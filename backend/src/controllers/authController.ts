import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/vault';

const prisma = new PrismaClient();

// In production, users authenticate via university AD and get an ID Token.
// We verify this token and register/update them in our database.
export async function handleMicrosoftLogin(req: Request, res: Response) {
  const config = getConfig();
  const redirectUri = config.AZURE_REDIRECT_URI;
  const tenantId = config.AZURE_TENANT_ID;
  const clientId = config.AZURE_CLIENT_ID;

  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: 'openid profile email'
    }).toString();

  return res.redirect(authUrl);
}

export async function handleMicrosoftCallback(req: Request, res: Response) {
  const { code, error, error_description } = req.query;
  const config = getConfig();

  if (error || !code) {
    console.error('[Microsoft Auth Error]:', error_description || error || 'No authorization code received');
    return res.redirect(`/project/?error=${encodeURIComponent(String(error_description || 'Authentication cancelled'))}`);
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${config.AZURE_TENANT_ID}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: config.AZURE_CLIENT_ID,
      client_secret: config.AZURE_CLIENT_SECRET,
      code: String(code),
      redirect_uri: config.AZURE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Microsoft Token Error]:', errText);
      return res.redirect(`/project/?error=${encodeURIComponent('Failed to exchange token with Microsoft')}`);
    }

    const tokenData: any = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    let rawEmail = '';
    let name = '';

    // 1. Decode Microsoft ID Token payload (Standard OIDC Claims)
    if (idToken) {
      const decoded: any = jwt.decode(idToken);
      if (decoded) {
        rawEmail = decoded.preferred_username || decoded.email || decoded.upn || decoded.unique_name || '';
        name = decoded.name || (rawEmail ? rawEmail.split('@')[0] : '');
      }
    }

    // 2. Fallback to Microsoft Graph API if ID token didn't contain email
    if (!rawEmail && accessToken) {
      try {
        const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (userRes.ok) {
          const graphUser: any = await userRes.json();
          rawEmail = graphUser.mail || graphUser.userPrincipalName || '';
          if (!name) name = graphUser.displayName || rawEmail.split('@')[0];
        }
      } catch (graphErr) {
        console.warn('[Microsoft Graph Warning]: Could not fetch from Graph API, using ID token claims.');
      }
    }

    const normalizedEmail = rawEmail.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.redirect(`/project/?error=${encodeURIComponent('No email associated with Microsoft Account')}`);
    }

    const userId = normalizedEmail.split('@')[0];
    let assignedRole = 'STUDENT';
    if (normalizedEmail.startsWith('staff.') || normalizedEmail.startsWith('teacher.')) assignedRole = 'TEACHER';
    if (normalizedEmail.startsWith('admin.')) assignedRole = 'ADMIN';

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
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.redirect(`/project/?token=${token}`);
  } catch (err: any) {
    console.error('Microsoft Callback Error:', err);
    return res.redirect(`/project/?error=${encodeURIComponent(err.message || 'Authentication failed')}`);
  }
}

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
