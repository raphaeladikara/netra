import { useParams } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { SiteMap } from '../../components/site/SiteMap'
import { Panel, PanelHead, Badge, Button, Field, Dot } from '../../components/ui'
import { vehicleByPlate, cameras } from '../../lib/data'

const KIND_TONE = {
  enter: 'azure',
  pass: 'azure',
  stop: 'scan',
  flag: 'warn',
  exit: 'ok',
} as const

export default function JourneyPage() {
  const { plate = '' } = useParams()
  const v = vehicleByPlate(plate)

  if (!v) {
    return (
      <>
        <TopBar title="Detail perjalanan" back={{ to: '/app/kendaraan', label: 'Kendaraan' }} />
        <Page>
          <Panel className="px-6 py-16 text-center">
            <p className="text-[15px] text-paper">Plat {decodeURIComponent(plate)} tidak ditemukan.</p>
            <p className="mx-auto mt-2 max-w-[48ch] text-[13px] text-dim">
              Kendaraan ini mungkin di luar rentang retensi metadata (90 hari), atau platnya tercatat berbeda.
            </p>
          </Panel>
        </Page>
      </>
    )
  }

  const longestStop = v.status === 'overstay' ? 47 : 18

  return (
    <>
      <TopBar title="Detail perjalanan" back={{ to: '/app/kendaraan', label: 'Kendaraan' }} />

      <Page className="flex flex-col gap-4">
        <Panel className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
          <span className="font-mono text-[28px] leading-none tracking-[0.05em] text-paper">{v.plate}</span>
          {v.status === 'overstay' && <Badge tone="warn">Melebihi batas berhenti</Badge>}
          {v.status === 'unverified' && <Badge tone="neutral">Belum terverifikasi</Badge>}
          {v.status === 'left' && <Badge tone="ok">Perjalanan ditutup</Badge>}
          <span className="text-[13px] text-dim">
            {v.type} · masuk {v.enteredAt} lewat {v.gateIn}
          </span>
          <div className="ml-auto flex gap-2">
            <Button size="sm">
              <Download className="size-3.5" />
              Ekspor bukti
            </Button>
            <Button size="sm" variant="primary">
              <Plus className="size-3.5" />
              Buat insiden
            </Button>
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <Panel className="min-w-0 overflow-hidden p-0">
            <PanelHead
              title="Rangkaian penampakan"
              meta={`${v.sightings.length} kejadian · ${new Set(v.sightings.map((s) => s.cam)).size} kamera`}
            />
            <ol className="px-5 py-2">
              {v.sightings.map((s, i) => {
                const c = cameras.find((x) => x.name === s.cam) ?? cameras[0]
                const last = i === v.sightings.length - 1
                return (
                  <li key={i} className="relative flex gap-4 py-4">
                    {!last && <span className="absolute left-[70px] top-11 bottom-0 w-px bg-line" />}
                    <span className="w-12 shrink-0 pt-1 font-mono text-[13px] tabular-nums text-paper">{s.time}</span>
                    <span className="relative z-10 mt-1.5 shrink-0">
                      <Dot tone={KIND_TONE[s.kind]} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-paper">{s.event}</div>
                      <div className="mt-0.5 text-[12px] text-dim">
                        {s.zone} · {s.cam}
                        {s.confidence != null && <span className="ml-2 font-mono text-faint">keyakinan {s.confidence}%</span>}
                      </div>
                    </div>
                    <CameraFeed
                      camera={c}
                      compact
                      live={false}
                      time={s.time}
                      className="h-16 w-28 shrink-0 rounded-md border border-line"
                    />
                  </li>
                )
              })}
            </ol>
            <p className="border-t border-line px-5 py-3.5 text-[12px] leading-relaxed text-faint">
              Setiap penampakan disimpan bersama snapshot buktinya. Retensi metadata 90 hari, snapshot 14 hari.
            </p>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel className="overflow-hidden p-0">
              <PanelHead title="Rute perjalanan" meta={`${v.enteredAt} → ${v.sightings[v.sightings.length - 1].time}`} />
              <div className="bg-ink/40 p-3">
                <SiteMap selected={v.plate} compact showRoute className="aspect-[1000/620]" />
              </div>
            </Panel>

            <Panel className="px-5 py-2">
              <Field label="Total di dalam kawasan">
                {v.dwellMinutes >= 60
                  ? `${Math.floor(v.dwellMinutes / 60)} jam ${v.dwellMinutes % 60} menit`
                  : `${v.dwellMinutes} menit`}
              </Field>
              <Field label="Berhenti terlama">
                <span className={v.status === 'overstay' ? 'text-warn' : undefined}>{longestStop} menit</span>
              </Field>
              <Field label="Zona berhenti">{v.zone}</Field>
              <Field label="Masuk / keluar">
                {v.gateIn.replace('Gerbang ', '')} / {v.gateOut ? v.gateOut.replace('Gerbang ', '') : '—'}
              </Field>
              <Field label="Bukti tersimpan">{v.snapshots} snapshot</Field>
              <Field label="Tenant tujuan">{v.tenant}</Field>
            </Panel>
          </div>
        </div>
      </Page>
    </>
  )
}
