import { Skeleton } from "@/components/skeleton";

export default function AdminOpportunityDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-32" />
      <div className="mt-1 flex items-center justify-between">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-xl" />
        <div className="flex flex-col gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
