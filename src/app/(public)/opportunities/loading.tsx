import { CardGridSkeleton, Skeleton } from "@/components/skeleton";

export default function OpportunitiesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <Skeleton className="mt-6 h-32 w-full rounded-xl" />
      <div className="mt-8">
        <CardGridSkeleton />
      </div>
    </div>
  );
}
