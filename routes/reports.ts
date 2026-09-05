import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { notifyClients, logActivity, generateId } from '../lib/helpers.js';

const router = Router();

// List all reports
router.get('/', (req, res) => {
  const reports = db.prepare('SELECT * FROM reports').all().map((r: any) => {
    return {
      ...r,
      assigned_volunteers: r.assigned_volunteers ? JSON.parse(r.assigned_volunteers) : [],
      applied_volunteers: r.applied_volunteers ? JSON.parse(r.applied_volunteers) : [],
      victims: r.victims ? JSON.parse(r.victims) : [],
    };
  });
  res.json(reports);
});

// Create a report
router.post('/', authenticate, (req: any, res) => {
  const newReport = {
    ...req.body,
    id: generateId('REP'),
    status: 'unreviewed',
    created_at: new Date().toISOString(),
    reporter_id: req.user.sub,
    assigned_volunteers: '[]',
    applied_volunteers: '[]',
    victims: '[]',
    progress: 0
  };

  db.prepare(`
    INSERT INTO reports (id, reporter_id, category, severity, description, latitude, longitude, status, created_at, assigned_volunteers, applied_volunteers, victims, progress)
    VALUES (@id, @reporter_id, @category, @severity, @description, @latitude, @longitude, @status, @created_at, @assigned_volunteers, @applied_volunteers, @victims, @progress)
  `).run(newReport);

  newReport.assigned_volunteers = [];
  newReport.applied_volunteers = [];

  notifyClients('report_created', newReport);
  logActivity(req.user.sub, 'REPORT_CREATED', `Reported a mapped incident: ${newReport.category}`);
  res.status(201).json(newReport);
});

// Update a report
router.patch('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role === 'citizen') return res.status(403).json({ detail: 'Forbidden' });

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as any;
  if (!report) return res.status(404).json({ detail: 'Report not found' });

  const updatedReport = { ...report, ...req.body };
  if (typeof updatedReport.assigned_volunteers !== 'string') {
    updatedReport.assigned_volunteers = JSON.stringify(updatedReport.assigned_volunteers || []);
  }
  if (typeof updatedReport.applied_volunteers !== 'string') {
    updatedReport.applied_volunteers = JSON.stringify(updatedReport.applied_volunteers || []);
  }

  db.prepare(`
    UPDATE reports SET 
      status = @status, 
      progress = @progress, 
      assigned_volunteers = @assigned_volunteers,
      applied_volunteers = @applied_volunteers,
      severity = @severity,
      description = @description
    WHERE id = @id
  `).run(updatedReport);

  const formatted = {
    ...updatedReport,
    assigned_volunteers: JSON.parse(updatedReport.assigned_volunteers),
    applied_volunteers: JSON.parse(updatedReport.applied_volunteers)
  };

  notifyClients('report_updated', formatted);
  logActivity(req.user.sub, 'REPORT_UPDATED', `Updated status or assignee for incident ${req.params.id}`);
  res.json(formatted);
});

// Delete a report
router.delete('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const info = db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
  if (info.changes > 0) {
    notifyClients('report_deleted', req.params.id);
  }
  res.json({ success: true });
});

// Apply as volunteer for a report
router.post('/:id/apply', authenticate, (req: any, res: any) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as any;
  if (!report) return res.status(404).json({ detail: 'Report not found' });

  let applied = report.applied_volunteers ? JSON.parse(report.applied_volunteers) : [];
  if (!applied.includes(req.user.sub)) {
    applied.push(req.user.sub);
    db.prepare('UPDATE reports SET applied_volunteers = ? WHERE id = ?').run(JSON.stringify(applied), req.params.id);
  }

  const formatted = {
    ...report,
    assigned_volunteers: report.assigned_volunteers ? JSON.parse(report.assigned_volunteers) : [],
    applied_volunteers: applied,
    victims: report.victims ? JSON.parse(report.victims) : []
  };

  notifyClients('report_updated', formatted);
  logActivity(req.user.sub, 'VOLUNTEER_APPLIED', `Volunteered for incident ${req.params.id}`);
  res.json(formatted);
});

// Enroll as victim for a report
router.post('/:id/enroll-victim', authenticate, (req: any, res: any) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as any;
  if (!report) return res.status(404).json({ detail: 'Report not found' });

  let victims = report.victims ? JSON.parse(report.victims) : [];
  if (!victims.includes(req.user.sub)) {
    victims.push(req.user.sub);
    db.prepare('UPDATE reports SET victims = ? WHERE id = ?').run(JSON.stringify(victims), req.params.id);
  }

  const formatted = {
    ...report,
    assigned_volunteers: report.assigned_volunteers ? JSON.parse(report.assigned_volunteers) : [],
    applied_volunteers: report.applied_volunteers ? JSON.parse(report.applied_volunteers) : [],
    victims: victims
  };

  notifyClients('report_updated', formatted);
  logActivity(req.user.sub, 'VICTIM_ENROLLED', `Enrolled as victim for incident ${req.params.id}`);
  res.json(formatted);
});

export default router;
