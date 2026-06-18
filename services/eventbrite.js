/**
 * Eventbrite API v3 fetcher for Sofia events.
 *
 * Returns mapped event objects ready for DB insertion.
 * If EVENTBRITE_TOKEN is missing, returns a clear error instead of crashing.
 */

const axios = require('axios');

const EB_BASE = 'https://www.eventbriteapi.com/v3';

// Eventbrite category IDs → our category labels
const CAT_MAP = {
  '103': 'Music',
  '101': 'Business',
  '110': 'Food & Drink',
  '113': 'Community',
  '105': 'Performing Arts',
  '107': 'Fashion',
  '109': 'Film & Media',
  '111': 'Government',
  '115': 'Travel & Outdoor',
  '117': 'Charity',
  '119': 'Health',
};

function guessCategory(ev) {
  if (ev.category_id && CAT_MAP[ev.category_id]) return CAT_MAP[ev.category_id];
  const name = (ev.name?.text || '').toLowerCase();
  if (/jazz|rock|pop|techno|house|dj|concert|festival/.test(name)) return 'Music';
  if (/food|wine|beer|drink|dinner/.test(name)) return 'Food & Drink';
  if (/art|exhibit|gallery/.test(name)) return 'Art';
  return 'Other';
}

function buildPriceText(ev) {
  if (ev.is_free) return 'FREE';
  // ticket_classes are expanded; find cheapest non-free cost
  const classes = ev.ticket_classes || [];
  const costs = classes
    .map(tc => tc.cost?.major_value)
    .filter(v => v && Number(v) > 0)
    .map(Number);
  if (costs.length) return `от €${Math.min(...costs)}`;
  return 'виж цена';
}

function mapEvent(ev) {
  const venue = ev.venue || {};
  const address = venue.address?.localized_address_display || venue.address?.city || null;

  return {
    title:       (ev.name?.text || 'Untitled').slice(0, 255),
    description: ev.description?.text || ev.summary || null,
    start_time:  ev.start?.utc || null,
    venue:       venue.name || null,
    address,
    price_text:  buildPriceText(ev),
    ticket_url:  ev.url || null,
    image_url:   ev.logo?.original?.url || ev.logo?.url || null,
    category:    guessCategory(ev),
    source:      'eventbrite',
    source_id:   ev.id,
    source_url:  ev.url,
    approved:    false,
  };
}

/**
 * Fetch upcoming Sofia events from Eventbrite.
 * @returns {{ events: object[], method: string, error?: string }}
 */
async function fetchSofiaEvents() {
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) {
    return { events: [], method: null, error: 'Eventbrite token not configured — set EVENTBRITE_TOKEN in Railway environment variables.' };
  }

  const headers = { Authorization: `Bearer ${token}` };
  const now = new Date().toISOString();

  // Try public search first
  try {
    const resp = await axios.get(`${EB_BASE}/events/search/`, {
      headers,
      params: {
        'location.address':        'Sofia, Bulgaria',
        'location.within':         '20km',
        'start_date.range_start':  now,
        'sort_by':                 'date',
        'expand':                  'venue,ticket_classes,logo',
        'page_size':               50,
      },
      timeout: 12000,
    });

    const raw = resp.data.events || [];
    console.log(`[Eventbrite] search returned ${raw.length} events`);
    return { events: raw.map(mapEvent), method: 'search' };

  } catch (err) {
    const status = err.response?.status;

    if (status === 403 || status === 401) {
      console.warn(`[Eventbrite] search blocked (${status}) — token may lack search permissions. Add organizer IDs to fetch by organizer instead.`);
      return {
        events: [],
        method: 'search_blocked',
        error: `Eventbrite search returned ${status}. Your token may need "Read Private Events" permission or search may require a paid Eventbrite plan. Provide organizer IDs to fetch by organizer instead.`,
      };
    }

    if (status === 404) {
      console.warn('[Eventbrite] search endpoint 404 — may be deprecated on this account tier.');
      return {
        events: [],
        method: 'search_unavailable',
        error: 'Eventbrite search endpoint returned 404. This API endpoint may not be available on your account. Provide organizer IDs to use the organizer-events endpoint instead.',
      };
    }

    console.error('[Eventbrite] unexpected error:', err.message);
    return { events: [], method: 'error', error: `Eventbrite API error: ${err.message}` };
  }
}

/**
 * Fetch events for a specific Eventbrite organizer ID.
 * Use this if the search endpoint is unavailable.
 * @param {string} organizerId
 */
async function fetchOrganizerEvents(organizerId) {
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) {
    return { events: [], error: 'Eventbrite token not configured.' };
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const resp = await axios.get(`${EB_BASE}/organizers/${organizerId}/events/`, {
      headers,
      params: {
        status:   'live',
        expand:   'venue,ticket_classes,logo',
        order_by: 'start_asc',
      },
      timeout: 12000,
    });

    const raw = resp.data.events || [];
    return { events: raw.map(mapEvent), method: `organizer:${organizerId}` };
  } catch (err) {
    return { events: [], method: 'error', error: `Organizer fetch error: ${err.message}` };
  }
}

module.exports = { fetchSofiaEvents, fetchOrganizerEvents };
