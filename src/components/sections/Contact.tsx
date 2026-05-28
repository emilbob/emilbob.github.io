import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scramble } from "../../utils/scramble";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/emilbob/",
    meta: "Professional network",
  },
  { label: "GitHub", href: "https://github.com/emilbob", meta: "Open source" },
  {
    label: "Medium",
    href: "https://medium.com/@emilbob03/establishing-secure-communication-with-a-substrate-node-using-rust-3611f0f26427",
    meta: "Articles & write-ups",
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      onEnter: () => {
        if (labelRef.current)
          scramble(labelRef.current, "> contact.rs", { duration: 400 });
      },
    });

    const numEl = numRef.current;
    if (numEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          gsap.to(numEl, { opacity: 0.35, duration: 0.6, ease: "expo.out" });
          scramble(numEl, "006", { duration: 500 });
        },
        { threshold: 0.5 },
      );
      io.observe(numEl);
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 75%" },
    });

    tl.fromTo(
      statusRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" },
    )
      .fromTo(
        line1Ref.current,
        { yPercent: 105 },
        { yPercent: 0, duration: 1.1, ease: "expo.out" },
        0.1,
      )
      .fromTo(
        line2Ref.current,
        { yPercent: 105 },
        { yPercent: 0, duration: 1.1, ease: "expo.out" },
        0.22,
      )
      .fromTo(
        emailRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" },
        0.5,
      )
      .fromTo(
        linksRef.current?.querySelectorAll(".link-row") ?? [],
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.6, ease: "expo.out" },
        0.55,
      )
      .fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        0.9,
      );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="bg-void px-gutter pt-section pb-12 border-t border-smoke"
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
          className="font-mono text-3xl text-electric mb-6 block"
        >
          &gt; ________
        </span>

        {/* Status */}
        <div
          ref={statusRef}
          className="flex items-center gap-3 mb-8"
          style={{ opacity: 0 }}
        >
          <span className="w-2 h-2 rounded-full bg-electric pulse-electric" />
          <span className="font-mono text-2xs text-electric tracking-[0.2em] md:tracking-[0.4em]">
            STATUS · AVAILABLE_FOR_REMOTE
          </span>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <div className="overflow-hidden mb-1">
            <div
              ref={line1Ref}
              className="font-mono text-display text-ivory tracking-tighter leading-none"
              style={{ transform: "translateY(110%)" }}
            >
              LET'S
            </div>
          </div>
          <div className="overflow-hidden">
            <div
              ref={line2Ref}
              className="font-mono text-display text-electric tracking-tighter leading-none"
              style={{ transform: "translateY(110%)" }}
            >
              BUILD.
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Email */}
          <div>
            <p className="font-mono text-2xs text-mist mb-6 tracking-[0.3em]">
              $ echo $EMAIL
            </p>
            <a
              ref={emailRef}
              href="mailto:emilbob03@gmail.com"
              className="font-mono text-xl md:text-2xl text-ivory hover:text-electric transition-colors duration-300 group"
              style={{ opacity: 0 }}
            >
              emilbob03@gmail.com
              <span className="text-electric ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ↗
              </span>
            </a>
            <p className="font-sans text-xl text-ivory leading-relaxed mt-6">
              Open to remote Full-Stack roles, Product engineering, Web3
              collaborations, and anything at the intersection of performance
              and craft.
            </p>
          </div>

          {/* Links */}
          <div ref={linksRef}>
            <p className="font-mono text-2xs text-mist mb-6 tracking-[0.3em]">
              $ ls social/
            </p>
            <div className="divide-y divide-smoke">
              {LINKS.map(({ label, href, meta }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-row flex items-center justify-between py-4 group hover:bg-carbon/50 px-2 -mx-2 transition-colors duration-200"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-electric text-xs">›</span>
                    <span className="font-mono text-lg text-ivory group-hover:text-electric transition-colors duration-200">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-2xs text-mist">{meta}</span>
                    <span className="font-mono text-mist group-hover:text-electric transition-colors duration-200">
                      ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          ref={footerRef}
          className="border-t border-smoke pt-8 flex flex-col md:flex-row justify-between gap-3"
          style={{ opacity: 0 }}
        >
          <span className="font-mono text-2xs text-mist">© 2026 Emil Bob</span>
          <span className="font-mono text-2xs text-mist">
            FULL-STACK · RUST · PRODUCT · NOVI SAD · RS
          </span>
        </div>
      </div>
    </section>
  );
}
