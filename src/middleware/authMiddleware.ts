import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config';

interface AuthResponse {
  active: boolean;
  userId?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

export async function authenticateAndAuthorize(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const introspectionUrl = `${config.services.auth}/auth/introspect`;
    const response = await axios.post<AuthResponse>(
      introspectionUrl,
      { token },
    );

    const authData = response.data;

    if (authData && authData.active) {
      // @ts-ignore (Express Request object is extensible)
      req.user = { id: authData.userId, email: authData.email, roles: authData.roles, permissions: authData.permissions };

      res.setHeader('X-User-Id', authData.userId || '');
      res.setHeader('X-User-Email', authData.email || '');
      res.setHeader('X-User-Roles', (authData.roles || []).join(','));
      res.setHeader('X-User-Permissions', (authData.permissions || []).join(','));

      return next();
    } else {
      return res.status(401).json({ message: 'Unauthorized: Invalid or inactive token.' });
    }
  } catch (error: any) {
    console.error('Auth Introspection Error:', error.message);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        return res.status(401).json({ message: 'Unauthorized: Token validation failed by auth service.' });
    }
    return res.status(500).json({ message: 'Authentication service error.' });
  }
}
