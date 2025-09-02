// src/app/loading.tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-80 p-4 border-r border-border bg-card">
        <div className="h-10 bg-muted rounded-md mb-4 animate-pulse" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-muted rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-muted animate-pulse" />
        <div className="flex-1 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-12 bg-muted rounded-2xl animate-pulse ${
                i % 2 === 0 ? 'w-2/5' : 'w-3/5 ml-auto'
              }`}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <div className="h-20 bg-muted animate-pulse" />
      </div>
    </div>
  );
}