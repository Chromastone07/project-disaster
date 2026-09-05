import { Router } from 'express';
import { notificationEmitter } from '../lib/helpers.js';

const router = Router();

// SSE endpoint for realtime notifications
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Send an immediate heartbeat to establish connection fully
  res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);

  const onUpdate = (payload: any) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  notificationEmitter.on('update', onUpdate);

  // Heartbeat interval (keep connection alive)
  const heartbeatInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 15000);

  req.on('close', () => {
    notificationEmitter.removeListener('update', onUpdate);
    clearInterval(heartbeatInterval);
  });
});

export default router;
