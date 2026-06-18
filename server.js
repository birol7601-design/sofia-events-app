const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { sendEmail } = require('./emailService');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'BuzzAdmin2026!Sofia';
const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' }
});

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
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
             e.price_text, e.ticket_url, e.image_url, e.artist_id,
             fs.slot_number,
             CASE WHEN fs.id IS NOT NULL AND NOW() BETWEEN fs.start_date AND fs.end_date
                  THEN true ELSE false END AS is_featured
      FROM events e
      LEFT JOIN featured_slots fs ON fs.event_id = e.id
      WHERE COALESCE(e.deleted, false) = false AND COALESCE(e.approved, true) = true
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
             e.price_text, e.ticket_url, e.image_url, e.artist_id,
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

app.post('/api/users/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password, email_marketing = false } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required.' });
    if (username.length < 3 || username.length > 30) return res.status(400).json({ error: 'Username must be 3–30 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, email_marketing) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [username.trim(), email.trim().toLowerCase(), hash, !!email_marketing]
    );
    const newUser = result.rows[0];
    // send verification email (fire-and-forget)
    const vToken = crypto.randomBytes(32).toString('hex');
    await pool.query('INSERT INTO verification_tokens (user_id, token) VALUES ($1, $2)', [newUser.id, vToken]);
    sendEmail(newUser.email, 'Verify your SofiaBuzz email',
      `<div style="background:#1A0A00;color:#FFD199;padding:32px;font-family:Georgia,serif;">
        <h1 style="color:#FF8C00;font-size:28px;">Welcome to SofiaBuzz! 🎉</h1>
        <p>Confirm your email to unlock everything:</p>
        <a href="https://sofiabuzz.com/verify-email.html?token=${vToken}"
           style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#FF8C00);color:#1A0A00;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;margin:16px 0;">
          Verify my email →
        </a>
        <p style="color:#8B6040;font-size:13px;">If you didn't create this account, ignore this email.</p>
      </div>`
    );
    res.json(newUser);
  } catch (err) {
    if (err.code === '23505') {
      if (err.detail && err.detail.includes('username')) return res.status(400).json({ error: 'Username already taken' });
      if (err.detail && err.detail.includes('email')) return res.status(400).json({ error: 'Email already registered' });
      return res.status(400).json({ error: 'Username or email already taken' });
    }
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
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
    res.json({ token, id: user.id, userId: user.id, username: user.username, email: user.email, avatarColor: user.avatar_color, avatarType: user.avatar_type, bio: user.bio, isPublic: user.is_public, onboardingComplete: user.onboarding_complete || false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/me', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, bio, avatar_color, avatar_type, is_public, email_verified, created_at FROM users WHERE id = $1',
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
    if (req.body.bio !== undefined)         { fields.push(`bio = $${i++}`);         values.push(req.body.bio); }
    if (req.body.is_public !== undefined)   { fields.push(`is_public = $${i++}`);   values.push(req.body.is_public); }
    if (req.body.avatar_type !== undefined) { fields.push(`avatar_type = $${i++}`); values.push(req.body.avatar_type); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, username, email, bio, avatar_color, avatar_type, is_public`,
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
      'SELECT id, username, bio, avatar_color, avatar_type FROM users WHERE username ILIKE $1 AND is_public = true LIMIT 10',
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
      'SELECT id, username, bio, avatar_color, avatar_type, is_public FROM users WHERE id = $1', [req.params.id]
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

// ── FRIEND ROUTES ────────────────────────────────────────────────────────────

app.post('/api/friends/request/:userId', authenticateUser, async (req, res) => {
  try {
    const receiver = req.params.userId;
    if (String(receiver) === String(req.userId)) return res.status(400).json({ error: 'Cannot friend yourself' });
    await pool.query(
      'INSERT INTO friendships (requester_id, receiver_id, status) VALUES ($1, $2, $3)',
      [req.userId, receiver, 'pending']
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Request already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friends/accept/:userId', authenticateUser, async (req, res) => {
  try {
    await pool.query(
      'UPDATE friendships SET status=$1 WHERE requester_id=$2 AND receiver_id=$3',
      ['accepted', req.params.userId, req.userId]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/friends/decline/:userId', authenticateUser, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM friendships WHERE (requester_id=$1 AND receiver_id=$2) OR (requester_id=$2 AND receiver_id=$1)',
      [req.params.userId, req.userId]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/friends', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.bio, u.avatar_color AS "avatarColor", u.avatar_type AS "avatarType"
      FROM friendships f
      JOIN users u ON (
        CASE WHEN f.requester_id = $1 THEN f.receiver_id ELSE f.requester_id END = u.id
      )
      WHERE (f.requester_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted'
    `, [req.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/friends/pending', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.avatar_type AS "avatarType", u.avatar_color AS "avatarColor"
      FROM friendships f
      JOIN users u ON f.requester_id = u.id
      WHERE f.receiver_id = $1 AND f.status = 'pending'
    `, [req.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/friends/status/:userId', authenticateUser, async (req, res) => {
  try {
    const other = req.params.userId;
    const result = await pool.query(
      'SELECT status, requester_id FROM friendships WHERE (requester_id=$1 AND receiver_id=$2) OR (requester_id=$2 AND receiver_id=$1)',
      [req.userId, other]
    );
    if (result.rows.length === 0) return res.json({ status: 'none' });
    const row = result.rows[0];
    if (row.status === 'accepted') return res.json({ status: 'accepted' });
    if (String(row.requester_id) === String(req.userId)) return res.json({ status: 'pending_sent' });
    return res.json({ status: 'pending_received' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── MESSAGE ROUTES ────────────────────────────────────────────────────────────

app.get('/api/messages/unread-count', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND read=false', [req.userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages/:userId', authenticateUser, async (req, res) => {
  try {
    const other = req.params.userId;
    await pool.query(
      'UPDATE messages SET read=true WHERE sender_id=$1 AND receiver_id=$2 AND read=false',
      [other, req.userId]
    );
    const result = await pool.query(`
      SELECT id, sender_id, receiver_id, content, read, created_at
      FROM messages
      WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
      ORDER BY created_at ASC
    `, [req.userId, other]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/messages/:userId', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message cannot be empty' });
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, req.params.userId, content.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ARTIST ROUTES ─────────────────────────────────────────────────────────────

app.get('/api/artists', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, genres, avatar_type, bio FROM artists ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/artists/by-name/:name', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artists WHERE name ILIKE $1 LIMIT 1', [req.params.name]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Artist not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/artists/:id', async (req, res) => {
  try {
    const artistResult = await pool.query('SELECT * FROM artists WHERE id = $1', [req.params.id]);
    if (artistResult.rows.length === 0) return res.status(404).json({ error: 'Artist not found' });
    const artist = artistResult.rows[0];

    const eventsResult = await pool.query(`
      SELECT id, title, venue, start_time, price_text, ticket_url, image_url, category
      FROM events WHERE artist_id = $1 ORDER BY start_time ASC
    `, [req.params.id]);

    const now = new Date();
    const upcoming = eventsResult.rows.filter(e => new Date(e.start_time) >= now);
    const past     = eventsResult.rows.filter(e => new Date(e.start_time) < now);

    res.json({ ...artist, upcoming, past });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── USER PREFERENCES & ONBOARDING ────────────────────────────────────────────

app.get('/api/users/preferences', authenticateUser, async (req, res) => {
  try {
    const genres = await pool.query('SELECT genre FROM user_genre_preferences WHERE user_id=$1', [req.userId]);
    const artists = await pool.query(
      'SELECT a.id, a.name, a.avatar_type FROM user_artist_preferences uap JOIN artists a ON uap.artist_id=a.id WHERE uap.user_id=$1',
      [req.userId]
    );
    res.json({ genres: genres.rows.map(r => r.genre), artists: artists.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/preferences/genres', authenticateUser, async (req, res) => {
  try {
    const { genres } = req.body;
    if (!Array.isArray(genres)) return res.status(400).json({ error: 'genres must be an array' });
    await pool.query('DELETE FROM user_genre_preferences WHERE user_id=$1', [req.userId]);
    for (const g of genres) {
      await pool.query('INSERT INTO user_genre_preferences (user_id, genre) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.userId, g]);
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/preferences/artists', authenticateUser, async (req, res) => {
  try {
    const { artistIds } = req.body;
    if (!Array.isArray(artistIds)) return res.status(400).json({ error: 'artistIds must be an array' });
    await pool.query('DELETE FROM user_artist_preferences WHERE user_id=$1', [req.userId]);
    for (const id of artistIds) {
      await pool.query('INSERT INTO user_artist_preferences (user_id, artist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.userId, id]);
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/users/onboarding', authenticateUser, async (req, res) => {
  try {
    await pool.query('UPDATE users SET onboarding_complete=true WHERE id=$1', [req.userId]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PASSWORD RESET ────────────────────────────────────────────────────────────

app.post('/api/users/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required.' });
    const r = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (r.rows.length > 0) {
      const userId = r.rows[0].id;
      const token = crypto.randomBytes(32).toString('hex');
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'1 hour\')',
        [userId, token]
      );
      sendEmail(email.trim().toLowerCase(), 'Reset your SofiaBuzz password',
        `<div style="background:#1A0A00;color:#FFD199;padding:32px;font-family:Georgia,serif;">
          <h1 style="color:#FF8C00;font-size:24px;">Password reset 🔑</h1>
          <p>Click the link below to choose a new password. The link expires in 1 hour.</p>
          <a href="https://sofiabuzz.com/reset-password.html?token=${token}"
             style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#FF8C00);color:#1A0A00;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;margin:16px 0;">
            Reset password →
          </a>
          <p style="color:#8B6040;font-size:13px;">If you didn't request this, ignore this email.</p>
        </div>`
      );
    }
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const r = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (r.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired link.' });
    const { user_id } = r.rows[0];
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user_id]);
    await pool.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── EMAIL VERIFICATION ────────────────────────────────────────────────────────

app.get('/api/users/verify-email/:token', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM verification_tokens WHERE token = $1', [req.params.token]);
    if (r.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired link.' });
    const { user_id } = r.rows[0];
    await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [user_id]);
    await pool.query('DELETE FROM verification_tokens WHERE token = $1', [req.params.token]);
    res.json({ message: 'Email verified successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/resend-verification', authenticateUser, async (req, res) => {
  try {
    const r = await pool.query('SELECT email, email_verified FROM users WHERE id = $1', [req.userId]);
    if (!r.rows[0]) return res.status(404).json({ error: 'User not found.' });
    if (r.rows[0].email_verified) return res.json({ message: 'Already verified.' });
    await pool.query('DELETE FROM verification_tokens WHERE user_id = $1', [req.userId]);
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query('INSERT INTO verification_tokens (user_id, token) VALUES ($1, $2)', [req.userId, token]);
    sendEmail(r.rows[0].email, 'Verify your SofiaBuzz email',
      `<div style="background:#1A0A00;color:#FFD199;padding:32px;font-family:Georgia,serif;">
        <h1 style="color:#FF8C00;">Verify your email ✉️</h1>
        <a href="https://sofiabuzz.com/verify-email.html?token=${token}"
           style="display:inline-block;background:linear-gradient(135deg,#FF6B35,#FF8C00);color:#1A0A00;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;margin:16px 0;">
          Verify email →
        </a>
      </div>`
    );
    res.json({ message: 'Verification email sent.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return res.status(403).json({ error: 'Not admin' });
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [eventsR, usersR, featuredR, eventsMonthR, usersMonthR] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM events WHERE COALESCE(deleted,false)=false'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM featured_slots WHERE NOW() BETWEEN start_date AND end_date'),
      pool.query("SELECT COUNT(*) FROM events WHERE created_at >= date_trunc('month', NOW()) AND COALESCE(deleted,false)=false"),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', NOW())"),
    ]);
    res.json({
      totalEvents: eventsR.rows[0].count,
      totalUsers: usersR.rows[0].count,
      activeFeaturedSlots: featuredR.rows[0].count,
      eventsThisMonth: eventsMonthR.rows[0].count,
      usersThisMonth: usersMonthR.rows[0].count,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT e.*, o.name AS organizer_name FROM events e LEFT JOIN organizers o ON e.organizer_id = o.id ORDER BY e.id DESC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/events/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE events SET approved=true WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/events/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE events SET approved=false WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE events SET deleted=true WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const allowed = ['title','description','category','venue','start_time','price_text','ticket_url','image_url','artist_bio'];
    const fields = []; const values = []; let i = 1;
    for (const k of allowed) {
      if (req.body[k] !== undefined) { fields.push(`${k}=$${i++}`); values.push(req.body[k]); }
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    values.push(req.params.id);
    const r = await pool.query(`UPDATE events SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, values);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, artist_bio, category, venue, start_time, price_text, ticket_url, image_url } = req.body;
    const r = await pool.query(
      `INSERT INTO events (title, description, artist_bio, category, venue, start_time, price_text, ticket_url, image_url, approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING *`,
      [title, description, artist_bio, category, venue, start_time, price_text, ticket_url, image_url]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT id, username, email, email_verified, created_at FROM users ORDER BY id DESC');
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/featured-slots', authenticateAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT fs.*, e.title AS event_title FROM featured_slots fs LEFT JOIN events e ON fs.event_id=e.id ORDER BY fs.slot_number`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/featured-slots/:id/activate', authenticateAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE featured_slots SET start_date=NOW(), end_date=NOW()+INTERVAL '30 days' WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/buzz-says', authenticateAdmin, async (req, res) => {
  try {
    const { page, comment_bg, comment_en, context } = req.body;
    const r = await pool.query(
      'INSERT INTO buzz_says (page, comment_bg, comment_en, context) VALUES ($1,$2,$3,$4) RETURNING *',
      [page, comment_bg, comment_en || null, context || 'default']
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ORGANIZER EDIT / DELETE ───────────────────────────────────────────────────

app.patch('/api/organizer/events/:id', authenticateOrganizer, async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM events WHERE id=$1 AND organizer_id=$2', [req.params.id, req.organizerId]);
    if (!check.rows.length) return res.status(403).json({ error: 'Not your event.' });
    const allowed = ['title','description','category','venue','start_time','price_text','ticket_url','image_url','artist_bio'];
    const fields = []; const values = []; let i = 1;
    for (const k of allowed) {
      if (req.body[k] !== undefined) { fields.push(`${k}=$${i++}`); values.push(req.body[k]); }
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update.' });
    values.push(req.params.id);
    const r = await pool.query(`UPDATE events SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, values);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/organizer/events/:id', authenticateOrganizer, async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM events WHERE id=$1 AND organizer_id=$2', [req.params.id, req.organizerId]);
    if (!check.rows.length) return res.status(403).json({ error: 'Not your event.' });
    await pool.query('UPDATE events SET deleted=true WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BUZZ SAYS ────────────────────────────────────────────────────────────────

app.get('/api/buzz-says/:page', async (req, res) => {
  try {
    const { context } = req.query;
    const params = [req.params.page];
    let q = 'SELECT * FROM buzz_says WHERE page=$1 AND active=true';
    if (context) { q += ' AND context=$2'; params.push(context); }
    q += ' ORDER BY RANDOM() LIMIT 1';
    const r = await pool.query(q, params);
    if (!r.rows.length) return res.json(null);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});