import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    if (window.innerWidth < 768) return;

    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis!.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis?.destroy()
      lenis = null
      gsap.ticker.remove(ScrollTrigger.update)
    }
  }, [])

  return lenis
}
