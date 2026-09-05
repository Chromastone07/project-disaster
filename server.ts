import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Route modules
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import inventoryRoutes from './routes/inventory.js';
import broadcastRoutes from './routes/broadcasts.js';
import civicRoutes from './routes/civic.js';
import locationRoutes from './routes/locations.js';
import userRoutes from './routes/users.js';
import logRoutes from './routes/logs.js';
import contributionRoutes from './routes/contributions.js';
import notificationRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/broadcast', broadcastRoutes);
app.use('/api/v1/civic-issues', civicRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/contributions', contributionRoutes);
app.use('/api/v1/notifications', notificationRoutes);

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
