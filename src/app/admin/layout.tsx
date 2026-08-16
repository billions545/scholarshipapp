import { requireStaff } from "@/lib/session";
import { AdminHeader } from "@/components/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AdminHeader name={user.name ?? user.email ?? "Admin"} role={user.role} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
