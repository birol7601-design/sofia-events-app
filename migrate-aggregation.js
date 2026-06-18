/**
 * Adds source / source_id / source_url columns to events for aggregation.
 * Usage:  DATABASE_URL="postgres://..." node migrate-aggregation.js
 */
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('ERROR: Set DATABASE_URL before running.\n  DATABASE_URL="postgres://..." node migrate-aggregation.js');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log('Connecting to Railway DB…');

  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS source     VARCHAR(50)  DEFAULT 'manual'`);
  console.log("✓ events.source (default 'manual')");

  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS source_id  VARCHAR(255)`);
  console.log('✓ events.source_id');

  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS source_url TEXT`);
  console.log('✓ events.source_url');

  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS address    TEXT`);
  console.log('✓ events.address');

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_events_source
    ON events(source, source_id)
    WHERE source_id IS NOT NULL
  `);
  console.log('✓ unique index on (source, source_id)');

  // Backfill existing events as 'manual'
  await pool.query(`UPDATE events SET source = 'manual' WHERE source IS NULL`);
  console.log("✓ backfilled existing rows with source='manual'");

  // Verify
  const check = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='events' AND column_name IN ('source','source_id','source_url','address') ORDER BY column_name`);
  console.log(`\n✓ Columns confirmed: ${check.rows.map(r => r.column_name).join(', ')}`);

  await pool.end();
  console.log('\nMigration complete.');
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  pool.end();
  process.exit(1);
});
