import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('app.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    score REAL,
    latitude REAL,
    longitude REAL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT,
    category TEXT,
    severity TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT,
    created_at TEXT,
    assigned_volunteers TEXT,
    applied_volunteers TEXT,
    victims TEXT,
    progress INTEGER
  );

  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    latitude REAL,
    longitude REAL,
    capacity INTEGER,
    operational_status TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    item_name TEXT,
    quantity INTEGER,
    unit TEXT,
    location_id TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY,
    message TEXT,
    severity TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS contributions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    item_name TEXT,
    quantity INTEGER,
    unit TEXT,
    status TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT,
    details TEXT,
    timestamp TEXT
  );

  CREATE TABLE IF NOT EXISTS civic_issues (
    id TEXT PRIMARY KEY,
    category TEXT,
    description TEXT,
    status TEXT,
    latitude REAL,
    longitude REAL,
    reporter_id TEXT,
    created_at TEXT
  );
`);

// Insert default admin account if none exists
const getAdmin = db.prepare('SELECT * FROM users WHERE role = ?').get('authority');
if (!getAdmin) {
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2024';
  const adminId = `auth-${crypto.randomUUID().slice(0, 8)}`;
  const hashedPassword = bcrypt.hashSync(adminPassword, 8);
  db.prepare(`
    INSERT INTO users (id, name, email, password, role) 
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'Admin User', 'admin@cserp.gov', hashedPassword, 'authority');
}

export default db;
