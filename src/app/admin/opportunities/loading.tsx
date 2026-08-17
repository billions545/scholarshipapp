import { Skeleton, TableSkeleton } from "@/components/skeleton";

export default function AdminOpportunitiesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      <div className="mt-6">
        <TableSkeleton />
      </div>
    </div>
  );
}
