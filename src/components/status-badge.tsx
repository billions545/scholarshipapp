import { statusColor } from "@/lib/ui";
import { labelize } from "@/lib/enums";

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(status)}`}
    >
      {label ?? labelize(status)}
    </span>
  );
}
