import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import MagneticEl from './MagneticEl'
import { scramble } from '../utils/scramble'

const links = [
  { label: 'About', id: 'about' },
  { label: 'Work', id: 'work' },
  { label: 'UI/UX', id: 'uiux' },
  { label: 'Blockchain', id: 'blockchain' },
  { label: 'Contact', id: 'contact' },
]

export default function Nav() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const textRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lastScrambleTime = useRef(0)

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 2.6 },
    )

    const triggerScramble = () => {
      const now = Date.now()
      if (now - lastScrambleTime.current < 450) return
      lastScrambleTime.current = now
      textRefs.current.forEach((el, i) => {
        if (!el) return
        scramble(el, links[i].label, { duration: 500, delay: i * 55 })
      })
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      triggerScramble()
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-gutter py-7 flex items-center justify-between border-b transition-all duration-500 ${
        scrolled
          ? 'border-smoke/60 bg-void/90 backdrop-blur-md'
          : 'border-transparent'
      }`}
      style={{ opacity: 0 }}
    >
      {/* Left: name */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono text-base tracking-[0.2em] text-ivory uppercase hover:text-electric transition-colors duration-300"
        >
          Emil Bob
        </button>
      </div>

      {/* Center: nav links */}
      <ul className="hidden md:flex items-center gap-8">
        {links.map(({ label, id }, i) => (
          <li key={id}>
            <MagneticEl strength={0.25} range={60}>
              <button
                onClick={() => scrollTo(id)}
                className="font-mono text-base tracking-[0.2em] text-mist uppercase hover:text-electric transition-colors duration-200 group relative"
              >
                <span ref={el => { textRefs.current[i] = el }}>{label}</span>
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-electric group-hover:w-full transition-all duration-300" />
              </button>
            </MagneticEl>
          </li>
        ))}
      </ul>

      {/* Right: available */}
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-electric pulse-electric" />
        <span className="font-mono text-base text-mist tracking-widest">AVAILABLE</span>
      </span>
    </nav>
  )
}
