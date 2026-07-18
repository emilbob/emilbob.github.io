import { useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scramble } from "../../utils/scramble";

const ProfileParticles = lazy(() => import("../webgl/ProfileParticles"));

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  "Claude Code",
  "AI Agents",
  "MCP",
  "Noir",
  "React.js",
  "Node.js",
  "React Native",
  "TypeScript",
  "Rust",
  "Substrate",
  "Polkadot",
  "Solana",
  "Anchor",
  "Ethereum",
  "Solidity",
  "ZK Proofs",
  "Unity",
  "C#",
  "WebGL",
  "Docker",
  "Git",
  "CI/CD",
];

const EXPERIENCE = [
  {
    role: "Software Developer",
    company: "Moonstruck",
    period: "Sep 2021 – Dec 2025",
    stack: "Rust · Node · React",
    location: "Belgrade",
  },
  {
    role: "Software Developer",
    company: "FRUSS AG",
    period: "Jan 2020 – Sep 2021",
    stack: ".NET · Node · React",
    location: "Remote",
  },
  {
    role: "Computer Graphics Generalist",
    company: "EVE Visual Technologies",
    period: "Sep 2017 – Nov 2019",
    stack: "Unity · WebGL · C#",
    location: "Budapest",
  },
  {
    role: "Computer Graphics Generalist",
    company: "Case3D Proptech Solutions",
    period: "Jul 2015 – Jul 2017",
    stack: "Unity · WebGL · C#",
    location: "Novi Sad",
  },
];

const STATS = [
  { label: "Years experience", end: 10 },
  { label: "Companies worked", end: 4 },
  { label: "Blockchain academy", end: 1 },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;

    // Section label scramble
    ScrollTrigger.create({
      trigger: section,
      start: "top 85%",
      onEnter: () => {
        if (labelRef.current)
          scramble(labelRef.current, "> about.rs", { duration: 500 });
      },
    });

    // Bio — each paragraph reveals individually
    gsap.fromTo(
      bioRef.current?.querySelectorAll("p") ?? [],
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.22,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: bioRef.current, start: "top 82%" },
      },
    );

    // Section number
    const numEl = numRef.current;
    if (numEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          gsap.to(numEl, { opacity: 0.35, duration: 0.6, ease: "expo.out" });
          scramble(numEl, "002", { duration: 500 });
        },
        { threshold: 0.5 },
      );
      io.observe(numEl);
    }

    // Stat counters — IntersectionObserver fires when stats are actually visible
    const statsEl = statsRef.current;
    if (statsEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          STATS.forEach((stat, i) => {
            const el = statRefs.current[i];
            if (!el) return;
            const obj = { val: 0 };
            gsap.to(obj, {
              val: 99,
              duration: 0.7,
              ease: "power3.inOut",
              delay: i * 0.08,
              onUpdate: () => {
                el.textContent = String(Math.floor(obj.val)).padStart(2, "0");
              },
              onComplete: () => {
                el.textContent = String(stat.end).padStart(2, "0");
              },
            });
          });
        },
        { threshold: 0.4 },
      );
      io.observe(statsEl);
    }

    // Experience rows
    gsap.fromTo(
      expRef.current?.querySelectorAll(".exp-row") ?? [],
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: { trigger: expRef.current, start: "top 85%" },
      },
    );

    // Skills
    gsap.fromTo(
      skillsRef.current?.querySelectorAll(".skill-tag") ?? [],
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.04,
        duration: 0.5,
        ease: "expo.out",
        scrollTrigger: { trigger: skillsRef.current, start: "top 85%" },
      },
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="px-gutter py-section bg-ash border-t border-smoke"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Section number */}
        <span
          ref={numRef}
          className="font-mono text-5xl text-mist tabular-nums leading-none select-none block mb-6"
          style={{ opacity: 0 }}
        >
          ---
        </span>

        {/* Section label */}
        <span
          ref={labelRef}
          className="font-mono text-3xl text-electric mb-12 block"
        >
          &gt; ________
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left col */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            {/* Profile picture — breaks into particles on hover */}
            {window.innerWidth >= 768 ? (
              <Suspense
                fallback={<div className="w-full aspect-square bg-carbon" />}
              >
                <ProfileParticles className="w-full" />
              </Suspense>
            ) : (
              <img
                src="/profilna_bw.png"
                alt="Emil Bob"
                className="w-full object-cover"
              />
            )}

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 border-t border-smoke pt-8"
            >
              {STATS.map((stat, i) => (
                <div key={stat.label}>
                  <div className="font-mono text-5xl text-electric mb-2">
                    <span
                      ref={(el) => {
                        statRefs.current[i] = el;
                      }}
                    >
                      00
                    </span>
                    <span className="text-mist text-2xl">+</span>
                  </div>
                  <div className="font-mono text-2xs text-mist leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            <div ref={bioRef} className="space-y-4">
              <p className="font-sans text-2xl text-ivory leading-relaxed">
                Engineer building autonomous AI agent systems — persistent
                memory, orchestration, and audit layers that make agents
                reliable. Deep background in Rust and applied cryptography, with
                years across full-stack, blockchain, and creative web.
              </p>
              <p className="font-sans text-xl text-ivory leading-relaxed">
                <a
                  href="https://www.youtube.com/watch?v=FGMlm9ugBpk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist hover:text-ivory transition-colors duration-200 underline decoration-mist/40 underline-offset-2"
                >
                  Polkadot Blockchain Academy graduate (Singapore, 2024) ↗
                </a>{" "}
                with
                experience across decentralized technologies, cross-chain
                infrastructure, and emerging digital systems. Alongside software
                development, focused on creative web experiences through Framer,
                motion design, WebGL, and interactive interfaces, combining
                strong technical foundations with design-oriented thinking.
                Previously worked on PropTech, CGI, and digital visualization
                projects across Novi Sad, Budapest, and Berlin.
              </p>
              <p className="font-mono text-2xs text-mist py-1">
                $ MEng · Faculty of Technical Sciences, University of Novi Sad
              </p>
            </div>

            {/* Skills */}
            <div ref={skillsRef}>
              <p className="font-mono text-2xs text-mist mb-4 tracking-[0.3em]">
                $ ls skills/
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <span
                    key={s}
                    className="skill-tag font-mono text-2xs text-mist border border-smoke px-3 py-1.5 hover:border-electric hover:text-electric transition-all duration-200"
                    style={{ opacity: 0 }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div ref={expRef}>
              <p className="font-mono text-2xs text-mist mb-4 tracking-[0.3em]">
                $ cat experience.log
              </p>
              <div className="divide-y divide-smoke">
                {EXPERIENCE.map((e) => (
                  <div
                    key={e.company}
                    className="exp-row grid grid-cols-[16px_1fr] md:grid-cols-[16px_1fr_1fr_auto] items-center py-5 gap-x-8 group"
                    style={{ opacity: 0 }}
                  >
                    <span className="text-electric font-mono text-sm">›</span>
                    <div>
                      <div className="font-mono text-xl text-ivory group-hover:text-electric transition-colors duration-200">
                        {e.role}
                      </div>
                      <div className="font-mono text-base text-mist mt-0.5">
                        {e.company}
                      </div>
                    </div>
                    <span className="hidden md:block font-mono text-base text-mist">
                      {e.stack}
                    </span>
                    <span className="hidden md:block font-mono text-sm text-mist whitespace-nowrap">
                      {e.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
