import { useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { scramble } from "../../utils/scramble";
import MagneticEl from "../MagneticEl";

const NoiseBackground = lazy(() => import("../webgl/NoiseBackground"));

const META = [
  { label: "STATUS", value: "AVAILABLE_REMOTE" },
  { label: "BASE", value: "NOVI SAD · RS" },
  { label: "SPEC", value: "AI AGENTS · RUST · ZK" },
  { label: "BUILD", value: "v2026" },
];

const TAGS = ["AI Agents", "Rust", "Cryptography", "Creative Dev"];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const nameBlockRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.1 });

    tl.fromTo(
      metaRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" },
      0,
    );

    tl.fromTo(
      numRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "expo.out" },
      0.1,
    );
    tl.add(() => {
      if (numRef.current) scramble(numRef.current, "001", { duration: 600 });
    }, 0.1);

    tl.fromTo(
      dividerRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: "expo.inOut", transformOrigin: "left" },
      0.5,
    );

    tl.fromTo(
      tagsRef.current?.querySelectorAll(".tag") ?? [],
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 0.6, ease: "expo.out" },
      0.7,
    );

    tl.fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      1.1,
    );

    tl.fromTo(
      scrollCueRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      1.1,
    );

    // Idle float — a slow nudge in the arrow's own direction to read as
    // "scroll down here". A separate, infinitely-repeating tween rather
    // than part of the one-shot intro timeline above, and on scrollCueRef
    // (the outer wrapper) rather than the MagneticEl child inside it, since
    // MagneticEl drives its own x/y transform on pointer proximity — a
    // second tween on that same element would fight it for the same
    // property. Nested transforms on parent vs. child compose fine.
    const idleFloat = gsap.to(scrollCueRef.current, {
      y: 12,
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Parallax
    const parallax = gsap.to(nameBlockRef.current ?? "", {
      yPercent: 22,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Every other section in this file skips cleanup — harmless there since
    // their tweens are all one-shot, so StrictMode's dev-only double-invoke
    // just runs two near-identical finite animations that finish and are
    // never seen again. idleFloat is this file's first *infinite* tween:
    // with no cleanup, the first invocation's y-tween would keep running
    // forever alongside the second, two tweens permanently fighting over
    // the same property. Kill everything the effect created on unmount so
    // exactly one clean set survives.
    return () => {
      tl.kill();
      idleFloat.kill();
      parallax.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-dvh flex flex-col justify-between px-gutter pt-20 pb-28 md:pt-24 md:pb-36 overflow-hidden"
    >
      {/* WebGL noise — desktop only */}
      {window.innerWidth >= 768 && (
        <Suspense fallback={<div className="absolute inset-0 bg-void" />}>
          <NoiseBackground />
        </Suspense>
      )}

      {/* Overlay gradient so content stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/10 via-transparent to-void/60 pointer-events-none" />

      {/* Meta bar */}
      <div
        ref={metaRef}
        className="relative z-10 flex flex-wrap gap-x-4 gap-y-1.5 md:gap-x-8 md:gap-y-2 border-b border-smoke/60 pb-3 md:pb-6"
        style={{ opacity: 0 }}
      >
        {META.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="font-mono text-sm md:text-lg text-mist">{label}</span>
            <span className="font-mono text-sm md:text-lg text-mist">·</span>
            <span className="font-mono text-sm md:text-lg text-electric">{value}</span>
          </div>
        ))}
      </div>

      {/* Name block */}
      <div
        ref={nameBlockRef}
        className="relative z-10 flex flex-col flex-1 justify-start md:justify-center pt-8 md:pt-0 pb-6 md:pb-16"
      >
        <span
          ref={numRef}
          className="font-mono text-3xl md:text-5xl text-mist tabular-nums leading-none mb-3 md:mb-4"
          style={{ opacity: 0 }}
        >
          ---
        </span>

        <div
          ref={dividerRef}
          className="w-full h-px bg-smoke/60 origin-left mb-5 md:mb-8"
          style={{ transform: "scaleX(0)" }}
        />

        <div ref={tagsRef} className="flex flex-wrap gap-2 md:gap-3">
          {TAGS.map((tag, i) => (
            <MagneticEl key={tag}>
              <span
                className="tag font-mono text-sm md:text-2xl tracking-[0.1em] md:tracking-[0.2em] uppercase px-3 py-1.5 md:px-5 md:py-2.5 border border-smoke/60 text-mist hover:border-electric hover:text-electric transition-all duration-300"
                style={{ opacity: 0 }}
              >
                {i > 0 && <span className="text-mist mr-3">×</span>}
                {tag}
              </span>
            </MagneticEl>
          ))}
        </div>
      </div>

      {/* Bottom row — shifted up via transform, not margin. This sits right
          after nameBlockRef, which is flex-grow (flex-1): the flex algorithm
          treats a margin change here as "less outer size to reserve," so
          nameBlockRef silently grows to fill the exact difference and the
          margin has zero visible effect (confirmed directly: -8px through
          -128px of margin-top all produced an identical paragraph position).
          A transform never participates in flex layout at all, so it can't
          be absorbed the same way — confirmed this one instead reliably
          moves the element by the exact pixel amount given. */}
      <div
        ref={scrollRef}
        className="relative z-10 border-t border-smoke/60 pt-3 md:pt-6 -translate-y-14 md:-translate-y-8"
        style={{ opacity: 0 }}
      >
        <p className="font-sans text-base sm:text-xl md:text-4xl text-mist max-w-lg leading-relaxed">
          Building autonomous agent systems, and the memory and proofs that make them trustworthy.
        </p>
      </div>

      {/* SCROLL cue — vertically centered with the fixed ChatBot launcher, not just
          sharing its bottom-8 offset: the launcher's border+padding make it a 58px
          box while this is bare 32px text, so matching bottom edges alone left their
          centers 13px apart. bottom-[45px] (32 + 13) aligns the centers instead. */}
      <div ref={scrollCueRef} className="absolute z-10 bottom-[45px] right-gutter" style={{ opacity: 0 }}>
        <MagneticEl>
          <button
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-3 font-mono text-2xl text-electric tracking-widest group"
          >
            <span>SCROLL</span>
            <span className="group-hover:translate-y-1 transition-transform duration-300">
              ↓
            </span>
          </button>
        </MagneticEl>
      </div>
    </section>
  );
}
