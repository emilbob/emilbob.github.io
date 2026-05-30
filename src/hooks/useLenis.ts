import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function useLenis() {
  useEffect(() => {
    // Web Audio API: once the context is resumed via a click, BufferSource.start()
    // works from any event (including wheel) with no further autoplay restrictions.
    const ctx = new AudioContext()
    let buffer: AudioBuffer | null = null
    let lastPlayed = 0

    fetch('/dragon-studio-simple-whoosh-382724.mp3')
      .then(r => r.arrayBuffer())
      .then(ab => ctx.decodeAudioData(ab))
      .then(b => { buffer = b })
      .catch(() => {})

    // Unlock the AudioContext on first click or keydown
    const unlock = () => ctx.resume().catch(() => {})
    window.addEventListener('click', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    const playSound = () => {
      if (!buffer || ctx.state !== 'running') return
      const now = Date.now()
      if (now - lastPlayed < 300) return
      lastPlayed = now
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const gain = ctx.createGain()
      gain.gain.value = 0.5
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start(0)
    }

    const isMobile = window.innerWidth < 768
    const scrollEvent = isMobile ? 'touchmove' : 'wheel'
    window.addEventListener(scrollEvent, playSound, { passive: true })

    if (isMobile) {
      return () => {
        window.removeEventListener(scrollEvent, playSound)
        window.removeEventListener('click', unlock)
        window.removeEventListener('keydown', unlock)
        ctx.close()
      }
    }

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
      window.removeEventListener(scrollEvent, playSound)
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
      ctx.close()
      lenis?.destroy()
      lenis = null
      gsap.ticker.remove(ScrollTrigger.update)
    }
  }, [])

  return lenis
}
