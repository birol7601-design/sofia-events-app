const pool = require('./db');

async function addEvent() {
  const description = "One of Bulgaria's most beloved pop stars takes the stage at Club 33 in the heart of Studentski grad for a night built around hits and high energy. Expect a packed dance floor, drink promotions on selected bottles throughout the night, and VIP parking and entry options for those who book ahead. Students get free entry before midnight - arrive early to make the most of it.";

  const artistBio = "Preslava is one of the most prominent names in Bulgarian pop-folk, known for a string of chart-topping hits and a high-energy live show built around big vocals and crowd interaction. A regular fixture on Sofia's club circuit, her shows typically draw large crowds looking for a night of dancing and singalongs.";

  await pool.query(
    `INSERT INTO events (title, description, artist_bio, category, venue, start_time, price_text, ticket_url, image_url, organizer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    ['Преслава Live at Club 33', description, artistBio, 'Pop', 'Club 33, Studentski grad', '2026-06-18 23:00:00', 'Free for students before 00:00', 'https://justbook.bg/@club33', '/images/club33.svg', null]
  );

  console.log('Preslava event added!');
  await pool.end();
}

addEvent();
