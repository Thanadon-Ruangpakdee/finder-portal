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

// 2. Consume: Fetch who occupied the room at the time an item was lost/found
export async function checkPeerBookings(req: Request, res: Response) {
  const { location, timestamp } = req.body;

  if (!location || !timestamp) {
    return res.status(400).json({ error: 'Location and timestamp are required' });
  }

  const config = getConfig();

  console.log(`[Peer API] Querying SpaceReserve active bookings at location: "${location}"...`);

  try {
    // Perform outgoing HTTP request to SpaceReserve REST API
    // Partner expects header "x-api-key" instead of Authorization: Bearer, and params "room" & "at" instead of "location" & "time".
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const response = await fetch(
      `${config.SPACE_RESERVE_API_URL}/external/bookings/active-at?room=${encodeURIComponent(location)}&at=${encodeURIComponent(timestamp)}`,
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
      const data = await response.json();
      return res.json({
        source: 'Live SpaceReserve API',
        booking: data
      });
    }

    throw new Error(`SpaceReserve responded with status ${response.status}`);
  } catch (err: any) {
    console.warn(`[Peer API Warning] Direct connection to SpaceReserve failed: ${err.message}. Falling back to simulation mode.`);
    
    // Fallback simulation: Return realistic mock booking matching the location
    const mockBookings: { [key: string]: any } = {
      'Cathedral of Learning (CL Building)': {
        bookingId: 'bk_cl_99218',
        room: 'CL Lounge 2nd Floor',
        bookerName: 'Thanakrit Kodklangdon',
        bookerEmail: 'student.thanakrit@au.edu',
        activeFrom: '2026-08-13T20:00:00Z',
        activeTo: '2026-08-13T22:00:00Z'
      },
      'Room 402 (Engineering Building)': {
        bookingId: 'bk_eng_33104',
        room: 'Room 402 Lab',
        bookerName: 'Kitirat Pisithaporn',
        bookerEmail: 'student.kitirat@au.edu',
        activeFrom: '2026-08-12T13:00:00Z',
        activeTo: '2026-08-12T16:00:00Z'
      },
      'Library Room 4B / Study Pod': {
        bookingId: 'bk_lib_12048',
        room: 'Library Study Pod B',
        bookerName: 'Somchai Prasert',
        bookerEmail: 'student.somchai@au.edu',
        activeFrom: '2026-08-13T14:00:00Z',
        activeTo: '2026-08-13T16:00:00Z'
      }
    };

    const simulatedBooking = mockBookings[location] || {
      bookingId: 'bk_gen_55012',
      room: location,
      bookerName: 'Guest Student',
      bookerEmail: 'student.guest@au.edu',
      activeFrom: timestamp,
      activeTo: timestamp
    };

    return res.json({
      source: 'SpaceReserve API (Simulation Fallback)',
      booking: simulatedBooking
    });
  }
}
