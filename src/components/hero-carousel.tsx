"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { labelize } from "@/lib/enums";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export type HeroSlide = {
  id: string;
  slug: string;
  title: string;
  type: string;
  category: string | null;
  country: string | null;
  deadline: string | null;
  scholarshipPercentage: number | null;
  universityName: string;
  image: string;
};

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides, children }: { slides: HeroSlide[]; children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setActive(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, paused]);

  const slide = slides[active];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Background image stack */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-55" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

      {/* decorative glow */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 animate-float-slow rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        {children}

        {slide && (
          <div className="animate-fade-in-up lg:justify-self-end">
            <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  {labelize(slide.type)}
                </span>
                {slide.scholarshipPercentage ? (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {slide.scholarshipPercentage}% funded
                  </span>
                ) : slide.category === "FULLY_FUNDED" ? (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Fully funded
                  </span>
                ) : null}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">{slide.title}</h3>
              <p className="mt-1 text-sm text-slate-300">
                {slide.universityName}
                {slide.country ? ` · ${slide.country}` : ""}
              </p>
              {slide.deadline && (
                <p className="mt-1 text-xs text-slate-400">
                  Deadline {new Date(slide.deadline).toLocaleDateString()}
                </p>
              )}

              <Link
                href={`/opportunities/${slide.slug}`}
                className="group mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-indigo-50"
              >
                View opportunity
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {count > 1 && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous opportunity"
                  onClick={() => goTo(active - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Show ${s.title}`}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Next opportunity"
                  onClick={() => goTo(active + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
