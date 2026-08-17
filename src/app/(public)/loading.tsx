import { CardGridSkeleton, Skeleton, StatsRowSkeleton } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <>
      <div className="h-[600px] w-full bg-slate-950" />
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-24">
        <div className="mb-4">
          <StatsRowSkeleton />
        </div>
        <Skeleton className="mt-10 h-6 w-56" />
        <div className="mt-8">
          <CardGridSkeleton />
        </div>
      </div>
    </>
  );
}
