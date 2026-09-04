import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { SiteMap } from '../components/site/SiteMap'
import { CameraFeed } from '../components/cctv/CameraFeed'
import { cameras, insideNow } from '../lib/data'
import { Dot } from '../components/ui'

function ShotRail() {
  return (
    <div className="hidden w-[248px] shrink-0 flex-col border-l border-line md:flex">
      <div className="border-b border-line px-4 py-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">Kendaraan di dalam kawasan</div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[26px] font-bold leading-none tabular-nums text-paper">{insideNow.length}</span>
          <span className="text-[11px] text-dim">dari {cameras.length} titik kamera</span>
        </div>
      </div>
      <ul className="divide-y divide-line/70">
        {insideNow.slice(0, 6).map((v) => (
          <li key={v.plate} className="flex items-center gap-2.5 px-4 py-[9px]">
            <Dot tone={v.status === 'overstay' ? 'warn' : v.status === 'unverified' ? 'neutral' : 'azure'} />
            <span className="font-mono text-[11px] tracking-tight text-paper">{v.plate}</span>
            <span className="ml-auto font-mono text-[10px] tabular-nums text-faint">{v.enteredAt}</span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
        {[cameras[0], cameras[5]].map((c) => (
          <CameraFeed key={c.id} camera={c} compact live className="aspect-[4/3] bg-ink-2" />
        ))}
      </div>
    </div>
  )
}

function DashboardShot() {
  return (
    <div className="overflow-hidden rounded-xl border border-line-2 bg-ink-2 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-ink-3/80 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto rounded-md bg-ink px-3 py-1 font-mono text-[10px] text-faint">
          netra.id/app/peta
        </span>
      </div>

      <div className="flex">
        {/* sidebar stub */}
        <div className="hidden w-[54px] shrink-0 flex-col items-center gap-3 border-r border-line py-3.5 sm:flex">
          <span className="size-6 rounded-md bg-azure/80" />
          {['bg-azure/22', 'bg-raised', 'bg-raised', 'bg-raised', 'bg-raised'].map((c, i) => (
            <span key={i} className={`size-6 rounded-md ${c}`} />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 sm:gap-3">
            <span className="whitespace-nowrap text-[13px] font-semibold text-paper">Peta kawasan</span>
            <span className="rounded-md bg-azure px-2 py-[3px] text-[10px] font-medium whitespace-nowrap text-white">
              Semua kendaraan
            </span>
            <span className="hidden rounded-md px-2 py-[3px] text-[10px] text-dim sm:inline">Truk</span>
            <span className="hidden rounded-md px-2 py-[3px] text-[10px] whitespace-nowrap text-dim sm:inline">
              Melebihi batas
            </span>
            <span className="ml-auto hidden items-center gap-1.5 whitespace-nowrap text-[10px] text-dim sm:flex">
              <Dot tone="ok" />
              Diperbarui 09:31
            </span>
          </div>
          <div className="bg-ink px-3 py-3">
            <SiteMap selected="B 1234 XYZ" compact className="aspect-[1000/560]" />
          </div>
        </div>

        <ShotRail />
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-32 pb-20 sm:pt-40">
      {/* the lit room: a wide wash behind the headline, a hard core under the screenshot */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="bp-grid absolute inset-0 mask-fade-b" />
        <div
          className="absolute left-1/2 top-[-420px] h-[760px] w-[150vw] max-w-[1500px] -translate-x-1/2 sm:h-[900px]"
          style={{
            background:
              'radial-gradient(closest-side, hsl(217 91% 58% / 0.55), hsl(224 82% 44% / 0.22) 52%, transparent 76%)',
          }}
        />
        <div
          className="absolute left-1/2 top-[300px] h-[460px] w-[900px] -translate-x-1/2 blur-[2px]"
          style={{
            background:
              'radial-gradient(closest-side, hsl(205 95% 66% / 0.34), hsl(217 91% 52% / 0.12) 58%, transparent 80%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(205 95% 78% / 0.5), transparent)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="anim-rise flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-ink-2/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
            <Dot tone="scan" /> Video management system
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-azure/35 bg-azure/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ice">
            <Dot tone="azure" /> Analitik AI on-premise
          </span>
        </div>

        <h1
          className="anim-rise mx-auto mt-7 max-w-[16ch] text-balance text-center text-[clamp(2.5rem,7.2vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-paper"
          style={{ animationDelay: '60ms' }}
        >
          Semua Kamera, Satu Dashboard Cerdas.
        </h1>

        <p
          className="anim-rise mx-auto mt-6 max-w-[64ch] text-balance text-center text-[15px] leading-relaxed text-dim sm:text-base"
          style={{ animationDelay: '120ms' }}
        >
          Pantau, rekam, dan analisis ribuan kamera dari satu layar. Netra mengubah stream yang selama ini hanya
          ditonton menjadi catatan yang bisa dicari: siapa masuk, kendaraan apa, jam berapa, lewat gerbang mana.
        </p>

        <div className="anim-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '180ms' }}>
          <Link
            to="/app"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-azure px-5 text-sm font-semibold text-white shadow-[0_16px_48px_-18px_hsl(217_91%_58%)] transition-colors hover:bg-azure-hi"
          >
            Lihat dashboard langsung
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="#platform"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-2 bg-raised/40 px-5 text-sm font-medium text-paper transition-colors hover:bg-raised"
          >
            <Play className="size-4 text-ice" />
            Cara kerjanya
          </a>
        </div>

        <div className="anim-rise relative mt-16 sm:mt-20" style={{ animationDelay: '260ms' }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 -top-8 bottom-8 -z-10 rounded-[32px] blur-2xl"
            style={{ background: 'radial-gradient(closest-side, hsl(217 91% 58% / 0.34), transparent 72%)' }}
          />
          <DashboardShot />
        </div>
      </div>
    </section>
  )
}
