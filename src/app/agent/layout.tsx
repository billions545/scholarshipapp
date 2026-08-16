import { requireAgent } from "@/lib/session";
import { AgentHeader } from "@/components/agent-header";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAgent();

  return (
    <div className="flex min-h-screen flex-col">
      <AgentHeader name={user.name ?? user.email ?? "Agent"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
