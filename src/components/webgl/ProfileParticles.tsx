import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

const STEP = 5

const VERT = /* glsl */ `
  attribute vec3 aRandom;
  attribute float aBrightness;
  attribute float aImgAlpha;
  uniform float uHover;
  uniform float uPointSize;
  uniform float uTime;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    vBrightness = aBrightness;

    float h = clamp(uHover, 0.0, 1.0);
    float t = uTime;

    // ── Static scatter (radial, random direction per particle) ──────
    float twist = h * aRandom.z * 1.6;
    float cs = cos(twist);
    float sn = sin(twist);
    vec2 scatterDir = vec2(cs * aRandom.x - sn * aRandom.y,
                           sn * aRandom.x + cs * aRandom.y);
    vec2 scatter = scatterDir * h * 0.9;

    // ── Continuous drift (unique Lissajous path per particle) ───────
    float p1 = position.x * 8.0 + position.y * 11.0 + aRandom.z * 3.14;
    float p2 = position.y * 6.0 - position.x *  9.0 + aRandom.x * 2.5;
    float amp = (0.05 + abs(aRandom.x) * 0.07) * h;

    vec2 drift;
    drift.x = (sin(t * 1.1 + p1) * 0.55 + sin(t * 0.45 + p2       ) * 0.45) * amp;
    drift.y = (cos(t * 0.8 + p1 * 0.9) * 0.5 + cos(t * 1.25 + p2 * 1.1) * 0.5) * amp;

    // ── Gentle breathing when assembled ─────────────────────────────
    float breathe = sin(t * 1.3 + position.x * 9.0 + position.y * 7.0) * 0.003 * (1.0 - h);

    vec3 pos = position;
    pos.xy  += scatter + drift + breathe;

    vAlpha = aImgAlpha * (1.0 - h * 0.25);

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPointSize * (1.0 + h * abs(aRandom.x) * 0.4);
  }
`

const FRAG = /* glsl */ `
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    vec2  pc = gl_PointCoord - 0.5;
    float d  = length(pc);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.2, 0.5, d);
    gl_FragColor = vec4(vBrightness, vBrightness, vBrightness, vAlpha * soft);
  }
`

interface Props { className?: string }

export default function ProfileParticles({ className }: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grainRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap   = wrapRef.current!
    const canvas = canvasRef.current!
    let mounted  = true
    let rafId    = 0
    let dispose: (() => void) | null = null

    const dpr      = Math.min(window.devicePixelRatio, 2)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(dpr)

    const w = wrap.clientWidth || 400
    const h = w // square
    renderer.setSize(w, h)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1
    const scene  = new THREE.Scene()

    const img = new Image()
    img.src   = '/profilna_bw.png'

    img.onload = () => {
      if (!mounted) return

      // Sample image pixels
      const oc  = document.createElement('canvas')
      oc.width  = img.width
      oc.height = img.height
      const ctx    = oc.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data

      const positions:   number[] = []
      const randoms:     number[] = []
      const brightnesses:number[] = []
      const imgAlphas:   number[] = []

      const iw = img.width
      const ih = img.height

      for (let y = 0; y < ih; y += STEP) {
        for (let x = 0; x < iw; x += STEP) {
          const i4 = (y * iw + x) * 4
          const a  = pixels[i4 + 3]
          if (a < 20) continue

          const r = pixels[i4], g = pixels[i4 + 1], b = pixels[i4 + 2]
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255

          // Map image UV → world space (-1..1)
          const wx =  (x / iw) * 2.0 - 1.0
          const wy = -((y / ih) * 2.0 - 1.0)

          positions.push(wx, wy, 0)

          // Random scatter: radial direction + random distance + twist
          const angle = Math.random() * Math.PI * 2
          const dist  = 0.7 + Math.random() * 1.6
          randoms.push(
            Math.cos(angle) * dist,
            Math.sin(angle) * dist,
            (Math.random() - 0.5) * 2.0, // twist factor
          )

          brightnesses.push(brightness)
          imgAlphas.push(a / 255)
        }
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position',   new THREE.Float32BufferAttribute(positions,    3))
      geo.setAttribute('aRandom',    new THREE.Float32BufferAttribute(randoms,      3))
      geo.setAttribute('aBrightness',new THREE.Float32BufferAttribute(brightnesses, 1))
      geo.setAttribute('aImgAlpha',  new THREE.Float32BufferAttribute(imgAlphas,    1))

      // Point size: fill each sampled cell
      const pointSize = ((w * dpr) / (iw / STEP)) * 1.7

      const uniforms = {
        uHover:     { value: 0 },
        uPointSize: { value: pointSize },
        uTime:      { value: 0 },
      }

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite:  false,
        uniforms,
        vertexShader:   VERT,
        fragmentShader: FRAG,
      })

      scene.add(new THREE.Points(geo, mat))

      const onEnter = () => {
        gsap.to(uniforms.uHover, { value: 1, duration: 1.0, ease: 'expo.out' })
        gsap.to(grainRef.current, { opacity: 0.13, duration: 0.5, ease: 'expo.out' })
      }
      const onLeave = () => {
        gsap.to(uniforms.uHover, { value: 0, duration: 1.4, ease: 'expo.inOut' })
        gsap.to(grainRef.current, { opacity: 0, duration: 0.9, ease: 'expo.inOut' })
      }

      wrap.addEventListener('mouseenter', onEnter)
      wrap.addEventListener('mouseleave', onLeave)

      const clock = new THREE.Clock()
      const tick  = () => {
        rafId = requestAnimationFrame(tick)
        uniforms.uTime.value = clock.getElapsedTime()
        renderer.render(scene, camera)
      }
      tick()

      dispose = () => {
        cancelAnimationFrame(rafId)
        wrap.removeEventListener('mouseenter', onEnter)
        wrap.removeEventListener('mouseleave', onLeave)
        geo.dispose()
        mat.dispose()
      }
    }

    return () => {
      mounted = false
      dispose?.()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={wrapRef} className={className} style={{ aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
      <div ref={grainRef} className="grain-local" style={{ opacity: 0 }} aria-hidden="true" />
    </div>
  )
}
