import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, Plus, ArrowUpRight } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Badge, Button, Field, Dot } from '../../components/ui'
import { vehicles, cameraFor, cameras, zoneName } from '../../lib/data'
import { frames } from '../../lib/frames'
import { cn } from '../../lib/cn'

const METHOD = {
  plate: { label: 'plat', tone: 'ok' as const },
  fusion: { label: 'plat + re-id', tone: 'scan' as const },
  reid: { label: 're-id', tone: 'warn' as const },
}

const ago = (s: number) => (s < 60 ? `${s} dtk lalu` : `${Math.round(s / 60)} mnt lalu`)

export default function VehiclesPage() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string>(vehicles[0].plate)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, '')
    if (!needle) return vehicles
    return vehicles.filter((v) =>
      [v.plate, v.id, v.make, v.type, v.color, v.tenant]
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(needle),
    )
  }, [q])

  const v = vehicles.find((x) => x.plate === selected) ?? results[0]

  return (
    <>
      <TopBar title="Kendaraan">
        <label className="relative flex min-w-[240px] flex-1 items-center sm:max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 size-4 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari plat, ID kendaraan, merek, atau tenant"
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
                  Coba potongan platnya saja, misalnya <span className="font-mono text-paper">1473</span>. Plat yang
                  hanya terbaca sebagian tetap tersimpan dan bisa dicari.
                </p>
                <Button className="mt-5" onClick={() => setQ('')}>
                  Bersihkan pencarian
                </Button>
              </div>
            ) : (
              <div className="max-h-[36vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-panel">
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Plat</th>
                      <th className="px-3 py-2.5 font-normal">ID</th>
                      <th className="hidden px-3 py-2.5 font-normal sm:table-cell">Kendaraan</th>
                      <th className="px-3 py-2.5 font-normal">Zona sekarang</th>
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
                        <td className="px-3 py-2.5 font-mono text-[12px] text-faint">{r.id}</td>
                        <td className="hidden px-3 py-2.5 text-[13px] text-dim sm:table-cell">
                          {r.make} · {r.color.toLowerCase()}
                        </td>
                        <td className="px-3 py-2.5 text-[13px] text-dim">{zoneName(r.zoneId)}</td>
                        <td className="px-5 py-2.5">
                          {r.status === 'INSIDE' ? (
                            <Badge tone={r.flag === 'overstay' ? 'warn' : 'azure'}>
                              {r.flag === 'overstay' ? 'Melebihi batas' : 'Di dalam'}
                            </Badge>
                          ) : (
                            <Badge tone="ok">Sudah keluar</Badge>
                          )}
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
                meta={`${new Set(v.hops.map((h) => h.cam)).size} kamera · ${v.dwellMinutes} menit di dalam kawasan`}
              />
              <div className="min-h-0 flex-1 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Waktu</th>
                      <th className="px-3 py-2.5 font-normal">Kamera / zona</th>
                      <th className="px-3 py-2.5 font-normal">Kejadian</th>
                      <th className="px-3 py-2.5 font-normal">Identitas dari</th>
                      <th className="px-5 py-2.5 font-normal">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {v.hops.map((h, i) => {
                      const c = cameraFor(h.cam) ?? cameras[0]
                      const m = METHOD[h.by]
                      return (
                        <tr key={i} className="align-middle transition-colors hover:bg-raised/30">
                          <td className="px-5 py-3 font-mono text-[13px] tabular-nums text-paper">{h.time}</td>
                          <td className="px-3 py-3 text-[13px] text-dim">
                            <span className="flex items-center gap-2">
                              <Dot tone={m.tone} />
                              {h.cam} · {zoneName(h.zoneId)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[13px] text-paper">{h.event}</td>
                          <td className="px-3 py-3">
                            <span className="flex flex-col gap-0.5">
                              <Badge tone={m.tone} mono>
                                {m.label} {h.confidence}%
                              </Badge>
                              <span className="font-mono text-[10px] text-faint">
                                {h.plateConf != null ? `ocr ${h.plateConf}%` : 'ocr —'}
                                {h.reidSim != null ? ` · sim ${h.reidSim}` : ''}
                              </span>
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <CameraFeed
                              camera={{ ...c, frame: h.frame }}
                              compact
                              live={false}
                              boxes={false}
                              time={h.time}
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
                  Lihat perjalanan lengkap
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <span className="ml-auto text-[12px] text-faint">
                  {v.status === 'OUTSIDE' ? 'Perjalanan sudah ditutup' : 'Masih berjalan — belum tercatat keluar'}
                </span>
              </div>
            </Panel>
          )}
        </div>

        {v && (
          <Panel className="h-fit overflow-hidden p-0">
            <PanelHead title="Identitas kendaraan" meta={v.id} />
            <div className="px-5 pt-5">
              <div className="font-mono text-[26px] leading-none tracking-[0.05em] text-paper">{v.plate}</div>
              <div className="mt-2 text-[13px] text-dim">
                {v.make} · {v.type} · {v.color.toLowerCase()}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {v.status === 'INSIDE' ? (
                  <Badge tone="ok">● DI DALAM KAWASAN</Badge>
                ) : (
                  <Badge tone="neutral">SUDAH KELUAR</Badge>
                )}
                <Badge tone="neutral" mono>
                  emb {v.embedding}
                </Badge>
              </div>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-lg border border-line">
                <img src={frames[v.frame].crop} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              </div>
              <p className="mt-2 text-[11px] text-faint">Crop plat dari penampakan pertama di gerbang</p>
            </div>

            <div className="px-5 pb-5">
              <Field label="Zona sekarang">{zoneName(v.zoneId)}</Field>
              <Field label="Kamera terakhir">{v.cam}</Field>
              <Field label="Terakhir terlihat">
                {v.lastSeen} · {ago(v.ago)}
              </Field>
              <Field label="Masuk">{v.enteredAt}</Field>
              <Field label="Keluar">{v.exitedAt ?? '—'}</Field>
              <Field label="Kamera menangkap">{new Set(v.hops.map((h) => h.cam)).size}</Field>
              <Field label="Tenant tujuan">{v.tenant}</Field>
              <Field label="Snapshot tersimpan">{v.snapshots}</Field>
            </div>

            <div className="border-t border-line px-5 py-4">
              <Link
                to="/app/identitas"
                className="inline-flex items-center gap-1.5 text-[13px] text-ice transition-colors hover:text-paper"
              >
                Cara identitas ini disambung
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </Panel>
        )}
      </Page>
    </>
  )
}
