const pool = require('./db');

async function fixData() {
  await pool.query("UPDATE events SET price_text = $1 WHERE id = 1", ['from €35']);
  await pool.query("UPDATE events SET price_text = $1 WHERE id = 2", ['from €28']);
  console.log('Done!');
  await pool.end();
}

fixData();