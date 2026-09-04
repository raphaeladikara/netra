import { useState } from 'react'
import { Camera, HardDriveDownload, Gauge } from 'lucide-react'
import { Section, Heading, Lede } from './parts'
import { CameraFeed, plateBoxes } from '../components/cctv/CameraFeed'
import { cameras, zoneName } from '../lib/data'
import { frames, formatPlate } from '../lib/frames'
import { Badge } from '../components/ui'
import { cn } from '../lib/cn'

/** a spread of cameras: a gate close-up, two clips, a dock, a yard, a fence line */
const WALL = [cameras[0], cameras[1], cameras[2], cameras[5], cameras[13], cameras[21]]

type Line = { t: string; label: string; detail: string; tone: 'scan' | 'warn' | 'ok' | 'alarm' }

/** the read-out is derived from the frame's own annotations, not written by hand */
function readout(camIndex: number): Line[] {
  const c = WALL[camIndex]
  const f = c.frame ? frames[c.frame] : null
  const base: Line[] = []

  if (c.clip) {
    base.push({ t: '09:31:04', label: 'ByteTrack', detail: 'Klip langsung — track id berjalan per frame', tone: 'scan' })
  }

  if (f) {
    f.boxes.forEach((b, i) => {
      base.push({
        t: `09:3${i}:0${(i * 3) % 10}`,
        label: 'ANPR',
        detail: `${formatPlate(b.text)} · keyakinan ${91 + ((b.text.charCodeAt(0) + i * 7) % 9)}%`,
        tone: 'ok',
      })
    })
    base.push({
      t: '09:30:58',
      label: 'Re-ID',
      detail: `${f.boxes.length} embedding disimpan untuk pencocokan lintas kamera`,
      tone: 'scan',
    })
  }

  if (c.kind === 'loading') {
    base.push({ t: '09:31:00', label: 'Durasi berhenti', detail: 'Satu truk melewati batas 45 menit', tone: 'warn' })
  }
  if (c.kind === 'perimeter') {
    base.push({ t: '09:30:44', label: 'Intrusi perimeter', detail: 'Peringatan dikirim ke Pos 2', tone: 'alarm' })
  }
  if (c.state === 'offline') {
    return [{ t: '06:12:03', label: 'Sinyal', detail: 'Kamera berhenti merespons — tiket #204', tone: 'alarm' }]
  }

  return base.slice(0, 5)
}

const TONE_TEXT = { scan: 'text-scan', warn: 'text-warn', ok: 'text-ok', alarm: 'text-alarm' } as const

export function Platform() {
  const [i, setI] = useState(0)
  const active = WALL[i]
  const feed = readout(i)
  const boxes = plateBoxes(active.frame, 'warn')

  return (
    <Section id="platform" mark="Platform">
      <Heading>Satu platform. Dua sisi.</Heading>
      <Lede>
        Sisi kiri adalah yang dioperasikan tim Anda setiap hari. Sisi kanan adalah yang dibaca mesin di belakangnya,
        di kamera yang sama, terus-menerus. Klik salah satu kamera untuk melihat keduanya berubah.
      </Lede>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-2">
        {/* operated */}
        <div className="bg-panel p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-paper">Yang Anda operasikan</h3>
            <Badge tone="neutral" mono>
              VMS
            </Badge>
          </div>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-dim">
            Dinding kamera, rekaman berjalan, dan playback. Tanpa aplikasi kedua, tanpa berpindah merek DVR.
          </p>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {WALL.map((c, k) => (
              <button
                key={c.id}
                onClick={() => setI(k)}
                aria-pressed={i === k}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 font-mono text-[11px] tracking-tight transition-colors duration-150',
                  i === k
                    ? 'border-azure bg-azure text-white'
                    : 'border-line-2 bg-raised/40 text-dim hover:text-paper',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {WALL.map((c, k) => (
              <button
                key={c.id}
                onClick={() => setI(k)}
                className={cn(
                  'group relative overflow-hidden rounded-lg border transition-all duration-200',
                  i === k ? 'border-azure ring-1 ring-azure/40' : 'border-line hover:border-line-2',
                )}
              >
                <CameraFeed camera={c} compact live={false} className="aspect-video" />
              </button>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
            {[
              ['Kamera aktif', String(cameras.length)],
              ['Rekaman berjalan', String(cameras.filter((c) => c.state !== 'offline').length)],
              ['Retensi terpakai', '62%'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">{k}</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-paper">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* seen by the engine */}
        <div className="bg-panel p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-paper">Yang dilihat mesin</h3>
            <Badge tone="azure" mono>
              Engine
            </Badge>
          </div>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-dim">
            Setiap kendaraan dapat kotak, plat dibaca kalau terlihat, dan penampilannya disimpan sebagai embedding
            supaya masih bisa dikenali di kamera berikutnya.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-line">
            <CameraFeed camera={active} boxes={boxes.length ? boxes : undefined} className="aspect-video" />
            <div className="flex flex-wrap items-center gap-1.5 border-t border-line bg-ink-2 px-3 py-2.5">
              {active.analytics.map((a) => (
                <span key={a} className="rounded-md bg-raised/70 px-2 py-1 font-mono text-[10px] text-dim">
                  {a}
                </span>
              ))}
              <span className="ml-auto font-mono text-[10px] text-faint">{zoneName(active.zoneId)}</span>
            </div>
          </div>

          <ul className="mt-5 space-y-px overflow-hidden rounded-xl border border-line bg-line">
            {feed.map((d, k) => (
              <li key={k} className="flex items-baseline gap-3 bg-panel px-3.5 py-2.5">
                <span className="font-mono text-[11px] tabular-nums text-faint">{d.t}</span>
                <span className={cn('font-mono text-[11px] font-medium', TONE_TEXT[d.tone])}>{d.label}</span>
                <span className="ml-auto truncate text-[12px] text-dim">{d.detail}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] leading-relaxed text-faint">
            Kotak plat pada frame diam di atas adalah anotasi asli dari Indonesian License Plate Dataset — bukan kotak
            hiasan yang digambar ulang.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {[
          {
            icon: Camera,
            title: 'Kamera apa pun',
            body: 'RTSP dan ONVIF dari merek mana saja. Kamera lama tetap terpakai — tidak ada penggantian massal di awal proyek.',
          },
          {
            icon: HardDriveDownload,
            title: 'Rekam & simpan',
            body: 'Perekaman kontinu, retensi per kamera, kuota disk, dan playback di antarmuka yang sama.',
          },
          {
            icon: Gauge,
            title: 'Tetap ringan',
            body: 'Decode adaptif dan transcode saat dibutuhkan. Dinding 16 kamera tidak membuat browser operator tersendat.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-panel p-6">
            <f.icon className="size-5 text-ice" strokeWidth={1.6} />
            <h4 className="mt-4 text-[15px] font-semibold text-paper">{f.title}</h4>
            <p className="mt-2 text-[13px] leading-relaxed text-dim">{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
