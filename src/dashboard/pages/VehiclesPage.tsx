import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, Plus, ArrowUpRight } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Badge, Button, Field, Dot } from '../../components/ui'
import { vehicles, cameras } from '../../lib/data'
import { cn } from '../../lib/cn'

const STATUS: Record<string, { label: string; tone: 'azure' | 'warn' | 'neutral' | 'ok' }> = {
  normal: { label: 'Di dalam kawasan', tone: 'azure' },
  overstay: { label: 'Melebihi batas', tone: 'warn' },
  unverified: { label: 'Belum terverifikasi', tone: 'neutral' },
  left: { label: 'Sudah keluar', tone: 'ok' },
}

const KIND_TONE = {
  enter: 'azure',
  pass: 'azure',
  stop: 'scan',
  flag: 'warn',
  exit: 'ok',
} as const

export default function VehiclesPage() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string>('B 1234 XYZ')

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, '')
    if (!needle) return vehicles
    return vehicles.filter(
      (v) =>
        v.plate.toLowerCase().replace(/\s+/g, '').includes(needle) ||
        v.tenant.toLowerCase().includes(q.trim().toLowerCase()) ||
        v.type.toLowerCase().includes(q.trim().toLowerCase()),
    )
  }, [q])

  const v = vehicles.find((x) => x.plate === selected) ?? results[0]
  const cam = v ? cameras.find((c) => c.name === v.sightings[v.sightings.length - 1].cam) ?? cameras[0] : cameras[0]

  return (
    <>
      <TopBar title="Kendaraan">
        <label className="relative flex min-w-[240px] flex-1 items-center sm:max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 size-4 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari plat, tenant, atau jenis kendaraan"
            className="h-10 w-full rounded-lg border border-line bg-ink-2 pl-9 pr-16 font-mono text-[13px] tracking-tight text-paper transition-colors placeholder:font-sans placeholder:tracking-normal focus:border-azure/60 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {results.length}
          </span>
        </label>
      </TopBar>

      <Page className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Hasil pencarian" meta={`${results.length} kendaraan`} />
            {results.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-[14px] text-paper">Tidak ada kendaraan yang cocok dengan “{q}”.</p>
                <p className="mx-auto mt-2 max-w-[46ch] text-[13px] leading-relaxed text-dim">
                  Coba potongan platnya saja, misalnya <span className="font-mono text-paper">1234</span>. Plat yang
                  terbaca sebagian tetap tersimpan dan bisa dicari.
                </p>
                <Button className="mt-5" onClick={() => setQ('')}>
                  Bersihkan pencarian
                </Button>
              </div>
            ) : (
              <div className="max-h-[38vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-panel">
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Plat</th>
                      <th className="px-3 py-2.5 font-normal">Jenis</th>
                      <th className="hidden px-3 py-2.5 font-normal sm:table-cell">Tenant</th>
                      <th className="px-3 py-2.5 font-normal">Masuk</th>
                      <th className="px-5 py-2.5 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {results.map((r) => (
                      <tr
                        key={r.plate}
                        onClick={() => setSelected(r.plate)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selected === r.plate ? 'bg-azure/12' : 'hover:bg-raised/40',
                        )}
                      >
                        <td className="px-5 py-2.5 font-mono text-[13px] tracking-tight text-paper">{r.plate}</td>
                        <td className="px-3 py-2.5 text-[13px] text-dim">{r.type}</td>
                        <td className="hidden px-3 py-2.5 text-[13px] text-dim sm:table-cell">{r.tenant}</td>
                        <td className="px-3 py-2.5 font-mono text-[12px] tabular-nums text-dim">{r.enteredAt}</td>
                        <td className="px-5 py-2.5">
                          <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {v && (
            <Panel className="flex min-w-0 flex-1 flex-col overflow-hidden p-0">
              <PanelHead
                title="Riwayat penampakan"
                meta={`${new Set(v.sightings.map((s) => s.cam)).size} kamera · ${v.dwellMinutes} menit di dalam kawasan`}
              />
              <div className="min-h-0 flex-1 overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Waktu</th>
                      <th className="px-3 py-2.5 font-normal">Kamera</th>
                      <th className="px-3 py-2.5 font-normal">Kejadian</th>
                      <th className="px-3 py-2.5 font-normal">Keyakinan</th>
                      <th className="px-5 py-2.5 font-normal">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {v.sightings.map((s, i) => {
                      const c = cameras.find((x) => x.name === s.cam) ?? cameras[0]
                      return (
                        <tr key={i} className="align-middle transition-colors hover:bg-raised/30">
                          <td className="px-5 py-3 font-mono text-[13px] tabular-nums text-paper">{s.time}</td>
                          <td className="px-3 py-3 text-[13px] text-dim">
                            <span className="flex items-center gap-2">
                              <Dot tone={KIND_TONE[s.kind]} />
                              {s.cam} · {s.zone}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[13px] text-paper">{s.event}</td>
                          <td className="px-3 py-3">
                            {s.confidence == null ? (
                              <span className="font-mono text-[12px] text-warn">—</span>
                            ) : (
                              <Badge tone={s.confidence >= 95 ? 'ok' : 'warn'} mono>
                                {s.confidence}%
                              </Badge>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <CameraFeed
                              camera={c}
                              compact
                              live={false}
                              time={s.time}
                              className="h-14 w-24 rounded-md border border-line"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
                <Button variant="primary" size="sm">
                  <Download className="size-3.5" />
                  Ekspor bukti
                </Button>
                <Button size="sm">
                  <Plus className="size-3.5" />
                  Buat insiden
                </Button>
                <Link
                  to={`/app/kendaraan/${encodeURIComponent(v.plate)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-ice transition-colors hover:text-paper"
                >
                  Lihat detail perjalanan
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <span className="ml-auto text-[12px] text-faint">
                  {v.status === 'left' ? 'Perjalanan sudah ditutup' : 'Perjalanan masih berjalan — belum tercatat keluar'}
                </span>
              </div>
            </Panel>
          )}
        </div>

        {v && (
          <Panel className="h-fit overflow-hidden p-0">
            <PanelHead title="Kendaraan" />
            <div className="px-5 pt-5">
              <div className="font-mono text-[26px] leading-none tracking-[0.05em] text-paper">{v.plate}</div>
              <div className="mt-2 text-[13px] text-dim">
                {v.type} · sumbu {v.axles} · {v.color.toLowerCase()}
              </div>
              <div className="mt-3">
                <Badge tone={STATUS[v.status].tone}>{STATUS[v.status].label}</Badge>
              </div>
            </div>
            <div className="p-5">
              <CameraFeed camera={cam} className="aspect-video rounded-lg border border-line" />
            </div>
            <div className="px-5 pb-5">
              <Field label="Tenant tujuan">{v.tenant}</Field>
              <Field label="Pertama terlihat">{v.enteredAt}</Field>
              <Field label="Terakhir terlihat">{v.sightings[v.sightings.length - 1].time}</Field>
              <Field label="Kamera menangkap">{new Set(v.sightings.map((s) => s.cam)).size}</Field>
              <Field label="Arah masuk">{v.gateIn}</Field>
              <Field label="Zona berhenti">{v.zone}</Field>
              <Field label="Batas zona">45 menit</Field>
              <Field label="Snapshot tersimpan">{v.snapshots}</Field>
            </div>
          </Panel>
        )}
      </Page>
    </>
  )
}
