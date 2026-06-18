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
        'hero-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'glow':          'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.25), transparent 70%)',
      },
      boxShadow: {
        'glow':        '0 0 30px rgba(124,58,237,0.3)',
        'glow-accent': '0 0 30px rgba(236,72,153,0.25)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

