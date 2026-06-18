export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold text-sm px-5 py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-body';
  const variants = {
    primary: 'bg-hero-gradient text-white shadow-glow hover:opacity-90 active:scale-95',
    ghost:   'bg-transparent border border-primary/40 text-primaryLight hover:bg-primary/10 active:scale-95',
    danger:  'bg-transparent border border-accent/40 text-accent hover:bg-accent/10 active:scale-95',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
