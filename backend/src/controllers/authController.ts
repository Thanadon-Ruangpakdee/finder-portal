import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/vault';

const prisma = new PrismaClient();

// In production, users authenticate via university AD and get an ID Token.
// We verify this token and register/update them in our database.
export async function handleAdLogin(req: Request, res: Response) {
  const { idToken, name, email, role, avatar } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required for AD login' });
  }

  try {
    const config = getConfig();
    
    const normalizedEmail = email.toLowerCase().trim();
    const userId = normalizedEmail.split('@')[0];
    
    // Default role assignment if AD claims don't specify
    let assignedRole = 'STUDENT';
    if (normalizedEmail.startsWith('staff.') || normalizedEmail.startsWith('teacher.')) assignedRole = 'TEACHER';
    if (normalizedEmail.startsWith('admin.')) assignedRole = 'ADMIN';
    if (role) assignedRole = role; // Override if requested

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: normalizedEmail,
          name,
          role: assignedRole,
          avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
        }
      });
    }

    // Generate local JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  } catch (err: any) {
    console.error('AD Login Error:', err);
    return res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
}

// Dev-friendly mock login to switch roles easily
export async function mockLogin(req: Request, res: Response) {
  const { role } = req.body; // STUDENT, TEACHER, or ADMIN

  if (!role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Valid role is required (STUDENT, TEACHER, ADMIN)' });
  }

  try {
    const config = getConfig();
    
    // Choose appropriate mock data
    let userId = 'student_6610308';
    let name = 'Thanadon Ruangpakdee';
    let email = 'student.thanadon@au.edu';

    if (role === 'TEACHER') {
      userId = 'staff_6610387';
      name = 'Somchai';
      email = 'staff.somchai@au.edu';
    } else if (role === 'ADMIN') {
      userId = 'admin_6610936';
      name = 'Admin Kitirat';
      email = 'admin.system@au.edu';
    }

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          role,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  } catch (err: any) {
    console.error('Mock Login Error:', err);
    return res.status(500).json({ error: 'Mock authentication failed', details: err.message });
  }
}

export async function getCurrentUser(req: any, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve profile', details: err.message });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve users', details: err.message });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Valid role is required (STUDENT, TEACHER, ADMIN)' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update user role', details: err.message });
  }
}

export async function updateProfile(req: any, res: Response) {
  const { name, avatar } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar })
      }
    });
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
}
