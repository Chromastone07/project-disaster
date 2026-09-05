import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { JWT_SECRET, ADMIN_SECRET, authenticate } from '../lib/auth.js';
import { notifyClients, logActivity, generateId } from '../lib/helpers.js';

const router = Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ access_token: token, user_id: user.id, name: user.name, role: user.role, email: user.email });
});

// Register
router.post('/register', (req: any, res) => {
  const { name, email, password, role, adminSecret } = req.body;

  if (role === 'authority' && adminSecret !== ADMIN_SECRET) {
    return res.status(400).json({ detail: 'Invalid admin creation secret key. Registration denied.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ detail: 'Email already exists' });
  }

  const newUser = {
    id: generateId(role.substring(0, 3)),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role,
    score: role === 'volunteer' ? 0.5 : null,
    latitude: role === 'volunteer' ? 19.07 + (Math.random() * 0.1 - 0.05) : null,
    longitude: role === 'volunteer' ? 72.87 + (Math.random() * 0.1 - 0.05) : null
  };

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, score, latitude, longitude)
    VALUES (@id, @name, @email, @password, @role, @score, @latitude, @longitude)
  `).run(newUser);

  notifyClients('user_created', {
    id: newUser.id, name: newUser.name, email: newUser.email,
    role: newUser.role, score: newUser.score,
    latitude: newUser.latitude, longitude: newUser.longitude
  });

  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

// Bulk Register
router.post('/bulk-register', authenticate, (req: any, res) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const newUsers = req.body.users;

  if (!Array.isArray(newUsers)) {
    return res.status(400).json({ detail: 'Invalid payload format. Expected an array of users.' });
  }

  const results = { successful: 0, failed: 0, errors: [] as string[] };
  const insertStmt = db.prepare('INSERT INTO users (id, name, email, password, role, score, latitude, longitude) VALUES (@id, @name, @email, @password, @role, @score, @latitude, @longitude)');

  const trx = db.transaction((usersToInsert: any[]) => {
    for (const user of usersToInsert) {
      if (!user.name || !user.email || !user.password || !user.role) {
        results.failed++;
        results.errors.push(`Missing fields for user: ${user.email || 'unknown'}`);
        continue;
      }

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
      if (existing) {
        results.failed++;
        results.errors.push(`Email already exists: ${user.email}`);
        continue;
      }

      const newUser = {
        id: generateId(user.role.substring(0, 3)),
        name: user.name,
        email: user.email,
        password: bcrypt.hashSync(user.password, 8),
        role: user.role,
        score: user.role === 'volunteer' ? 0.5 : null,
        latitude: user.role === 'volunteer' ? 19.07 + (Math.random() * 0.1 - 0.05) : null,
        longitude: user.role === 'volunteer' ? 72.87 + (Math.random() * 0.1 - 0.05) : null
      };

      insertStmt.run(newUser);
      results.successful++;
    }
  });

  trx(newUsers);
  res.status(201).json(results);
});

export default router;
