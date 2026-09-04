import { useState } from 'react'
import { Camera, HardDriveDownload, Gauge } from 'lucide-react'
import { Section, Heading, Lede } from './parts'
import { CameraFeed, BOXES } from '../components/cctv/CameraFeed'
import { cameras } from '../lib/data'
import { Badge, Dot } from '../components/ui'
import { cn } from '../lib/cn'

const WALL = [cameras[0], cameras[2], cameras[5], cameras[13], cameras[18], cameras[21]]

const DETECTIONS: Record<string, Array<{ t: string; label: string; detail: string; tone: 'scan' | 'warn' | 'ok' | 'alarm' }>> = {
  'CAM-01': [
    { t: '09:31:04', label: 'ANPR', detail: 'B 1234 XYZ · keyakinan 98%', tone: 'ok' },
    { t: '09:30:51', label: 'Klasifikasi', detail: 'Truk kontainer, sumbu 2', tone: 'scan' },
    { t: '09:30:12', label: 'Arah', detail: 'Masuk lewat Gerbang Utara', tone: 'scan' },
    { t: '09:28:44', label: 'ANPR', detail: 'B 9903 WSX · keyakinan 96%', tone: 'ok' },
  ],
  'CAM-03': [
    { t: '09:31:02', label: 'Deteksi', detail: '3 kendaraan di jalur utama', tone: 'scan' },
    { t: '09:29:38', label: 'Kecepatan', detail: 'Rata-rata 22 km/jam', tone: 'scan' },
    { t: '09:26:10', label: 'Lawan arah', detail: 'Tidak ada pelanggaran', tone: 'ok' },
  ],
  'CAM-06': [
    { t: '09:31:00', label: 'Durasi berhenti', detail: 'B 1234 XYZ · 47 menit (batas 45)', tone: 'warn' },
    { t: '09:12:20', label: 'Objek tertinggal', detail: 'Palet di bahu jalan · 9 menit', tone: 'warn' },
    { t: '08:53:07', label: 'Deteksi', detail: 'Truk memasuki bay D2', tone: 'scan' },
  ],
  'CAM-14': [
    { t: '09:30:58', label: 'APD', detail: '1 pekerja · helm & rompi lengkap', tone: 'ok' },
    { t: '09:24:31', label: 'Api & asap', detail: 'Tidak terdeteksi', tone: 'ok' },
    { t: '09:11:02', label: 'Loitering', detail: 'Tidak ada', tone: 'ok' },
  ],
  'CAM-19': [
    { t: '09:31:03', label: 'Okupansi', detail: '38 dari 60 petak terisi', tone: 'scan' },
    { t: '09:18:47', label: 'Durasi berhenti', detail: 'B 5527 NBV · 3 jam 12 menit', tone: 'warn' },
    { t: '09:02:15', label: 'ANPR', detail: 'D 1145 RTU · keyakinan 94%', tone: 'ok' },
  ],
  'CAM-22': [
    { t: '09:30:44', label: 'Intrusi perimeter', detail: 'Satu orang di zona terlarang', tone: 'alarm' },
    { t: '09:30:44', label: 'Peringatan', detail: 'Dikirim ke Pos 2 · Sujarwo', tone: 'warn' },
    { t: '09:16:29', label: 'Panjat pagar', detail: 'Tidak terdeteksi', tone: 'ok' },
  ],
}

const TONE_TEXT = { scan: 'text-scan', warn: 'text-warn', ok: 'text-ok', alarm: 'text-alarm' } as const

export function Platform() {
  const [active, setActive] = useState(cameras[0])
  const feed = DETECTIONS[active.id] ?? DETECTIONS['CAM-03']

  return (
    <Section id="platform" mark="Platform">
      <Heading>Satu platform. Dua sisi.</Heading>
      <Lede>
        Sisi kiri adalah yang dioperasikan tim Anda setiap hari. Sisi kanan adalah yang dibaca mesin di belakangnya,
        terus-menerus, di kamera yang sama. Klik salah satu kamera untuk melihat keduanya berubah.
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
            {WALL.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                aria-pressed={active.id === c.id}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 font-mono text-[11px] tracking-tight transition-colors duration-150',
                  active.id === c.id
                    ? 'border-azure bg-azure text-white'
                    : 'border-line-2 bg-raised/40 text-dim hover:border-line-2 hover:text-paper',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {WALL.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={cn(
                  'group relative overflow-hidden rounded-lg border transition-all duration-200',
                  active.id === c.id ? 'border-azure ring-1 ring-azure/40' : 'border-line hover:border-line-2',
                )}
              >
                <CameraFeed camera={c} compact live={active.id === c.id} className="aspect-video" />
              </button>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
            {[
              ['Kamera aktif', '24'],
              ['Rekaman berjalan', '23'],
              ['Retensi terpakai', '62%'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">{k}</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-paper">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* seen by AI */}
        <div className="bg-panel p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-paper">Yang dilihat AI</h3>
            <Badge tone="azure" mono>
              Engine
            </Badge>
          </div>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-dim">
            Filter analitik berjalan per kamera. Setiap deteksi disimpan bersama snapshot buktinya, jadi bisa dicari
            berbulan-bulan kemudian.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-line">
            <CameraFeed camera={active} boxes={BOXES[active.scene]} className="aspect-video" />
            <div className="flex flex-wrap gap-1.5 border-t border-line bg-ink-2 px-3 py-2.5">
              {active.analytics.map((a) => (
                <span key={a} className="rounded-md bg-raised/70 px-2 py-1 font-mono text-[10px] text-dim">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-5 space-y-px overflow-hidden rounded-xl border border-line bg-line">
            {feed.map((d, i) => (
              <li key={i} className="flex items-baseline gap-3 bg-panel px-3.5 py-2.5">
                <span className="font-mono text-[11px] tabular-nums text-faint">{d.t}</span>
                <span className={cn('font-mono text-[11px] font-medium', TONE_TEXT[d.tone])}>{d.label}</span>
                <span className="ml-auto truncate text-[12px] text-dim">{d.detail}</span>
              </li>
            ))}
          </ul>
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

export { DETECTIONS, TONE_TEXT, Dot }
