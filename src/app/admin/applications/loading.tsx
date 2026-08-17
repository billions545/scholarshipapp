import { Skeleton } from "@/components/skeleton";

export default function AdminApplicationsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0">
            <Skeleton className="h-4 w-24" />
            <div className="mt-2 flex flex-col gap-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
