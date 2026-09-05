import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';

const router = Router();

// List all logs (authority only)
router.get('/', authenticate, (req: any, res) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const logs = db.prepare(`
    SELECT logs.*, users.name as user_name, users.role as user_role 
    FROM logs 
    LEFT JOIN users ON logs.user_id = users.id 
    ORDER BY timestamp DESC
  `).all();

  const enrichedLogs = logs.map((l: any) => ({
    ...l,
    user_name: l.user_name || 'System',
    user_role: l.user_role || 'System'
  }));
  res.json(enrichedLogs);
});

export default router;
