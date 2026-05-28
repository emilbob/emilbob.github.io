import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function BackToTop() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const visible = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const shouldShow = window.scrollY > 400
      if (shouldShow === visible.current) return
      visible.current = shouldShow
      gsap.to(btnRef.current, {
        opacity: shouldShow ? 1 : 0,
        y: shouldShow ? 0 : 12,
        duration: 0.4,
        ease: 'expo.out',
        pointerEvents: shouldShow ? 'auto' : 'none',
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      ref={btnRef}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 font-mono text-base text-electric border border-electric px-4 py-2 hover:bg-electric hover:text-void transition-colors duration-200"
      style={{ opacity: 0, pointerEvents: 'none' }}
      aria-label="Back to top"
    >
      <span>↑</span>
      <span className="tracking-widest">TOP</span>
    </button>
  )
}
