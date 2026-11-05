"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Pause, Play } from "lucide-react";

export type HeroSlide = {
  image: string;
  eyebrow: string;
  eyebrowColor?: string;
  title: string;
  text?: string | null;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  meta?: string;
};

const DURATION = 7000; // ms per slide

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // auto-advance; restarts whenever the slide changes
  useEffect(() => {
    if (paused || count < 2) return;
    const t = window.setTimeout(() => go(index + 1), DURATION);
    return () => window.clearTimeout(t);
  }, [index, paused, count, go]);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative h-[calc(100svh-4rem)] min-h-[560px] max-h-[880px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Images (cross-fade + slow zoom) */}
      {slides.map((s, i) => (
        <div
          key={s.image + i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt=""
            fetchPriority={i === 0 ? "high" : "auto"}
            className={`h-full w-full object-cover ${i === index ? "animate-kenburns" : ""}`}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
      <span className="pointer-events-none absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand/30 blur-[120px]" />

      {/* Content */}
      <div className="container-x relative flex h-full flex-col justify-center pb-32 pt-10">
        <div key={index} className="max-w-3xl">
          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: slide.eyebrowColor ?? "#f3b7c0" }} />
            {slide.eyebrow}
          </span>
          <h1
            className="animate-fade-up mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl"
            style={{ animationDelay: "0.25s" }}
          >
            {slide.title}
          </h1>
          {slide.text && (
            <p className="animate-fade-up mt-6 line-clamp-3 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl" style={{ animationDelay: "0.4s" }}>
              {slide.text}
            </p>
          )}
          {slide.meta && (
            <p className="animate-fade-up mt-4 inline-flex items-center gap-2 text-sm text-white/60" style={{ animationDelay: "0.5s" }}>
              <Clock size={15} /> {slide.meta}
            </p>
          )}
          <div className="animate-fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.55s" }}>
            <Link href={slide.href} className="btn group bg-white px-7 py-3.5 text-ink shadow-lift hover:bg-white/90">
              {slide.cta} <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </Link>
            {slide.secondaryHref && (
              <Link href={slide.secondaryHref} className="btn border border-white/25 px-7 py-3.5 text-white backdrop-blur hover:bg-white/10">
                {slide.secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="container-x flex items-end gap-6 pb-8">
          <div className="grid flex-1 grid-cols-3 gap-3 md:gap-5">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}: ${s.title}`}
                aria-current={i === index}
                className="group text-left"
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/20">
                  {i === index ? (
                    <span
                      key={`${index}-${paused}`}
                      className="animate-fill-x block h-full bg-white"
                      style={{ animationDuration: `${DURATION}ms`, animationPlayState: paused ? "paused" : "running" }}
                    />
                  ) : (
                    <span className={`block h-full bg-white ${i < index ? "w-full opacity-40" : "w-0"}`} />
                  )}
                </span>
                <span
                  className={`mt-3 hidden text-xs font-semibold uppercase tracking-wider transition md:block ${
                    i === index ? "text-white" : "text-white/45 group-hover:text-white/80"
                  }`}
                >
                  0{i + 1}
                </span>
                <span
                  className={`mt-1 hidden line-clamp-1 text-sm transition md:block ${
                    i === index ? "text-white/90" : "text-white/40 group-hover:text-white/70"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white backdrop-blur transition hover:bg-white/10 sm:flex"
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white backdrop-blur transition hover:bg-white hover:text-ink"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition hover:bg-white/85"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
