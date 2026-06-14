const pool = require('./db');

async function addImages() {
  const images = {
    1: 'https://picsum.photos/seed/scorpions/600/340',
    2: 'https://picsum.photos/seed/aura/600/340',
    3: 'https://picsum.photos/seed/sofialive/600/340',
    4: 'https://picsum.photos/seed/jazz/600/340',
    5: 'https://picsum.photos/seed/beat/600/340',
    6: 'https://picsum.photos/seed/wailers/600/340'
  };

  for (const [id, url] of Object.entries(images)) {
    await pool.query('UPDATE events SET image_url = $1 WHERE id = $2', [url, id]);
  }

  console.log('Images added!');
  await pool.end();
}

addImages();