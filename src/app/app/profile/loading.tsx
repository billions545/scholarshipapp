import { Skeleton } from "@/components/skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-10">
      <Skeleton className="h-7 w-48" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-56 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
