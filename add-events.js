const pool = require('./db');

async function addEvents() {
  const events = [
    {
      title: 'Sofia Live Festival 2026',
      description: 'Urban festival mixing indie rock, electronic, hip-hop and alternative music',
      category: 'Festival',
      venue: 'Vidas Art Arena, Borisova Garden',
      start_time: '2026-06-27 17:30:00',
      price_text: 'price varies',
      ticket_url: 'https://ticketstation.bg'
    },
    {
      title: 'A to JazZ Festival',
      description: 'Annual jazz festival in South Park',
      category: 'Jazz',
      venue: 'South Park',
      start_time: '2026-07-02 18:00:00',
      price_text: 'free entry',
      ticket_url: 'https://atojazzfest.bg'
    },
    {
      title: 'BEAT @ NDK',
      description: 'Live concert at the National Palace of Culture',
      category: 'Pop',
      venue: 'NDK Hall 1',
      start_time: '2026-07-09 19:00:00',
      price_text: 'price varies',
      ticket_url: 'https://ticketstation.bg'
    },
    {
      title: 'The Wailers',
      description: 'Legendary reggae band live in Sofia',
      category: 'Reggae',
      venue: 'Vidas Art Arena',
      start_time: '2026-07-15 19:00:00',
      price_text: 'price varies',
      ticket_url: 'https://ticketstation.bg'
    }
  ];

  for (const e of events) {
    await pool.query(
      `INSERT INTO events (title, description, category, venue, start_time, price_text, ticket_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [e.title, e.description, e.category, e.venue, e.start_time, e.price_text, e.ticket_url]
    );
  }

  console.log('Added', events.length, 'events!');
  await pool.end();
}

addEvents();