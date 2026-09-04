import { seeded, between } from './rng'
import { frames, formatPlate } from './frames'

export const ESTATE = {
  brand: 'Netra',
  product: 'Netra Command',
  estate: 'Bumi Sentosa Business Park',
  phase: 'Fase 1 — cluster Sentosa dan sekitarnya',
  operator: { name: 'Andi Nugroho', role: 'Operator', shift: 'Shift pagi', initials: 'AN' },
  clock: '09:31',
}

/* ------------------------------------------------------------------- zones */

export type ZoneKind = 'gate' | 'road' | 'loading' | 'warehouse' | 'parking' | 'perimeter'

export type Zone = {
  id: string
  name: string
  kind: ZoneKind
  /** parking or dock slots, where the zone has a countable capacity */
  capacity?: number
}

export const zones: Zone[] = [
  { id: 'GATE_N', name: 'Gerbang Utara', kind: 'gate' },
  { id: 'GATE_S', name: 'Gerbang Selatan', kind: 'gate' },
  { id: 'ROAD_MAIN', name: 'Jalur utama', kind: 'road' },
  { id: 'ROAD_W', name: 'Jalur barat', kind: 'road' },
  { id: 'ROAD_E', name: 'Jalur timur', kind: 'road' },
  { id: 'ROAD_N', name: 'Jalur utara', kind: 'road' },
  { id: 'DOCK', name: 'Area Loading', kind: 'loading', capacity: 8 },
  { id: 'WH_B', name: 'Blok Gudang B', kind: 'warehouse' },
  { id: 'WH_C', name: 'Blok Gudang C', kind: 'warehouse' },
  { id: 'WH_L', name: 'Blok Gudang L', kind: 'warehouse' },
  { id: 'WH_SENTOSA', name: 'Gudang Sentosa', kind: 'warehouse' },
  { id: 'PARK', name: 'Area parkir', kind: 'parking', capacity: 60 },
  { id: 'RUKO', name: 'Ruko Komersial', kind: 'parking', capacity: 40 },
  { id: 'FENCE', name: 'Pagar perimeter', kind: 'perimeter' },
]

export const zoneById = (id: string) => zones.find((z) => z.id === id)
export const zoneName = (id: string) => zoneById(id)?.name ?? id

/* ----------------------------------------------------------------- cameras */

export type CamState = 'online' | 'attention' | 'offline'
export type CamRole = 'entry' | 'exit' | 'internal'

export type Camera = {
  id: string
  no: number
  name: string
  zoneId: string
  zone: string
  kind: ZoneKind
  role: CamRole
  state: CamState
  uptime: number
  note?: string
  fps: number
  bitrate: number
  resolution: string
  analytics: string[]
  /** key into `frames` — a real still from the plate dataset */
  frame: string | null
  /** looping CCTV clip, where this camera ships motion instead of a still */
  clip: string | null
  /** position on the 1000x620 site plan */
  x: number
  y: number
  /** viewing direction in degrees, 0 = east */
  bearing: number
}

type CamSeed = [zoneId: string, role: CamRole, frame: string | null, x: number, y: number, bearing: number, clip?: string]

const CAM_SEEDS: CamSeed[] = [
  ['GATE_N', 'entry', 'train756', 340, 74, 90],
  ['GATE_N', 'entry', 'test034', 366, 100, 140, '/clips/gerbang-utara.mp4'],
  ['ROAD_MAIN', 'internal', 'train086', 250, 300, 0, '/clips/jalur-utama.mp4'],
  ['ROAD_MAIN', 'internal', 'train126', 470, 300, 180],
  ['ROAD_W', 'internal', 'train499', 46, 214, 20],
  ['DOCK', 'internal', 'test027', 452, 424, 250],
  ['DOCK', 'internal', 'train449', 530, 400, 290],
  ['WH_B', 'internal', 'train451', 178, 150, 20],
  ['WH_L', 'internal', 'train394', 742, 452, 200],
  ['WH_C', 'internal', 'train103', 430, 168, 340],
  ['WH_C', 'internal', 'train433', 512, 216, 300],
  ['GATE_S', 'exit', 'train263', 600, 556, 270],
  ['WH_L', 'internal', 'train123', 806, 400, 160],
  ['WH_SENTOSA', 'internal', 'test029', 782, 168, 210],
  ['WH_SENTOSA', 'internal', 'train553', 866, 214, 240],
  ['ROAD_E', 'internal', 'train089', 962, 320, 200, '/clips/simpang-timur.mp4'],
  ['ROAD_N', 'internal', 'train674', 612, 92, 200],
  ['ROAD_W', 'internal', 'val070', 46, 380, 20],
  ['PARK', 'internal', 'test054', 246, 504, 300],
  ['RUKO', 'internal', 'test073', 150, 396, 60],
  ['FENCE', 'internal', null, 40, 56, 35],
  ['FENCE', 'internal', 'train647', 960, 56, 145],
  ['FENCE', 'internal', 'train370', 960, 564, 215],
  ['DOCK', 'internal', 'train242', 400, 502, 210],
]

const ANALYTICS_BY_KIND: Record<ZoneKind, string[]> = {
  gate: ['ANPR', 'Klasifikasi kendaraan', 'Hitung masuk/keluar'],
  road: ['Deteksi kendaraan', 'ByteTrack', 'Re-ID embedding'],
  loading: ['Durasi berhenti', 'Parkir liar', 'Objek tertinggal'],
  warehouse: ['Deteksi APD', 'Api & asap', 'Loitering'],
  parking: ['Okupansi parkir', 'Re-ID embedding', 'Durasi berhenti'],
  perimeter: ['Intrusi perimeter', 'Loitering', 'Panjat pagar'],
}

export const cameras: Camera[] = CAM_SEEDS.map(([zoneId, role, frame, x, y, bearing, clip], i) => {
  const r = seeded(`cam-${i}`)
  const no = i + 1
  const attention = no === 6 || no === 14
  const offline = no === 21
  const z = zoneById(zoneId)!
  return {
    id: `CAM-${String(no).padStart(2, '0')}`,
    no,
    name: `Cam ${String(no).padStart(2, '0')}`,
    zoneId,
    zone: z.name,
    kind: z.kind,
    role,
    state: offline ? 'offline' : attention ? 'attention' : 'online',
    uptime: offline ? 0 : attention ? between(r, 71, 89) : between(r, 98.9, 99.99),
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
    analytics: ANALYTICS_BY_KIND[z.kind],
    frame,
    clip: clip ?? null,
    x,
    y,
    bearing,
  }
})

export const cameraById = (id: string) => cameras.find((c) => c.id === id)
/** Hops store camera ids ('CAM-03'); some UI still speaks display names ('Cam 03'). */
export const cameraFor = (ref: string) => cameras.find((c) => c.id === ref || c.name === ref)
export const camerasInZone = (zoneId: string) => cameras.filter((c) => c.zoneId === zoneId)

/* -------------------------------------------------------- camera topology */

/**
 * Which cameras a vehicle can plausibly reach next, and how long that takes.
 * Re-ID uses this as a hard filter: a match that would need a car to teleport
 * from the north gate to the east fence in four seconds is rejected before its
 * appearance score is ever considered.
 */
export type Edge = { from: string; to: string; seconds: [number, number] }

export const topology: Edge[] = [
  { from: 'CAM-01', to: 'CAM-02', seconds: [4, 20] },
  { from: 'CAM-02', to: 'CAM-03', seconds: [15, 70] },
  { from: 'CAM-02', to: 'CAM-17', seconds: [12, 55] },
  { from: 'CAM-03', to: 'CAM-04', seconds: [20, 90] },
  { from: 'CAM-03', to: 'CAM-05', seconds: [25, 110] },
  { from: 'CAM-03', to: 'CAM-08', seconds: [18, 80] },
  { from: 'CAM-04', to: 'CAM-06', seconds: [15, 75] },
  { from: 'CAM-04', to: 'CAM-10', seconds: [20, 85] },
  { from: 'CAM-04', to: 'CAM-16', seconds: [30, 130] },
  { from: 'CAM-06', to: 'CAM-07', seconds: [8, 40] },
  { from: 'CAM-06', to: 'CAM-24', seconds: [10, 45] },
  { from: 'CAM-07', to: 'CAM-12', seconds: [25, 120] },
  { from: 'CAM-16', to: 'CAM-09', seconds: [18, 80] },
  { from: 'CAM-09', to: 'CAM-13', seconds: [10, 50] },
  { from: 'CAM-17', to: 'CAM-14', seconds: [20, 95] },
  { from: 'CAM-14', to: 'CAM-15', seconds: [8, 35] },
  { from: 'CAM-05', to: 'CAM-18', seconds: [15, 70] },
  { from: 'CAM-18', to: 'CAM-19', seconds: [12, 60] },
  { from: 'CAM-19', to: 'CAM-20', seconds: [8, 40] },
  { from: 'CAM-24', to: 'CAM-12', seconds: [20, 95] },
]

export const neighboursOf = (camId: string) =>
  topology.filter((e) => e.from === camId || e.to === camId).map((e) => (e.from === camId ? e : { ...e, from: e.to, to: e.from }))

/* ---------------------------------------------------------------- vehicles */

export type VehicleStatus = 'INSIDE' | 'OUTSIDE'

/** how identity was established at a given sighting */
export type IdMethod = 'plate' | 'reid' | 'fusion'

export type Hop = {
  time: string
  cam: string
  zoneId: string
  event: string
  by: IdMethod
  /** OCR confidence, null when the plate was not readable at this angle */
  plateConf: number | null
  /** cosine similarity against the vehicle's stored embedding */
  reidSim: number | null
  /** fused identity confidence */
  confidence: number
  frame: string | null
}

export type Vehicle = {
  /** global id, stable across every camera */
  id: string
  plate: string
  plateRaw: string
  type: string
  make: string
  color: string
  /** short hash shown in place of the 512-d embedding */
  embedding: string
  tenant: string
  status: VehicleStatus
  flag: 'normal' | 'overstay' | 'unverified'
  enteredAt: string
  exitedAt?: string
  lastSeen: string
  /** seconds since the last sighting */
  ago: number
  zoneId: string
  cam: string
  gateIn: string
  gateOut?: string
  dwellMinutes: number
  snapshots: number
  hops: Hop[]
  /** frame that carries this vehicle's plate box */
  frame: string
  x: number
  y: number
}

type VehSeed = {
  frame: string
  make: string
  type: string
  color: string
  tenant: string
  flag?: Vehicle['flag']
  status?: VehicleStatus
  /** cam, zone, minutes after entry, what happened, how identity held — and the
   *  frame that actually shows this vehicle, when the dataset has one */
  route: Array<[cam: string, zoneId: string, minutes: number, event: string, by: IdMethod, frame?: string]>
  spot: [number, number]
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

export function toMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function fromMin(min: number) {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const VEH_SEEDS: VehSeed[] = [
  // three vehicles the dataset actually photographed more than once; their hops
  // point at those real frames, so the Re-ID gallery shows one car, not lookalikes
  {
    frame: 'train157',
    make: 'Honda Brio',
    type: 'Hatchback',
    color: 'Putih',
    tenant: TENANTS[3],
    flag: 'overstay',
    spot: [196, 506],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca penuh', 'plate', 'train157'],
      ['CAM-03', 'ROAD_MAIN', 7, 'Melintas jalur utama', 'fusion', 'train159'],
      ['CAM-05', 'ROAD_W', 11, 'Belok ke jalur barat', 'fusion', 'train158'],
      ['CAM-18', 'ROAD_W', 12, 'Tertutup rombongan motor, plat tidak terbaca', 'reid', 'train162'],
      ['CAM-19', 'PARK', 17, 'Parkir di area parkir, hitung durasi dimulai', 'fusion'],
      ['CAM-19', 'PARK', 64, 'Melebihi batas parkir 45 menit', 'reid'],
    ],
  },
  {
    frame: 'val087',
    make: 'Toyota Veloz',
    type: 'MPV',
    color: 'Hitam',
    tenant: TENANTS[0],
    spot: [470, 186],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate', 'val087'],
      ['CAM-03', 'ROAD_MAIN', 6, 'Melintas jalur utama', 'plate', 'train700'],
      ['CAM-04', 'ROAD_MAIN', 9, 'Menyalip di jalur utama', 'fusion', 'train701'],
      ['CAM-10', 'WH_C', 14, 'Menuju Blok Gudang C', 'reid', 'train703'],
      ['CAM-11', 'WH_C', 18, 'Parkir di Blok Gudang C', 'reid', 'train705'],
    ],
  },
  {
    frame: 'train306',
    make: 'Honda HR-V',
    type: 'SUV',
    color: 'Hitam',
    tenant: TENANTS[2],
    flag: 'unverified',
    spot: [136, 522],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate', 'train306'],
      ['CAM-03', 'ROAD_MAIN', 5, 'Melintas jalur utama, jarak jauh', 'reid', 'train305'],
      ['CAM-19', 'PARK', 12, 'Parkir malam di area parkir', 'fusion', 'train307'],
    ],
  },
  {
    frame: 'train785',
    make: 'Honda BR-V',
    type: 'SUV',
    color: 'Hitam',
    tenant: TENANTS[0],
    spot: [806, 214],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-17', 'ROAD_N', 8, 'Melintas jalur utara', 'fusion'],
      ['CAM-14', 'WH_SENTOSA', 19, 'Masuk Gudang Sentosa', 'plate'],
    ],
  },
  {
    frame: 'train086',
    make: 'Truk terpal',
    type: 'Truk',
    color: 'Putih',
    tenant: TENANTS[0],
    flag: 'overstay',
    spot: [742, 452],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-03', 'ROAD_MAIN', 9, 'Melintas jalur utama', 'plate'],
      ['CAM-16', 'ROAD_E', 21, 'Melintas jalur timur', 'reid'],
      ['CAM-09', 'WH_L', 34, 'Bongkar muat Blok Gudang L', 'fusion'],
      ['CAM-09', 'WH_L', 96, 'Melebihi batas berhenti 45 menit', 'reid'],
    ],
  },
  {
    frame: 'test098',
    make: 'Toyota Rush',
    type: 'SUV',
    color: 'Merah',
    tenant: TENANTS[5],
    spot: [258, 528],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-05', 'ROAD_W', 8, 'Melintas jalur barat', 'reid'],
      ['CAM-18', 'ROAD_W', 15, 'Melintas jalur barat', 'reid'],
      ['CAM-19', 'PARK', 22, 'Parkir di area parkir', 'fusion'],
    ],
  },
  {
    frame: 'train126',
    make: 'Truk box J&T',
    type: 'Truk box',
    color: 'Putih',
    tenant: TENANTS[2],
    status: 'OUTSIDE',
    spot: [300, 300],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-03', 'ROAD_MAIN', 7, 'Melintas jalur utama', 'plate'],
      ['CAM-06', 'DOCK', 13, 'Bongkar muat bay D1', 'fusion'],
      ['CAM-24', 'DOCK', 58, 'Meninggalkan area loading', 'reid'],
      ['CAM-12', 'GATE_S', 71, 'Keluar lewat Gerbang Selatan, perjalanan ditutup', 'plate'],
    ],
  },
  {
    frame: 'train767',
    make: 'Hyundai Stargazer',
    type: 'MPV',
    color: 'Hitam',
    tenant: TENANTS[3],
    spot: [560, 190],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-17', 'ROAD_N', 6, 'Melintas jalur utara', 'reid'],
      ['CAM-10', 'WH_C', 14, 'Parkir di Blok Gudang C', 'fusion'],
    ],
  },
  {
    frame: 'train123',
    make: 'Truk bak terbuka',
    type: 'Truk',
    color: 'Biru',
    tenant: TENANTS[6],
    spot: [900, 300],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-04', 'ROAD_MAIN', 10, 'Melintas jalur utama', 'fusion'],
      ['CAM-16', 'ROAD_E', 24, 'Melintas jalur timur', 'reid'],
    ],
  },
  {
    frame: 'train183',
    make: 'Suzuki Ignis',
    type: 'Hatchback',
    color: 'Oranye',
    tenant: TENANTS[5],
    status: 'OUTSIDE',
    spot: [430, 490],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-03', 'ROAD_MAIN', 5, 'Melintas jalur utama', 'plate'],
      ['CAM-19', 'PARK', 12, 'Parkir di area parkir', 'reid'],
      ['CAM-12', 'GATE_S', 84, 'Keluar lewat Gerbang Selatan, perjalanan ditutup', 'plate'],
    ],
  },
  {
    frame: 'train352',
    make: 'Honda Jazz',
    type: 'Hatchback',
    color: 'Krem',
    tenant: TENANTS[1],
    spot: [512, 244],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-04', 'ROAD_MAIN', 8, 'Melintas jalur utama', 'reid'],
      ['CAM-10', 'WH_C', 17, 'Menuju Blok Gudang C', 'fusion'],
    ],
  },
  {
    frame: 'train316',
    make: 'Toyota Avanza',
    type: 'MPV',
    color: 'Putih',
    tenant: TENANTS[3],
    spot: [138, 384],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-05', 'ROAD_W', 7, 'Melintas jalur barat', 'reid'],
      ['CAM-20', 'RUKO', 16, 'Parkir di Ruko Komersial', 'fusion'],
    ],
  },
  {
    frame: 'train346',
    make: 'Daihatsu Xenia',
    type: 'MPV',
    color: 'Silver',
    tenant: TENANTS[4],
    spot: [500, 130],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-17', 'ROAD_N', 5, 'Melintas jalur utara', 'plate'],
      ['CAM-11', 'WH_C', 13, 'Parkir di Blok Gudang C', 'reid'],
    ],
  },
  {
    frame: 'train499',
    make: 'Truk box',
    type: 'Truk box',
    color: 'Putih',
    tenant: TENANTS[6],
    spot: [762, 486],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-04', 'ROAD_MAIN', 11, 'Melintas jalur utama', 'fusion'],
      ['CAM-13', 'WH_L', 26, 'Bongkar muat Blok Gudang L', 'reid'],
    ],
  },
  {
    frame: 'train263',
    make: 'Daihatsu Sigra',
    type: 'MPV',
    color: 'Putih',
    tenant: TENANTS[2],
    spot: [860, 452],
    route: [
      ['CAM-01', 'GATE_N', 0, 'Masuk kawasan, plat terbaca', 'plate'],
      ['CAM-16', 'ROAD_E', 14, 'Melintas jalur timur', 'reid'],
      ['CAM-09', 'WH_L', 27, 'Parkir di Blok Gudang L', 'fusion'],
    ],
  },
]

const CONF_BY_METHOD: Record<IdMethod, [number, number]> = {
  plate: [96, 99.4],
  fusion: [93, 98],
  reid: [86, 95],
}

export const vehicles: Vehicle[] = VEH_SEEDS.map((s, i) => {
  const r = seeded(`veh-${s.frame}`)
  const f = frames[s.frame]
  const heroBox = f.boxes[f.hero] ?? f.boxes[0]
  const plateRaw = heroBox.text
  const start = Math.round(between(r, 6 * 60 + 20, 8 * 60 + 40))

  const hops: Hop[] = s.route.map(([cam, zoneId, minutes, event, by, hopFrame]) => {
    const rr = seeded(`hop-${s.frame}-${cam}-${minutes}`)
    const [lo, hi] = CONF_BY_METHOD[by]
    const camera = cameraFor(cam) ?? cameras.find((c) => c.id === cam)
    return {
      time: fromMin(start + minutes),
      cam,
      zoneId,
      event,
      by,
      plateConf: by === 'reid' ? null : Math.round(between(rr, 92, 99)),
      reidSim: by === 'plate' ? null : Number(between(rr, 0.83, 0.97).toFixed(3)),
      confidence: Number(between(rr, lo, hi).toFixed(1)),
      frame: hopFrame ?? camera?.frame ?? null,
    }
  })

  const last = hops[hops.length - 1]
  const status: VehicleStatus = s.status ?? 'INSIDE'

  return {
    id: `VHC-${String(i + 1).padStart(4, '0')}`,
    plate: formatPlate(plateRaw),
    plateRaw,
    type: s.type,
    make: s.make,
    color: s.color,
    embedding: `#${Math.floor(r() * 0xffff)
      .toString(16)
      .padStart(4, '0')}`,
    tenant: s.tenant,
    status,
    flag: s.flag ?? 'normal',
    enteredAt: hops[0].time,
    exitedAt: status === 'OUTSIDE' ? last.time : undefined,
    lastSeen: last.time,
    ago: Math.round(between(r, 4, 240)),
    zoneId: last.zoneId,
    cam: last.cam,
    gateIn: 'Gerbang Utara',
    gateOut: status === 'OUTSIDE' ? 'Gerbang Selatan' : undefined,
    dwellMinutes: toMin(last.time) - toMin(hops[0].time),
    snapshots: hops.length + 1,
    hops,
    frame: s.frame,
    x: s.spot[0],
    y: s.spot[1],
  }
})

export const vehicleById = (id: string) => vehicles.find((v) => v.id === id)
export const vehicleByPlate = (plate: string) => {
  const needle = decodeURIComponent(plate).toLowerCase().replace(/\s+/g, '')
  return vehicles.find((v) => v.plate.toLowerCase().replace(/\s+/g, '') === needle || v.id.toLowerCase() === needle)
}

export const insideNow = vehicles.filter((v) => v.status === 'INSIDE')

export const zoneOccupancy = zones
  .map((z) => ({ zone: z, count: insideNow.filter((v) => v.zoneId === z.id).length }))
  .filter((z) => z.count > 0)
  .sort((a, b) => b.count - a.count)

/* ------------------------------------------------- the re-ID worked example */

/**
 * The hand-off the demo walks through: a readable plate at the gate, then the
 * same vehicle seen from the side where the plate is not in frame at all.
 */
export const reidExample = {
  vehicle: vehicles[0],
  a: { cam: 'CAM-05', frame: 'train158', time: '07:41:06', plateConf: 96, note: 'Plat terbaca penuh' },
  b: { cam: 'CAM-18', frame: 'train162', time: '07:41:48', plateConf: null, note: 'Tertutup rombongan motor, plat terlalu jauh' },
  gapSeconds: 42,
  signals: [
    { label: 'Kemiripan embedding Re-ID', value: 0.94, weight: 0.42, detail: 'cosine similarity, OSNet 512-d' },
    { label: 'Warna kendaraan', value: 0.98, weight: 0.12, detail: 'putih ↔ putih' },
    { label: 'Tipe kendaraan', value: 0.99, weight: 0.14, detail: 'hatchback ↔ hatchback' },
    { label: 'Transisi kamera sah', value: 1.0, weight: 0.18, detail: 'CAM-05 → CAM-18 ada di topologi' },
    { label: 'Waktu tempuh masuk akal', value: 0.91, weight: 0.14, detail: '42 dtk, rentang wajar 15–70 dtk' },
  ],
  verdict: 96.2,
}

/* ------------------------------------------------------------------ alerts */

export type AlertRow = {
  id: string
  kind: string
  severity: 'high' | 'medium' | 'low'
  plate: string | null
  vehicleId: string | null
  zoneId: string
  cam: string
  openedMinutes: number
  assignee: string | null
  post: string | null
  state: 'unassigned' | 'working' | 'closed'
}

export const alerts: AlertRow[] = [
  { id: 'ALR-4471', kind: 'Melebihi batas berhenti', severity: 'medium', plate: vehicles[0].plate, vehicleId: vehicles[0].id, zoneId: 'PARK', cam: 'Cam 19', openedMinutes: 12, assignee: null, post: null, state: 'unassigned' },
  { id: 'ALR-4470', kind: 'Kendaraan belum terverifikasi', severity: 'low', plate: vehicles[2].plate, vehicleId: vehicles[2].id, zoneId: 'GATE_N', cam: 'Cam 01', openedMinutes: 8, assignee: null, post: null, state: 'unassigned' },
  { id: 'ALR-4468', kind: 'Identitas ganda perlu ditinjau', severity: 'medium', plate: vehicles[5].plate, vehicleId: vehicles[5].id, zoneId: 'ROAD_W', cam: 'Cam 18', openedMinutes: 21, assignee: 'Sujarwo', post: 'Pos 2', state: 'working' },
  { id: 'ALR-4465', kind: 'Melebihi batas berhenti', severity: 'medium', plate: vehicles[4].plate, vehicleId: vehicles[4].id, zoneId: 'WH_L', cam: 'Cam 09', openedMinutes: 34, assignee: 'Haryanto', post: 'Pos 3', state: 'working' },
  { id: 'ALR-4462', kind: 'Plat tidak terbaca, dilanjutkan Re-ID', severity: 'low', plate: null, vehicleId: vehicles[2].id, zoneId: 'ROAD_MAIN', cam: 'Cam 03', openedMinutes: 41, assignee: 'Rahmat', post: 'Pos 1', state: 'working' },
  { id: 'ALR-4459', kind: 'Keluar tanpa catatan masuk', severity: 'high', plate: vehicles[9].plate, vehicleId: vehicles[9].id, zoneId: 'GATE_S', cam: 'Cam 12', openedMinutes: 52, assignee: null, post: null, state: 'unassigned' },
  { id: 'ALR-4455', kind: 'Kamera tidak merespons', severity: 'high', plate: null, vehicleId: null, zoneId: 'FENCE', cam: 'Cam 21', openedMinutes: 64, assignee: 'Teknisi', post: 'tiket #204', state: 'working' },
  { id: 'ALR-4451', kind: 'Intrusi perimeter', severity: 'high', plate: null, vehicleId: null, zoneId: 'FENCE', cam: 'Cam 22', openedMinutes: 78, assignee: 'Sujarwo', post: 'Pos 2', state: 'working' },
]

export const closedToday = 12

/* --------------------------------------------------------------- audit log */

export type AuditRow = { time: string; actor: string; role: string; action: string }

export const auditLog: AuditRow[] = [
  { time: '09:31', actor: 'Andi Nugroho', role: 'Operator', action: `Mencari plat ${vehicles[0].plate}` },
  { time: '09:28', actor: 'Andi Nugroho', role: 'Operator', action: `Mengekspor bukti ${vehicles[0].id} (5 snapshot)` },
  { time: '09:22', actor: 'Dewi Ratna', role: 'Supervisor', action: 'Menyetujui penggabungan identitas VHC-0003 ← kandidat Re-ID' },
  { time: '09:14', actor: 'Sistem', role: 'Otomatis', action: 'Cam 21 ditandai perlu perhatian' },
  { time: '09:02', actor: 'Rahmat Hidayat', role: 'Petugas', action: 'Menerima tugas ALR-4462 — Cam 03' },
  { time: '08:55', actor: 'Dewi Ratna', role: 'Supervisor', action: 'Mengubah batas berhenti Area Loading 60 → 45 menit' },
  { time: '08:41', actor: 'Andi Nugroho', role: 'Operator', action: 'Memutar ulang rekaman Cam 06 07:50–08:10' },
  { time: '08:30', actor: 'Sistem', role: 'Otomatis', action: 'Retensi harian dijalankan — 41 GB dibebaskan' },
  { time: '08:22', actor: 'Sistem', role: 'Otomatis', action: 'Re-ID menyambung VHC-0001 lintas CAM-03 → CAM-04 (0,94)' },
  { time: '08:12', actor: 'Bagus Prakoso', role: 'Admin', action: 'Menambah pengguna baru: Sri Lestari (Petugas)' },
  { time: '07:58', actor: 'Sistem', role: 'Otomatis', action: 'Model Re-ID OSNet v2.1 dimuat pada node GPU-02' },
  { time: '07:44', actor: 'Sujarwo', role: 'Petugas', action: 'Menutup ALR-4443 dengan foto bukti' },
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
  { label: 'Siang, cerah', anpr: 98.4, fusion: 99.3 },
  { label: 'Siang, hujan', anpr: 94.2, fusion: 98.1 },
  { label: 'Senja', anpr: 95.8, fusion: 98.7 },
  { label: 'Malam, lampu gerbang', anpr: 93.1, fusion: 97.4 },
  { label: 'Malam, jalur gelap', anpr: 86.7, fusion: 95.2 },
  { label: 'Sudut samping, plat tertutup', anpr: 41.5, fusion: 92.8 },
]

/** how each hop in today's journeys was resolved */
export const idMethodMix = (() => {
  const all = vehicles.flatMap((v) => v.hops)
  const count = (m: IdMethod) => all.filter((h) => h.by === m).length
  return [
    { name: 'Plat terbaca', value: count('plate') },
    { name: 'Plat + Re-ID', value: count('fusion') },
    { name: 'Re-ID saja', value: count('reid') },
  ]
})()

export const uptimeSeries = Array.from({ length: 30 }, (_, d) => {
  const r = seeded(`up-${d}`)
  return { day: d + 1, uptime: Number(between(r, d === 19 ? 92 : 98.4, 100).toFixed(2)) }
})

export { formatPlate }

/** the procedural scene component still speaks in the old vocabulary */
export type SceneKind = ZoneKind
