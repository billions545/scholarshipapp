import { Skeleton, TableSkeleton } from "@/components/skeleton";

export default function AdminStudentsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-6">
        <TableSkeleton cols={6} />
      </div>
    </div>
  );
}
