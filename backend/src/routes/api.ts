import { Router } from 'express';
import { handleAdLogin, mockLogin, getCurrentUser, getAllUsers, updateUserRole, updateProfile } from '../controllers/authController';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/itemController';
import { submitClaim, getClaims, reviewClaim } from '../controllers/claimController';
import { getPotentialMatches, reviewMatch } from '../controllers/matchController';
import { getItemsByLocation, checkPeerBookings } from '../controllers/peerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/login-ad', handleAdLogin);
router.post('/auth/login-mock', mockLogin);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.put('/auth/profile', authenticateToken, updateProfile);

// ==========================================
// User Management Routes (Admin Only)
// ==========================================
router.get('/users', authenticateToken, requireRole(['ADMIN']), getAllUsers);
router.put('/users/:id/role', authenticateToken, requireRole(['ADMIN']), updateUserRole);

// ==========================================
// Lost & Found Items Routes
// ==========================================
router.get('/items', authenticateToken, getItems);
router.get('/items/:id', authenticateToken, getItemById);
router.post('/items', authenticateToken, createItem);
router.put('/items/:id', authenticateToken, updateItem);
router.delete('/items/:id', authenticateToken, requireRole(['ADMIN']), deleteItem);

// ==========================================
// Claim Management Routes
// ==========================================
router.post('/claims', authenticateToken, submitClaim);
router.get('/claims', authenticateToken, getClaims);
router.post('/claims/:id/review', authenticateToken, requireRole(['TEACHER', 'ADMIN']), reviewClaim);

// ==========================================
// AI Matching Routes
// ==========================================
router.get('/matches', authenticateToken, requireRole(['TEACHER', 'ADMIN']), getPotentialMatches);
router.post('/matches/:id/review', authenticateToken, requireRole(['TEACHER', 'ADMIN']), reviewMatch);

// ==========================================
// Bilateral Peer API Services (SpaceReserve)
// ==========================================
// Expose (Expects x-api-key header)
router.get('/items/by-location', getItemsByLocation);

// Consume (Authenticated local proxy)
router.post('/peer/check-bookings', authenticateToken, checkPeerBookings);

export default router;
