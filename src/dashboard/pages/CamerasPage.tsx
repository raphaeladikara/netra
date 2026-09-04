import { useState } from 'react'
import { Wrench, RefreshCw } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Badge, Button, Stat, Field, UptimeBars, Dot } from '../../components/ui'
import { cameras, auditLog } from '../../lib/data'
import { seeded, between } from '../../lib/rng'
import { cn } from '../../lib/cn'

function bars(id: string, state: string) {
  const r = seeded(`bars-${id}`)
  return Array.from({ length: 14 }, (_, i) => {
    if (state === 'offline') return i > 10 ? 0.2 : between(r, 0.7, 1)
    if (state === 'attention') return r() > 0.7 ? between(r, 0.2, 0.45) : between(r, 0.75, 1)
    return between(r, 0.8, 1)
  })
}

export default function CamerasPage() {
  const [open, setOpen] = useState<string | null>(null)
  const online = cameras.filter((c) => c.state === 'online').length
  const attention = cameras.filter((c) => c.state !== 'online')
  const live = cameras.filter((c) => c.state !== 'offline')
  const avg = live.reduce((a, c) => a + c.uptime, 0) / live.length
  const active = cameras.find((c) => c.id === open)

  return (
    <>
      <TopBar title="Kesehatan kamera" />

      <Page className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Kesehatan kamera" meta={`${cameras.length} titik terpasang`}>
              <div className="ml-auto flex gap-1.5">
                <Badge tone="ok">{online} online</Badge>
                <Badge tone="warn">{attention.length} perlu perhatian</Badge>
              </div>
            </PanelHead>

            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {cameras.map((c) => {
                const tone = c.state === 'online' ? 'ok' : c.state === 'attention' ? 'warn' : 'alarm'
                return (
                  <button
                    key={c.id}
                    onClick={() => setOpen(c.id)}
                    className={cn(
                      'rounded-xl border p-3.5 text-left transition-colors duration-150',
                      c.state === 'online' ? 'border-line hover:border-line-2' : 'border-warn/35 bg-warn/[0.04]',
                      c.state === 'offline' && 'border-alarm/40 bg-alarm/[0.05]',
                      open === c.id && 'ring-1 ring-azure/50',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Dot tone={tone} pulse={c.state === 'offline'} />
                        <span className="font-mono text-[13px] tracking-tight text-paper">{c.name}</span>
                      </span>
                      <span
                        className={cn(
                          'font-mono text-[12px] tabular-nums',
                          c.state === 'online' ? 'text-ok' : c.state === 'attention' ? 'text-warn' : 'text-alarm',
                        )}
                      >
                        {c.state === 'offline' ? '—' : `${c.uptime.toFixed(1)}%`}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[12px] text-dim">{c.zone}</div>
                    <div className="mt-3">
                      <UptimeBars seedValues={bars(c.id, c.state)} tone={tone} />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
                      <span>14 hari</span>
                      <span>{c.state === 'online' ? 'stabil' : c.state === 'attention' ? 'putus berulang' : 'tidak merespons'}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Perlu perhatian</div>
              <ul className="mt-3 space-y-2.5">
                {attention.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                    <Dot tone={c.state === 'offline' ? 'alarm' : 'warn'} />
                    <span className="font-mono tracking-tight text-paper">{c.name}</span>
                    <span className="text-dim">{c.zone}</span>
                    <span className="text-faint">{c.note}</span>
                    <Button size="sm" className="ml-auto">
                      <Wrench className="size-3.5" />
                      Buat tiket
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Rata-rata uptime" value={`${avg.toFixed(1)}%`} hint="30 hari · 1 kamera mati tidak dihitung" tone="ok" />
            <Stat label="Penyimpanan" value="62%" hint="4,75 TB dari 8 TB" tone="azure" />
          </div>

          {active ? (
            <Panel className="overflow-hidden p-0">
              <PanelHead title={active.name} meta={active.zone}>
                <button
                  onClick={() => setOpen(null)}
                  className="ml-auto text-[12px] text-faint transition-colors hover:text-paper"
                >
                  Tutup
                </button>
              </PanelHead>
              <CameraFeed camera={active} className="aspect-video" />
              <div className="px-5 py-4">
                <Field label="Status">{active.state === 'online' ? 'Online' : active.state === 'attention' ? 'Perlu perhatian' : 'Tidak merespons'}</Field>
                <Field label="Resolusi">{active.resolution}</Field>
                <Field label="Frame rate">{active.fps} fps</Field>
                <Field label="Bitrate">{active.bitrate} Mbps</Field>
                <Field label="Uptime 14 hari">{active.state === 'offline' ? '—' : `${active.uptime.toFixed(1)}%`}</Field>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {active.analytics.map((a) => (
                    <span key={a} className="rounded-md bg-raised/70 px-2 py-1 font-mono text-[10px] text-dim">
                      {a}
                    </span>
                  ))}
                </div>
                <Button className="mt-4 w-full">
                  <RefreshCw className="size-4" />
                  Sambung ulang stream
                </Button>
              </div>
            </Panel>
          ) : (
            <Panel className="px-5 py-10 text-center">
              <p className="text-[14px] text-paper">Pilih satu kamera</p>
              <p className="mx-auto mt-2 max-w-[34ch] text-[13px] leading-relaxed text-dim">
                Kartu di sebelah kiri membuka detail stream, bitrate, dan filter analitik yang sedang berjalan di titik
                itu.
              </p>
            </Panel>
          )}

          <Panel className="min-h-0 overflow-hidden p-0">
            <PanelHead title="Jejak audit" meta="hari ini" />
            <ul className="max-h-[42vh] divide-y divide-line/70 overflow-y-auto">
              {auditLog.slice(0, 6).map((a, i) => (
                <li key={i} className="flex gap-3 px-5 py-3">
                  <span className="w-10 shrink-0 font-mono text-[12px] tabular-nums text-faint">{a.time}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] text-paper">{a.actor}</span>
                      <Badge tone="neutral">{a.role}</Badge>
                    </div>
                    <div className="mt-0.5 text-[12px] leading-relaxed text-dim">{a.action}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Page>
    </>
  )
}
