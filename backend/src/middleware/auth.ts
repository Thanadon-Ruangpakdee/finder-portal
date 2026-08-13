import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../config/vault';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required (Bearer)' });
  }

  try {
    const config = getConfig();
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied: Requires one of these roles: [${allowedRoles.join(', ')}]` 
      });
    }

    next();
  };
}
