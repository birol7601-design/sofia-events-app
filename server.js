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
      SELECT e.id, e.title, e.description, e.artist_bio, e.category, e.venue, e.start_time,
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
app.get('/api/events/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.title, e.description, e.artist_bio, e.category, e.venue, e.start_time,
             e.price_text, e.ticket_url, e.image_url,
             fs.slot_number,
             CASE WHEN fs.id IS NOT NULL AND NOW() BETWEEN fs.start_date AND fs.end_date
                  THEN true ELSE false END AS is_featured
      FROM events e
      LEFT JOIN featured_slots fs ON fs.event_id = e.id
      WHERE e.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
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
    const { title, description, artist_bio = null, category, venue, start_time, price_text, ticket_url, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO events (organizer_id, title, description, artist_bio, category, venue, start_time, price_text, ticket_url, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.organizerId, title, description, artist_bio, category, venue, start_time, price_text, ticket_url, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/featured-slots/availability', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fs.slot_number, fs.end_date, e.title
      FROM featured_slots fs
      JOIN events e ON e.id = fs.event_id
      WHERE NOW() BETWEEN fs.start_date AND fs.end_date
      ORDER BY fs.slot_number
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USER AUTH MIDDLEWARE ──────────────────────────────────────────────────────
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── USER ROUTES ───────────────────────────────────────────────────────────────

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, email_marketing = false } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, email_marketing) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [username.trim(), email.trim().toLowerCase(), hash, !!email_marketing]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      if (err.detail && err.detail.includes('username')) return res.status(400).json({ error: 'Username already taken' });
      if (err.detail && err.detail.includes('email')) return res.status(400).json({ error: 'Email already registered' });
      return res.status(400).json({ error: 'Username or email already taken' });
    }
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, username: user.username, avatarColor: user.avatar_color },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, id: user.id, username: user.username, email: user.email, avatarColor: user.avatar_color, bio: user.bio, isPublic: user.is_public });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/me', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, bio, avatar_color, is_public, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/me', authenticateUser, async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    if (req.body.bio !== undefined)       { fields.push(`bio = $${i++}`);       values.push(req.body.bio); }
    if (req.body.is_public !== undefined) { fields.push(`is_public = $${i++}`); values.push(req.body.is_public); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, username, email, bio, avatar_color, is_public`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ error: 'Query must be at least 2 characters' });
    const result = await pool.query(
      'SELECT id, username, bio, avatar_color FROM users WHERE username ILIKE $1 AND is_public = true LIMIT 10',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// These literal routes must be defined BEFORE /:id routes to avoid param capture
app.get('/api/users/saved/ids', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT event_id FROM user_saved_events WHERE user_id = $1', [req.userId]);
    res.json({ savedIds: result.rows.map(r => r.event_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/attending/ids', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT event_id FROM user_attending WHERE user_id = $1', [req.userId]);
    res.json({ attendingIds: result.rows.map(r => r.event_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/saved/:eventId', authenticateUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = await pool.query(
      'SELECT id FROM user_saved_events WHERE user_id = $1 AND event_id = $2', [req.userId, eventId]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM user_saved_events WHERE user_id = $1 AND event_id = $2', [req.userId, eventId]);
      res.json({ saved: false });
    } else {
      await pool.query('INSERT INTO user_saved_events (user_id, event_id) VALUES ($1, $2)', [req.userId, eventId]);
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/attending/:eventId', authenticateUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = await pool.query(
      'SELECT id FROM user_attending WHERE user_id = $1 AND event_id = $2', [req.userId, eventId]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM user_attending WHERE user_id = $1 AND event_id = $2', [req.userId, eventId]);
      res.json({ attending: false });
    } else {
      await pool.query('INSERT INTO user_attending (user_id, event_id) VALUES ($1, $2)', [req.userId, eventId]);
      res.json({ attending: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, bio, avatar_color, is_public FROM users WHERE id = $1', [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    if (!user.is_public) return res.status(403).json({ error: 'This profile is private' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/saved', async (req, res) => {
  try {
    const userId = req.params.id;
    const userRow = await pool.query('SELECT is_public FROM users WHERE id = $1', [userId]);
    if (userRow.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        isOwner = String(decoded.id) === String(userId);
      } catch {}
    }
    if (!userRow.rows[0].is_public && !isOwner) return res.status(403).json({ error: 'This profile is private' });

    const result = await pool.query(`
      SELECT e.id, e.title, e.description, e.category, e.venue, e.start_time, e.price_text, e.ticket_url, e.image_url,
             CASE WHEN fs.id IS NOT NULL AND NOW() BETWEEN fs.start_date AND fs.end_date THEN true ELSE false END AS is_featured
      FROM events e
      JOIN user_saved_events us ON us.event_id = e.id
      LEFT JOIN featured_slots fs ON fs.event_id = e.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/attending', async (req, res) => {
  try {
    const userId = req.params.id;
    const userRow = await pool.query('SELECT is_public FROM users WHERE id = $1', [userId]);
    if (userRow.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        isOwner = String(decoded.id) === String(userId);
      } catch {}
    }
    if (!userRow.rows[0].is_public && !isOwner) return res.status(403).json({ error: 'This profile is private' });

    const result = await pool.query(`
      SELECT e.id, e.title, e.description, e.category, e.venue, e.start_time, e.price_text, e.ticket_url, e.image_url,
             CASE WHEN fs.id IS NOT NULL AND NOW() BETWEEN fs.start_date AND fs.end_date THEN true ELSE false END AS is_featured
      FROM events e
      JOIN user_attending ua ON ua.event_id = e.id
      LEFT JOIN featured_slots fs ON fs.event_id = e.id
      WHERE ua.user_id = $1
      ORDER BY ua.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id/attending-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM user_attending WHERE event_id = $1', [req.params.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});