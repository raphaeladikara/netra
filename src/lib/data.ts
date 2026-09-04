import { seeded, pick, between } from './rng'

export const ESTATE = {
  brand: 'Netra',
  product: 'Netra Command',
  estate: 'Bumi Sentosa Business Park',
  phase: 'Fase 1 — cluster Sentosa dan sekitarnya',
  operator: { name: 'Andi Nugroho', role: 'Operator', shift: 'Shift pagi', initials: 'AN' },
  clock: '09:31',
}

export type SceneKind = 'gate' | 'road' | 'loading' | 'warehouse' | 'parking' | 'perimeter'
export type CamState = 'online' | 'attention' | 'offline'

export type Camera = {
  id: string
  no: number
  name: string
  zone: string
  scene: SceneKind
  state: CamState
  uptime: number
  note?: string
  fps: number
  bitrate: number
  resolution: string
  analytics: string[]
  /** position on the 1000x620 site plan */
  x: number
  y: number
  /** viewing direction in degrees, 0 = east */
  bearing: number
}

const ZONES: Array<[string, SceneKind, number, number, number]> = [
  ['Gerbang Utara', 'gate', 340, 74, 90],
  ['Gerbang Utara', 'gate', 366, 100, 140],
  ['Jalur utama', 'road', 250, 300, 0],
  ['Jalur utama', 'road', 470, 300, 180],
  ['Jalur barat', 'road', 46, 214, 20],
  ['Area Loading', 'loading', 452, 424, 250],
  ['Area Loading', 'loading', 530, 400, 290],
  ['Blok Gudang B', 'warehouse', 178, 150, 20],
  ['Blok Gudang L', 'warehouse', 742, 452, 200],
  ['Blok Gudang C', 'warehouse', 430, 168, 340],
  ['Blok Gudang C', 'warehouse', 512, 216, 300],
  ['Gerbang Selatan', 'gate', 600, 556, 270],
  ['Blok Gudang L', 'warehouse', 806, 400, 160],
  ['Gudang Sentosa', 'warehouse', 782, 168, 210],
  ['Gudang Sentosa', 'warehouse', 866, 214, 240],
  ['Jalur timur', 'road', 962, 320, 200],
  ['Jalur utara', 'road', 612, 92, 200],
  ['Jalur barat', 'road', 46, 380, 20],
  ['Area parkir', 'parking', 238, 486, 320],
  ['Ruko Komersial', 'parking', 150, 470, 60],
  ['Pagar perimeter', 'perimeter', 40, 56, 35],
  ['Pagar perimeter', 'perimeter', 960, 56, 145],
  ['Pagar perimeter', 'perimeter', 960, 564, 215],
  ['Area Loading', 'loading', 400, 502, 210],
]

const ANALYTICS_BY_SCENE: Record<SceneKind, string[]> = {
  gate: ['ANPR', 'Klasifikasi kendaraan', 'Hitung masuk/keluar'],
  road: ['Deteksi kendaraan', 'Lawan arah', 'ANPR'],
  loading: ['Durasi berhenti', 'Parkir liar', 'Objek tertinggal'],
  warehouse: ['Deteksi APD', 'Api & asap', 'Loitering'],
  parking: ['Okupansi parkir', 'ANPR', 'Durasi berhenti'],
  perimeter: ['Intrusi perimeter', 'Loitering', 'Panjat pagar'],
}

export const cameras: Camera[] = ZONES.map(([zone, scene, x, y, bearing], i) => {
  const r = seeded(`cam-${i}`)
  const no = i + 1
  const attention = no === 6 || no === 14
  const offline = no === 21
  const uptime = offline ? 0 : attention ? between(r, 71, 89) : between(r, 98.9, 99.99)
  return {
    id: `CAM-${String(no).padStart(2, '0')}`,
    no,
    name: `Cam ${String(no).padStart(2, '0')}`,
    zone,
    scene,
    state: offline ? 'offline' : attention ? 'attention' : 'online',
    uptime,
    note: offline
      ? 'Tidak merespons sejak 06:12 — tiket #204'
      : attention
        ? no === 6
          ? 'Sambungan putus berulang sejak 06:12'
          : 'Uptime 72,1% dalam 14 hari terakhir'
        : undefined,
    fps: offline ? 0 : Math.round(between(r, 12, 25)),
    bitrate: Number(between(r, 2.1, 6.4).toFixed(1)),
    resolution: r() > 0.6 ? '3840×2160' : '1920×1080',
    analytics: ANALYTICS_BY_SCENE[scene],
    x,
    y,
    bearing,
  } as Camera
})

export const cameraById = (id: string) => cameras.find((c) => c.id === id)

/* ---------------------------------------------------------------- vehicles */

export type VehicleStatus = 'normal' | 'overstay' | 'unverified' | 'left'

export type Sighting = {
  time: string
  cam: string
  zone: string
  event: string
  confidence: number | null
  kind: 'enter' | 'pass' | 'stop' | 'flag' | 'exit'
}

export type Vehicle = {
  plate: string
  type: string
  axles: number
  color: string
  tenant: string
  status: VehicleStatus
  enteredAt: string
  exitedAt?: string
  gateIn: string
  gateOut?: string
  zone: string
  cam: string
  dwellMinutes: number
  snapshots: number
  sightings: Sighting[]
  x: number
  y: number
}

const TENANTS = [
  'PT Nawasena Logistik',
  'Luxus Distribusi',
  'Dooglee Fulfilment',
  'Formosa Pack',
  'Bingxue Cold Chain',
  'Wallet Express',
  'Sentosa Metalworks',
]

const TYPES: Array<[string, number]> = [
  ['Truk kontainer', 2],
  ['Truk box', 2],
  ['Tronton', 3],
  ['Pikap', 2],
  ['Mobil penumpang', 2],
  ['Motor', 1],
]

const PLATES = [
  'B 1234 XYZ',
  'B 9142 TKN',
  'A 7781 KLM',
  'B 4419 SDK',
  'B 7702 MRA',
  'B 6318 PLN',
  'B 2210 QWE',
  'B 8890 HJK',
  'D 1145 RTU',
  'B 5527 NBV',
  'B 3061 ZAQ',
  'B 7734 LMP',
  'BE 2214 KOP',
  'B 9903 WSX',
  'B 1180 EDC',
]

export function toMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function fromMin(min: number) {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function makeSightings(plate: string, status: VehicleStatus, enter: string): Sighting[] {
  const r = seeded(`sight-${plate}`)
  const t0 = toMin(enter)
  const s: Sighting[] = [
    {
      time: fromMin(t0),
      cam: 'Cam 01',
      zone: 'Gerbang Utara',
      event: 'Masuk kawasan, plat nomor terbaca',
      confidence: Math.round(between(r, 94, 99)),
      kind: 'enter',
    },
    {
      time: fromMin(t0 + 6),
      cam: 'Cam 03',
      zone: 'Jalur utama',
      event: 'Melintas menuju blok gudang',
      confidence: Math.round(between(r, 91, 98)),
      kind: 'pass',
    },
    {
      time: fromMin(t0 + 11),
      cam: 'Cam 06',
      zone: 'Area Loading',
      event: 'Berhenti, hitung durasi dimulai',
      confidence: Math.round(between(r, 92, 98)),
      kind: 'stop',
    },
  ]
  if (status === 'overstay') {
    s.push({
      time: fromMin(t0 + 56),
      cam: 'Cam 06',
      zone: 'Area Loading',
      event: 'Melebihi batas berhenti 45 menit',
      confidence: null,
      kind: 'flag',
    })
  }
  if (status === 'left') {
    s.push({
      time: fromMin(t0 + 93),
      cam: 'Cam 12',
      zone: 'Gerbang Selatan',
      event: 'Keluar, perjalanan ditutup',
      confidence: Math.round(between(r, 93, 99)),
      kind: 'exit',
    })
  }
  return s
}

const VEHICLE_SPOTS: Array<[number, number]> = [
  [452, 424],
  [206, 176],
  [340, 300],
  [806, 214],
  [742, 452],
  [206, 470],
  [300, 300],
  [560, 190],
  [900, 300],
  [430, 490],
  [640, 300],
  [120, 300],
  [500, 130],
  [762, 486],
  [860, 452],
]

export const vehicles: Vehicle[] = PLATES.map((plate, i) => {
  const r = seeded(`veh-${plate}`)
  const [type, axles] = pick(r, TYPES)
  const status: VehicleStatus =
    i === 0 ? 'overstay' : i === 2 ? 'unverified' : i === 4 ? 'overstay' : i === 6 || i === 9 ? 'left' : 'normal'
  const enteredAt = fromMin(Math.round(between(r, 6 * 60 + 10, 9 * 60)))
  const sightings = makeSightings(plate, status, enteredAt)
  const last = sightings[sightings.length - 1]
  const [x, y] = VEHICLE_SPOTS[i]
  return {
    plate,
    type,
    axles,
    color: pick(r, ['Putih', 'Biru', 'Kuning', 'Merah', 'Abu-abu']),
    tenant: pick(r, TENANTS),
    status,
    enteredAt,
    exitedAt: status === 'left' ? last.time : undefined,
    gateIn: 'Gerbang Utara',
    gateOut: status === 'left' ? 'Gerbang Selatan' : undefined,
    zone: last.zone,
    cam: last.cam,
    dwellMinutes: toMin(last.time) - toMin(enteredAt),
    snapshots: sightings.length + 1,
    sightings,
    x,
    y,
  }
})

export const vehicleByPlate = (plate: string) =>
  vehicles.find((v) => v.plate.toLowerCase() === decodeURIComponent(plate).toLowerCase())

export const insideNow = vehicles.filter((v) => v.status !== 'left')

/* ------------------------------------------------------------------ alerts */

export type AlertRow = {
  id: string
  kind: string
  severity: 'high' | 'medium' | 'low'
  plate: string | null
  zone: string
  cam: string
  openedMinutes: number
  assignee: string | null
  post: string | null
  state: 'unassigned' | 'working' | 'closed'
}

export const alerts: AlertRow[] = [
  { id: 'ALR-4471', kind: 'Melebihi batas berhenti', severity: 'medium', plate: 'B 1234 XYZ', zone: 'Area Loading', cam: 'Cam 06', openedMinutes: 12, assignee: null, post: null, state: 'unassigned' },
  { id: 'ALR-4470', kind: 'Kendaraan belum terverifikasi', severity: 'low', plate: 'A 7781 KLM', zone: 'Gerbang Utara', cam: 'Cam 01', openedMinutes: 8, assignee: null, post: null, state: 'unassigned' },
  { id: 'ALR-4468', kind: 'Parkir di jalur utama', severity: 'medium', plate: 'B 4419 SDK', zone: 'Jalur utama', cam: 'Cam 03', openedMinutes: 21, assignee: 'Sujarwo', post: 'Pos 2', state: 'working' },
  { id: 'ALR-4465', kind: 'Melebihi batas berhenti', severity: 'medium', plate: 'B 7702 MRA', zone: 'Blok Gudang L', cam: 'Cam 09', openedMinutes: 34, assignee: 'Haryanto', post: 'Pos 3', state: 'working' },
  { id: 'ALR-4462', kind: 'Plat tidak terbaca', severity: 'low', plate: null, zone: 'Jalur utama', cam: 'Cam 05', openedMinutes: 41, assignee: 'Rahmat', post: 'Pos 1', state: 'working' },
  { id: 'ALR-4459', kind: 'Keluar tanpa catatan masuk', severity: 'high', plate: 'B 6318 PLN', zone: 'Gerbang Selatan', cam: 'Cam 12', openedMinutes: 52, assignee: null, post: null, state: 'unassigned' },
  { id: 'ALR-4455', kind: 'Kamera tidak merespons', severity: 'high', plate: null, zone: 'Gudang Sentosa', cam: 'Cam 21', openedMinutes: 64, assignee: 'Teknisi', post: 'tiket #204', state: 'working' },
  { id: 'ALR-4451', kind: 'Intrusi perimeter', severity: 'high', plate: null, zone: 'Pagar perimeter', cam: 'Cam 22', openedMinutes: 78, assignee: 'Sujarwo', post: 'Pos 2', state: 'working' },
]

export const closedToday = 12

/* --------------------------------------------------------------- audit log */

export type AuditRow = { time: string; actor: string; role: string; action: string }

export const auditLog: AuditRow[] = [
  { time: '09:31', actor: 'Andi Nugroho', role: 'Operator', action: 'Mencari plat B 1234 XYZ' },
  { time: '09:28', actor: 'Andi Nugroho', role: 'Operator', action: 'Mengekspor bukti B 1234 XYZ (4 snapshot)' },
  { time: '09:22', actor: 'Dewi Ratna', role: 'Supervisor', action: 'Menutup peringatan ALR-4468 — B 4419 SDK' },
  { time: '09:14', actor: 'Sistem', role: 'Otomatis', action: 'Cam 21 ditandai perlu perhatian' },
  { time: '09:02', actor: 'Rahmat Hidayat', role: 'Petugas', action: 'Menerima tugas ALR-4462 — Cam 05' },
  { time: '08:55', actor: 'Dewi Ratna', role: 'Supervisor', action: 'Mengubah batas berhenti Area Loading 60 → 45 menit' },
  { time: '08:41', actor: 'Andi Nugroho', role: 'Operator', action: 'Memutar ulang rekaman Cam 06 07:50–08:10' },
  { time: '08:30', actor: 'Sistem', role: 'Otomatis', action: 'Retensi harian dijalankan — 41 GB dibebaskan' },
  { time: '08:12', actor: 'Bagus Prakoso', role: 'Admin', action: 'Menambah pengguna baru: Sri Lestari (Petugas)' },
  { time: '07:58', actor: 'Sistem', role: 'Otomatis', action: 'Model ANPR v4.2 dimuat pada node GPU-02' },
  { time: '07:44', actor: 'Sujarwo', role: 'Petugas', action: 'Menutup ALR-4443 dengan foto bukti' },
  { time: '07:20', actor: 'Bagus Prakoso', role: 'Admin', action: 'Menambah Cam 24 ke zona Area Loading' },
]

export type UserRow = { name: string; role: string; access: string; lastSeen: string; state: 'aktif' | 'nonaktif' }

export const users: UserRow[] = [
  { name: 'Andi Nugroho', role: 'Operator', access: 'Peta, Kendaraan, Peringatan', lastSeen: 'Sekarang', state: 'aktif' },
  { name: 'Dewi Ratna', role: 'Supervisor', access: 'Semua kecuali Admin', lastSeen: '4 menit lalu', state: 'aktif' },
  { name: 'Bagus Prakoso', role: 'Admin', access: 'Penuh', lastSeen: '22 menit lalu', state: 'aktif' },
  { name: 'Rahmat Hidayat', role: 'Petugas lapangan', access: 'Aplikasi petugas', lastSeen: '29 menit lalu', state: 'aktif' },
  { name: 'Sujarwo', role: 'Petugas lapangan', access: 'Aplikasi petugas', lastSeen: '1 jam lalu', state: 'aktif' },
  { name: 'Haryanto', role: 'Petugas lapangan', access: 'Aplikasi petugas', lastSeen: '1 jam lalu', state: 'aktif' },
  { name: 'Sri Lestari', role: 'Petugas lapangan', access: 'Aplikasi petugas', lastSeen: 'Belum pernah', state: 'nonaktif' },
  { name: 'Auditor Internal', role: 'Pembaca', access: 'Audit & laporan', lastSeen: 'Kemarin', state: 'aktif' },
]

/* --------------------------------------------------------------- analytics */

export const hourlyTraffic = Array.from({ length: 24 }, (_, h) => {
  const r = seeded(`traffic-${h}`)
  const base = h < 5 ? 4 : h < 7 ? 26 : h < 10 ? 78 : h < 12 ? 62 : h < 14 ? 44 : h < 17 ? 71 : h < 20 ? 38 : 12
  return {
    hour: `${String(h).padStart(2, '0')}`,
    masuk: Math.round(base * between(r, 0.85, 1.15)),
    keluar: Math.round(base * between(r, 0.7, 1.05)),
  }
})

export const weeklyDwell = [
  { day: 'Sen', rerata: 38, terlama: 96 },
  { day: 'Sel', rerata: 42, terlama: 118 },
  { day: 'Rab', rerata: 35, terlama: 88 },
  { day: 'Kam', rerata: 47, terlama: 132 },
  { day: 'Jum', rerata: 51, terlama: 147 },
  { day: 'Sab', rerata: 29, terlama: 74 },
  { day: 'Min', rerata: 14, terlama: 41 },
]

export const alertMix = [
  { name: 'Melebihi batas', value: 148 },
  { name: 'Parkir di jalur', value: 96 },
  { name: 'Plat tidak terbaca', value: 61 },
  { name: 'Keluar tanpa izin', value: 24 },
  { name: 'Intrusi perimeter', value: 11 },
]

export const tenantTraffic = [
  { tenant: 'Nawasena Logistik', kendaraan: 214, rerata: 41 },
  { tenant: 'Luxus Distribusi', kendaraan: 187, rerata: 36 },
  { tenant: 'Dooglee Fulfilment', kendaraan: 143, rerata: 52 },
  { tenant: 'Bingxue Cold Chain', kendaraan: 118, rerata: 28 },
  { tenant: 'Formosa Pack', kendaraan: 92, rerata: 63 },
  { tenant: 'Wallet Express', kendaraan: 74, rerata: 22 },
]

export const retention = [
  { label: 'Gerbang (ANPR)', hari: 90, gb: 1420 },
  { label: 'Jalur utama', hari: 30, gb: 980 },
  { label: 'Area loading', hari: 30, gb: 1120 },
  { label: 'Blok gudang', hari: 14, gb: 640 },
  { label: 'Perimeter', hari: 14, gb: 410 },
  { label: 'Ruko & parkir', hari: 7, gb: 180 },
]

export const accuracy = [
  { label: 'Siang, cerah', anpr: 98.4, deteksi: 99.1 },
  { label: 'Siang, hujan', anpr: 94.2, deteksi: 97.6 },
  { label: 'Senja', anpr: 95.8, deteksi: 98.2 },
  { label: 'Malam, lampu gerbang', anpr: 93.1, deteksi: 96.9 },
  { label: 'Malam, jalur gelap', anpr: 86.7, deteksi: 94.3 },
]

export const uptimeSeries = Array.from({ length: 30 }, (_, d) => {
  const r = seeded(`up-${d}`)
  return { day: d + 1, uptime: Number(between(r, d === 19 ? 92 : 98.4, 100).toFixed(2)) }
})
