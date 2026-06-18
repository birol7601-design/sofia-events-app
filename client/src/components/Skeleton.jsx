import { motion } from 'framer-motion';

function ShimmerBox({ className = '', style = {} }) {
  return (
    <motion.div
      className={`rounded-xl shimmer-bg ${className}`}
      style={{ backgroundSize: '200% 100%', ...style }}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(30,24,56,0.55)',
        border: '1px solid rgba(167,139,250,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      }}
    >
      {/* Image area */}
      <ShimmerBox className="h-44 rounded-none" />
      {/* Info area */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        <ShimmerBox className="h-4 w-3/4" />
        <ShimmerBox className="h-3 w-1/2" />
        <div className="flex justify-between pt-1">
          <ShimmerBox className="h-3 w-16" />
          <ShimmerBox className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 flex gap-3 items-center"
      style={{
        background: 'rgba(30,24,56,0.55)',
        border: '1px solid rgba(167,139,250,0.1)',
      }}
    >
      <ShimmerBox className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <ShimmerBox className="h-3.5 w-3/4" />
        <ShimmerBox className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 px-5 pt-3">
      <div className="flex items-end gap-4">
        <ShimmerBox className="w-[72px] h-[72px] rounded-full" />
        <div className="flex-1 space-y-2 pb-1">
          <ShimmerBox className="h-5 w-32" />
          <ShimmerBox className="h-3 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ShimmerBox className="h-20 rounded-2xl" />
        <ShimmerBox className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBox
          key={i}
          className="h-3"
          style={{ width: `${100 - (i === lines - 1 ? 30 : i * 8)}%` }}
        />
      ))}
    </div>
  );
}
