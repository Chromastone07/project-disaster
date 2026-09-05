import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { notifyClients, logActivity, generateId } from '../lib/helpers.js';

const router = Router();

// List all broadcasts
router.get('/', (req, res) => {
  const broadcasts = db.prepare('SELECT * FROM broadcasts ORDER BY created_at DESC').all();
  res.json(broadcasts);
});

// Create a broadcast
router.post('/', authenticate, (req: any, res) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const newBc = {
    id: generateId('BC'),
    message: req.body.message,
    severity: req.body.severity || 'high',
    created_at: new Date().toISOString()
  };

  db.prepare('INSERT INTO broadcasts (id, message, severity, created_at) VALUES (@id, @message, @severity, @created_at)').run(newBc);

  notifyClients('broadcast_alert', newBc);
  logActivity(req.user.sub, 'BROADCAST_SENT', `Sent alert: ${newBc.message}`);
  res.json({ success: true, broadcast: newBc });
});

// Delete a broadcast
router.delete('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const info = db.prepare('DELETE FROM broadcasts WHERE id = ?').run(req.params.id);
  if (info.changes > 0) {
    notifyClients('broadcast_deleted', req.params.id);
  }
  res.json({ success: true });
});

export default router;
