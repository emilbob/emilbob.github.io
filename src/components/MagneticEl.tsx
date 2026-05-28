import { useEffect, useRef, ReactNode } from 'react'
import gsap from 'gsap'

interface Props {
  children: ReactNode
  className?: string
  strength?: number
  range?: number
}

export default function MagneticEl({ children, className, strength = 0.38, range = 90 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapRef.current!

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < range) {
        const t = 1 - dist / range
        gsap.to(el, {
          x: dx * strength * t,
          y: dy * strength * t,
          duration: 0.35,
          ease: 'expo.out',
        })
      } else {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)' })
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [strength, range])

  return (
    <div ref={wrapRef} className={className}>
      {children}
    </div>
  )
}
