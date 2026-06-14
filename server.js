const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
function authenticateOrganizer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.organizerId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
app.get('/', (req, res) => {
  res.send('Sofia Events API is running');
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, code: err.code, detail: err.toString() });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.title, e.description, e.category, e.venue, e.start_time,
             e.price_text, e.ticket_url, e.image_url,
             fs.slot_number,
             CASE WHEN fs.id IS NOT NULL AND NOW() BETWEEN fs.start_date AND fs.end_date
                  THEN true ELSE false END AS is_featured
      FROM events e
      LEFT JOIN featured_slots fs ON fs.event_id = e.id
      ORDER BY is_featured DESC, fs.slot_number ASC, e.start_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code, detail: err.toString() });
  }
});
app.post('/api/organizers/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO organizers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/organizers/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM organizers WHERE email = $1', [email]);
    const organizer = result.rows[0];

    if (!organizer) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, organizer.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: organizer.id, name: organizer.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: organizer.name, email: organizer.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/organizer/events', authenticateOrganizer, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE organizer_id = $1 ORDER BY start_time ASC',
      [req.organizerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/organizer/events', authenticateOrganizer, async (req, res) => {
  try {
    const { title, description, category, venue, start_time, price_text, ticket_url, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO events (organizer_id, title, description, category, venue, start_time, price_text, ticket_url, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.organizerId, title, description, category, venue, start_time, price_text, ticket_url, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});