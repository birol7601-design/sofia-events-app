import { motion } from 'framer-motion';

const VARIANTS = {
  primary: {
    style: {
      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      color: '#fff',
      border: 'none',
    },
    hover: { boxShadow: '0 0 28px rgba(124,58,237,0.55)', scale: 1.03 },
  },
  ghost: {
    style: {
      background: 'transparent',
      color: '#A78BFA',
      border: '1px solid rgba(167,139,250,0.4)',
    },
    hover: { background: 'rgba(124,58,237,0.12)', borderColor: 'rgba(167,139,250,0.7)', scale: 1.02 },
  },
  glass: {
    style: {
      background: 'rgba(124,58,237,0.15)',
      color: '#A78BFA',
      border: '1px solid rgba(167,139,250,0.25)',
      backdropFilter: 'blur(12px)',
    },
    hover: { background: 'rgba(124,58,237,0.25)', scale: 1.02 },
  },
  accent: {
    style: {
      background: 'linear-gradient(135deg, #EC4899 0%, #FB923C 100%)',
      color: '#fff',
      border: 'none',
    },
    hover: { boxShadow: '0 0 28px rgba(236,72,153,0.5)', scale: 1.03 },
  },
  danger: {
    style: {
      background: 'transparent',
      color: '#EC4899',
      border: '1px solid rgba(236,72,153,0.4)',
    },
    hover: { background: 'rgba(236,72,153,0.1)', scale: 1.02 },
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
