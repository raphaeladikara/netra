import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Cctv,
  Cpu,
  FileSearch,
  Fingerprint,
  Map as MapIcon,
  ScrollText,
  ShieldCheck,
  Timer,
  Upload,
  Sliders,
  Workflow,
  Download,
  Check,
} from 'lucide-react'
import { Section, Heading, Lede } from './parts'
import { retention, reidExample } from '../lib/data'
import { Badge } from '../components/ui'
import { HandoffPair, FusionBars } from '../components/reid/Reid'
import { cn } from '../lib/cn'

/* ------------------------------------------------------- recording section */

const VMS_FEATURES = [
  { title: 'Rekaman kontinu', body: 'Semua kamera direkam terus, bukan hanya saat ada gerakan. Kejadian yang tidak memicu alert tetap ada saat dicari.' },
  { title: 'Playback tanpa unduh', body: 'Gulir ke jam mana pun, potong klip, ekspor bukti dengan stempel waktu dan hash.' },
  { title: 'Retensi per zona', body: 'Gerbang disimpan 90 hari, blok gudang 14 hari. Kebijakan diatur per kamera, bukan satu angka untuk semua.' },
  { title: 'Sambungan pulih sendiri', body: 'Kamera putus akan disambung ulang otomatis, dan jeda perekaman dicatat di log — tidak ada lubang diam-diam.' },
]

export function Recording() {
  const maxGb = Math.max(...retention.map((r) => r.gb))
  return (
    <Section id="rekaman" mark="Manajemen rekaman">
      <Heading>Setiap stream terekam, tersimpan, bisa diputar ulang.</Heading>
      <Lede>
        Kamera tanpa rekaman hanya berguna kalau ada orang yang kebetulan sedang menonton. ByteTrack merekam semuanya,
        menyimpannya sesuai kebijakan per zona, dan menyiapkan playback dari titik mana pun di rentang retensi.
      </Lede>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-line bg-panel p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-[15px] font-semibold text-paper">Kebijakan retensi per zona</h3>
            <span className="font-mono text-[11px] text-faint">total 4,75 TB dari 8 TB</span>
          </div>

          <ul className="mt-6 space-y-4">
            {retention.map((r) => (
              <li key={r.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-dim">{r.label}</span>
                  <span className="font-mono text-[11px] tabular-nums text-faint">
                    {r.hari} hari · {(r.gb / 1000).toFixed(2)} TB
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(r.gb / maxGb) * 100}%`,
                      background: 'linear-gradient(90deg, hsl(217 91% 58%), hsl(196 92% 62%))',
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-7 border-t border-line pt-5 text-[13px] leading-relaxed text-dim">
            Metadata perjalanan kendaraan disimpan lebih lama daripada videonya. Setelah rekaman gerbang habis masa
            simpan, catatan “VHC-0001 masuk 08:28 lewat Gerbang Utara, terakhir di Area parkir” beserta snapshot
            buktinya tetap ada.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {VMS_FEATURES.map((f) => (
            <div key={f.title} className="bg-panel p-6">
              <h4 className="text-[15px] font-semibold text-paper">{f.title}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* --------------------------------------------------------- offline archive */

const STEPS = [
  { icon: Upload, title: 'Unggah', body: 'Berkas MP4, MKV, atau MOV sampai 50 GB. Bisa juga tarik dari NVR lama lewat share jaringan.' },
  { icon: Sliders, title: 'Konfigurasi', body: 'Pilih filter yang dijalankan dan zona di dalam frame. Sama persis dengan konfigurasi kamera live.' },
  { icon: Workflow, title: 'Proses', body: 'Antrean paralel di GPU yang sama. Rekaman semalam selesai dalam hitungan menit, bukan jam.' },
  { icon: Download, title: 'Ekspor', body: 'Hasil masuk ke pencarian yang sama: plat, waktu, kamera, snapshot, dan klip terpotong.' },
]

const SEGMENTS = [
  { at: 4, w: 6, tone: 'bg-scan' },
  { at: 14, w: 3, tone: 'bg-scan' },
  { at: 21, w: 9, tone: 'bg-warn' },
  { at: 38, w: 4, tone: 'bg-scan' },
  { at: 47, w: 2, tone: 'bg-alarm' },
  { at: 55, w: 7, tone: 'bg-scan' },
  { at: 68, w: 5, tone: 'bg-scan' },
  { at: 79, w: 11, tone: 'bg-warn' },
  { at: 93, w: 3, tone: 'bg-scan' },
]

export function Archive() {
  return (
    <Section id="arsip" mark="Analisis rekaman lama">
      <Heading>Rekaman apa pun. Engine yang sama.</Heading>
      <Lede>
        Insiden yang sudah lewat tidak harus ditonton manual satu per satu. Unggah rekaman lama — dari NVR merek apa
        pun — dan biarkan engine yang sama menandai kendaraan, plat, dan kejadiannya.
      </Lede>

      <div className="mt-14 rounded-2xl border border-line bg-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-[13px] text-paper">rekaman-gerbang-utara-2026-08-30.mkv</h3>
            <Badge tone="ok" mono>
              Selesai
            </Badge>
          </div>
          <span className="font-mono text-[11px] text-faint">8 jam 12 menit · 41 kejadian · 6 menit pemrosesan</span>
        </div>

        <div className="relative mt-6 h-16 overflow-hidden rounded-lg border border-line bg-ink-2">
          <div className="bp-grid-sm absolute inset-0 opacity-50" />
          {SEGMENTS.map((s, i) => (
            <div
              key={i}
              className={cn('absolute bottom-0 top-0 rounded-[2px] opacity-80', s.tone)}
              style={{ left: `${s.at}%`, width: `${s.w}%` }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 flex justify-between border-t border-line bg-ink/70 px-2 py-[3px] font-mono text-[9px] text-faint">
            {['22:00', '00:00', '02:00', '04:00', '06:00'].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 font-mono text-[11px] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-scan" /> kendaraan terdeteksi
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-warn" /> berhenti melebihi batas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-alarm" /> perlu ditinjau manusia
          </span>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-panel p-5">
              <div className="flex items-center gap-2.5">
                <s.icon className="size-4 text-ice" strokeWidth={1.7} />
                <span className="font-mono text-[10px] text-faint">Langkah {i + 1}</span>
              </div>
              <h4 className="mt-3 text-[15px] font-semibold text-paper">{s.title}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- bandwidth */

const CODECS = [
  { name: 'H.264 mentah', pct: 100, size: '21,5 MB', tone: 'from-[hsl(217_14%_38%)] to-[hsl(217_14%_46%)]' },
  { name: 'H.265 standar', pct: 58, size: '12,4 MB', tone: 'from-[hsl(217_30%_44%)] to-[hsl(217_34%_54%)]' },
  { name: 'ByteTrack adaptif', pct: 13, size: '1,38 MB', tone: 'from-[hsl(217_91%_58%)] to-[hsl(196_92%_64%)]' },
]

export function Bandwidth() {
  return (
    <Section id="jaringan" mark="Kompresi adaptif">
      <Heading>Sampai 87% lebih hemat bandwidth. Nyaris tanpa kehilangan detail.</Heading>
      <Lede>
        Kawasan industri jarang punya serat optik ke setiap titik kamera. ByteTrack menyesuaikan bitrate per kamera
        berdasarkan apa yang benar-benar bergerak di frame, dan menaikkannya kembali begitu ada kejadian.
      </Lede>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl border border-line bg-panel p-6 sm:p-7">
          <p className="text-[13px] leading-relaxed text-dim">
            Algoritmanya menahan detail di area yang berubah — kendaraan, orang, plat — dan menurunkan alokasi bit di
            bagian frame yang praktis diam sepanjang hari: aspal kosong, dinding gudang, langit.
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-dim">
            Hasilnya bukan gambar yang lebih buruk, tetapi berkas yang jauh lebih kecil untuk isi yang sama. Ini yang
            membuat 24 kamera muat di satu tautan internet kawasan tanpa antrean.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            <div className="bg-ink-2 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Sebelum</div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-dim line-through decoration-line-2">21,5 MB</div>
              <div className="mt-1 text-[11px] text-faint">1 menit · 1080p · 15 fps</div>
            </div>
            <div className="bg-azure/10 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ice">Sesudah</div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-paper">1,38 MB</div>
              <div className="mt-1 text-[11px] text-faint">isi identik, detail terjaga</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-6 sm:p-7">
          <h3 className="text-[15px] font-semibold text-paper">Ukuran berkas relatif terhadap H.264</h3>
          <div className="mt-7 space-y-6">
            {CODECS.map((c) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className={cn('text-[13px]', c.pct === 13 ? 'font-medium text-paper' : 'text-dim')}>{c.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-faint">{c.size}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-raised">
                  <div className={cn('h-full rounded-full bg-gradient-to-r', c.tone)} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 border-t border-line pt-5 text-[12px] leading-relaxed text-faint">
            Angka diukur pada rekaman uji internal 1080p 15 fps di jalur gerbang. Hasil di lapangan bergantung pada
            keramaian frame, pencahayaan, dan pengaturan kamera.
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ----------------------------------------------------------- capabilities */

const CAPS = [
  { icon: Bell, title: 'Peringatan yang bisa ditindak', body: 'Aturan per zona dan per jam. Peringatan masuk ke antrean bertugas, bukan sekadar notifikasi yang hilang.' },
  { icon: Cpu, title: 'Pemrosesan di tepi', body: 'Inferensi berjalan di GPU lokal kawasan. Video tidak pernah keluar dari infrastruktur Anda.' },
  { icon: FileSearch, title: 'Pencarian plat', body: 'Ketik plat, dapat seluruh riwayat penampakannya lintas kamera beserta snapshot.' },
  { icon: MapIcon, title: 'Peta kawasan', body: 'Setiap kamera dan kendaraan terikat ke titik nyata di denah, bukan daftar nama yang harus dihafal.' },
  { icon: Cctv, title: 'Kesehatan kamera', body: 'Uptime 14 hari per titik, deteksi lensa buram, dan tiket otomatis saat kamera berhenti merespons.' },
  { icon: ShieldCheck, title: 'Akses berbasis peran', body: 'Operator, supervisor, teknisi, auditor. Setiap peran melihat persis yang dia butuhkan.' },
  { icon: ScrollText, title: 'Jejak audit', body: 'Siapa mencari plat siapa, siapa mengekspor bukti apa. Tercatat permanen dan bisa diekspor.' },
  { icon: Timer, title: 'Retensi otomatis', body: 'Kebijakan hapus berjalan sendiri per zona, dengan laporan kapasitas sebelum disk penuh.' },
  { icon: Fingerprint, title: 'Bukti yang sah', body: 'Snapshot dan klip diekspor dengan stempel waktu, sumber kamera, dan hash integritas.' },
]

const FILTERS = [
  'ANPR plat Indonesia', 'Klasifikasi kendaraan', 'Hitung kendaraan', 'Durasi berhenti', 'Parkir liar',
  'Lawan arah', 'Antrean gerbang', 'Intrusi perimeter', 'Loitering', 'Objek tertinggal', 'Api & asap',
  'Deteksi APD', 'Kerumunan', 'Orang terjatuh', 'Perkelahian', 'Kamera dirusak',
]

export function Capabilities() {
  const [more, setMore] = useState(false)
  const shown = more ? CAPS : CAPS.slice(0, 6)

  return (
    <Section id="kemampuan" mark="Kemampuan platform">
      <Heading>Dari beberapa kamera ke ribuan — tanpa ganti platform.</Heading>
      <Lede>
        Fase pertama biasanya satu cluster dan dua puluhan kamera. Yang dipasang di fase itu tidak dibuang saat kawasan
        berkembang; hanya bertambah node, bukan berganti sistem.
      </Lede>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-gradient-to-b from-azure/16 to-transparent p-7">
          <div>
            <div className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-paper">
              1.000+
            </div>
            <p className="mt-3 text-[15px] font-medium text-ice">kamera pada satu panel</p>
            <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-dim">
              Arsitektur node-nya horizontal. Menambah kamera berarti menambah kapasitas inferensi, bukan mengganti
              lisensi platform.
            </p>
          </div>
          <div className="mt-8 space-y-2.5 border-t border-azure/20 pt-6">
            {['Tanpa batas lisensi per kamera', 'Berjalan penuh di on-premise', 'Bisa dijalankan air-gapped'].map((t) => (
              <div key={t} className="flex items-start gap-2.5 text-[13px] text-dim">
                <Check className="mt-[3px] size-3.5 shrink-0 text-ok" strokeWidth={2.5} />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <div key={c.title} className="bg-panel p-5">
                <c.icon className="size-[18px] text-ice" strokeWidth={1.6} />
                <h4 className="mt-3.5 text-[14px] font-semibold leading-snug text-paper">{c.title}</h4>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{c.body}</p>
              </div>
            ))}
          </div>
          {!more && (
            <button
              onClick={() => setMore(true)}
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-ice transition-colors hover:text-paper"
            >
              Tampilkan 3 kemampuan lainnya
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-paper">Filter analitik yang tersedia</h3>
          <span className="font-mono text-[11px] text-faint">16 filter · aktif per kamera</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <span
              key={f}
              className="rounded-lg border border-line-2 bg-raised/40 px-2.5 py-1.5 font-mono text-[11px] tracking-tight text-dim transition-colors hover:border-azure/50 hover:text-paper"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------- CTA */

export function Cta() {
  return (
    <section className="border-t border-line py-24 sm:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <h2 className="mb-12 text-balance text-center text-[clamp(1.6rem,3.6vw,2.5rem)] font-bold tracking-[-0.035em] text-paper">
          Mau lihat ini jalan di kawasan Anda?
        </h2>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel p-7 sm:p-8">
            <Cctv className="size-5 text-ice" strokeWidth={1.6} />
            <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-paper">Punya kebutuhan spesifik?</h3>
            <p className="mt-3 max-w-[44ch] text-[13px] leading-relaxed text-dim">
              Kirim satu rekaman dari kamera Anda sendiri. Kami jalankan engine-nya dan kembalikan hasil deteksinya —
              bukan slide, tapi keluaran nyata dari lokasi Anda.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Kami tandatangani perjanjian penanganan data lebih dulu',
                'Rekaman diproses di lingkungan terisolasi, lalu dihapus',
                'Hasilnya dikirim dalam tiga hari kerja',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13px] text-dim">
                  <Check className="mt-[3px] size-3.5 shrink-0 text-ok" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
            <a
              href="mailto:halo@bytetrack.id"
              className="mt-7 inline-flex h-10 items-center gap-2 rounded-xl border border-line-2 bg-raised/50 px-4 text-sm font-medium text-paper transition-colors hover:bg-raised"
            >
              Kirim rekaman uji
              <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-azure/30 bg-gradient-to-br from-azure/18 via-panel to-panel p-7 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(closest-side, hsl(217 91% 58% / 0.45), transparent)' }}
            />
            <ShieldCheck className="size-5 text-ice" strokeWidth={1.6} />
            <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-paper">Siap untuk skala kawasan</h3>
            <p className="mt-3 max-w-[44ch] text-[13px] leading-relaxed text-dim">
              Butuh penerapan penuh di on-premise? Terintegrasi dengan gate, sistem tenant, dan proses jaga yang sudah
              berjalan.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Penerapan on-premise atau hybrid',
                'Dukungan aktif dengan SLA tertulis',
                'Serah terima dokumentasi dan runbook',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13px] text-dim">
                  <Check className="mt-[3px] size-3.5 shrink-0 text-ok" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/app"
              className="mt-7 inline-flex h-10 items-center gap-2 rounded-xl bg-azure px-4 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_hsl(217_91%_58%)] transition-colors hover:bg-azure-hi"
            >
              Masuk ke dashboard demo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------- cross-camera tracking */

const PIPELINE: Array<[string, string, string]> = [
  ['Deteksi', 'YOLO11', 'Setiap kendaraan dapat kotak di setiap frame.'],
  ['Tracking satu kamera', 'ByteTrack', 'Kotak yang sama diberi track id selama kendaraan masih terlihat.'],
  ['Re-ID lintas kamera', 'OSNet', 'Penampilan kendaraan disimpan sebagai embedding, lalu dicocokkan ke kamera lain.'],
  ['Baca plat', 'ANPR', 'Plat dibaca setiap kali sudutnya memungkinkan, sebagai penanda paling kuat.'],
  ['Peleburan identitas', 'fusion', 'Semua sinyal digabung jadi satu ID global per kendaraan.'],
]

export function CrossCamera() {
  const ex = reidExample
  return (
    <Section id="lintas" mark="Pelacakan lintas kamera">
      <Heading>Satu kendaraan, dua puluh empat kamera, satu identitas.</Heading>
      <Lede>
        Membaca plat di gerbang itu bagian yang gampang. Yang sulit adalah tetap tahu kendaraan mana yang mana setelah
        ia masuk, berbelok, dan terlihat dari sudut yang platnya tidak kelihatan sama sekali.
      </Lede>

      <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line bg-panel p-6 sm:p-7">
          <h3 className="text-[15px] font-semibold text-paper">Serah terima antar kamera</h3>
          <p className="mb-6 mt-1 text-[12px] text-faint">
            {ex.a.cam} → {ex.b.cam}, selisih {ex.gapSeconds} detik
          </p>
          <HandoffPair a={ex.a} b={ex.b} gapSeconds={ex.gapSeconds} />
          <p className="mt-6 text-[13px] leading-relaxed text-dim">
            Kedua frame itu kendaraan yang sama, difoto dua kali oleh dataset yang sama. Tanpa Re-ID, perjalanannya
            terputus di frame kedua dan dashboard kehilangan jejaknya. Dengan Re-ID, ia tetap satu baris — lengkap
            dengan zona terakhirnya.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-6 sm:p-7">
          <h3 className="text-[15px] font-semibold text-paper">Sinyal yang dilebur</h3>
          <p className="mb-6 mt-1 text-[12px] text-faint">Tidak ada satu sinyal yang boleh memutuskan sendirian.</p>
          <FusionBars signals={ex.signals} verdict={ex.verdict} />
        </div>
      </div>

      <ol className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
        {PIPELINE.map(([stage, model, body], i) => (
          <li key={stage} className="bg-panel p-5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-faint">{String(i + 1).padStart(2, '0')}</span>
              <span className="rounded border border-line-2 bg-raised/50 px-1.5 py-[1px] font-mono text-[10px] text-ice">
                {model}
              </span>
            </div>
            <h4 className="mt-3 text-[14px] font-semibold leading-snug text-paper">{stage}</h4>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
