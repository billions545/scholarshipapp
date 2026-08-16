import Link from "next/link";
import { labelize } from "@/lib/enums";
import { formatMoney } from "@/lib/money";

const TYPE_GRADIENT: Record<string, string> = {
  SCHOLARSHIP: "from-indigo-500 to-violet-500",
  UNIVERSITY_PROGRAMME: "from-sky-500 to-indigo-500",
  TUITION_DISCOUNT: "from-emerald-500 to-teal-500",
  FELLOWSHIP: "from-amber-500 to-orange-500",
  GRANT: "from-rose-500 to-pink-500",
  ONLINE_DEGREE: "from-cyan-500 to-blue-500",
  ON_CAMPUS_PROGRAMME: "from-indigo-500 to-blue-500",
  PROFESSIONAL_PROGRAMME: "from-violet-500 to-fuchsia-500",
  OTHER: "from-slate-500 to-slate-600",
};

type OpportunityCardData = {
  id: string;
  slug: string;
  title: string;
  type: string;
  category: string | null;
  country: string | null;
  deadline: Date | null;
  scholarshipPercentage: number | null;
  serviceFeeAmount: number | null;
  programme: { degreeLevel: string; university: { name: string; country: string | null } };
};

export function OpportunityCard({ opportunity }: { opportunity: OpportunityCardData }) {
  const gradient = TYPE_GRADIENT[opportunity.type] ?? TYPE_GRADIENT.OTHER;
  const initial = opportunity.programme.university.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/opportunities/${opportunity.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
    >
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-base font-bold text-white shadow-sm`}
          >
            {initial}
          </div>
          {opportunity.scholarshipPercentage && (
            <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {opportunity.scholarshipPercentage}% funded
            </span>
          )}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {labelize(opportunity.type)}
          {opportunity.category ? ` · ${labelize(opportunity.category)}` : ""}
        </p>
        <h3 className="mt-1 font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
          {opportunity.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {opportunity.programme.university.name} · {opportunity.country ?? opportunity.programme.university.country}
        </p>
        <p className="mt-1 text-xs text-slate-400">{labelize(opportunity.programme.degreeLevel)}</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            {opportunity.serviceFeeAmount ? formatMoney(opportunity.serviceFeeAmount, "NGN") + " fee" : "No admin fee"}
          </span>
          {opportunity.deadline && <span>Deadline {new Date(opportunity.deadline).toLocaleDateString()}</span>}
        </div>
      </div>
    </Link>
  );
}
