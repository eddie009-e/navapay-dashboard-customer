interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LoadingSpinner({ size = 'md', color = 'text-primary' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-3" />
          <div className="skeleton h-8 w-32 mb-2" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="skeleton w-14 h-14 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="skeleton h-10 flex-1 rounded-xl" />
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="skeleton w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome skeleton */}
      <div className="skeleton h-24 rounded-2xl" />
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Chart + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 skeleton h-80 rounded-2xl" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-3 w-32" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
