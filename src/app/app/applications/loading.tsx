import { Skeleton } from "@/components/skeleton";

export default function MyApplicationsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
