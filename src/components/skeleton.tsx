export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-shimmer rounded-md ${className ?? "h-4 w-full"}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-1/3" />
      <Skeleton className="mt-2 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 flex justify-between border-t border-slate-100 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 border-b border-slate-100 px-4 py-4 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? "w-32" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-1/2" />
      <Skeleton className="mt-2 h-4 w-1/3" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-10 w-full" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-64" />
      <div className="mt-6">
        <StatsRowSkeleton />
      </div>
      <Skeleton className="mt-8 h-40 w-full rounded-xl" />
    </div>
  );
}
