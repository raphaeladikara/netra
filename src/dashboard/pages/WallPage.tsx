import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Scissors, Download } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Segmented, Button, Badge } from '../../components/ui'
import { cameras, fromMin } from '../../lib/data'
import { seeded, between } from '../../lib/rng'
import { cn } from '../../lib/cn'

const LAYOUTS = { '4': 'grid-cols-2', '9': 'grid-cols-3', '16': 'grid-cols-4' } as const
type LayoutKey = keyof typeof LAYOUTS

/** Recorded coverage for the scrub bar: one entry per 5 minutes of the day. */
function coverage(camId: string) {
  const r = seeded(`cov-${camId}`)
  return Array.from({ length: 288 }, (_, i) => {
    const gap = camId === 'CAM-06' && i > 74 && i < 82
    return gap ? 0 : between(r, 0.82, 1)
  })
}

const EVENTS = [
  { at: 7 * 60 + 42, label: 'B 1234 XYZ masuk', tone: 'bg-scan' },
  { at: 7 * 60 + 53, label: 'Berhenti dimulai', tone: 'bg-scan' },
  { at: 8 * 60 + 38, label: 'Melebihi batas berhenti', tone: 'bg-warn' },
  { at: 6 * 60 + 12, label: 'Kamera putus', tone: 'bg-alarm' },
  { at: 9 * 60 + 2, label: 'Petugas menerima tugas', tone: 'bg-azure' },
]

export default function WallPage() {
  const [layout, setLayout] = useState<LayoutKey>('9')
  const [mode, setMode] = useState<'live' | 'playback'>('live')
  const [playing, setPlaying] = useState(true)
  const [at, setAt] = useState(8 * 60 + 38)
  const [focus, setFocus] = useState(cameras[5].id)

  const count = Number(layout)
  const shown = cameras.slice(0, count)
  const cam = cameras.find((c) => c.id === focus) ?? cameras[0]
  const cov = coverage(cam.id)

  return (
    <>
      <TopBar title="Dinding kamera">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'live', label: 'Live' },
            { value: 'playback', label: 'Putar ulang' },
          ]}
        />
        <Segmented
          value={layout}
          onChange={setLayout}
          options={[
            { value: '4', label: '2×2' },
            { value: '9', label: '3×3' },
            { value: '16', label: '4×4' },
          ]}
        />
      </TopBar>

      <Page className="flex flex-col gap-4">
        <div className={cn('grid gap-2', LAYOUTS[layout])}>
          {shown.map((c) => (
            <button
              key={c.id}
              onClick={() => setFocus(c.id)}
              className={cn(
                'group relative overflow-hidden rounded-xl border transition-all duration-200',
                focus === c.id ? 'border-azure ring-1 ring-azure/40' : 'border-line hover:border-line-2',
              )}
            >
              <CameraFeed
                camera={c}
                compact={count > 9}
                live={mode === 'live' && playing && focus === c.id}
                time={mode === 'live' ? '09:31:04' : `${fromMin(at)}:12`}
                className="aspect-video"
              />
            </button>
          ))}
        </div>

        <Panel className="overflow-hidden p-0">
          <PanelHead title={`Garis waktu · ${cam.name}`} meta={`${cam.zone} · ${cam.resolution} · ${cam.fps} fps`}>
            <div className="ml-auto flex items-center gap-2">
              <Badge tone={mode === 'live' ? 'ok' : 'azure'} mono>
                {mode === 'live' ? 'LIVE' : fromMin(at)}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => setAt((v) => Math.max(0, v - 15))} aria-label="Mundur 15 menit">
                <SkipBack className="size-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPlaying((v) => !v)} aria-label={playing ? 'Jeda' : 'Putar'}>
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAt((v) => Math.min(1439, v + 15))} aria-label="Maju 15 menit">
                <SkipForward className="size-4" />
              </Button>
            </div>
          </PanelHead>

          <div className="px-5 py-5">
            <div className="relative h-14 overflow-hidden rounded-lg border border-line bg-ink-2">
              {/* recorded coverage */}
              <div className="absolute inset-x-0 top-0 flex h-8 items-end gap-px px-px">
                {cov.map((v, i) => (
                  <span
                    key={i}
                    className={cn('flex-1 rounded-[1px]', v === 0 ? 'bg-alarm/45' : 'bg-azure/35')}
                    style={{ height: `${v === 0 ? 100 : v * 100}%` }}
                  />
                ))}
              </div>

              {/* events */}
              {EVENTS.map((e, i) => (
                <span
                  key={i}
                  title={`${fromMin(e.at)} — ${e.label}`}
                  className={cn('absolute top-0 h-8 w-[3px] rounded-full', e.tone)}
                  style={{ left: `${(e.at / 1440) * 100}%` }}
                />
              ))}

              {/* playhead */}
              <span
                className="pointer-events-none absolute inset-y-0 z-10 w-[2px] bg-paper"
                style={{ left: `${(at / 1440) * 100}%` }}
              >
                <span className="absolute -left-[3px] top-0 size-2 rounded-full bg-paper" />
              </span>

              <div className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-between border-t border-line bg-ink/60 px-2 font-mono text-[9px] text-faint">
                {['00', '04', '08', '12', '16', '20', '24'].map((h) => (
                  <span key={h}>{h}:00</span>
                ))}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={1439}
              value={at}
              onChange={(e) => setAt(Number(e.target.value))}
              aria-label="Geser waktu pemutaran"
              className="mt-3 w-full"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-4 font-mono text-[11px] text-dim">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-[2px] bg-azure/50" /> terekam
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-[2px] bg-alarm/60" /> jeda perekaman
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-[2px] bg-warn" /> peringatan
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm">
                  <Scissors className="size-3.5" />
                  Potong klip
                </Button>
                <Button size="sm" variant="primary">
                  <Download className="size-3.5" />
                  Ekspor bukti
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </Page>
    </>
  )
}
