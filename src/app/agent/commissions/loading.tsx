import { Skeleton, TableSkeleton } from "@/components/skeleton";

export default function AgentCommissionsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6">
        <TableSkeleton cols={5} />
      </div>
    </div>
  );
}
