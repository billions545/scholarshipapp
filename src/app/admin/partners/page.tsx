import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPartnerAction } from "@/lib/actions/catalog-actions";
import { ui } from "@/lib/ui";
import { PARTNER_TYPES, labelize } from "@/lib/enums";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    include: { universities: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className={ui.pageHeading}>Partners</h1>
        <p className={`${ui.muted} mt-1`}>
          Universities, scholarship providers and other organisations you work with.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {partners.length === 0 && <p className={ui.muted}>No partners yet. Add one to get started.</p>}
          {partners.map((p) => (
            <Link key={p.id} href={`/admin/partners/${p.id}`} className={`${ui.card} block hover:border-indigo-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className={ui.muted}>
                    {labelize(p.type)} {p.country ? `- ${p.country}` : ""}
                  </p>
                </div>
                <p className={ui.muted}>{p.universities.length} universities</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className={ui.sectionHeading}>Add partner</h2>
        <form action={createPartnerAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
          <div>
            <label className={ui.label}>Name</label>
            <input className={ui.input} name="name" required />
          </div>
          <div>
            <label className={ui.label}>Type</label>
            <select className={ui.input} name="type" required>
              {PARTNER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {labelize(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={ui.label}>Country</label>
            <input className={ui.input} name="country" />
          </div>
          <div>
            <label className={ui.label}>Contact name</label>
            <input className={ui.input} name="contactName" />
          </div>
          <div>
            <label className={ui.label}>Contact email</label>
            <input className={ui.input} name="contactEmail" type="email" />
          </div>
          <button type="submit" className={ui.btnPrimary}>
            Add partner
          </button>
        </form>
      </div>
    </div>
  );
}
