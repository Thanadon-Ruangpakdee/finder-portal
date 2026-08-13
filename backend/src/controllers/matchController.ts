import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getPotentialMatches(req: AuthenticatedRequest, res: Response) {
  try {
    const matches = await prisma.match.findMany({
      where: { status: 'SUGGESTED' },
      include: {
        lostItem: {
          include: { reporter: { select: { name: true, email: true } } }
        },
        foundItem: {
          include: { reporter: { select: { name: true, email: true } } }
        }
      },
      orderBy: { similarityScore: 'desc' }
    });

    return res.json(matches);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve potential matches', details: err.message });
  }
}

export async function reviewMatch(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { action } = req.body; // CONFIRMED or REJECTED

  if (!action || !['CONFIRMED', 'REJECTED'].includes(action)) {
    return res.status(400).json({ error: 'Action is required (CONFIRMED or REJECTED)' });
  }

  try {
    const match = await prisma.match.findUnique({ where: { id } });

    if (!match) {
      return res.status(404).json({ error: 'Match record not found' });
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status: action }
    });

    if (action === 'CONFIRMED') {
      // Set status of both items to MATCHED
      await prisma.item.update({
        where: { id: match.lostItemId },
        data: { status: 'MATCHED' }
      });

      await prisma.item.update({
        where: { id: match.foundItemId },
        data: { status: 'MATCHED' }
      });
    }

    return res.json(updatedMatch);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to review match', details: err.message });
  }
}
