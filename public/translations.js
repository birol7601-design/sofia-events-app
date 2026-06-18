const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_saved: 'Saved', nav_messages: 'Messages',
    nav_organizers: 'Organizers', nav_profile: 'Profile',
    btn_get_tickets: 'Get tickets', btn_going: "I'm going", btn_going_check: "Going ✓",
    btn_save: 'Save', btn_send: 'Send', btn_register: 'Create account',
    btn_login: 'Log in', btn_logout: 'Log out', btn_edit_profile: 'Edit profile',
    btn_add_friend: 'Add friend', btn_accept: 'Accept', btn_decline: 'Decline',
    btn_follow: 'Follow', btn_unfollow: 'Unfollow',
    section_about_event: 'About this event', section_about_artist: 'About the artist',
    section_venue: 'Venue & getting there', section_more_shows: 'More shows',
    section_saved: 'Saved events', section_attending: 'Attending',
    section_friend_requests: 'Friend requests', section_browse_genre: 'Browse by genre',
    section_highlights: 'Tonight & this week', section_for_you: 'For You',
    empty_saved: 'No saved events yet. Tap ♡ on any event to save it.',
    empty_attending: 'No upcoming events. Browse the feed!',
    empty_messages: 'No conversations yet. Add friends to start chatting.',
    empty_friends: 'No friend requests.',
    form_email: 'Email', form_password: 'Password', form_username: 'Username',
    form_confirm_password: 'Confirm password', form_bio: 'Bio',
    form_event_title: 'Event title', form_description: 'Description',
    form_venue: 'Venue', form_category: 'Category', form_price: 'Price',
    form_ticket_url: 'Ticket URL', form_image_url: 'Image URL',
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening', greeting_night: 'Good night',
    from: 'from', loading: 'Loading…', error_load: 'Could not load events.',
    taste_rock: '🎸 Rock head', taste_jazz: '🎷 Jazz soul', taste_festival: '🎪 Festival creature',
    taste_electronic: '🎧 Floor resident', taste_pop: '🎤 Pop heart', taste_mixed: '🃏 Open to everything',
    lang_toggle: '🌐 Език / Language',
    buzz_label: 'BUZZ SAYS',
  },
  bg: {
    nav_home: 'Начало', nav_saved: 'Запазени', nav_messages: 'Съобщения',
    nav_organizers: 'Организатори', nav_profile: 'Профил',
    btn_get_tickets: 'Купи билети', btn_going: 'Ще ходя', btn_going_check: 'Ще ходя ✓',
    btn_save: 'Запази', btn_send: 'Изпрати', btn_register: 'Създай акаунт',
    btn_login: 'Влез', btn_logout: 'Изход', btn_edit_profile: 'Редактирай профил',
    btn_add_friend: 'Добави приятел', btn_accept: 'Приеми', btn_decline: 'Откажи',
    btn_follow: 'Последвай', btn_unfollow: 'Спри',
    section_about_event: 'За събитието', section_about_artist: 'За артиста',
    section_venue: 'Място и как да стигнеш', section_more_shows: 'Още концерти',
    section_saved: 'Запазени събития', section_attending: 'Ще присъствам',
    section_friend_requests: 'Заявки за приятелство', section_browse_genre: 'Разгледай по жанр',
    section_highlights: 'Тази вечер и тази седмица', section_for_you: 'За теб',
    empty_saved: 'Нямаш запазени събития. Натисни ♡ на събитие.',
    empty_attending: 'Нямаш предстоящи събития. Разгледай!',
    empty_messages: 'Нямаш разговори. Добави приятели.',
    empty_friends: 'Нямаш заявки за приятелство.',
    form_email: 'Имейл', form_password: 'Парола', form_username: 'Потребителско име',
    form_confirm_password: 'Потвърди паролата', form_bio: 'Биография',
    form_event_title: 'Заглавие на събитие', form_description: 'Описание',
    form_venue: 'Място', form_category: 'Категория', form_price: 'Цена',
    form_ticket_url: 'Линк за билети', form_image_url: 'Линк към изображение',
    greeting_morning: 'Добро утро', greeting_afternoon: 'Добър ден',
    greeting_evening: 'Добър вечер', greeting_night: 'Добра нощ',
    from: 'от', loading: 'Зарежда се…', error_load: 'Неуспешно зареждане.',
    taste_rock: '🎸 Рок глава', taste_jazz: '🎷 Джаз душа', taste_festival: '🎪 Фестивално създание',
    taste_electronic: '🎧 Floor резидент', taste_pop: '🎤 Поп сърце', taste_mixed: '🃏 Всеяден',
    lang_toggle: '🌐 Език / Language',
    buzz_label: 'BUZZ КАЗВА',
  }
};

window.TRANSLATIONS = TRANSLATIONS;

window.t = function(key) {
  const lang = localStorage.getItem('lang') || 'bg';
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['en'][key] || key;
};

window.currentLang = function() {
  return localStorage.getItem('lang') || 'bg';
};
