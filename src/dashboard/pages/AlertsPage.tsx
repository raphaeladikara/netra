import { useState } from 'react'
import { UserPlus, CheckCircle2, MapPin } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Segmented, Badge, Button, Stat, Field, Dot } from '../../components/ui'
import { alerts, cameras, closedToday } from '../../lib/data'
import { cn } from '../../lib/cn'

const SEV: Record<string, 'alarm' | 'warn' | 'neutral'> = { high: 'alarm', medium: 'warn', low: 'neutral' }

export default function AlertsPage() {
  const [tab, setTab] = useState<'all' | 'unassigned' | 'working'>('all')
  const [open, setOpen] = useState<string | null>('ALR-4471')

  const rows = alerts.filter((a) => (tab === 'all' ? true : a.state === tab))
  const active = alerts.find((a) => a.id === open)
  const cam = active ? cameras.find((c) => c.name === active.cam) ?? cameras[0] : cameras[0]

  const unassigned = alerts.filter((a) => a.state === 'unassigned').length
  const working = alerts.filter((a) => a.state === 'working').length

  return (
    <>
      <TopBar title="Peringatan">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'unassigned', label: 'Belum ditugaskan' },
            { value: 'working', label: 'Sedang ditangani' },
          ]}
        />
      </TopBar>

      <Page className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Peringatan terbuka" value={alerts.length} hint={`${unassigned} belum ditugaskan`} tone="warn" />
          <Stat label="Sedang ditangani" value={working} hint="oleh 3 petugas" tone="azure" />
          <Stat label="Selesai hari ini" value={closedToday} hint="sejak 06:00" tone="ok" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel className="min-w-0 overflow-hidden p-0">
            <PanelHead title="Peringatan belum ditutup" meta="urut waktu terbuka" />
            {rows.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <CheckCircle2 className="mx-auto size-7 text-ok" strokeWidth={1.5} />
                <p className="mt-4 text-[15px] text-paper">Tidak ada peringatan pada saringan ini.</p>
                <p className="mx-auto mt-2 max-w-[42ch] text-[13px] text-dim">
                  Semua yang masuk sudah ditugaskan atau ditutup. Antrean akan terisi lagi begitu ada deteksi baru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Jenis</th>
                      <th className="px-3 py-2.5 font-normal">Plat</th>
                      <th className="px-3 py-2.5 font-normal">Lokasi</th>
                      <th className="px-3 py-2.5 font-normal">Terbuka</th>
                      <th className="px-3 py-2.5 font-normal">Petugas</th>
                      <th className="px-5 py-2.5 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {rows.map((a) => (
                      <tr
                        key={a.id}
                        className={cn('transition-colors', open === a.id ? 'bg-azure/12' : 'hover:bg-raised/40')}
                      >
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2.5">
                            <Dot tone={SEV[a.severity]} pulse={a.severity === 'high'} />
                            <span className="text-[13px] text-paper">{a.kind}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[13px] tracking-tight text-dim">{a.plate ?? '—'}</td>
                        <td className="px-3 py-3 text-[13px] text-dim">
                          {a.zone} · {a.cam}
                        </td>
                        <td className="px-3 py-3 font-mono text-[12px] tabular-nums text-dim">{a.openedMinutes} menit</td>
                        <td className="px-3 py-3">
                          {a.assignee ? (
                            <Badge tone="azure">
                              {a.assignee} · {a.post}
                            </Badge>
                          ) : (
                            <Badge tone="neutral">Belum ditugaskan</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button size="sm" onClick={() => setOpen(a.id)}>
                            Tinjau
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {active && (
            <Panel className="h-fit overflow-hidden p-0">
              <PanelHead title="Tinjau peringatan" meta={active.id} />
              <CameraFeed camera={cam} className="aspect-video" />
              <div className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Dot tone={SEV[active.severity]} />
                  <span className="text-[15px] font-semibold text-paper">{active.kind}</span>
                </div>
                <div className="mt-3">
                  <Field label="Plat">{active.plate ?? '—'}</Field>
                  <Field label="Lokasi">{active.zone}</Field>
                  <Field label="Kamera">{active.cam}</Field>
                  <Field label="Terbuka">{active.openedMinutes} menit</Field>
                  <Field label="Petugas">{active.assignee ? `${active.assignee} · ${active.post}` : 'Belum ditugaskan'}</Field>
                </div>

                <div className="mt-5 grid gap-2">
                  <Button variant="primary">
                    <UserPlus className="size-4" />
                    {active.assignee ? 'Alihkan ke petugas lain' : 'Tugaskan ke petugas terdekat'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button>
                      <MapPin className="size-4" />
                      Lihat di peta
                    </Button>
                    <Button>
                      <CheckCircle2 className="size-4" />
                      Tutup
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-faint">
                  Menutup peringatan memerlukan alasan dan, untuk pelanggaran parkir, satu foto dari petugas. Semua
                  tindakan tercatat di jejak audit.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </Page>
    </>
  )
}
