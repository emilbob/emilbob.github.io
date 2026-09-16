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

    fetch('/dragon-studio-simple-whoosh-382724.mp3')
      .then(r => r.arrayBuffer())
      .then(ab => ctx.decodeAudioData(ab))
      .then(b => { buffer = b })
      .catch(() => {})

    // Unlock the AudioContext on first click or keydown
    const unlock = () => ctx.resume().catch(() => {})
    window.addEventListener('click', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    // Browsers can auto-suspend an AudioContext for power saving after a
    // stretch with no active audio graph — which is our normal state between
    // wooshes, since each BufferSourceNode is transient. Once genuinely
    // unlocked, sticky activation lets resume() succeed with no further
    // click, so re-arm automatically whenever the browser suspends it on its
    // own — otherwise every scroll after that point silently plays nothing.
    ctx.addEventListener('statechange', () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    })

    const playSound = () => {
      if (!buffer || ctx.state !== 'running') return
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const gain = ctx.createGain()
      gain.gain.value = 0.5
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start(0)
    }

    // One woosh per scroll *gesture*, not per wheel/touchmove event — a single
    // trackpad swipe or mouse-wheel scroll fires dozens of these in quick
    // succession, well inside any per-event time throttle. Play on the first
    // event of a gesture, then hold off until motion has gone quiet for
    // SCROLL_IDLE_MS before the next event is allowed to start a new one.
    //
    // Tried making this repeat periodically on long/fast scrolls so a
    // sustained gesture couldn't go silent for its whole duration — but a
    // single real scroll gesture routinely runs well past any reasonable
    // repeat interval (momentum trails on for a while), so it just fired
    // twice on what was still one scroll. Reverted: strictly one play per
    // gesture, no matter how long the gesture runs.
    const SCROLL_IDLE_MS = 180
    let scrollIdleTimer: ReturnType<typeof setTimeout> | undefined
    let isScrolling = false

    const onScrollEvent = () => {
      if (!isScrolling) {
        isScrolling = true
        playSound()
      }
      clearTimeout(scrollIdleTimer)
      scrollIdleTimer = setTimeout(() => {
        isScrolling = false
      }, SCROLL_IDLE_MS)
    }

    // A backgrounded tab throttles or fully suspends timers, so the idle
    // timeout above can fire much later than SCROLL_IDLE_MS — or not at all
    // while hidden — leaving isScrolling stuck `true`. That silently
    // swallows the next scroll once the tab is foregrounded again. Any
    // visibility change means whatever gesture was in progress is over;
    // reset explicitly instead of trusting a timer that may be starved.
    const onVisibilityChange = () => {
      isScrolling = false
      clearTimeout(scrollIdleTimer)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const isMobile = window.innerWidth < 768
    const scrollEvent = isMobile ? 'touchmove' : 'wheel'
    window.addEventListener(scrollEvent, onScrollEvent, { passive: true })

    if (isMobile) {
      return () => {
        window.removeEventListener(scrollEvent, onScrollEvent)
        window.removeEventListener('click', unlock)
        window.removeEventListener('keydown', unlock)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        clearTimeout(scrollIdleTimer)
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
      window.removeEventListener(scrollEvent, onScrollEvent)
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      clearTimeout(scrollIdleTimer)
      ctx.close()
      lenis?.destroy()
      lenis = null
      gsap.ticker.remove(ScrollTrigger.update)
    }
  }, [])

  return lenis
}
