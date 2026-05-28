import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scramble } from "../../utils/scramble";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  {
    index: "001",
    title: "PROOF OF ANCHOR",
    category: "ZK · Hackathon",
    year: "2025",
    tag: "SOLANA",
    desc: "Zero-knowledge proof verification system using Noir ZK circuits and Solana/Anchor for trustless on-chain attestation. Built for the Colosseum × Solana × Cypherpunk hackathon.",
    stack: ["Solana", "Anchor", "Noir", "Rust", "React", "TypeScript"],
    github: "https://github.com/emilbob/proof-of-anchor",
    live: "https://proofanchor.netlify.app/",
  },
  {
    index: "002",
    title: "INFINITE DECK POKER",
    category: "Rust · Cryptography",
    year: "2026",
    tag: "RUST",
    desc: "Provably fair poker using Verifiable Random Functions for on-chain card dealing. An infinite deck removes card-counting — fairness is cryptographically guaranteed, not assumed.",
    stack: ["Rust", "VRF", "Cryptography", "Game Theory"],
    github: "https://github.com/emilbob/Infinite-deck-poker-using-VRFs",
  },
  {
    index: "003",
    title: "SOLANA DATA AGGREGATOR",
    category: "Rust · Blockchain",
    year: "2025",
    tag: "RUST",
    desc: "Real-time Solana transaction aggregator with in-memory storage, file persistence across restarts, and a RESTful API. Query transactions by public key and date with pagination.",
    stack: ["Rust", "Solana", "REST API", "WebSocket"],
    github: "https://github.com/emilbob/solana-data-aggregator",
  },
  {
    index: "004",
    title: "SUBSTRATE HANDSHAKE",
    category: "Rust · Substrate",
    year: "2024",
    tag: "SUBSTRATE",
    desc: "Secure WebSocket client for Substrate nodes — performs an authenticated handshake, queries chain identity and version via JSON-RPC, with detailed step-by-step communication logging.",
    stack: ["Rust", "Substrate", "WebSocket", "JSON-RPC", "Polkadot"],
    github: "https://github.com/emilbob/substrate_handshake",
  },
  {
    index: "005",
    title: "CROWDFUNDING ICP",
    category: "Smart Contract · ICP",
    year: "2024",
    tag: "ICP",
    desc: "Kickstarter-like decentralised crowdfunding on the Internet Computer. Campaigns have owners, goal amounts, and deadlines — contributors fund campaigns and owners withdraw once the goal is reached.",
    stack: ["TypeScript", "ICP", "Azle", "DFX"],
    github: "https://github.com/emilbob/Crowdfunding-ICP",
  },
  {
    index: "006",
    title: "PICASO TOKEN",
    category: "Solidity · DeFi",
    year: "2023",
    tag: "SOLIDITY",
    desc: "ERC-721 NFT contract using the Bancor bonding curve. Deposit ERC-20 tokens to mint PicasoToken NFTs; burn them to swap back — a hybrid NFT / DeFi primitive on Ethereum.",
    stack: ["Solidity", "TypeScript", "Hardhat", "Bancor", "ERC-721"],
    github: "https://github.com/emilbob/Picaso-Token",
  },
  {
    index: "007",
    title: "GAME THEORY",
    category: "Rust · Cryptography",
    year: "2025",
    tag: "RUST",
    desc: "Repeated-game tournament engine in Rust. Players submit strategies against a 3×3 payout matrix (X / Y / Z moves); strategies evolve and compete across rounds — written at the Polkadot Blockchain Academy.",
    stack: ["Rust", "Game Theory", "PBA"],
    github: "https://github.com/emilbob/Game-theory",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeIdx = useRef<number | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const numEl = numRef.current;
    if (numEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          gsap.to(numEl, { opacity: 0.35, duration: 0.6, ease: "expo.out" });
          scramble(numEl, "003", { duration: 500 });
        },
        { threshold: 0.5 },
      );
      io.observe(numEl);
    }

    gsap.fromTo(
      listRef.current?.querySelectorAll(".project-row") ?? [],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: { trigger: listRef.current, start: "top 80%" },
      },
    );

    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const row = listRef.current?.querySelectorAll(".project-row")[
        i
      ] as HTMLElement | null;
      if (!row) return;
      const wrapper = row.parentElement as HTMLElement | null;
      if (!wrapper) return;

      wrapper.addEventListener("mouseenter", () => {
        if (activeIdx.current !== null && activeIdx.current !== i) {
          gsap.to(panelRefs.current[activeIdx.current], {
            height: 0,
            duration: 0.4,
            ease: "expo.inOut",
          });
        }
        activeIdx.current = i;
        gsap.to(panel, { height: "auto", duration: 0.55, ease: "expo.out" });
        gsap.to(row.querySelector(".row-arrow"), {
          x: 6,
          duration: 0.3,
          ease: "expo.out",
        });
        gsap.to(row.querySelector(".row-title"), {
          color: "#ffffff",
          duration: 0.3,
        });
        gsap.to(row.querySelector(".row-index"), {
          color: "#ffffff",
          duration: 0.3,
        });
      });
      wrapper.addEventListener("mouseleave", () => {
        gsap.to(panel, { height: 0, duration: 0.45, ease: "expo.inOut" });
        gsap.to(row.querySelector(".row-arrow"), {
          x: 0,
          duration: 0.4,
          ease: "expo.out",
        });
        gsap.to(row.querySelector(".row-title"), {
          color: "#f5f5f5",
          duration: 0.3,
        });
        gsap.to(row.querySelector(".row-index"), {
          color: "#b0b0b0",
          duration: 0.3,
        });
        activeIdx.current = null;
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="bg-void border-t border-smoke px-gutter py-section"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <span
          ref={numRef}
          className="font-mono text-5xl text-mist tabular-nums leading-none select-none block mb-6"
          style={{ opacity: 0 }}
        >
          ---
        </span>

        <div className="mb-16">
          <p className="font-mono text-xl md:text-3xl text-electric mb-3 md:tracking-[0.35em]">
            &gt; selected_work.rs
          </p>
        </div>

        {/* Project list */}
        <div ref={listRef} className="divide-y divide-smoke">
          {PROJECTS.map((p, i) => (
            <div key={p.index}>
              {/* Row */}
              <div
                className="project-row group flex items-center justify-between py-7 cursor-default"
                style={{ opacity: 0 }}
              >
                <div className="flex items-center gap-8">
                  <span className="row-index font-mono text-2xs text-mist w-10 tabular-nums">
                    {p.index}
                  </span>
                  <span className="row-title font-mono text-3xl md:text-5xl text-ivory tracking-tighter">
                    {p.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                  <span className="hidden md:block font-mono text-2xs text-mist">
                    {p.category}
                  </span>
                  <span className="hidden md:block font-mono text-2xs text-mist">{p.year}</span>
                  <span className="hidden sm:block font-mono text-2xs border border-smoke px-2 py-0.5 text-mist group-hover:border-ivory group-hover:text-ivory transition-all duration-300">
                    {p.tag}
                  </span>
                  <span className="row-arrow font-mono text-xl text-mist group-hover:text-ivory transition-colors duration-300">
                    →
                  </span>
                </div>
              </div>

              {/* Expandable info panel */}
              <div
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="overflow-hidden w-full"
                style={{ height: 0 }}
              >
                <div className="bg-ash border-t border-smoke px-16 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="font-mono text-2xs text-mist mb-3 tracking-[0.3em]">
                      $ cat README.md
                    </p>
                    <p className="font-sans text-xl text-ivory leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="font-mono text-2xs text-mist mb-3 tracking-[0.3em]">
                        $ ls stack/
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.stack.map((s) => (
                          <span
                            key={s}
                            className="font-mono text-2xs text-mist border border-smoke px-3 py-1.5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-2xs text-mist border border-smoke px-4 py-2 hover:border-ivory hover:text-ivory transition-all duration-200"
                      >
                        GitHub ↗
                      </a>
                      {"live" in p && (
                        <a
                          href={(p as { live: string }).live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-2xs text-ivory border border-ivory px-4 py-2 hover:bg-ivory hover:text-void transition-all duration-200"
                        >
                          Live demo ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
