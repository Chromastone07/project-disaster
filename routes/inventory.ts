import { Router } from 'express';
import db from '../database.js';
import { authenticate } from '../lib/auth.js';
import { notifyClients, logActivity, generateId } from '../lib/helpers.js';

const router = Router();

// List all inventory
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM inventory').all());
});

// Add inventory item
router.post('/', authenticate, (req: any, res: any) => {
  if (req.user.role === 'citizen') return res.status(403).json({ detail: 'Forbidden' });

  const newItem = {
    ...req.body,
    id: generateId('INV')
  };
  db.prepare(`
    INSERT INTO inventory (id, item_name, quantity, unit, location_id, status)
    VALUES (@id, @item_name, @quantity, @unit, @location_id, @status)
  `).run(newItem);

  notifyClients('inventory_created', newItem);
  logActivity(req.user.sub, 'INVENTORY_ADDED', `Registered ${newItem.quantity} ${newItem.unit} of ${newItem.item_name}`);
  res.status(201).json(newItem);
});

// Update inventory item
router.patch('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role === 'citizen') return res.status(403).json({ detail: 'Forbidden' });

  const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id) as any;
  if (!item) return res.status(404).json({ detail: 'Item not found' });

  const updated = { ...item, ...req.body };
  db.prepare('UPDATE inventory SET quantity = @quantity, status = @status WHERE id = @id').run(updated);

  notifyClients('inventory_updated', updated);
  logActivity(req.user.sub, 'INVENTORY_UPDATED', `Updated inventory item ${req.params.id}`);
  res.json(updated);
});

// Delete inventory item
router.delete('/:id', authenticate, (req: any, res: any) => {
  if (req.user.role !== 'authority') return res.status(403).json({ detail: 'Forbidden' });
  const info = db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
  if (info.changes > 0) {
    notifyClients('inventory_deleted', req.params.id);
  }
  res.json({ success: true });
});

export default router;
