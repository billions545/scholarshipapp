import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ui } from "@/lib/ui";
import { OpportunityCard } from "@/components/opportunity-card";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import {
  SearchIcon,
  CheckCircleIcon,
  DocumentIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GlobeIcon,
  SparkleIcon,
} from "@/components/icons";

const HERO_IMAGES = [
  "/images/hero-graduation.jpg",
  "/images/hero-campus.jpg",
  "/images/graduation-caps.jpg",
  "/images/library-students.jpg",
];

const HOW_IT_WORKS = [
  { icon: SearchIcon, title: "Discover", body: "Browse scholarships, university programmes and funded opportunities matched to you." },
  { icon: CheckCircleIcon, title: "Check eligibility", body: "See exactly what you qualify for and what's missing — no guesswork." },
  { icon: DocumentIcon, title: "Apply & upload documents", body: "One guided application with a clear checklist and adviser support." },
  { icon: GraduationCapIcon, title: "Track to enrolment", body: "Follow your status from submission through admission and enrolment." },
];

export default async function HomePage() {
  const featured = await prisma.opportunity.findMany({
    where: { status: "PUBLISHED" },
    include: { programme: { include: { university: true } } },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  const stats = [
    ["26", "Opportunities live"],
    ["18", "Countries"],
    ["16", "Partner universities"],
    ["100%", "Free to browse"],
  ] as const;

  const heroSlides: HeroSlide[] = featured.map((opp, i) => ({
    id: opp.id,
    slug: opp.slug,
    title: opp.title,
    type: opp.type,
    category: opp.category,
    country: opp.country ?? opp.programme.university.country,
    deadline: opp.deadline ? opp.deadline.toISOString() : null,
    scholarshipPercentage: opp.scholarshipPercentage,
    universityName: opp.programme.university.name,
    image: HERO_IMAGES[i % HERO_IMAGES.length],
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <HeroCarousel slides={heroSlides}>
          <div className="animate-fade-in-up max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <SparkleIcon className="h-3.5 w-3.5 text-amber-300" />
              Guided applications for students across Africa
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your guided path to studying abroad
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200">
              Discover scholarships and international education opportunities, check your eligibility, and get
              step-by-step guidance from application to enrolment. You&apos;ll never have to ask{" "}
              <span className="text-white">&ldquo;what do I do next?&rdquo;</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-black/20 transition-all hover:bg-indigo-50 hover:shadow-xl"
              >
                Find My Opportunities
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Browse Scholarships
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-300">
              No hidden fees at browse time &middot; Real advisers &middot; Transparent status tracking
            </p>
          </div>
        </HeroCarousel>

        {/* Stats bar, overlapping the hero/next-section seam */}
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md sm:grid-cols-4 sm:translate-y-10">
            {stats.map(([value, label]) => (
              <div key={label} className="bg-slate-950/40 px-6 py-6 text-center sm:py-8">
                <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured opportunities */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Featured</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Opportunities open right now</h2>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all opportunities <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className={`${ui.muted} mt-6`}>
            No opportunities published yet. Check back soon, or sign in as an admin to add one.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">How it works</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              From first search to your first day on campus
            </h2>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute top-8 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent lg:block" />
            {HOW_IT_WORKS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100">
                  <Icon className="h-7 w-7 text-indigo-600" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className={`${ui.muted} mt-2 text-sm`}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo band CTA */}
      <section className="relative isolate overflow-hidden">
        <div className="relative h-[420px] w-full">
          <Image
            src="/images/graduation-caps.jpg"
            alt="Graduates celebrating at commencement"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/60 to-indigo-950/30" />
          <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
            <GraduationCapIcon className="h-9 w-9 text-amber-300" />
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Your success is the whole point</h2>
            <p className="mt-3 max-w-xl text-slate-200">
              Every task, document check and status update exists for one reason: getting you from
              &ldquo;interested&rdquo; to &ldquo;enrolled.&rdquo;
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-indigo-50"
            >
              Start your application <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            <div className="relative h-80 w-full sm:h-96">
              <Image
                src="/images/library-students.jpg"
                alt="Students studying together in a library"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Why students trust us</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Guidance that actually gets you there
            </h2>
            <div className="mt-8 flex flex-col gap-6">
              {[
                {
                  icon: ShieldCheckIcon,
                  title: "A clear path, mapped out for you",
                  body: "We tell you exactly where you stand and exactly what's next — no guesswork, no confusing jargon, just a straight line to your application.",
                },
                {
                  icon: DocumentIcon,
                  title: "Nothing gets lost in WhatsApp",
                  body: "Every document, message and status change lives in one place, with a full timeline you and your adviser can both see.",
                },
                {
                  icon: GlobeIcon,
                  title: "A growing network of partners",
                  body: "From scholarships to tuition discounts to fellowships, we're adding new universities and providers every month.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className={`${ui.muted} mt-1`}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
