const pool = require('./db');

async function run() {
  await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS artist_bio TEXT');
  console.log('artist_bio column added (local)');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
