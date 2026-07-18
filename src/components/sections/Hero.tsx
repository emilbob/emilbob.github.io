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
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
      line1Ref.current,
      { yPercent: 110 },
      { yPercent: 0, duration: 1.1, ease: "expo.out" },
      0.15,
    );
    tl.add(() => {
      if (line1Ref.current)
        scramble(line1Ref.current, "EMIL", { duration: 700 });
    }, 0.15);

    tl.fromTo(
      line2Ref.current,
      { yPercent: 110 },
      { yPercent: 0, duration: 1.1, ease: "expo.out" },
      0.27,
    );
    tl.add(() => {
      if (line2Ref.current)
        scramble(line2Ref.current, "BOB", { duration: 700 });
    }, 0.27);

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

    // Parallax
    gsap.to(line1Ref.current?.parentElement ?? "", {
      yPercent: 22,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen flex flex-col justify-between px-gutter pt-24 pb-16 overflow-hidden"
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
        className="relative z-10 flex flex-wrap gap-x-8 gap-y-2 border-b border-smoke/60 pb-6"
        style={{ opacity: 0 }}
      >
        {META.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="font-mono text-lg text-mist">{label}</span>
            <span className="font-mono text-lg text-mist">·</span>
            <span className="font-mono text-lg text-electric">{value}</span>
          </div>
        ))}
      </div>

      {/* Name block */}
      <div className="relative z-10 flex flex-col flex-1 justify-center py-8">
        <div className="flex items-start gap-6 mb-4">
          <span
            ref={numRef}
            className="font-mono text-5xl text-mist tabular-nums leading-none"
            style={{ opacity: 0 }}
          >
            ---
          </span>
          <div className="flex-1">
            <div className="overflow-hidden">
              <div
                ref={line1Ref}
                className="font-mono text-[clamp(3rem,min(12vw,13vh),13rem)] text-ivory tracking-tighter leading-none"
                style={{ transform: "translateY(110%)" }}
              >
                EMIL
              </div>
            </div>
            <div className="overflow-hidden">
              <div
                ref={line2Ref}
                className="font-mono text-[clamp(3rem,min(12vw,13vh),13rem)] text-electric tracking-tighter leading-none"
                style={{ transform: "translateY(110%)" }}
              >
                BOB
              </div>
            </div>
          </div>
        </div>

        <div
          ref={dividerRef}
          className="w-full h-px bg-smoke/60 origin-left mb-8"
          style={{ transform: "scaleX(0)" }}
        />

        <div ref={tagsRef} className="flex flex-wrap gap-3">
          {TAGS.map((tag, i) => (
            <MagneticEl key={tag}>
              <span
                className="tag font-mono text-2xl tracking-[0.2em] uppercase px-5 py-2.5 border border-smoke/60 text-mist hover:border-electric hover:text-electric transition-all duration-300"
                style={{ opacity: 0 }}
              >
                {i > 0 && <span className="text-mist mr-3">×</span>}
                {tag}
              </span>
            </MagneticEl>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div
        ref={scrollRef}
        className="relative z-10 flex items-end justify-between border-t border-smoke/60 pt-6"
        style={{ opacity: 0 }}
      >
        <p className="font-sans text-4xl text-mist max-w-lg leading-relaxed">
          Building autonomous agent systems, and the memory and proofs that make them trustworthy.
        </p>
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
