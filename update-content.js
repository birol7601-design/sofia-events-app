const pool = require('./db');

const updates = [
  {
    id: 1,
    description: "After more than five decades on the road, Scorpions return to Sofia with the Coming Home Tour - a career-spanning set built around their classic albums. Expect a production heavy on lights and pyrotechnics, a setlist mixing arena anthems with deep cuts, and the kind of crowd singalongs that have defined their European tours since the 1980s. Doors open at 19:00, with a support act expected to take the stage roughly 45 minutes before the headline set begins.",
    artist_bio: "Formed in Hannover in 1965, Scorpions helped define the sound of European hard rock through the 1970s and 80s. Known for blending technical guitar work with anthemic, sing-along choruses, the band built a global following through constant touring and a string of albums that balanced heavy riffs with power ballads. Decades later, their live shows remain a benchmark for the genre - tight, theatrical, and built around songs that entire stadiums know by heart.",
  },
  {
    id: 2,
    description: "AURA Festival transforms Sofia Airport Park into a multi-stage electronic music experience built around the 'Temple of Eos' theme - immersive visuals, large-scale stage design, and a lineup spanning techno, house, and progressive sounds. With camping and day-ticket options typically available, the festival draws an international crowd for a weekend that runs from afternoon into the early hours, with production values aiming for a full sensory experience rather than just a concert.",
    artist_bio: "Electronic festivals like AURA build their lineups around a mix of international headliners and rising regional talent, often revealed in phases ahead of the event. Stage design and visual production are treated as a core part of the experience - expect large LED setups, synchronized lighting, and themed stage architecture that ties into the festival's annual concept.",
  },
  {
    id: 3,
    description: "Sofia Live Festival brings together indie rock, electronic, hip-hop, and alternative acts across multiple stages in Borisova Garden, positioning itself as the city's flagship multi-genre music event. The festival format means a varied day - rotating between stages lets attendees catch everything from guitar-driven sets to DJ-led performances, with food and drink vendors and rest areas spread throughout the park grounds.",
    artist_bio: "Multi-genre festivals like this one typically build their bill around a small number of larger touring acts supported by a wider mix of local and regional artists across smaller stages, giving attendees a chance to discover new music between bigger sets.",
  },
  {
    id: 4,
    description: "Now a fixture of Sofia's summer calendar, A to JazZ turns South Park into an open-air jazz venue for several days, with free entry making it one of the most accessible major festivals in the city. The lineup typically spans traditional jazz, fusion, and adjacent genres like soul and funk, with performances running from late afternoon into the evening against the backdrop of the park's green spaces.",
    artist_bio: "Jazz festivals built around free, open-air formats tend to draw a broad audience - families early in the day, a more concert-focused crowd as evening sets begin. Lineups often mix internationally touring jazz musicians with strong representation from the local and regional jazz scene.",
  },
  {
    id: 5,
    description: "BEAT @ NDK brings a contemporary pop lineup to the National Palace of Culture's main hall, one of Sofia's largest indoor concert venues. Expect a full-production show - staging, lighting, and sound designed for NDK's large-capacity Hall 1 - with the kind of setlist built around radio hits and crowd-pleasing moments.",
    artist_bio: "NDK's Hall 1 is one of the largest indoor venues in Sofia, regularly hosting major touring pop and contemporary acts. Its size allows for substantial stage production while remaining an indoor, seated-or-standing venue depending on the show's configuration.",
  },
  {
    id: 6,
    description: "The Wailers bring authentic reggae roots to Sofia, performing the genre-defining catalogue that helped bring reggae to a global audience. Expect a set built around classic rhythms, horn-driven arrangements, and the kind of laid-back-but-powerful live sound that's been the band's signature for decades.",
    artist_bio: "Originally formed in Jamaica in the 1960s, The Wailers became one of the most influential bands in reggae history, helping carry the genre's sound and message to audiences worldwide. Decades on, the band continues to tour internationally, performing the music that shaped reggae as a global genre.",
  },
];

async function run() {
  for (const { id, description, artist_bio } of updates) {
    await pool.query(
      'UPDATE events SET description = $1, artist_bio = $2 WHERE id = $3',
      [description, artist_bio, id]
    );
    console.log(`Updated event ${id}`);
  }
  await pool.end();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });
