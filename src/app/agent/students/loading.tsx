import { Skeleton } from "@/components/skeleton";

export default function AgentStudentsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
