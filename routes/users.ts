import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { notifyClients } from '../lib/helpers.js';

const router = Router();

// List all users (authority only)
router.get('/', authenticate, (req: any, res) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const users = db.prepare('SELECT id, name, email, role, score, latitude, longitude FROM users').all();
  res.json(users);
});

// Delete a user (authority only)
router.delete('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (info.changes > 0) {
    notifyClients('user_deleted', req.params.id);
  }
  res.json({ success: true });
});

export default router;
