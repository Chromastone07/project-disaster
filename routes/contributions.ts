import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { generateId } from '../lib/helpers.js';

const router = Router();

// List all contributions
router.get('/', authenticate, (req: any, res) => {
  const contributions = db.prepare('SELECT * FROM contributions ORDER BY created_at DESC').all();
  res.json(contributions);
});

// Create a contribution
router.post('/', authenticate, (req: any, res) => {
  const newC = {
    ...req.body,
    id: generateId('DON'),
    user_id: req.user.sub,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  db.prepare('INSERT INTO contributions (id, user_id, item_name, quantity, unit, status, created_at) VALUES (@id, @user_id, @item_name, @quantity, @unit, @status, @created_at)').run(newC);

  // logActivity is intentionally lightweight here
  res.status(201).json(newC);
});

export default router;
