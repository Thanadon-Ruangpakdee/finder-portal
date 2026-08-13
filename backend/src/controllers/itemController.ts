import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { analyzeItemDescription } from '../services/gemini';

const prisma = new PrismaClient();

export async function getItems(req: AuthenticatedRequest, res: Response) {
  const { search, type, status, location, category } = req.query;

  try {
    const whereClause: any = {};

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (location && location !== 'All Locations') whereClause.location = location;
    if (category && category !== 'All') whereClause.category = category;

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { title: { contains: searchStr } },
        { description: { contains: searchStr } },
        { aiTags: { contains: searchStr } }
      ];
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, role: true, avatar: true }
        },
        claims: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve items', details: err.message });
  }
}

export async function getItemById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, role: true, avatar: true }
        },
        claims: {
          include: {
            claimant: { select: { id: true, name: true, email: true, avatar: true } }
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve item details', details: err.message });
  }
}

export async function createItem(req: AuthenticatedRequest, res: Response) {
  const { title, description, location, type, category: bodyCategory, imagePreset, imageUrl } = req.body;
  const reporterId = req.user?.id;

  if (!title || !description || !location || !type || !reporterId) {
    return res.status(400).json({ error: 'Title, description, location, and type are required' });
  }

  try {
    // 1. Run Gemini AI Auto-Categorization & Tagging
    const aiResult = await analyzeItemDescription(description);

    // 2. Select final category: Use user selection, fallback to AI suggestion
    const finalCategory = bodyCategory && bodyCategory !== 'Other' ? bodyCategory : aiResult.category;
    const aiTagsString = aiResult.tags.join(',');

    // 3. Create database entry
    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        location,
        type,
        category: finalCategory,
        status: 'OPEN',
        imagePreset,
        imageUrl,
        aiTags: aiTagsString,
        reporterId
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } }
      }
    });

    // 4. Trigger auto-matching in the background (we will implement this service next!)
    triggerBackgroundAutoMatcher(newItem.id);

    return res.status(201).json(newItem);
  } catch (err: any) {
    console.error('Create Item Error:', err);
    return res.status(500).json({ error: 'Failed to create item', details: err.message });
  }
}

export async function updateItem(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status, title, description, location, category } = req.body;

  try {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Role check: Only teacher, admin, or the original reporter can update
    const isTeacherOrAdmin = req.user?.role === 'TEACHER' || req.user?.role === 'ADMIN';
    const isReporter = item.reporterId === req.user?.id;

    if (!isTeacherOrAdmin && !isReporter) {
      return res.status(403).json({ error: 'Access denied: You do not own this listing' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        status: status || item.status,
        title: title || item.title,
        description: description || item.description,
        location: location || item.location,
        category: category || item.category
      }
    });

    return res.json(updatedItem);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
}

export async function deleteItem(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    await prisma.item.delete({ where: { id } });
    return res.json({ message: 'Item deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
}

// Background Match Checker Helper
async function triggerBackgroundAutoMatcher(newRecordId: string) {
  try {
    const newRecord = await prisma.item.findUnique({ where: { id: newRecordId } });
    if (!newRecord) return;

    // Fetch items of the opposite type
    const opposites = await prisma.item.findMany({
      where: {
        type: newRecord.type === 'LOST' ? 'FOUND' : 'LOST',
        status: 'OPEN'
      }
    });

    for (const opp of opposites) {
      const matchScore = calculateSimilarityScore(newRecord, opp);
      
      // If score is above 35%, log as potential match
      if (matchScore >= 35) {
        const lostId = newRecord.type === 'LOST' ? newRecord.id : opp.id;
        const foundId = newRecord.type === 'FOUND' ? newRecord.id : opp.id;

        // Check if matching pair already exists
        const existing = await prisma.match.findFirst({
          where: { lostItemId: lostId, foundItemId: foundId }
        });

        if (!existing) {
          await prisma.match.create({
            data: {
              lostItemId: lostId,
              foundItemId: foundId,
              similarityScore: matchScore,
              status: 'SUGGESTED'
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('[AutoMatcher Error] Background process failed:', err);
  }
}

function calculateSimilarityScore(item1: any, item2: any): number {
  let score = 0;

  // 1. Same category match (30%)
  if (item1.category === item2.category) {
    score += 30;
  }

  // 2. Location match (20%)
  if (item1.location === item2.location) {
    score += 20;
  }

  // 3. Keyword / AI tag match (Up to 50%)
  const tags1 = (item1.aiTags || '').split(',').filter(Boolean);
  const tags2 = (item2.aiTags || '').split(',').filter(Boolean);
  
  if (tags1.length > 0 && tags2.length > 0) {
    const common = tags1.filter((t: string) => tags2.includes(t));
    const tokenScore = (common.length / Math.max(tags1.length, tags2.length)) * 50;
    score += tokenScore;
  }

  return Math.min(Math.round(score), 100);
}
