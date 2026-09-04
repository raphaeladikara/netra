import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  Map as MapIcon,
  LayoutGrid,
  Truck,
  Bell,
  Cctv,
  BarChart3,
  ScrollText,
  Smartphone,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { Mark } from '../components/brand/Logo'
import { ESTATE, alerts } from '../lib/data'
import { cn } from '../lib/cn'

const openAlerts = alerts.filter((a) => a.state !== 'closed').length

const GROUPS: Array<{ title: string; items: Array<{ to: string; label: string; icon: typeof MapIcon; badge?: number }> }> = [
  {
    title: 'Operasi',
    items: [
      { to: '/app/peta', label: 'Peta kawasan', icon: MapIcon },
      { to: '/app/dinding', label: 'Dinding kamera', icon: LayoutGrid },
      { to: '/app/kendaraan', label: 'Kendaraan', icon: Truck },
      { to: '/app/peringatan', label: 'Peringatan', icon: Bell, badge: openAlerts },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { to: '/app/kamera', label: 'Kesehatan kamera', icon: Cctv },
      { to: '/app/analitik', label: 'Analitik & laporan', icon: BarChart3 },
      { to: '/app/audit', label: 'Audit & pengguna', icon: ScrollText },
    ],
  },
  {
    title: 'Lapangan',
    items: [{ to: '/app/petugas', label: 'Aplikasi petugas', icon: Smartphone }],
  },
]

export function Shell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-dvh bg-ink">
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-ink-2/60 transition-[width] duration-200 md:flex',
          collapsed ? 'w-[68px]' : 'w-[236px]',
        )}
      >
        <div className={cn('flex items-center gap-2.5 border-b border-line px-4 py-4', collapsed && 'justify-center px-0')}>
          <Link to="/" aria-label="Kembali ke beranda">
            <Mark className="size-7" />
          </Link>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-semibold text-paper">{ESTATE.product}</div>
              <div className="truncate text-[11px] text-faint">{ESTATE.estate}</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-5">
              {!collapsed && (
                <div className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">{g.title}</div>
              )}
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      title={collapsed ? it.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors duration-150',
                          collapsed && 'justify-center px-0',
                          isActive ? 'bg-azure/18 text-paper' : 'text-dim hover:bg-raised/60 hover:text-paper',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <it.icon className={cn('size-[17px] shrink-0', isActive ? 'text-ice' : 'text-faint')} strokeWidth={1.7} />
                          {!collapsed && <span className="truncate">{it.label}</span>}
                          {!collapsed && it.badge ? (
                            <span className="ml-auto rounded-md bg-warn/15 px-1.5 py-[1px] font-mono text-[10px] tabular-nums text-warn">
                              {it.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              'mb-3 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-faint transition-colors hover:bg-raised/60 hover:text-paper',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <PanelLeft className="size-[17px]" strokeWidth={1.7} /> : <PanelLeftClose className="size-[17px]" strokeWidth={1.7} />}
            {!collapsed && 'Ciutkan'}
          </button>

          <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
            <span className="grid size-8 shrink-0 place-content-center rounded-full bg-azure/20 font-mono text-[11px] text-ice">
              {ESTATE.operator.initials}
            </span>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13px] text-paper">{ESTATE.operator.name}</div>
                <div className="truncate text-[11px] text-faint">
                  {ESTATE.operator.role} · {ESTATE.operator.shift}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* below md the rail collapses into a scrollable strip so every screen stays reachable */}
        <div className="flex items-center gap-2 border-b border-line bg-ink-2/70 px-3 py-2 md:hidden">
          <Link to="/" aria-label="Kembali ke beranda" className="shrink-0">
            <Mark className="size-6" />
          </Link>
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {GROUPS.flatMap((g) => g.items).map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] whitespace-nowrap transition-colors',
                    isActive ? 'bg-azure/20 text-paper' : 'text-dim',
                  )
                }
              >
                <it.icon className="size-4" strokeWidth={1.7} />
                {it.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export function TopBar({
  title,
  children,
  back,
}: {
  title: string
  children?: React.ReactNode
  back?: { to: string; label: string }
}) {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      {back && (
        <Link
          to={back.to}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-dim transition-colors hover:text-paper"
        >
          <ArrowLeft className="size-3.5" />
          {back.label}
        </Link>
      )}
      <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-paper">{title}</h1>
      {children}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-[12px] text-dim sm:flex">
          <span className="size-1.5 rounded-full bg-ok" style={{ animation: 'netra-pulse 2.4s ease-in-out infinite' }} />
          Diperbarui {ESTATE.clock}
        </span>
        <span className="rounded-md border border-warn/35 bg-warn/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-warn">
          Data contoh
        </span>
      </div>
    </header>
  )
}

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 p-4 sm:p-6', className)}>{children}</div>
}
