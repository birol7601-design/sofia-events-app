export default function GlassCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl p-4 ${onClick ? 'cursor-pointer hover:border-primary/40 transition-colors duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
