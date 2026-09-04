import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, X } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { Panel, PanelHead, Badge, Stat, Dot } from '../../components/ui'
import { FusionBars, HandoffPair, TopologyGraph } from '../../components/reid/Reid'
import { PlateExtraction } from '../../components/anpr/PlateExtraction'
import {
  reidExample,
  cameras,
  cameraById,
  neighboursOf,
  idMethodMix,
  vehicles,
  zoneName,
} from '../../lib/data'
import { cn } from '../../lib/cn'

const PIPELINE = [
  { stage: 'Deteksi', model: 'YOLO11', out: 'kotak kendaraan per frame' },
  { stage: 'Tracking satu kamera', model: 'ByteTrack', out: 'track id yang stabil selama kendaraan terlihat' },
  { stage: 'Re-ID lintas kamera', model: 'OSNet 512-d', out: 'embedding untuk dicocokkan ke kamera lain' },
  { stage: 'Baca plat', model: 'YOLO + OCR', out: 'string plat dan keyakinannya' },
  { stage: 'Peleburan identitas', model: 'aturan berbobot', out: 'satu ID global per kendaraan' },
]

export default function IdentityPage() {
  const [cam, setCam] = useState<string>('CAM-03')
  const ex = reidExample
  const total = idMethodMix.reduce((a, b) => a + b.value, 0)
  const selected = cameraById(cam)
  const neighbours = neighboursOf(cam)

  return (
    <>
      <TopBar title="Identitas & Re-ID" />

      <Page className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Kendaraan dilacak hari ini" value={vehicles.length} hint={`${vehicles.filter((v) => v.status === 'INSIDE').length} masih di dalam`} />
          <Stat
            label="Penampakan disambung"
            value={total}
            hint={`${idMethodMix[2].value} tanpa plat sama sekali`}
            tone="azure"
          />
          <Stat label="Kamera dalam topologi" value={cameras.length} hint={`${neighboursOf('CAM-01').length} tetangga dari gerbang utara`} />
          <Stat label="Ambang gabung otomatis" value="92%" hint="di bawah itu, supervisor yang memutuskan" tone="warn" />
        </div>

        {/* the hand-off */}
        <Panel className="overflow-hidden p-0">
          <PanelHead
            title="Ketika plat tidak terbaca, identitas tetap nyambung"
            meta={`${ex.a.cam} → ${ex.b.cam} · ${ex.gapSeconds} detik`}
          />
          <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <HandoffPair a={ex.a} b={ex.b} gapSeconds={ex.gapSeconds} />
              <p className="mt-5 max-w-[60ch] text-[13px] leading-relaxed text-dim">
                Kedua frame ini kendaraan yang sama — mobil putih yang sama, dari dataset yang sama. Di kamera kedua ia
                terlihat dari jauh dan tertutup rombongan motor, jadi platnya tidak bisa dibaca andal. Kalau sistem cuma
                mengandalkan ANPR, perjalanannya terputus di sini. Re-ID membandingkan embedding penampilan kendaraan,
                lalu memeriksa apakah perpindahan kamera dan waktu tempuhnya masuk akal menurut denah.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="ok">
                  <Check className="size-3" /> Digabung ke {ex.vehicle.id}
                </Badge>
                <Badge tone="neutral" mono>
                  embedding {ex.vehicle.embedding}
                </Badge>
                <Link
                  to={`/app/kendaraan/${encodeURIComponent(ex.vehicle.plate)}`}
                  className="inline-flex items-center gap-1.5 text-[13px] text-ice transition-colors hover:text-paper"
                >
                  Lihat perjalanannya
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-ink-2/60 p-5">
              <h3 className="text-[13px] font-semibold text-paper">Sinyal yang dilebur</h3>
              <p className="mt-1 mb-5 text-[12px] text-faint">
                Tidak ada satu sinyal yang boleh memutuskan sendirian.
              </p>
              <FusionBars signals={ex.signals} verdict={ex.verdict} />
            </div>
          </div>
        </Panel>

        {/* how identity was resolved today */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Dari mana identitas berasal" meta="seluruh penampakan hari ini" />
            <div className="px-5 py-6">
              <div className="flex h-3 overflow-hidden rounded-full bg-raised">
                {idMethodMix.map((m, i) => (
                  <div
                    key={m.name}
                    className={cn('h-full', i === 0 ? 'bg-ok' : i === 1 ? 'bg-scan' : 'bg-warn')}
                    style={{ width: `${(m.value / total) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="mt-5 space-y-3">
                {idMethodMix.map((m, i) => (
                  <li key={m.name} className="flex items-baseline gap-3">
                    <Dot tone={i === 0 ? 'ok' : i === 1 ? 'scan' : 'warn'} />
                    <span className="text-[13px] text-paper">{m.name}</span>
                    <span className="ml-auto font-mono text-[13px] tabular-nums text-dim">
                      {m.value}
                      <span className="ml-2 text-faint">{Math.round((m.value / total) * 100)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-line pt-5 text-[12px] leading-relaxed text-faint">
                Angka ketiga adalah yang menentukan. Itu penampakan yang seluruhnya akan hilang kalau sistem cuma
                membaca plat.
              </p>
            </div>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Rantai pemrosesan" meta="dari frame ke satu ID global" />
            <ol className="divide-y divide-line/70">
              {PIPELINE.map((p, i) => (
                <li key={p.stage} className="flex items-baseline gap-4 px-5 py-3.5">
                  <span className="w-5 shrink-0 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13px] font-medium text-paper">{p.stage}</span>
                      <span className="rounded border border-line-2 bg-raised/50 px-1.5 py-[1px] font-mono text-[10px] text-ice">
                        {p.model}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-dim">{p.out}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* topology */}
        <Panel className="overflow-hidden p-0">
          <PanelHead
            title="Topologi kamera"
            meta="Re-ID hanya mencari di kamera yang benar-benar bisa dijangkau berikutnya"
          >
            <div className="ml-auto flex flex-wrap gap-3 text-[11px] text-dim">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2 border-ok" /> gerbang masuk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2 border-warn" /> gerbang keluar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2 border-alarm" /> mati
              </span>
            </div>
          </PanelHead>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="bg-ink/40 p-3">
              <TopologyGraph
                selected={cam}
                onSelect={setCam}
                path={[cam, ...neighbours.map((n) => n.to)]}
                className="aspect-[1000/620] max-h-[54vh]"
              />
            </div>

            <div className="border-t border-line p-5 lg:border-l lg:border-t-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Kamera dipilih</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-[20px] text-paper">{selected?.id}</span>
                <Badge tone={selected?.role === 'entry' ? 'ok' : selected?.role === 'exit' ? 'warn' : 'neutral'}>
                  {selected?.role === 'entry' ? 'gerbang masuk' : selected?.role === 'exit' ? 'gerbang keluar' : 'internal'}
                </Badge>
              </div>
              <div className="mt-1 text-[13px] text-dim">{selected && zoneName(selected.zoneId)}</div>

              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                Tujuan yang mungkin
              </div>
              <ul className="mt-3 space-y-2">
                {neighbours.map((n) => (
                  <li key={n.to} className="flex items-baseline justify-between gap-3">
                    <button
                      onClick={() => setCam(n.to)}
                      className="text-left text-[13px] text-paper transition-colors hover:text-ice"
                    >
                      {n.to} <span className="text-faint">{zoneName(cameraById(n.to)?.zoneId ?? '')}</span>
                    </button>
                    <span className="shrink-0 font-mono text-[12px] tabular-nums text-dim">
                      {n.seconds[0]}–{n.seconds[1]}s
                    </span>
                  </li>
                ))}
                {neighbours.length === 0 && (
                  <li className="text-[13px] text-faint">Belum ada tetangga terdefinisi untuk kamera ini.</li>
                )}
              </ul>

              <div className="mt-6 rounded-lg border border-line bg-ink-2/60 p-4">
                <div className="flex items-center gap-2 text-[12px] text-alarm">
                  <X className="size-3.5" />
                  Kandidat yang ditolak
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-dim">
                  Kecocokan penampilan setinggi apa pun tetap dibuang kalau kameranya tidak bertetangga, atau waktu
                  tempuhnya di luar rentang. Ini yang mencegah dua mobil putih sejenis tertukar.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden p-0">
          <PanelHead title="Plat sebagai identitas kuat" meta="dibaca ulang setiap kali platnya terlihat" />
          <div className="px-5 py-5">
            <PlateExtraction frameId={ex.vehicle.frame} />
          </div>
        </Panel>

        <Panel className="flex flex-wrap items-center gap-3 px-5 py-4">
          <p className="max-w-[70ch] text-[12px] leading-relaxed text-faint">
            Frame dan seluruh kotak plat di halaman ini berasal dari Indonesian License Plate Dataset; klip bergerak
            berasal dari dataset CCTV lalu lintas publik. Skor Re-ID adalah angka contoh untuk purwarupa — bukan hasil
            pengukuran model yang sudah dilatih di kawasan ini.
          </p>
          <Link
            to="/app/analitik"
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-2 bg-raised/50 px-3 text-[13px] text-paper transition-colors hover:bg-raised"
          >
            Lihat akurasi per kondisi
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Panel>
      </Page>
    </>
  )
}
