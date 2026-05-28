import { useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from './hooks/useLenis'
import GrainOverlay from './components/ui/GrainOverlay'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Nav from './components/Nav'
import BackToTop from './components/BackToTop'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import UIUX from './components/sections/UIUX'
import Blockchain from './components/sections/Blockchain'
import Contact from './components/sections/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [loaded, setLoaded] = useState(false)
  useLenis()

  const handleLoaderComplete = () => {
    setLoaded(true)
    ScrollTrigger.refresh()
  }

  return (
    <>
      <GrainOverlay />
      <Cursor />
      <BackToTop />
      {!loaded && <Loader onComplete={handleLoaderComplete} />}
      <div
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
      >
        <Nav />
        <main>
          <Hero />
          <About />
          <Projects />
          <UIUX />
          <Blockchain />
          <Contact />
        </main>
      </div>
    </>
  )
}
