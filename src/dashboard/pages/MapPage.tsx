import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { SiteMap } from '../../components/site/SiteMap'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Segmented, Badge, Dot } from '../../components/ui'
import { ESTATE, insideNow, vehicles, cameras, vehicleByPlate } from '../../lib/data'
import { cn } from '../../lib/cn'

const STATUS_LABEL = {
  normal: 'Normal',
  overstay: 'Melebihi batas berhenti',
  unverified: 'Belum terverifikasi',
  left: 'Sudah keluar',
} as const

export default function MapPage() {
  const [filter, setFilter] = useState<'all' | 'truck' | 'overstay'>('all')
  const [selected, setSelected] = useState<string | null>('B 1234 XYZ')
  const v = selected ? vehicleByPlate(selected) : undefined
  const cam = v ? cameras.find((c) => c.name === v.cam) ?? cameras[0] : cameras[0]

  const counts = {
    normal: insideNow.filter((x) => x.status === 'normal').length,
    overstay: insideNow.filter((x) => x.status === 'overstay').length,
    unverified: insideNow.filter((x) => x.status === 'unverified').length,
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
        <Panel className="flex min-w-0 flex-col overflow-hidden p-0">
          <PanelHead title="Denah kawasan" meta={ESTATE.phase}>
            <span className="ml-auto rounded-md border border-azure/35 bg-azure/12 px-2 py-1 text-[11px] text-ice">
              {selected ? '1 kendaraan dipilih' : 'Tidak ada yang dipilih'}
            </span>
          </PanelHead>

          <div className="min-h-0 flex-1 bg-ink/40 p-3">
            <SiteMap selected={selected} onSelect={setSelected} filter={filter} className="aspect-[1000/620] max-h-[62vh] w-full" />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-[12px] text-dim">
            <span className="flex items-center gap-2">
              <Dot tone="azure" /> Normal
            </span>
            <span className="flex items-center gap-2">
              <Dot tone="warn" /> Melebihi batas berhenti
            </span>
            <span className="flex items-center gap-2">
              <Dot tone="neutral" /> Belum terverifikasi
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full border-2 border-scan" /> Titik kamera
            </span>
          </div>
        </Panel>

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
                <div className="font-mono text-[19px] tracking-[0.04em] text-paper">{v.plate}</div>
                <div className="mt-1 text-[12px] text-dim">
                  {v.type} · {v.tenant}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone={v.status === 'overstay' ? 'warn' : v.status === 'unverified' ? 'neutral' : 'azure'}>
                    {STATUS_LABEL[v.status]}
                  </Badge>
                  <span className="font-mono text-[11px] text-faint">
                    masuk {v.enteredAt} · {v.dwellMinutes} menit
                  </span>
                </div>
                <Link
                  to={`/app/kendaraan/${encodeURIComponent(v.plate)}`}
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-azure text-[13px] font-medium text-white transition-colors hover:bg-azure-hi"
                >
                  Buka detail perjalanan
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
                      <Dot tone={x.status === 'overstay' ? 'warn' : x.status === 'unverified' ? 'neutral' : 'azure'} />
                      <span className="font-mono text-[13px] tracking-tight text-paper">{x.plate}</span>
                      <span className="ml-auto shrink-0 text-right">
                        <span className="block font-mono text-[12px] tabular-nums text-dim">{x.enteredAt}</span>
                        <span className="block text-[11px] text-faint">
                          {x.zone} · {x.cam}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
            <p className="border-t border-line px-5 py-3 text-[11px] leading-relaxed text-faint">
              Kendaraan yang tercatat masuk tetapi belum tercatat keluar dihitung masih berada di dalam kawasan.
              Total tercatat hari ini {vehicles.length} kendaraan.
            </p>
          </Panel>
        </div>
      </Page>
    </>
  )
}
