import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { generateId } from '../lib/helpers.js';

const router = Router();

// List all locations
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM locations').all());
});

// Add a location
router.post('/', authenticate, (req: any, res) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const newLocation = {
    ...req.body,
    id: generateId('LOC'),
  };
  db.prepare(`
    INSERT INTO locations (id, name, category, latitude, longitude, capacity, operational_status)
    VALUES (@id, @name, @category, @latitude, @longitude, @capacity, @operational_status)
  `).run(newLocation);

  res.status(201).json(newLocation);
});

export default router;
