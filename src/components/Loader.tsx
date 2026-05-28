import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { scramble } from '../utils/scramble'

interface LoaderProps {
  onComplete: () => void
}

const BOOT_LINES = [
  '> initializing runtime...',
  '> loading modules [react, gsap, lenis]',
  '> connecting substrate node...',
  '> building portfolio...',
  '> done.',
]

export default function Loader({ onComplete }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const termRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    const obj = { val: 0 }
    const lines: HTMLElement[] = []

    // Build terminal lines
    if (termRef.current) {
      BOOT_LINES.forEach((line, i) => {
        const el = document.createElement('p')
        el.textContent = ''
        el.style.opacity = '0'
        el.className = 'font-mono text-2xs text-mist leading-relaxed'
        termRef.current!.appendChild(el)
        lines.push(el)

        tl.to(el, { opacity: 1, duration: 0.01 }, i * 0.28)
        tl.add(() => scramble(el, line, { duration: 350 }), i * 0.28 + 0.02)
      })
    }

    tl.to(
      obj,
      {
        val: 100,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate() {
          if (countRef.current)
            countRef.current.textContent = Math.floor(obj.val).toString().padStart(3, '0')
          if (barRef.current)
            gsap.set(barRef.current, { scaleX: obj.val / 100 })
        },
      },
      0.4,
    )

    if (nameRef.current) {
      tl.add(() => scramble(nameRef.current!, 'EMIL BOB', { duration: 600 }), 1.2)
    }

    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: 'expo.inOut',
      delay: 0.3,
      onComplete,
    })
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9990] bg-void flex flex-col justify-between p-gutter overflow-hidden"
    >
      {/* Top */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xs text-mist tracking-[0.3em] uppercase">System</span>
        <span className="font-mono text-2xs text-electric tracking-[0.3em] uppercase">Boot</span>
      </div>

      {/* Center terminal */}
      <div className="flex flex-col gap-8">
        <div ref={termRef} className="space-y-1 max-w-sm" />
        <div
          ref={nameRef}
          className="font-mono text-4xl md:text-6xl text-ivory tracking-tighter"
        >
          ________
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-6">
        <div className="flex-1 h-px bg-smoke overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-electric origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <span ref={countRef} className="font-mono text-2xs text-electric tabular-nums">
          000
        </span>
      </div>
    </div>
  )
}
