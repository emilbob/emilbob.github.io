import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface PreviewState {
  visible: boolean
  gradient: string
  label: string
}

export default function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const coordRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<PreviewState>({ visible: false, gradient: '', label: '' })

  useEffect(() => {
    const dot   = dotRef.current!
    const ring  = ringRef.current!
    const coord = coordRef.current!

    const pos     = { x: window.innerWidth / 2,  y: window.innerHeight / 2 }
    const ringPos = { x: pos.x, y: pos.y }
    const prePos  = { x: pos.x, y: pos.y }

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      coord.textContent = `${String(Math.round(pos.x)).padStart(4, '0')} / ${String(Math.round(pos.y)).padStart(4, '0')}`
      gsap.set(coord, { x: pos.x + 14, y: pos.y - 10 })
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      gsap.set(dot, { x: pos.x, y: pos.y })

      ringPos.x += (pos.x - ringPos.x) * 0.1
      ringPos.y += (pos.y - ringPos.y) * 0.1
      gsap.set(ring, { x: ringPos.x, y: ringPos.y })

      prePos.x += (pos.x - prePos.x) * 0.07
      prePos.y += (pos.y - prePos.y) * 0.07
      if (previewRef.current) {
        gsap.set(previewRef.current, { x: prePos.x, y: prePos.y })
      }
    }
    gsap.ticker.add(tick)

    // Generic link/button hover
    const enter = () => {
      gsap.to(ring, { scale: 2.2, borderColor: 'rgba(255,255,255,0.9)', duration: 0.3, ease: 'expo.out' })
      gsap.to(dot,  { scale: 0, duration: 0.2 })
    }
    const leave = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(255,255,255,0.45)', duration: 0.3, ease: 'expo.out' })
      gsap.to(dot,  { scale: 1, duration: 0.2 })
    }

    const all = document.querySelectorAll('a, button')
    all.forEach((el) => {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })

    // Project row hover — show floating preview
    const projectRows = document.querySelectorAll('[data-preview]')
    projectRows.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const gradient = (el as HTMLElement).dataset.preview ?? ''
        const label    = (el as HTMLElement).dataset.label ?? ''
        setPreview({ visible: true, gradient, label })
        gsap.to(ring,  { scale: 0, duration: 0.2 })
        gsap.to(dot,   { scale: 0, duration: 0.2 })
      })
      el.addEventListener('mouseleave', () => {
        setPreview((s) => ({ ...s, visible: false }))
        gsap.to(ring, { scale: 1, borderColor: '#b4ff3980', duration: 0.3, ease: 'expo.out' })
        gsap.to(dot,  { scale: 1, duration: 0.3 })
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.ticker.remove(tick)
    }
  }, [])

  // Animate preview in/out
  useEffect(() => {
    if (!previewRef.current) return
    if (preview.visible) {
      gsap.to(previewRef.current, {
        opacity: 1,
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.5,
        ease: 'expo.out',
      })
    } else {
      gsap.to(previewRef.current, {
        opacity: 0,
        scale: 0.92,
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.4,
        ease: 'expo.in',
      })
    }
  }, [preview.visible])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={coordRef} className="cursor-coords" />

      {/* Floating project preview */}
      <div
        ref={previewRef}
        className="fixed top-0 left-0 z-[9996] w-[280px] h-[190px] pointer-events-none overflow-hidden border border-smoke"
        style={{
          opacity: 0,
          scale: 0.92,
          clipPath: 'inset(0% 0% 100% 0%)',
          transform: 'translate(-50%, -120%)',
          background: preview.gradient,
        }}
      >
        <div className="absolute inset-0 flex items-end p-4">
          <span className="font-mono text-2xs text-electric tracking-[0.25em] uppercase">
            {preview.label}
          </span>
        </div>
      </div>
    </>
  )
}
