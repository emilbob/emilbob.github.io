import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scramble } from "../../utils/scramble";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    n: "01",
    title: "Motion-first",
    desc: "Every state change has a physical analogy — nothing appears or disappears, it arrives.",
  },
  {
    n: "02",
    title: "System thinking",
    desc: "Tokens, components, patterns. Design scales when the system is sound.",
  },
  {
    n: "03",
    title: "Zero waste",
    desc: "Remove every element that does not serve the user's next action.",
  },
  {
    n: "04",
    title: "Precision",
    desc: "4px off is wrong. Spacing, type size, radius — these are not opinions.",
  },
];

const TOOLS = [
  "Figma",
  "React",
  "TypeScript",
  "Tailwind",
  "Framer",
  "GSAP",
  "Storybook",
  "Radix UI",
];

export default function UIUX() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      onEnter: () => {
        if (labelRef.current)
          scramble(labelRef.current, "> ui_ux.rs", { duration: 400 });
      },
    });

    const numEl = numRef.current;
    if (numEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          gsap.to(numEl, { opacity: 0.35, duration: 0.6, ease: "expo.out" });
          scramble(numEl, "004", { duration: 500 });
        },
        { threshold: 0.5 },
      );
      io.observe(numEl);
    }

    gsap.fromTo(
      textRef.current?.querySelectorAll("p") ?? [],
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.22,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: textRef.current, start: "top 82%" },
      },
    );

    gsap.fromTo(
      principlesRef.current?.querySelectorAll(".principle") ?? [],
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: { trigger: principlesRef.current, start: "top 85%" },
      },
    );

    gsap.fromTo(
      toolsRef.current?.querySelectorAll(".tool-tag") ?? [],
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.04,
        duration: 0.5,
        ease: "expo.out",
        scrollTrigger: { trigger: toolsRef.current, start: "top 88%" },
      },
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="uiux"
      className="bg-void px-gutter py-section border-t border-smoke"
    >
      <div className="max-w-[1600px] mx-auto">
        <span
          ref={numRef}
          className="font-mono text-5xl text-mist tabular-nums leading-none select-none block mb-6"
          style={{ opacity: 0 }}
        >
          ---
        </span>

        <span
          ref={labelRef}
          className="font-mono text-3xl text-electric mb-10 block"
        >
          &gt; ________
        </span>

        {/* Header */}
        <div className="mb-20">
          <div
            className="flex flex-col gap-6 max-w-3xl"
            ref={textRef}
          >
            <p className="font-sans text-2xl text-ivory leading-relaxed">
              Interfaces should feel inevitable — every layout, spacing
              decision, and micro-interaction a natural consequence of the
              user's intent, not a decorator's preference.
            </p>
            <p className="font-sans text-xl text-ivory leading-relaxed">
              Coming from a background in CGI and game developement, I approach
              UI with the same spatial awareness — hierarchy, depth, rhythm.
              Combined with React and TypeScript, that translates into component
              systems that are precise, accessible, and alive.
            </p>
          </div>
        </div>

        {/* Principles */}
        <div ref={principlesRef} className="mb-16">
          <p className="font-mono text-2xs text-mist mb-6 tracking-[0.35em]">
            $ cat principles.md
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-smoke">
            {PRINCIPLES.map((p) => (
              <div
                key={p.n}
                className="principle bg-void p-8 hover:bg-ash transition-colors duration-400 group"
                style={{ opacity: 0 }}
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-2xs text-electric mt-1">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-mono text-lg text-ivory mb-2 group-hover:text-electric transition-colors duration-300">
                      {p.title}
                    </h3>
                    <p className="font-sans text-xl text-ivory leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div ref={toolsRef}>
          <p className="font-mono text-2xs text-mist mb-4 tracking-[0.35em]">
            $ ls tools/
          </p>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <span
                key={t}
                className="tool-tag font-mono text-2xs text-mist border border-smoke px-3 py-1.5 hover:border-electric hover:text-electric transition-all duration-200"
                style={{ opacity: 0 }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
