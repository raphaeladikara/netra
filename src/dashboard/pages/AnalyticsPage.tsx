import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
  Cell,
} from 'recharts'
import { Download, Table2 } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { Panel, PanelHead, Segmented, Button, Stat } from '../../components/ui'
import { hourlyTraffic, weeklyDwell, alertMix, tenantTraffic, uptimeSeries, accuracy } from '../../lib/data'

/* Validated on the dark panel surface with the dataviz palette checker:
   lightness band, chroma, CVD separation, and contrast all pass. */
const SERIES = { masuk: '#4C8DF6', keluar: '#C96A3F' }
const ONE_HUE = '#4C8DF6'

const AXIS = { stroke: 'hsl(217 10% 46%)', fontSize: 11, fontFamily: 'var(--font-mono)' }

function Tip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line-2 bg-ink-2/95 px-3 py-2 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.9)] backdrop-blur">
      <div className="font-mono text-[11px] text-faint">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="mt-1 flex items-center gap-2 text-[12px]">
          <span className="size-2 rounded-[2px]" style={{ background: p.color ?? p.fill }} />
          <span className="text-dim">{p.name}</span>
          <span className="ml-auto font-mono tabular-nums text-paper">
            {p.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  )
}

function Legend({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-2 text-[12px] text-dim">
          <span className="size-2.5 rounded-[3px]" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30')
  const [showTable, setShowTable] = useState(false)

  const totalIn = hourlyTraffic.reduce((a, h) => a + h.masuk, 0)
  const totalOut = hourlyTraffic.reduce((a, h) => a + h.keluar, 0)
  const peak = hourlyTraffic.reduce((a, h) => (h.masuk > a.masuk ? h : a))

  return (
    <>
      <TopBar title="Analitik & laporan">
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: '7', label: '7 hari' },
            { value: '30', label: '30 hari' },
            { value: '90', label: '90 hari' },
          ]}
        />
        <Button size="sm" onClick={() => setShowTable((v) => !v)}>
          <Table2 className="size-3.5" />
          {showTable ? 'Sembunyikan tabel' : 'Lihat sebagai tabel'}
        </Button>
        <Button size="sm" variant="primary">
          <Download className="size-3.5" />
          Unduh laporan
        </Button>
      </TopBar>

      <Page className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Kendaraan masuk" value={totalIn.toLocaleString('id-ID')} hint="hari ini, semua gerbang" />
          <Stat label="Kendaraan keluar" value={totalOut.toLocaleString('id-ID')} hint={`selisih ${totalIn - totalOut} masih di dalam`} />
          <Stat label="Jam tersibuk" value={`${peak.hour}:00`} hint={`${peak.masuk} kendaraan masuk`} tone="azure" />
          <Stat label="Rerata berhenti" value="42 mnt" hint="batas zona loading 45 menit" tone="warn" />
        </div>

        <Panel className="overflow-hidden p-0">
          <PanelHead title="Lalu lintas kendaraan per jam" meta="hari ini · semua gerbang">
            <div className="ml-auto">
              <Legend items={[['Masuk', SERIES.masuk], ['Keluar', SERIES.keluar]]} />
            </div>
          </PanelHead>
          <div className="h-[260px] px-3 py-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTraffic} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(217 21% 16%)" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={AXIS} tickMargin={10} interval={2} />
                <YAxis tickLine={false} axisLine={false} tick={AXIS} width={38} />
                <Tooltip content={<Tip unit=" kendaraan" />} cursor={{ stroke: 'hsl(217 22% 30%)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="masuk"
                  name="Masuk"
                  stroke={SERIES.masuk}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(220 34% 9.5%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="keluar"
                  name="Keluar"
                  stroke={SERIES.keluar}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(220 34% 9.5%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Durasi berhenti per hari" meta="menit">
              <div className="ml-auto">
                <Legend items={[['Rerata', SERIES.masuk], ['Terlama', SERIES.keluar]]} />
              </div>
            </PanelHead>
            <div className="h-[240px] px-3 py-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDwell} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid stroke="hsl(217 21% 16%)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={AXIS} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} tick={AXIS} width={38} />
                  <Tooltip content={<Tip unit=" menit" />} cursor={{ fill: 'hsl(217 22% 20% / 0.4)' }} />
                  <ReferenceLine y={45} stroke="hsl(38 94% 58%)" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Bar dataKey="rerata" name="Rerata" fill={SERIES.masuk} radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="terlama" name="Terlama" fill={SERIES.keluar} radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="border-t border-line px-5 py-3 text-[12px] text-faint">
              Garis putus-putus adalah batas 45 menit di zona loading. Kamis dan Jumat rutin melewatinya.
            </p>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Jenis peringatan" meta={`${range} hari terakhir`} />
            <div className="h-[240px] px-3 py-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertMix} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="hsl(217 21% 16%)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={AXIS} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ ...AXIS, fontFamily: 'var(--font-sans)', fontSize: 12 }}
                    width={150}
                  />
                  <Tooltip content={<Tip unit=" kejadian" />} cursor={{ fill: 'hsl(217 22% 20% / 0.4)' }} />
                  <Bar dataKey="value" name="Kejadian" fill={ONE_HUE} radius={[0, 4, 4, 0]} maxBarSize={16}>
                    <LabelList
                      dataKey="value"
                      position="right"
                      offset={8}
                      style={{ fill: 'hsl(217 12% 70%)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Kendaraan per tenant" meta={`${range} hari terakhir`} />
            <div className="h-[250px] px-3 py-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tenantTraffic} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke="hsl(217 21% 16%)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={AXIS} />
                  <YAxis
                    type="category"
                    dataKey="tenant"
                    tickLine={false}
                    axisLine={false}
                    tick={{ ...AXIS, fontFamily: 'var(--font-sans)', fontSize: 12 }}
                    width={168}
                  />
                  <Tooltip content={<Tip unit=" kendaraan" />} cursor={{ fill: 'hsl(217 22% 20% / 0.4)' }} />
                  <Bar dataKey="kendaraan" name="Kendaraan" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {tenantTraffic.map((t) => (
                      <Cell key={t.tenant} fill={ONE_HUE} />
                    ))}
                    <LabelList
                      dataKey="kendaraan"
                      position="right"
                      offset={8}
                      style={{ fill: 'hsl(217 12% 70%)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="border-t border-line px-5 py-3 text-[12px] text-faint">
              Rerata durasi berhenti per tenant ada di tabel — dua ukuran dengan satuan berbeda tidak digabung ke satu
              grafik.
            </p>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Uptime sistem" meta="30 hari" />
            <div className="h-[250px] px-3 py-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uptimeSeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(217 21% 16%)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={AXIS} tickMargin={10} interval={4} />
                  <YAxis domain={[90, 100]} tickLine={false} axisLine={false} tick={AXIS} width={42} />
                  <Tooltip content={<Tip unit="%" />} cursor={{ stroke: 'hsl(217 22% 30%)', strokeWidth: 1 }} />
                  <ReferenceLine y={99} stroke="hsl(38 94% 58%)" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Line
                    type="monotone"
                    dataKey="uptime"
                    name="Uptime"
                    stroke={ONE_HUE}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(220 34% 9.5%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="border-t border-line px-5 py-3 text-[12px] text-faint">
              Penurunan di hari ke-20 adalah pemadaman listrik 2 jam di gardu utara. SLA yang dijanjikan 99%.
            </p>
          </Panel>
        </div>

        <Panel className="overflow-hidden p-0">
          <PanelHead title="Akurasi pembacaan per kondisi" meta="hasil uji lapangan, 4.200 sampel" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-5 py-2.5 font-normal">Kondisi</th>
                  <th className="px-3 py-2.5 font-normal">Baca plat (ANPR)</th>
                  <th className="px-5 py-2.5 font-normal">Plat + Re-ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {accuracy.map((a) => (
                  <tr key={a.label}>
                    <td className="px-5 py-3 text-[13px] text-paper">{a.label}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-3">
                        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-raised">
                          <span className="block h-full rounded-full" style={{ width: `${a.anpr}%`, background: ONE_HUE }} />
                        </span>
                        <span className="font-mono text-[12px] tabular-nums text-dim">{a.anpr.toFixed(1)}%</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-raised">
                          <span className="block h-full rounded-full" style={{ width: `${a.fusion}%`, background: SERIES.keluar }} />
                        </span>
                        <span className="font-mono text-[12px] tabular-nums text-dim">{a.fusion.toFixed(1)}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-5 py-3 text-[12px] leading-relaxed text-faint">
            Plat dengan keyakinan di bawah ambang tidak dibuang, tetapi masuk antrean verifikasi manusia. Angka di
            atas adalah pembacaan otomatis saja.
          </p>
        </Panel>

        {showTable && (
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Tabel data" meta="lalu lintas per jam & tenant" />
            <div className="grid gap-px bg-line lg:grid-cols-2">
              <div className="overflow-x-auto bg-panel">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Jam</th>
                      <th className="px-3 py-2.5 font-normal">Masuk</th>
                      <th className="px-5 py-2.5 font-normal">Keluar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {hourlyTraffic.map((h) => (
                      <tr key={h.hour}>
                        <td className="px-5 py-2 font-mono text-[12px] tabular-nums text-dim">{h.hour}:00</td>
                        <td className="px-3 py-2 font-mono text-[12px] tabular-nums text-paper">{h.masuk}</td>
                        <td className="px-5 py-2 font-mono text-[12px] tabular-nums text-paper">{h.keluar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-x-auto bg-panel">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-5 py-2.5 font-normal">Tenant</th>
                      <th className="px-3 py-2.5 font-normal">Kendaraan</th>
                      <th className="px-5 py-2.5 font-normal">Rerata berhenti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {tenantTraffic.map((t) => (
                      <tr key={t.tenant}>
                        <td className="px-5 py-2 text-[13px] text-paper">{t.tenant}</td>
                        <td className="px-3 py-2 font-mono text-[12px] tabular-nums text-dim">{t.kendaraan}</td>
                        <td className="px-5 py-2 font-mono text-[12px] tabular-nums text-dim">{t.rerata} menit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
        )}
      </Page>
    </>
  )
}
