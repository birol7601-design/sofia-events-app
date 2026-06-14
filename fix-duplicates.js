const pool = require('./db');

async function fixDuplicates() {
  // Keep only the lowest-id row per event_id, delete the rest
  await pool.query(`
    DELETE FROM featured_slots
    WHERE id NOT IN (
      SELECT MIN(id) FROM featured_slots GROUP BY event_id
    )
  `);

  const result = await pool.query('SELECT * FROM featured_slots');
  console.log('Remaining featured slots:', result.rows);
  await pool.end();
}

fixDuplicates();