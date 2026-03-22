const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'scraper_dashboard.db');
const db = new Database(dbPath);

try {
  db.prepare("ALTER TABLE schedule ADD COLUMN search_query TEXT DEFAULT 'agencias de viajes'").run();
  console.log('Column search_query added to schedule table.');
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log('Column search_query already exists.');
  } else {
    console.error('Error adding column:', err.message);
  }
}

db.close();
