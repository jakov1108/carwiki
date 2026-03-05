interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-700/50 rounded ${className}`}
    />
  );
}

/** Skeleton for a full page of cards (e.g., brand/model listing) */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a detail page header */
export function DetailHeaderSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 mb-8">
      <Skeleton className="h-64 md:h-80 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/** Skeleton for variant spec cards */
export function SpecCardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for variant cards in generation detail */
export function VariantCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800 rounded-lg p-5 border border-slate-700"
        >
          <div className="flex justify-between items-start mb-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
          <div className="mt-3 flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for blog post cards */
export function BlogCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Breadcrumb skeleton */
export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-3" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-3" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
