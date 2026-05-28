import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { noiseVertex, noiseFragment } from './shaders'

export default function NoiseBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    const W = mount.clientWidth
    const H = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(W, H)
    renderer.setClearColor(0x040404)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.z = 1.5

    const geo = new THREE.PlaneGeometry(4, 3, 120, 90)
    const uniforms = {
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader: noiseVertex,
      fragmentShader: noiseFragment,
      uniforms,
    })
    scene.add(new THREE.Mesh(geo, mat))

    const mouse = new THREE.Vector2()
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove)

    let targetHover = 0
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') targetHover = 1
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') targetHover = 0
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    const targetMouse = new THREE.Vector2()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      uniforms.uTime.value += 0.016
      targetMouse.lerp(mouse, 0.018)
      uniforms.uMouse.value.copy(targetMouse)
      uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.07
      renderer.render(scene, camera)
    }
    tick()

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />
}
