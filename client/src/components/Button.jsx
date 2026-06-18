import { motion } from 'framer-motion';

const VARIANTS = {
  primary: {
    style: {
      background: 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFF7C0 0%, #FFE45C 22%, #FFB800 55%, #D87A00 100%)',
      color: '#7A3D00',
      border: 'none',
      boxShadow: '0 6px 18px rgba(255,150,0,0.38), inset 0 2px 5px rgba(255,255,255,0.65), inset 0 -3px 8px rgba(150,70,0,0.45)',
      position: 'relative',
      overflow: 'hidden',
    },
    hover: { scale: 1.04, boxShadow: '0 8px 24px rgba(255,150,0,0.5), inset 0 2px 5px rgba(255,255,255,0.7), inset 0 -3px 8px rgba(150,70,0,0.5)' },
  },
  ghost: {
    style: {
      background: 'transparent',
      color: '#FFE45C',
      border: '1px solid rgba(255,184,0,0.4)',
    },
    hover: { background: 'rgba(255,184,0,0.1)', borderColor: 'rgba(255,184,0,0.7)', scale: 1.02 },
  },
  glass: {
    style: {
      background: 'rgba(255,184,0,0.12)',
      color: '#FFE45C',
      border: '1px solid rgba(255,184,0,0.25)',
      backdropFilter: 'blur(12px)',
    },
    hover: { background: 'rgba(255,184,0,0.22)', scale: 1.02 },
  },
  accent: {
    style: {
      background: 'linear-gradient(135deg, #FFB800 0%, #C46A00 100%)',
      color: '#1A0A00',
      border: 'none',
      fontWeight: 800,
    },
    hover: { boxShadow: '0 0 28px rgba(255,184,0,0.5)', scale: 1.03 },
  },
  danger: {
    style: {
      background: 'transparent',
      color: '#FF6B35',
      border: '1px solid rgba(255,107,53,0.4)',
    },
    hover: { background: 'rgba(255,107,53,0.1)', scale: 1.02 },
  },
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  size = 'md',
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold font-body ${sizes[size] || sizes.md} ${className}`}
      style={{
        ...v.style,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={disabled ? undefined : v.hover}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.button>
  );
}
