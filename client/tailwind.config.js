/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#0D0A1A',
        surface:      '#16122B',
        surface2:     '#1E1838',
        primary:      '#7C3AED',
        primaryLight: '#A78BFA',
        accent:       '#EC4899',
        accentWarm:   '#FB923C',
        text:         '#F5F3FF',
        textMuted:    '#A39CC4',
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'hero-gradient-r':  'linear-gradient(135deg, #EC4899 0%, #FB923C 100%)',
        'glow':             'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.25), transparent 70%)',
        'shimmer':          'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.15) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow':        '0 0 30px rgba(124,58,237,0.3)',
        'glow-lg':     '0 8px 40px rgba(124,58,237,0.4)',
        'glow-accent': '0 0 30px rgba(236,72,153,0.25)',
        'glow-accent-lg': '0 8px 40px rgba(236,72,153,0.35)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
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
        'marquee':     'marquee-x 28s linear infinite',
        'shimmer':     'shimmer 2s ease-in-out infinite',
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
