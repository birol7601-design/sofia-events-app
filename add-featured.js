const pool = require('./db');

async function addFeatured() {
  const now = new Date();
  const in30days = new Date();
  in30days.setDate(in30days.getDate() + 30);

  // Feature event 1 (Scorpions) as slot 1
  await pool.query(
    'INSERT INTO featured_slots (event_id, slot_number, start_date, end_date) VALUES ($1, $2, $3, $4)',
    [1, 1, now, in30days]
  );

  // Feature event 3 (Sofia Live Festival) as slot 2
  await pool.query(
    'INSERT INTO featured_slots (event_id, slot_number, start_date, end_date) VALUES ($1, $2, $3, $4)',
    [3, 2, now, in30days]
  );

  console.log('Featured slots added!');
  await pool.end();
}

addFeatured();