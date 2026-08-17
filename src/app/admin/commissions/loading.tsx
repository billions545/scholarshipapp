import { Skeleton, StatsRowSkeleton, TableSkeleton } from "@/components/skeleton";

export default function AdminCommissionsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <div className="mt-4 w-fit">
        <StatsRowSkeleton count={3} />
      </div>
      <div className="mt-6">
        <TableSkeleton cols={7} />
      </div>
    </div>
  );
}
