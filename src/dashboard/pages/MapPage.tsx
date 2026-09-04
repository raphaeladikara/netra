import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { SiteMap, type MapView } from '../../components/site/SiteMap'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Segmented, Badge, Dot, Toggle } from '../../components/ui'
import { ESTATE, insideNow, vehicles, cameras, cameraFor, vehicleByPlate, zoneName, zoneOccupancy } from '../../lib/data'
import { cn } from '../../lib/cn'

const FLAG_LABEL = {
  normal: 'Normal',
  overstay: 'Melebihi batas berhenti',
  unverified: 'Belum terverifikasi',
} as const

const ago = (s: number) => (s < 60 ? `${s} dtk lalu` : `${Math.round(s / 60)} mnt lalu`)

export default function MapPage() {
  const [filter, setFilter] = useState<'all' | 'truck' | 'overstay'>('all')
  const [selected, setSelected] = useState<string | null>(insideNow[0].plate)
  const [view, setView] = useState<MapView>('iso')
  const [cones, setCones] = useState(false)
  const [plates, setPlates] = useState(false)
  const v = selected ? vehicleByPlate(selected) : undefined
  const cam = v ? cameraFor(v.cam) ?? cameras[0] : cameras[0]

  const counts = {
    normal: insideNow.filter((x) => x.flag === 'normal').length,
    overstay: insideNow.filter((x) => x.flag === 'overstay').length,
    unverified: insideNow.filter((x) => x.flag === 'unverified').length,
  }

  return (
    <>
      <TopBar title="Peta kawasan">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Semua kendaraan' },
            { value: 'truck', label: 'Truk' },
            { value: 'overstay', label: 'Melebihi batas' },
          ]}
        />
      </TopBar>

      <Page className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="flex min-w-0 flex-col overflow-hidden p-0">
            <PanelHead title="Denah kawasan" meta={ESTATE.phase}>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Segmented
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'iso', label: 'Isometrik' },
                    { value: 'plan', label: 'Denah' },
                  ]}
                />
                <Toggle on={cones} onClick={() => setCones((x) => !x)}>
                  Cakupan kamera
                </Toggle>
                <Toggle on={plates} onClick={() => setPlates((x) => !x)}>
                  Semua plat
                </Toggle>
              </div>
            </PanelHead>

            <div className="min-h-0 flex-1 bg-ink/40 p-3">
              <SiteMap
                selected={selected}
                onSelect={setSelected}
                filter={filter}
                view={view}
                showCones={cones}
                showPlates={plates}
                className={cn('w-full max-h-[60vh]', view === 'iso' ? 'aspect-[1440/960]' : 'aspect-[1000/620]')}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-[12px] text-dim">
              <span className="flex items-center gap-2">
                <Dot tone="azure" /> Normal
              </span>
              <span className="flex items-center gap-2">
                <Dot tone="warn" /> Melebihi batas
              </span>
              <span className="flex items-center gap-2">
                <Dot tone="neutral" /> Belum terverifikasi
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-3.5 rounded-[2px] bg-dim" /> Truk
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full border-2 border-ok" /> Kamera gerbang
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full border-2 border-scan" /> Kamera internal
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-px w-4 border-t-2 border-dashed border-scan" /> Rute lintas kamera
              </span>
              <span className="ml-auto text-faint">Arahkan kursor ke kamera untuk melihat cakupannya</span>
            </div>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Isi per zona" meta="kendaraan yang tercatat masih di dalam" />
            <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
              {zoneOccupancy.map(({ zone, count }) => (
                <li key={zone.id} className="flex items-baseline gap-3 bg-panel px-5 py-3">
                  <span className="text-[13px] text-paper">{zone.name}</span>
                  <span className="ml-auto font-mono text-[15px] tabular-nums text-ice">{count}</span>
                  {zone.capacity && <span className="font-mono text-[11px] text-faint">/ {zone.capacity}</span>}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Kendaraan di dalam kawasan</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-[44px] font-bold leading-none tracking-[-0.04em] tabular-nums text-paper">
                {insideNow.length}
              </span>
              <span className="text-[13px] text-dim">dari {cameras.length} titik kamera aktif</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge tone="azure">{counts.normal} normal</Badge>
              <Badge tone="warn">{counts.overstay} melebihi batas</Badge>
              <Badge tone="neutral">{counts.unverified} belum terverifikasi</Badge>
            </div>
          </Panel>

          {v && (
            <Panel className="overflow-hidden p-0">
              <PanelHead title="Kendaraan dipilih" meta={v.cam} />
              <CameraFeed camera={cam} className="aspect-video" />
              <div className="px-5 py-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[19px] tracking-[0.04em] text-paper">{v.plate}</span>
                  <span className="font-mono text-[11px] text-faint">{v.id}</span>
                </div>
                <div className="mt-1 text-[12px] text-dim">
                  {v.make} · {v.color.toLowerCase()} · {v.type}
                </div>

                <dl className="mt-4 space-y-2 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Status</dt>
                    <dd className="flex items-center gap-1.5 text-ok">
                      <Dot tone="ok" /> DI DALAM KAWASAN
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Zona sekarang</dt>
                    <dd className="text-paper">{zoneName(v.zoneId)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Kamera terakhir</dt>
                    <dd className="font-mono text-paper">{v.cam}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Terakhir terlihat</dt>
                    <dd className="font-mono text-paper">
                      {v.lastSeen} <span className="text-faint">· {ago(v.ago)}</span>
                    </dd>
                  </div>
                </dl>

                {v.flag !== 'normal' && (
                  <div className="mt-3">
                    <Badge tone={v.flag === 'overstay' ? 'warn' : 'neutral'}>{FLAG_LABEL[v.flag]}</Badge>
                  </div>
                )}

                <Link
                  to={`/app/kendaraan/${encodeURIComponent(v.plate)}`}
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-azure text-[13px] font-medium text-white transition-colors hover:bg-azure-hi"
                >
                  Buka perjalanan lengkap
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </Panel>
          )}

          <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
            <PanelHead title="Kendaraan aktif" meta="urut waktu masuk" />
            <ul className="min-h-0 flex-1 divide-y divide-line/70 overflow-y-auto">
              {[...insideNow]
                .sort((a, b) => a.enteredAt.localeCompare(b.enteredAt))
                .map((x) => (
                  <li key={x.plate}>
                    <button
                      onClick={() => setSelected(x.plate)}
                      className={cn(
                        'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors',
                        selected === x.plate ? 'bg-azure/12' : 'hover:bg-raised/40',
                      )}
                    >
                      <Dot tone={x.flag === 'overstay' ? 'warn' : x.flag === 'unverified' ? 'neutral' : 'azure'} />
                      <span className="min-w-0">
                        <span className="block font-mono text-[13px] tracking-tight text-paper">{x.plate}</span>
                        <span className="block text-[11px] text-faint">{x.make}</span>
                      </span>
                      <span className="ml-auto shrink-0 text-right">
                        <span className="block font-mono text-[12px] tabular-nums text-dim">{x.lastSeen}</span>
                        <span className="block text-[11px] text-faint">{zoneName(x.zoneId)}</span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
            <p className="border-t border-line px-5 py-3 text-[11px] leading-relaxed text-faint">
              Kendaraan tercatat masuk tetapi belum tercatat keluar dihitung masih berada di dalam kawasan. Total
              tercatat hari ini {vehicles.length} kendaraan.
            </p>
          </Panel>
        </div>
      </Page>
    </>
  )
}
