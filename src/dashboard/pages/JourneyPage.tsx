import { useParams } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { SiteMap } from '../../components/site/SiteMap'
import { PlateExtraction } from '../../components/anpr/PlateExtraction'
import { ReidGallery, TopologyGraph } from '../../components/reid/Reid'
import { Panel, PanelHead, Badge, Button, Field, Dot } from '../../components/ui'
import { vehicleByPlate, cameraFor, cameras, zoneName } from '../../lib/data'

const METHOD = {
  plate: { label: 'Plat terbaca', tone: 'ok' as const },
  fusion: { label: 'Plat + Re-ID', tone: 'scan' as const },
  reid: { label: 'Re-ID saja', tone: 'warn' as const },
}

export default function JourneyPage() {
  const { plate = '' } = useParams()
  const v = vehicleByPlate(plate)

  if (!v) {
    return (
      <>
        <TopBar title="Perjalanan kendaraan" back={{ to: '/app/kendaraan', label: 'Kendaraan' }} />
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

  const path = v.hops.map((h) => cameraFor(h.cam)?.id).filter((x): x is string => Boolean(x))
  const uniquePath = path.filter((c, i) => i === 0 || c !== path[i - 1])
  const reidHops = v.hops.filter((h) => h.by !== 'plate').length

  return (
    <>
      <TopBar title="Perjalanan kendaraan" back={{ to: '/app/kendaraan', label: 'Kendaraan' }} />

      <Page className="flex flex-col gap-4">
        <Panel className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
          <span className="font-mono text-[28px] leading-none tracking-[0.05em] text-paper">{v.plate}</span>
          <span className="rounded-md border border-line-2 bg-raised/50 px-2 py-1 font-mono text-[12px] text-dim">
            {v.id}
          </span>
          {v.status === 'INSIDE' ? <Badge tone="ok">● DI DALAM KAWASAN</Badge> : <Badge tone="neutral">SUDAH KELUAR</Badge>}
          {v.flag === 'overstay' && <Badge tone="warn">Melebihi batas berhenti</Badge>}
          {v.flag === 'unverified' && <Badge tone="neutral">Belum terverifikasi</Badge>}
          <span className="text-[13px] text-dim">
            {v.make} · {v.color.toLowerCase()} · masuk {v.enteredAt} lewat {v.gateIn}
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
              meta={`${v.hops.length} kejadian · ${new Set(v.hops.map((h) => h.cam)).size} kamera · ${reidHops} disambung Re-ID`}
            />
            <ol className="px-5 py-2">
              {v.hops.map((h, i) => {
                const c = cameraFor(h.cam) ?? cameras[0]
                const last = i === v.hops.length - 1
                const m = METHOD[h.by]
                return (
                  <li key={i} className="relative flex gap-4 py-4">
                    {!last && <span className="absolute left-[70px] top-12 bottom-0 w-px bg-line" />}
                    <span className="w-12 shrink-0 pt-1 font-mono text-[13px] tabular-nums text-paper">{h.time}</span>
                    <span className="relative z-10 mt-1.5 shrink-0">
                      <Dot tone={m.tone} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-paper">{h.event}</div>
                      <div className="mt-0.5 text-[12px] text-dim">
                        {zoneName(h.zoneId)} · {h.cam}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone={m.tone} mono>
                          {m.label} {h.confidence}%
                        </Badge>
                        {h.plateConf != null && (
                          <span className="font-mono text-[11px] text-faint">OCR {h.plateConf}%</span>
                        )}
                        {h.reidSim != null && (
                          <span className="font-mono text-[11px] text-faint">embedding {h.reidSim}</span>
                        )}
                      </div>
                    </div>
                    <CameraFeed
                      camera={{ ...c, frame: h.frame }}
                      compact
                      live={false}
                      boxes={false}
                      time={h.time}
                      className="h-16 w-28 shrink-0 rounded-md border border-line"
                    />
                  </li>
                )
              })}
            </ol>
            <p className="border-t border-line px-5 py-3.5 text-[12px] leading-relaxed text-faint">
              Penampakan yang platnya tidak terbaca tetap masuk perjalanan ini karena embedding Re-ID-nya cocok dan
              transisi kameranya masuk akal. Retensi metadata 90 hari, snapshot 14 hari.
            </p>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel className="overflow-hidden p-0">
              <PanelHead title="Rute di denah" meta={`${v.enteredAt} → ${v.lastSeen}`} />
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
              <Field label="Zona sekarang">{zoneName(v.zoneId)}</Field>
              <Field label="Kamera terakhir">{v.cam}</Field>
              <Field label="Masuk / keluar">
                {v.gateIn.replace('Gerbang ', '')} / {v.gateOut ? v.gateOut.replace('Gerbang ', '') : '—'}
              </Field>
              <Field label="Embedding Re-ID">{v.embedding}</Field>
              <Field label="Tenant tujuan">{v.tenant}</Field>
            </Panel>
          </div>
        </div>

        <Panel className="overflow-hidden p-0">
          <PanelHead title="Pembacaan plat di gerbang" meta="ANPR pada frame masuk" />
          <div className="px-5 py-5">
            <PlateExtraction frameId={v.frame} />
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Kendaraan yang sama di setiap kamera" meta="galeri Re-ID" />
            <div className="px-5 py-5">
              <ReidGallery vehicle={v} />
            </div>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Jalur di topologi kamera" meta={`${uniquePath.length} simpul`} />
            <div className="bg-ink/40 p-3">
              <TopologyGraph path={uniquePath} className="aspect-[1000/620]" />
            </div>
          </Panel>
        </div>
      </Page>
    </>
  )
}
