import { useState } from 'react'
import { Bell, MapPin, Camera, Check, ChevronRight } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { CameraFeed } from '../../components/cctv/CameraFeed'
import { Panel, PanelHead, Badge } from '../../components/ui'
import { cameras } from '../../lib/data'
import { cn } from '../../lib/cn'

function Phone({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[300px] shrink-0 rounded-[38px] border border-line-2 bg-ink-2 p-2.5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]">
        <div className="absolute left-1/2 top-4 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
        <div className="h-[600px] overflow-hidden rounded-[28px] border border-line bg-ink">{children}</div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pb-1 pt-5 font-mono text-[11px] text-dim">
      <span className="tabular-nums">09:31</span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-ok" />
        Pos 2 · Sujarwo
      </span>
    </div>
  )
}

export default function FieldPage() {
  const [accepted, setAccepted] = useState(false)
  const cam = cameras[18]

  return (
    <>
      <TopBar title="Aplikasi petugas" />

      <Page className="grid gap-6 xl:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-wrap justify-center gap-8">
          <Phone label="Antrean tugas">
            <StatusBar />
            <div className="flex items-center gap-2.5 px-5 pb-4 pt-3">
              <Bell className="size-5 text-paper" strokeWidth={1.8} />
              <h2 className="text-[19px] font-bold tracking-[-0.02em] text-paper">Tugas saya</h2>
              <span className="ml-auto rounded-md border border-warn/40 bg-warn/12 px-2 py-[3px] font-mono text-[10px] text-warn">
                1 baru
              </span>
            </div>

            <div className="mx-4 overflow-hidden rounded-2xl border border-warn/35 bg-warn/[0.05]">
              <div className="flex items-center gap-2 px-4 pb-2 pt-3.5">
                <span className="size-2 rounded-full bg-warn" style={{ animation: 'bt-pulse 2s ease-in-out infinite' }} />
                <span className="text-[12px] text-dim">Peringatan · 12 menit lalu</span>
              </div>
              <div className="px-4">
                <h3 className="text-[17px] font-bold tracking-[-0.02em] text-paper">Melebihi batas berhenti</h3>
                <div className="mt-1 font-mono text-[17px] tracking-[0.04em] text-paper">L 1731 LI</div>
                <div className="mt-1 text-[13px] text-dim">Area parkir · Cam 19</div>
              </div>
              <div className="p-4">
                <CameraFeed camera={cam} compact className="aspect-video rounded-xl border border-line" />
              </div>
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => setAccepted((v) => !v)}
                  className={cn(
                    'h-11 flex-1 rounded-xl text-[14px] font-semibold transition-colors',
                    accepted ? 'bg-ok/18 text-ok' : 'bg-azure text-white hover:bg-azure-hi',
                  )}
                >
                  {accepted ? 'Tugas diterima' : 'Terima tugas'}
                </button>
                <button className="grid h-11 w-11 place-content-center rounded-xl border border-line-2 bg-raised/50 text-dim transition-colors hover:text-paper">
                  <MapPin className="size-4" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-2 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Selesai hari ini
            </div>
            <ul className="px-5">
              {[
                ['Parkir di jalur utama', 'B 2005 POU · ditutup dengan foto', '08:52'],
                ['Melebihi batas berhenti', 'AB 1633 SY · ditutup dengan foto', '08:11'],
                ['Kendaraan belum terverifikasi', 'B 1186 COG · plat dikoreksi manual', '07:36'],
              ].map(([t, s, w]) => (
                <li key={w} className="flex items-start gap-3 border-b border-line/70 py-3 last:border-0">
                  <span className="mt-[6px] size-2 shrink-0 rounded-full bg-ok" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] text-paper">{t}</div>
                    <div className="mt-0.5 truncate text-[12px] text-dim">{s}</div>
                  </div>
                  <span className="font-mono text-[12px] tabular-nums text-faint">{w}</span>
                </li>
              ))}
            </ul>
          </Phone>

          <Phone label="Menutup tugas">
            <StatusBar />
            <div className="px-5 pb-4 pt-3">
              <div className="text-[12px] text-dim">Tugas · ALR-4471</div>
              <h2 className="mt-1 text-[19px] font-bold tracking-[-0.02em] text-paper">Tutup dengan bukti</h2>
            </div>

            <div className="px-4">
              <div className="rounded-2xl border border-line bg-panel p-4">
                <div className="font-mono text-[15px] tracking-[0.04em] text-paper">L 1731 LI</div>
                <div className="mt-1 text-[12px] text-dim">Area parkir · berhenti 47 menit</div>
              </div>

              <button className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-line-2 bg-raised/25 px-4 py-6 text-left transition-colors hover:border-azure/50">
                <Camera className="size-5 text-ice" strokeWidth={1.7} />
                <div className="min-w-0">
                  <div className="text-[14px] text-paper">Ambil foto di lokasi</div>
                  <div className="mt-0.5 text-[12px] text-dim">Wajib untuk pelanggaran parkir</div>
                </div>
                <ChevronRight className="ml-auto size-4 text-faint" />
              </button>

              <div className="mt-3 space-y-2">
                {['Sopir sudah dihubungi', 'Kendaraan sudah dipindahkan', 'Perlu eskalasi ke supervisor'].map((t, i) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 text-[14px] text-paper"
                  >
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-content-center rounded-md border',
                        i < 2 ? 'border-azure bg-azure' : 'border-line-2',
                      )}
                    >
                      {i < 2 && <Check className="size-3 text-white" strokeWidth={3} />}
                    </span>
                    {t}
                  </label>
                ))}
              </div>

              <textarea
                rows={3}
                defaultValue="Sopir sedang bongkar muat, minta tambahan 15 menit. Sudah dicatat di pos."
                className="mt-3 w-full resize-none rounded-xl border border-line bg-ink-2 px-4 py-3 text-[13px] leading-relaxed text-paper focus:border-azure/60 focus:outline-none"
              />

              <button className="mt-3 h-11 w-full rounded-xl bg-azure text-[14px] font-semibold text-white transition-colors hover:bg-azure-hi">
                Tutup tugas
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-faint">
                Penutupan dicatat di jejak audit bersama foto, waktu, dan lokasi GPS petugas.
              </p>
            </div>
          </Phone>
        </div>

        <div className="flex flex-col gap-4">
          <Panel className="p-6">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-paper">
              Peringatan tanpa petugas hanya jadi angka
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              Bagian tersulit bukan mendeteksi truk yang parkir terlalu lama, tetapi memastikan ada orang yang datang
              dan menyelesaikannya. Aplikasi petugas menutup jarak itu: peringatan dari dashboard masuk sebagai tugas
              bernama, diterima oleh satu orang, dan ditutup dengan bukti.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                ['Satu tugas, satu pemilik', 'Tidak ada peringatan yang “dilihat semua orang tapi tidak dikerjakan siapa pun”.'],
                ['Bukti di titik kejadian', 'Foto dari lapangan menempel ke peringatan yang sama, bukan di grup chat terpisah.'],
                ['Jejaknya terukur', 'Waktu tanggap per pos dan per jenis pelanggaran tercatat sendiri, tanpa laporan manual.'],
                ['Bekerja saat sinyal jelek', 'Tugas tersimpan lokal dan disinkronkan ulang begitu jaringan kembali.'],
              ].map(([t, s]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-azure" />
                  <div>
                    <div className="text-[14px] font-medium text-paper">{t}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-dim">{s}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Waktu tanggap per pos" meta="rata-rata 30 hari" />
            <ul className="divide-y divide-line/70">
              {[
                ['Pos 1 · Gerbang Utara', '4 mnt 20 dtk', 'ok'],
                ['Pos 2 · Jalur utama', '6 mnt 05 dtk', 'ok'],
                ['Pos 3 · Blok Gudang L', '11 mnt 40 dtk', 'warn'],
                ['Pos 4 · Gerbang Selatan', '7 mnt 15 dtk', 'ok'],
              ].map(([pos, t, tone]) => (
                <li key={pos} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-[13px] text-paper">{pos}</span>
                  <Badge tone={tone as 'ok' | 'warn'} mono className="ml-auto">
                    {t}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="border-t border-line px-5 py-3 text-[12px] leading-relaxed text-faint">
              Pos 3 konsisten paling lambat karena jarak tempuhnya paling jauh dari titik jaga. Ini jenis temuan yang
              baru terlihat setelah waktunya dicatat otomatis.
            </p>
          </Panel>
        </div>
      </Page>
    </>
  )
}
