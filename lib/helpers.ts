import { EventEmitter } from 'events';
import db from '../database.js';
import crypto from 'crypto';

export const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(0);

/** Broadcast a realtime event to all SSE-connected clients. */
export const notifyClients = (event: string, data: any) => {
  notificationEmitter.emit('update', { event, data });
};

/** Append an entry to the activity log table. */
export const logActivity = (user_id: string | undefined, action: string, details: string) => {
  const newLog = {
    id: `LOG-${crypto.randomUUID().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    user_id: user_id || 'system',
    action,
    details
  };
  db.prepare('INSERT INTO logs (id, user_id, action, details, timestamp) VALUES (@id, @user_id, @action, @details, @timestamp)').run(newLog);
};

/** Generate a prefixed unique ID (e.g. "REP-a1b2c3d4"). */
export const generateId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
