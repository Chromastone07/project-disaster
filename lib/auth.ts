import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-me';
export const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fallback-admin-secret-change-me';

/** Express middleware — verifies JWT and attaches decoded payload to `req.user`. */
export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ detail: 'Invalid token' });
  }
};
