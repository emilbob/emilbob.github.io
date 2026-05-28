import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scramble } from '../../utils/scramble'

gsap.registerPlugin(ScrollTrigger)

const STACK = ['rust', 'solidity', 'substrate', 'polkadot', 'solana', 'anchor', 'near', 'noir', 'typescript', 'react', 'node', 'ipfs', 'ibc', 'zk-proofs']

const TERMINAL_LINES = [
  { cmd: '$ whoami', out: 'rust · smart contract developer · novi sad, rs' },
  { cmd: '$ cat academy.log', out: 'polkadot blockchain academy · wave 05 · singapore · 2024' },
  { cmd: '$ cat education.log', out: 'belgrade mathematical academy · zero-knowledge cryptography · 2023' },
  { cmd: '$ cat hackathon.log', out: 'proof of anchor · colosseum × solana × cypherpunk · 2025' },
  { cmd: '$ ls expertise/', out: 'groth16  plonk  kzg  ibc  rwa  defi  parachains  zktls' },
]

export default function Blockchain() {
  const sectionRef = useRef<HTMLElement>(null)
  const termRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const numRef   = useRef<HTMLSpanElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current!

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      onEnter: () => {
        if (labelRef.current) scramble(labelRef.current, '> blockchain.rs', { duration: 450 })
      },
    })

    const numEl = numRef.current
    if (numEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          io.disconnect()
          gsap.to(numEl, { opacity: 0.35, duration: 0.6, ease: 'expo.out' })
          scramble(numEl, '005', { duration: 500 })
        },
        { threshold: 0.5 },
      )
      io.observe(numEl)
    }

    // Terminal — IntersectionObserver for Lenis compatibility
    const termEl = termRef.current
    if (termEl) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          io.disconnect()
          lineRefs.current.forEach((lineEl, i) => {
            if (!lineEl) return
            const cmdEl = lineEl.querySelector('.t-cmd') as HTMLElement | null
            const outEl = lineEl.querySelector('.t-out') as HTMLElement | null
            setTimeout(() => {
              gsap.to(lineEl, { opacity: 1, y: 0, duration: 0.3, ease: 'expo.out' })
              if (cmdEl) scramble(cmdEl, cmdEl.dataset.text ?? '', { duration: 350 })
              setTimeout(() => {
                if (outEl) {
                  gsap.to(outEl, { opacity: 1, duration: 0.2 })
                  scramble(outEl, outEl.dataset.text ?? '', { duration: 450 })
                }
              }, 420)
            }, i * 370)
          })
        },
        { threshold: 0.3 },
      )
      io.observe(termEl)
    }

    gsap.fromTo(
      stackRef.current?.querySelectorAll('.s-tag') ?? [],
      { opacity: 0, y: 8 },
      {
        opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: 'expo.out',
        scrollTrigger: { trigger: stackRef.current, start: 'top 85%' },
      },
    )

    // Ticker
    const inner = tickerRef.current?.querySelector('.ticker-inner')
    if (inner) {
      gsap.to(inner, { xPercent: -50, ease: 'none', repeat: -1, duration: 22 })
    }
  }, [])

  return (
    <section ref={sectionRef} id="blockchain" className="bg-ash px-gutter py-section border-t border-smoke overflow-hidden">
      <div className="max-w-[1600px] mx-auto">

        <span ref={numRef} className="font-mono text-5xl text-mist tabular-nums leading-none select-none block mb-6" style={{ opacity: 0 }}>---</span>

        <span ref={labelRef} className="font-mono text-3xl text-electric mb-10 block">
          &gt; ________
        </span>

        {/* Terminal window */}
        <div ref={termRef} className="border border-smoke bg-void mb-14 overflow-hidden">
          {/* Terminal chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-smoke">
            <span className="w-2.5 h-2.5 rounded-full bg-smoke" />
            <span className="w-2.5 h-2.5 rounded-full bg-smoke" />
            <span className="w-2.5 h-2.5 rounded-full bg-electric/60" />
            <span className="font-mono text-2xs text-mist ml-4 tracking-[0.2em]">emilbob ~ profile.rs</span>
          </div>

          <div className="p-6 space-y-4">
            {TERMINAL_LINES.map((line, i) => (
              <div
                key={i}
                ref={(el) => { lineRefs.current[i] = el }}
                className="space-y-1"
                style={{ opacity: 0, transform: 'translateY(8px)' }}
              >
                <div
                  className="t-cmd font-mono text-lg text-electric"
                  data-text={line.cmd}
                >
                  {line.cmd}
                </div>
                <div
                  className="t-out font-mono text-xl text-bone pl-4 border-l border-smoke"
                  data-text={line.out}
                  style={{ opacity: 0 }}
                >
                  {line.out}
                </div>
              </div>
            ))}

            {/* Blinking cursor */}
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg text-electric">$</span>
              <span className="font-mono text-lg text-electric blink">_</span>
            </div>
          </div>
        </div>

        {/* Stack tags */}
        <div ref={stackRef}>
          <p className="font-mono text-2xs text-mist mb-4 tracking-[0.3em]">$ ls stack/</p>
          <div className="flex flex-wrap gap-2">
            {STACK.map((s) => (
              <span
                key={s}
                className="s-tag font-mono text-2xs text-mist border border-smoke px-3 py-1.5 hover:border-electric hover:text-electric transition-all duration-200"
                style={{ opacity: 0 }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div ref={tickerRef} className="mt-16 border-t border-b border-smoke py-3 overflow-hidden">
        <div className="ticker-inner flex whitespace-nowrap w-max select-none">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center">
              {['RUST', 'SUBSTRATE', 'POLKADOT', 'SOLANA', 'WEB3', 'ZK-PROOFS', 'DEFI', 'IPFS', 'HACKATHON', 'BELGRADE', 'SINGAPORE', 'REMOTE'].map((t) => (
                <span key={t} className="font-mono text-2xs tracking-[0.5em] text-mist uppercase mx-10">{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
