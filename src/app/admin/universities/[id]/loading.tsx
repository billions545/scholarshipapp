import { Skeleton } from "@/components/skeleton";

export default function UniversityDetailLoading() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-1 h-8 w-56" />
        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
