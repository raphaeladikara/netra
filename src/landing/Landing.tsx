import { useEffect } from 'react'
import { Nav, Footer } from './parts'
import { Hero } from './Hero'
import { Platform } from './Platform'
import { Recording, Archive, Bandwidth, Capabilities, Cta } from './Sections'

export default function Landing() {
  useEffect(() => {
    document.title = 'Netra — Semua Kamera, Satu Dashboard Cerdas'
  }, [])

  return (
    <div className="min-h-dvh bg-ink">
      <Nav />
      <main>
        <Hero />
        <Platform />
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
