require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_scraper_dashboard_key_2026';
const PORT = process.env.PORT || 3001;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API: Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username });
});

// API: Links (CRUD)
app.get('/api/links', authenticateToken, (req, res) => {
  const links = db.prepare('SELECT * FROM links ORDER BY created_at DESC').all();
  res.json(links);
});

app.post('/api/links', authenticateToken, (req, res) => {
  const { url, name } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  const stmt = db.prepare('INSERT INTO links (url, name) VALUES (?, ?)');
  const result = stmt.run(url, name || '');
  res.json({ id: result.lastInsertRowid, url, name });
});

app.delete('/api/links/:id', authenticateToken, (req, res) => {
  const stmt = db.prepare('DELETE FROM links WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

// API: Schedule (GET, PUT)
app.get('/api/schedule', authenticateToken, (req, res) => {
  const schedule = db.prepare('SELECT * FROM schedule LIMIT 1').get();
  res.json(schedule);
});

app.put('/api/schedule', authenticateToken, (req, res) => {
  const { cron_expression, webhook_url, search_query, state, municipality, max_results, is_active } = req.body;
  if (!cron_expression || !webhook_url) {
    return res.status(400).json({ error: 'Cron expression and webhook URL are required' });
  }
  
  // Validate cron logic
  if (!cron.validate(cron_expression)) {
    return res.status(400).json({ error: 'Invalid cron expression' });
  }

  db.prepare('UPDATE schedule SET cron_expression = ?, webhook_url = ?, search_query = ?, state = ?, municipality = ?, max_results = ?, is_active = ? WHERE id = (SELECT id FROM schedule LIMIT 1)')
    .run(cron_expression, webhook_url, search_query || 'agencias de viajes', state || '', municipality || '', max_results || 10, is_active ? 1 : 0);
  
  setupCronJob(); // Restart cron job
  res.json({ success: true });
});



// API: Trigger Scraper Now
app.post('/api/scrape-now', authenticateToken, async (req, res) => {
  console.log('Manual scraper trigger requested.');
  const success = await runScraper();
  if (success) {
    res.json({ success: true, message: 'Scraper triggered successfully' });
  } else {
    res.status(500).json({ error: 'Failed to trigger scraper' });
  }
});


// Scraper Trigger Function
const runScraper = async () => {
  const schedule = db.prepare('SELECT * FROM schedule LIMIT 1').get();
  if (!schedule || !schedule.webhook_url) {
    console.error('Scraper trigger failed: No schedule or webhook URL configured.');
    return false;
  }

  const linksRows = db.prepare('SELECT url FROM links').all();
  const urls = linksRows.map(row => row.url);
  
  console.log(`[${new Date().toISOString()}] Triggering Scraper...`);
  
  try {
    const response = await fetch(schedule.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        urls, 
        query: schedule.search_query || 'agencias de viajes',
        state: schedule.state || '',
        municipality: schedule.municipality || '',
        max_results: schedule.max_results || 10
      })
    });


    
    console.log(`Webhook responded with status ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error('Error hitting n8n webhook:', error.message);
    return false;
  }
};

// Cron Job Manager
let activeCronTask = null;

const setupCronJob = () => {
  if (activeCronTask) {
    activeCronTask.stop();
  }

  const schedule = db.prepare('SELECT * FROM schedule LIMIT 1').get();
  
  if (!schedule || schedule.is_active === 0) {
    console.log('Cron job inactive or not configured.');
    return;
  }

  console.log(`Setting up cron schedule: ${schedule.cron_expression}`);
  
  activeCronTask = cron.schedule(schedule.cron_expression, async () => {
    console.log(`[${new Date().toISOString()}] Cron job triggered!`);
    await runScraper();
  });
};


// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*any', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setupCronJob(); // Start cron on boot
});
