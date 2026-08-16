import { requireStudent } from "@/lib/session";
import { StudentHeader } from "@/components/student-header";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireStudent();

  return (
    <div className="flex min-h-screen flex-col">
      <StudentHeader name={user.name ?? user.email ?? "Student"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
