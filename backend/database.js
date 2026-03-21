const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'scraper_dashboard.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cron_expression TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
  );
`);

// Insert default admin if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const defaultPassword = 'admin'; // Change in production
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(defaultPassword, salt);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Default admin user created.');
}

// Ensure default schedule exists
const scheduleCount = db.prepare('SELECT COUNT(*) as count FROM schedule').get();
if (scheduleCount.count === 0) {
  // Default is every 12 hours
  db.prepare('INSERT INTO schedule (cron_expression, webhook_url, is_active) VALUES (?, ?, ?)').run('0 */12 * * *', 'YOUR_WEBHOOK_URL_HERE', 1);
  console.log('Default schedule created.');
}

module.exports = db;
