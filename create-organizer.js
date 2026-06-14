const pool = require('./db');
const bcrypt = require('bcryptjs');

async function createOrganizer() {
  const hash = await bcrypt.hash('test1234', 10);
  const result = await pool.query(
    'INSERT INTO organizers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    ['Test Venue', 'test@venue.com', hash]
  );
  console.log('Created organizer:', result.rows[0]);
  console.log('Login with email: test@venue.com / password: test1234');
  await pool.end();
}

createOrganizer();