import { Skeleton } from "@/components/skeleton";

export default function OpportunityDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-8 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
