/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        bg:           '#0A0A0A',
        bg2:          '#120E04',
        surface:      '#1C1708',
        surface2:     '#120E04',
        // Honey palette
        honey:        '#FFB800',
        honeyLight:   '#FFE45C',
        honeyPale:    '#FFF7C0',
        honeyDeep:    '#C46A00',
        honeyDark:    '#7A3D00',
        // Wax text tones
        wax:          '#FFF4D6',
        waxMuted:     '#C7B68A',
        waxDim:       '#8A7B4A',
        // Legacy aliases (keep so existing Tailwind classes auto-remap)
        primary:      '#FFB800',
        primaryLight: '#FFE45C',
        accent:       '#C46A00',
        accentWarm:   '#FFB800',
        text:         '#FFF4D6',
        textMuted:    '#C7B68A',
      },
      backgroundImage: {
        'hero-gradient':   'linear-gradient(135deg, #FFB800 0%, #C46A00 100%)',
        'hero-gradient-r': 'linear-gradient(135deg, #C46A00 0%, #FFB800 100%)',
        'glow':            'radial-gradient(circle at 50% 0%, rgba(255,184,0,0.18), transparent 70%)',
        'shimmer':         'linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.12) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow':           '0 0 30px rgba(255,184,0,0.28)',
        'glow-lg':        '0 8px 40px rgba(255,184,0,0.35)',
        'glow-accent':    '0 0 30px rgba(196,106,0,0.28)',
        'glow-accent-lg': '0 8px 40px rgba(196,106,0,0.35)',
        'card':           '0 4px 24px rgba(0,0,0,0.55)',
      },
      fontFamily: {
        display: ['"Sora"', '"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        'marquee-x': {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6 },
          '50%':      { opacity: 1 },
        },
      },
      animation: {
        'marquee':    'marquee-x 28s linear infinite',
        'shimmer':    'shimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
