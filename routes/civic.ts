import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { notifyClients, logActivity, generateId } from '../lib/helpers.js';

const router = Router();

// List all civic issues
router.get('/', authenticate, (req: any, res) => {
  res.json(db.prepare('SELECT * FROM civic_issues ORDER BY created_at DESC').all());
});

// Create a civic issue
router.post('/', authenticate, (req: any, res) => {
  const newIssue = {
    ...req.body,
    id: generateId('CIVIC'),
    status: 'open',
    created_at: new Date().toISOString(),
    reporter_id: req.user.sub
  };

  db.prepare(`
    INSERT INTO civic_issues (id, category, description, status, latitude, longitude, reporter_id, created_at)
    VALUES (@id, @category, @description, @status, @latitude, @longitude, @reporter_id, @created_at)
  `).run(newIssue);

  notifyClients('civic_issue_created', newIssue);
  logActivity(req.user.sub, 'CIVIC_ISSUE_CREATED', `Reported a civic issue: ${newIssue.category}`);
  res.status(201).json(newIssue);
});

// Update a civic issue status
router.patch('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role === 'citizen') return res.status(403).json({ detail: 'Forbidden' });

  const issue = db.prepare('SELECT * FROM civic_issues WHERE id = ?').get(req.params.id) as any;
  if (!issue) return res.status(404).json({ detail: 'Issue not found' });

  const updated = { ...issue, ...req.body };
  db.prepare('UPDATE civic_issues SET status = @status WHERE id = @id').run(updated);

  notifyClients('civic_issue_updated', updated);
  logActivity(req.user.sub, 'CIVIC_ISSUE_UPDATED', `Updated civic issue ${req.params.id}`);
  res.json(updated);
});

// Delete a civic issue
router.delete('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const info = db.prepare('DELETE FROM civic_issues WHERE id = ?').run(req.params.id);
  if (info.changes > 0) {
    notifyClients('civic_issue_deleted', req.params.id);
  }
  res.json({ success: true });
});

export default router;
