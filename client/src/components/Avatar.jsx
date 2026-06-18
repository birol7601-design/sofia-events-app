const GRADIENTS = {
  star:    ['#7C3AED','#EC4899'],
  crown:   ['#FB923C','#FBBF24'],
  moon:    ['#3B82F6','#7C3AED'],
  diamond: ['#06B6D4','#3B82F6'],
  flame:   ['#EF4444','#FB923C'],
  compass: ['#10B981','#3B82F6'],
  eye:     ['#8B5CF6','#EC4899'],
  vinyl:   ['#374151','#7C3AED'],
};

const SYMBOLS = {
  star:'✦', crown:'♛', moon:'◑', diamond:'◈', flame:'✦', compass:'⊕', eye:'◉', vinyl:'◎',
};

export default function Avatar({ type = 'star', size = 40, name = '' }) {
  const [c1, c2] = GRADIENTS[type] || GRADIENTS.star;
  const symbol = SYMBOLS[type] || '✦';
  const initial = name ? name[0].toUpperCase() : '';
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38,
        color: 'rgba(255,255,255,0.9)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initial || symbol}
    </div>
  );
}
