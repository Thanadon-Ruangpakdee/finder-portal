import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function submitClaim(req: AuthenticatedRequest, res: Response) {
  const { itemId, proofText } = req.body;
  const claimantId = req.user?.id;

  if (!itemId || !proofText || !claimantId) {
    return res.status(400).json({ error: 'Item ID and proof text are required' });
  }

  try {
    // 1. Verify item exists and is OPEN or MATCHED
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.status === 'CLAIMED' || item.status === 'CLOSED') {
      return res.status(400).json({ error: 'Item has already been returned or closed' });
    }

    // 2. Check if this user already has a pending claim on the item
    const existing = await prisma.claim.findFirst({
      where: { itemId, claimantId, status: 'PENDING' }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a claim for this item' });
    }

    // 3. Create the claim
    const newClaim = await prisma.claim.create({
      data: {
        itemId,
        claimantId,
        proofText,
        status: 'PENDING'
      },
      include: {
        item: true,
        claimant: { select: { name: true, email: true } }
      }
    });

    return res.status(201).json(newClaim);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit claim', details: err.message });
  }
}

export async function getClaims(req: AuthenticatedRequest, res: Response) {
  const { status, itemId } = req.query;

  try {
    const isTeacherOrAdmin = req.user?.role === 'TEACHER' || req.user?.role === 'ADMIN';
    const whereClause: any = {};

    if (status) whereClause.status = status;
    if (itemId) whereClause.itemId = itemId;

    // Students can ONLY retrieve their own claims
    if (!isTeacherOrAdmin) {
      whereClause.claimantId = req.user?.id;
    }

    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        item: {
          include: {
            reporter: { select: { name: true, email: true } }
          }
        },
        claimant: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(claims);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve claims', details: err.message });
  }
}

export async function reviewClaim(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { action } = req.body; // APPROVED or REJECTED
  const reviewerId = req.user?.id;

  if (!action || !['APPROVED', 'REJECTED'].includes(action) || !reviewerId) {
    return res.status(400).json({ error: 'Action is required (APPROVED or REJECTED)' });
  }

  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { item: true }
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (claim.status !== 'PENDING') {
      return res.status(400).json({ error: `Claim has already been reviewed (${claim.status})` });
    }

    const finalStatus = action;

    const updatedClaim = await prisma.claim.update({
      where: { id },
      data: {
        status: finalStatus,
        reviewerId
      }
    });

    if (finalStatus === 'APPROVED') {
      // 1. Update item status to CLAIMED
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: 'CLAIMED' }
      });

      // 2. Reject all other pending claims for this specific item automatically
      await prisma.claim.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: id },
          status: 'PENDING'
        },
        data: {
          status: 'REJECTED',
          reviewerId
        }
      });
    }

    return res.json(updatedClaim);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to review claim', details: err.message });
  }
}
