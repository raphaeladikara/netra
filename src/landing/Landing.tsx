import { useEffect } from 'react'
import { Nav, Footer } from './parts'
import { Hero } from './Hero'
import { Platform } from './Platform'
import { CrossCamera, Recording, Archive, Bandwidth, Capabilities, Cta } from './Sections'

export default function Landing() {
  useEffect(() => {
    document.title = 'ByteTrack — Satu Kendaraan, Semua Kamera, Satu Identitas'
  }, [])

  return (
    <div className="min-h-dvh bg-ink">
      <Nav />
      <main>
        <Hero />
        <Platform />
        <CrossCamera />
        <Recording />
        <Archive />
        <Bandwidth />
        <Capabilities />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
