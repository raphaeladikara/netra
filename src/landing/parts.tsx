import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Mark, Wordmark } from '../components/brand/Logo'
import { cn } from '../lib/cn'

export const NAV = [
  { id: 'platform', label: 'Platform' },
  { id: 'lintas', label: 'Lintas kamera' },
  { id: 'rekaman', label: 'Rekaman' },
  { id: 'arsip', label: 'Arsip' },
  { id: 'jaringan', label: 'Jaringan' },
  { id: 'kemampuan', label: 'Kemampuan' },
]

/** Section index. Doubles as the anchor the nav scroll-spy tracks. */
export function SectionMark({ id, children }: { id: string; children: string }) {
  return (
    <a
      href={`#${id}`}
      className="group mx-auto mb-8 flex w-fit items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-faint transition-colors hover:text-ice"
    >
      <span className="h-px w-8 bg-line-2 transition-colors group-hover:bg-azure" />
      {children}
      <span className="h-px w-8 bg-line-2 transition-colors group-hover:bg-azure" />
    </a>
  )
}

export function Heading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'text-balance text-center text-[clamp(1.75rem,4.2vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.035em] text-paper',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function Lede({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('mx-auto mt-5 max-w-[62ch] text-center text-[15px] leading-relaxed text-dim', className)}>
      {children}
    </p>
  )
}

export function Section({
  id,
  mark,
  children,
  className,
}: {
  id: string
  mark: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 border-t border-line/70 py-24 sm:py-32', className)}>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <SectionMark id={id}>{mark}</SectionMark>
        {children}
      </div>
    </section>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState('platform')

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    )
    NAV.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        solid ? 'border-b border-line bg-ink/78 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Netra — beranda">
          <Wordmark />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={cn(
                'rounded-md px-3 py-1.5 text-[13px] transition-colors duration-150',
                active === n.id ? 'text-paper' : 'text-dim hover:text-paper',
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link
            to="/app"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-azure px-4 text-[13px] font-medium text-white shadow-[0_10px_30px_-14px_hsl(217_91%_58%)] transition-colors hover:bg-azure-hi"
          >
            Buka dashboard
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <button
          className="ml-auto grid size-9 place-content-center rounded-lg border border-line text-dim md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-ink/95 px-5 py-3 backdrop-blur-xl md:hidden">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2.5 text-sm text-dim hover:text-paper"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/app"
            className="mt-2 flex h-10 items-center justify-center rounded-lg bg-azure text-sm font-medium text-white"
          >
            Buka dashboard
          </Link>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const cols: Array<{ title: string; items: string[] }> = [
    { title: 'Produk', items: ['Netra Command', 'Netra Stream', 'Netra Engine', 'Netra Field'] },
    { title: 'Solusi', items: ['Kawasan industri', 'Pergudangan & logistik', 'Perumahan & komersial', 'Pelabuhan & terminal'] },
    { title: 'Sumber daya', items: ['Dokumentasi', 'Panduan penerapan', 'Kalkulator storage', 'Status layanan'] },
  ]
  return (
    <footer className="border-t border-line bg-ink-2/60">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-dim">
              Kami bangun lapisan penglihatan untuk kawasan industri: kamera yang sudah terpasang, dibaca terus-menerus,
              dan diterjemahkan jadi keputusan operasional. Semua diproses di dalam infrastruktur Anda.
            </p>
            <dl className="mt-6 space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="text-faint">Surel</dt>
                <dd className="text-dim">halo@netra.id</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">Telepon</dt>
                <dd className="font-mono text-dim">+62 21 5000 4400</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">Kantor</dt>
                <dd className="text-dim">Jakarta Utara, Indonesia</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{c.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((i) => (
                    <li key={i}>
                      <span className="text-sm text-dim transition-colors hover:text-paper">{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Netra Teknologi Nusantara. Purwarupa demonstrasi — angka dan rekaman di halaman ini adalah data contoh.</p>
          <div className="flex items-center gap-2">
            <Mark className="size-4" />
            <span className="font-mono tracking-tight">v0.9 · demo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
