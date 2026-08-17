import { Skeleton, TableSkeleton } from "@/components/skeleton";

export default function AdminPaymentsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-4 h-20 w-40 rounded-xl" />
      <div className="mt-6">
        <TableSkeleton cols={6} />
      </div>
    </div>
  );
}
