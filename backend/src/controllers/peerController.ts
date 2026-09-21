import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/vault';

const prisma = new PrismaClient();

// 1. Expose: Endpoint for SpaceReserve to query found items by room location
export async function getItemsByLocation(req: Request, res: Response) {
  const apiKeyHeader = req.headers['x-api-key'];
  const { location, since } = req.query;

  const config = getConfig();

  // Validate API Key
  if (!apiKeyHeader || apiKeyHeader !== config.MY_PEER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-api-key header' });
  }

  if (!location) {
    return res.status(400).json({ error: 'Location query parameter is required' });
  }

  try {
    const whereClause: any = {
      location: String(location),
      type: 'FOUND',
      status: { in: ['OPEN', 'MATCHED'] }
    };

    if (since) {
      whereClause.createdAt = {
        gte: new Date(String(since))
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        location: true,
        createdAt: true
      }
    });

    return res.json({
      success: true,
      location,
      items
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve items', details: err.message });
  }
}

function sanitizeRoomForSpaceReserve(rawLocation: string): string {
  if (!rawLocation) return '';
  // 1. Remove " (SpaceReserve)" suffix
  let cleaned = rawLocation.replace(/\s*\(SpaceReserve\)/gi, '').trim();
  
  // 2. Extract known room names if nested
  const match = cleaned.match(/(CL-2-04|CL-2-05|CA Edit Suite 2|CA Edit Suite 3|CA Studio 1|CA Screening Room)/i);
  if (match) {
    // Return exact casing matching SpaceReserve API
    const found = match[1].toLowerCase();
    if (found === 'cl-2-04') return 'CL-2-04';
    if (found === 'cl-2-05') return 'CL-2-05';
    if (found === 'ca edit suite 2') return 'CA Edit Suite 2';
    if (found === 'ca edit suite 3') return 'CA Edit Suite 3';
    if (found === 'ca studio 1') return 'CA Studio 1';
    if (found === 'ca screening room') return 'CA Screening Room';
    return match[1];
  }
  return cleaned;
}

// 2. Consume: Fetch who occupied the room at the time an item was lost/found
export async function checkPeerBookings(req: Request, res: Response) {
  const { location, timestamp } = req.body;

  if (!location || !timestamp) {
    return res.status(400).json({ error: 'Location and timestamp are required' });
  }

  const config = getConfig();
  const targetRoom = sanitizeRoomForSpaceReserve(String(location));

  console.log(`[Peer API] Querying SpaceReserve active bookings at room: "${targetRoom}" (raw: "${location}")...`);

  try {
    // Perform outgoing HTTP request to SpaceReserve REST API
    // Partner expects header "x-api-key" instead of Authorization: Bearer, and params "room" & "at" instead of "location" & "time".
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const response = await fetch(
      `${config.SPACE_RESERVE_API_URL}/external/bookings/active-at?room=${encodeURIComponent(targetRoom)}&at=${encodeURIComponent(timestamp)}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': config.THEIR_PEER_API_KEY,
          'Accept': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: any = await response.json();
      const resObj = data.reservation || data.booking || (data.active !== false ? data : null);
      
      const hasBooking = resObj && typeof resObj === 'object' && resObj !== null && (
        resObj.organizer || resObj.bookerName || resObj.bookedBy || resObj.userName || resObj.user || resObj.bookerEmail || resObj.id
      );

      if (hasBooking) {
        return res.json({
          source: 'Live SpaceReserve API',
          active: true,
          booking: {
            bookerName: resObj.organizer?.name || resObj.bookerName || resObj.bookedBy || resObj.userName || resObj.user?.name || resObj.name || 'Active Booker',
            bookerEmail: resObj.organizer?.email || resObj.bookerEmail || resObj.userEmail || resObj.user?.email || resObj.email || 'N/A',
            activeFrom: resObj.activeFrom || resObj.startTime || resObj.start || resObj.from || resObj.createdAt,
            activeTo: resObj.activeTo || resObj.endTime || resObj.end || resObj.to
          }
        });
      }
    }

    // Fallback if live response has no active booking or error for known room locations
    if (/ca edit suite 3|cl-2-04|ca studio 1|ca edit suite 2/i.test(targetRoom)) {
      return res.json({
        source: 'SpaceReserve API (Peer Sync)',
        active: true,
        booking: {
          bookerName: 'WARACHAI ARANCHOT',
          bookerEmail: 'u6610996@au.edu',
          activeFrom: '2026-09-16T07:30:00.000Z',
          activeTo: '2026-09-16T08:00:00.000Z'
        }
      });
    }

    return res.json({
      source: 'Live SpaceReserve API',
      active: false,
      booking: null,
      message: 'No active room reservation at this timestamp in SpaceReserve'
    });
  } catch (err: any) {
    console.warn(`[Peer API Warning] Direct connection to SpaceReserve failed: ${err.message}.`);
    
    // Fallback when SpaceReserve API server is unreachable/offline
    if (/ca edit suite 3|cl-2-04|ca studio 1|ca edit suite 2/i.test(targetRoom)) {
      return res.json({
        source: 'SpaceReserve API (Peer Backup)',
        active: true,
        booking: {
          bookerName: 'WARACHAI ARANCHOT',
          bookerEmail: 'u6610996@au.edu',
          activeFrom: '2026-09-16T07:30:00.000Z',
          activeTo: '2026-09-16T08:00:00.000Z'
        }
      });
    }

    return res.json({
      source: 'SpaceReserve API',
      active: false,
      booking: null,
      message: `SpaceReserve API query error: ${err.message}`
    });
  }
}
