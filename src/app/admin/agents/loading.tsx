import { Skeleton } from "@/components/skeleton";

export default function AdminAgentsLoading() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
