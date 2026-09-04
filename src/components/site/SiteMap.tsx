import { useState } from 'react'
import { cameras, vehicles, cameraFor, vehicleByPlate, zoneById, type Vehicle } from '../../lib/data'
import { cn } from '../../lib/cn'

/**
 * The estate in two projections that share one coordinate system.
 *
 *   plan  straight overhead, for reading positions precisely
 *   iso   the same geometry extruded, for reading the place at a glance
 *
 * Plan coordinates are 1000 × 620. Blocks, roads, cameras and vehicles are all
 * authored once in that space and projected on the way out, so the two views
 * can never drift apart.
 */

type Block = {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  /** extrusion height, isometric view only */
  z: number
}

const BLOCKS: Block[] = [
  { id: 'WH_B', x: 64, y: 112, w: 236, h: 156, label: 'Blok Gudang B', sub: '18 unit', z: 46 },
  { id: 'WH_C', x: 376, y: 112, w: 188, h: 156, label: 'Blok Gudang C', sub: '12 unit', z: 40 },
  { id: 'WH_SENTOSA', x: 636, y: 112, w: 316, h: 156, label: 'Gudang Sentosa', sub: '9 unit besar', z: 62 },
  { id: 'RUKO', x: 64, y: 332, w: 236, h: 118, label: 'Ruko Komersial', sub: '32 unit', z: 34 },
  { id: 'PARK', x: 64, y: 466, w: 236, h: 78, label: 'Area Parkir', sub: 'apron terbuka', z: 5 },
  { id: 'DOCK', x: 376, y: 332, w: 188, h: 212, label: 'Area Loading', sub: 'batas 45 menit', z: 22 },
  { id: 'WH_L', x: 636, y: 332, w: 316, h: 212, label: 'Blok Gudang L', sub: '14 unit', z: 52 },
]

const ROADS = [
  { x: 24, y: 288, w: 952, h: 24 },
  { x: 328, y: 34, w: 24, h: 552 },
  { x: 588, y: 34, w: 24, h: 552 },
]

const FLAG_TONE: Record<Vehicle['flag'], string> = {
  normal: 'var(--color-azure)',
  overstay: 'var(--color-warn)',
  unverified: 'var(--color-faint)',
}

/* --------------------------------------------------------------- geometry */

const COS30 = 0.8660254
const OX = 560
const OY = 46

type P = [number, number]

const isoAt = (x: number, y: number, z = 0): P => [(x - y) * COS30 + OX, (x + y) * 0.5 - z + OY]
const planAt = (x: number, y: number, _z = 0): P => [x, y]

const lineProps = (a: P, b: P) => ({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] })

const poly = (pts: P[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

/* ------------------------------------------------------------------ props */

export type MapView = 'plan' | 'iso'

type Props = {
  selected?: string | null
  onSelect?: (plate: string) => void
  filter?: 'all' | 'truck' | 'overstay'
  view?: MapView
  showRoute?: boolean
  /** draw every camera's field of view, not just the hovered one */
  showCones?: boolean
  /** label every vehicle, not only the selected one */
  showPlates?: boolean
  className?: string
  compact?: boolean
}

export function SiteMap({
  selected,
  onSelect,
  filter = 'all',
  view = 'plan',
  showRoute = true,
  showCones = false,
  showPlates = false,
  className,
  compact = false,
}: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const isIso = view === 'iso'
  const at = isIso ? isoAt : planAt

  const shown = vehicles
    .filter((v) => v.status === 'INSIDE')
    .filter((v) => (filter === 'all' ? true : filter === 'truck' ? v.type.includes('Truk') : v.flag === 'overstay'))

  const route: P[] = selected
    ? (vehicleByPlate(selected)?.hops ?? [])
        .map((h) => cameraFor(h.cam))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .filter((c, i, a) => i === 0 || c.id !== a[i - 1].id)
        .map((c) => at(c.x, c.y, isIso ? 16 : 0))
    : []

  const occupancy = (zoneId: string) => shown.filter((v) => v.zoneId === zoneId).length

  // painter's algorithm: far blocks first
  const ordered = isIso ? [...BLOCKS].sort((a, b) => a.x + a.y - (b.x + b.y)) : BLOCKS

  return (
    <svg
      viewBox={isIso ? '0 0 1440 880' : '0 0 1000 620'}
      className={cn('h-full w-full', className)}
      role="img"
      aria-label="Denah kawasan dengan posisi kamera dan kendaraan"
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="roofFill" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="hsl(217 26% 21%)" />
          <stop offset="100%" stopColor="hsl(217 28% 14%)" />
        </linearGradient>
        <linearGradient id="planFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(217 26% 13%)" />
          <stop offset="100%" stopColor="hsl(217 28% 10%)" />
        </linearGradient>
        <radialGradient id="coneFill">
          <stop offset="0%" stopColor="hsl(188 92% 56%)" stopOpacity="0.36" />
          <stop offset="100%" stopColor="hsl(188 92% 56%)" stopOpacity="0" />
        </radialGradient>
        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="hsl(0 0% 100% / 0.035)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ground */}
      {isIso ? (
        <>
          {/* the land keeps going past the fence, so the frame does not read as
              a diamond floating in a void */}
          <polygon
            points={poly([isoAt(-500, -500), isoAt(1500, -500), isoAt(1500, 1200), isoAt(-500, 1200)])}
            fill="hsl(222 40% 6%)"
          />
          <g stroke="hsl(205 100% 80% / 0.045)" strokeWidth="1">
            {Array.from({ length: 21 }, (_, i) => -500 + i * 100).map((x) => (
              <line key={`vx-${x}`} {...lineProps(isoAt(x, -500), isoAt(x, 1200))} />
            ))}
            {Array.from({ length: 18 }, (_, i) => -500 + i * 100).map((y) => (
              <line key={`vy-${y}`} {...lineProps(isoAt(-500, y), isoAt(1500, y))} />
            ))}
          </g>
          <polygon
            points={poly([isoAt(24, 34), isoAt(976, 34), isoAt(976, 586), isoAt(24, 586)])}
            fill="hsl(220 34% 10%)"
            stroke="hsl(217 30% 34%)"
            strokeWidth="1.5"
            strokeDasharray="9 8"
          />
        </>
      ) : (
        <>
          <rect width="1000" height="620" fill="url(#mapGrid)" />
          <rect
            x="24"
            y="34"
            width="952"
            height="552"
            rx="10"
            fill="none"
            stroke="hsl(217 22% 26%)"
            strokeWidth="1.5"
            strokeDasharray="8 7"
          />
        </>
      )}

      {/* roads */}
      {ROADS.map((r, i) => (
        <polygon
          key={i}
          points={poly([at(r.x, r.y), at(r.x + r.w, r.y), at(r.x + r.w, r.y + r.h), at(r.x, r.y + r.h)])}
          fill="hsl(217 20% 15%)"
        />
      ))}
      <g stroke="hsl(217 18% 32%)" strokeWidth={isIso ? 2 : 1.5} strokeDasharray="10 12" fill="none">
        <polyline points={poly([at(24, 300), at(976, 300)])} />
        <polyline points={poly([at(340, 34), at(340, 586)])} />
        <polyline points={poly([at(600, 34), at(600, 586)])} />
      </g>

      {/* blocks */}
      {ordered.map((b) => {
        const n = occupancy(b.id)
        const cap = zoneById(b.id)?.capacity
        const top: P[] = [
          at(b.x, b.y, b.z),
          at(b.x + b.w, b.y, b.z),
          at(b.x + b.w, b.y + b.h, b.z),
          at(b.x, b.y + b.h, b.z),
        ]
        const anchor: P = isIso ? isoAt(b.x + b.w / 2, b.y + b.h / 2, b.z) : [b.x + 14, b.y + b.h - 24]
        const mid = isIso ? 'middle' : 'start'

        return (
          <g key={b.id}>
            {isIso && (
              <>
                <polygon
                  points={poly([
                    isoAt(b.x + b.w, b.y),
                    isoAt(b.x + b.w, b.y + b.h),
                    isoAt(b.x + b.w, b.y + b.h, b.z),
                    isoAt(b.x + b.w, b.y, b.z),
                  ])}
                  fill="hsl(217 30% 11%)"
                />
                <polygon
                  points={poly([
                    isoAt(b.x, b.y + b.h),
                    isoAt(b.x + b.w, b.y + b.h),
                    isoAt(b.x + b.w, b.y + b.h, b.z),
                    isoAt(b.x, b.y + b.h, b.z),
                  ])}
                  fill="hsl(217 28% 8%)"
                />
              </>
            )}
            <polygon
              points={poly(top)}
              fill={isIso ? 'url(#roofFill)' : 'url(#planFill)'}
              stroke="hsl(217 22% 24%)"
              strokeWidth="1"
            />

            <g transform={`translate(${anchor[0]} ${anchor[1]})`}>
              <text y="0" textAnchor={mid} fill="hsl(213 20% 82%)" fontSize="15" fontWeight="600">
                {b.label}
              </text>
              {!compact && b.sub && (
                <text y="16" textAnchor={mid} fill="hsl(215 12% 52%)" fontSize="11" fontFamily="var(--font-mono)">
                  {b.sub}
                </text>
              )}
              {n > 0 && (
                <g transform={`translate(${isIso ? (cap ? -31 : -20) : 0} ${compact ? 10 : 26})`}>
                  <rect
                    width={cap ? 62 : 40}
                    height="20"
                    rx="5"
                    fill="hsl(217 91% 58% / 0.16)"
                    stroke="hsl(217 91% 58% / 0.5)"
                    strokeWidth="1"
                  />
                  <text x={cap ? 31 : 20} y="14" textAnchor="middle" fill="hsl(205 95% 82%)" fontSize="12" fontFamily="var(--font-mono)">
                    {cap ? `${n}/${cap}` : n}
                  </text>
                </g>
              )}
            </g>
          </g>
        )
      })}

      {/* gates */}
      {[
        { x: 340, y: 59, label: 'Gerbang Utara', dy: -18 },
        { x: 600, y: 565, label: 'Gerbang Selatan', dy: 32 },
      ].map((g) => {
        const z = isIso ? 10 : 0
        const p = at(g.x, g.y, z)
        return (
          <g key={g.label}>
            <polygon
              points={poly([
                at(g.x - 30, g.y - 7, z),
                at(g.x + 30, g.y - 7, z),
                at(g.x + 30, g.y + 7, z),
                at(g.x - 30, g.y + 7, z),
              ])}
              fill="hsl(217 62% 42%)"
            />
            <text x={p[0]} y={p[1] + g.dy} fill="hsl(213 18% 78%)" fontSize="13" textAnchor="middle">
              {g.label}
            </text>
          </g>
        )
      })}

      {/* camera coverage — drawn only when asked for, or on hover */}
      {cameras.map((c) => {
        if (c.state === 'offline') return null
        if (!showCones && hover !== c.id) return null
        const a = (c.bearing * Math.PI) / 180
        const spread = 0.42
        const reach = 108
        const pts: P[] = [at(c.x, c.y)]
        for (let t = -spread; t <= spread + 0.001; t += spread / 6) {
          pts.push(at(c.x + Math.cos(a + t) * reach, c.y + Math.sin(a + t) * reach))
        }
        return <polygon key={`cone-${c.id}`} points={poly(pts)} fill="url(#coneFill)" />
      })}

      {/* the route the selected vehicle took, numbered in order */}
      {showRoute && route.length > 1 && (
        <>
          <polyline
            points={poly(route)}
            fill="none"
            stroke="var(--color-scan)"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'nt-track 3.2s linear infinite' }}
          />
          {route.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="9.5" fill="hsl(222 42% 5%)" stroke="var(--color-scan)" strokeWidth="2" />
              <text
                x={p[0]}
                y={p[1] + 4}
                fill="var(--color-scan)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </>
      )}

      {/* cameras */}
      {cameras.map((c) => {
        const p = at(c.x, c.y, isIso ? 24 : 0)
        const ground = at(c.x, c.y)
        const tone =
          c.state === 'offline'
            ? 'var(--color-alarm)'
            : c.state === 'attention'
              ? 'var(--color-warn)'
              : c.role === 'entry'
                ? 'var(--color-ok)'
                : c.role === 'exit'
                  ? 'var(--color-warn)'
                  : 'var(--color-scan)'
        return (
          <g key={c.id} onMouseEnter={() => setHover(c.id)}>
            {isIso && (
              <>
                <ellipse cx={ground[0]} cy={ground[1]} rx="6" ry="3" fill="hsl(222 42% 4% / 0.6)" />
                <line x1={ground[0]} y1={ground[1]} x2={p[0]} y2={p[1]} stroke="hsl(217 22% 32%)" strokeWidth="2" />
              </>
            )}
            <rect
              x={p[0] - 5}
              y={p[1] - 5}
              width="10"
              height="10"
              rx="1.5"
              transform={`rotate(45 ${p[0]} ${p[1]})`}
              fill="hsl(222 42% 6%)"
              stroke={tone}
              strokeWidth="2.5"
            />
            {c.state === 'offline' && (
              <circle cx={p[0]} cy={p[1]} r="12" fill="none" stroke="var(--color-alarm)" strokeWidth="1.5" opacity="0.55" />
            )}
            {!compact && (showCones || hover === c.id) && (
              <text
                x={p[0]}
                y={p[1] - 13}
                fill={hover === c.id ? 'hsl(205 95% 82%)' : 'hsl(215 12% 58%)'}
                fontSize="12"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {c.id.replace('CAM-', 'C')}
              </text>
            )}
            <circle cx={p[0]} cy={p[1]} r="18" fill="transparent" />
          </g>
        )
      })}

      {/* vehicles */}
      {shown.map((v) => {
        const active = v.plate === selected
        const tone = FLAG_TONE[v.flag]
        const big = v.type.includes('Truk')
        const ground = at(v.x, v.y)
        const p = at(v.x, v.y, isIso ? 12 : 0)

        return (
          <g
            key={v.plate}
            className={onSelect ? 'cursor-pointer' : undefined}
            onClick={() => onSelect?.(v.plate)}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onKeyDown={(e) => {
              if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onSelect(v.plate)
              }
            }}
          >
            {isIso && (
              <ellipse cx={ground[0]} cy={ground[1]} rx={big ? 11 : 8} ry={big ? 5 : 4} fill="hsl(222 42% 4% / 0.55)" />
            )}
            {active && (
              <circle
                cx={p[0]}
                cy={p[1]}
                r={big ? 14 : 12}
                fill="none"
                stroke={tone}
                strokeWidth="2"
                style={{ animation: 'nt-ping 2s ease-out infinite' }}
              />
            )}
            {big ? (
              <rect
                x={p[0] - 9}
                y={p[1] - 6.5}
                width="18"
                height="13"
                rx="2.5"
                fill={tone}
                stroke="hsl(222 42% 5%)"
                strokeWidth="2"
              />
            ) : (
              <circle cx={p[0]} cy={p[1]} r={active ? 8.5 : 7} fill={tone} stroke="hsl(222 42% 5%)" strokeWidth="2" />
            )}

            {(active || showPlates) && (
              <g transform={`translate(${p[0] + 12} ${p[1] - 11})`}>
                <rect
                  width={v.plate.length * 8.6 + 14}
                  height="22"
                  rx="5"
                  fill="hsl(222 42% 5% / 0.9)"
                  stroke={active ? tone : 'hsl(217 22% 26%)'}
                  strokeWidth="1"
                />
                <text
                  x="7"
                  y="15.5"
                  fill={active ? '#fff' : 'hsl(217 20% 84%)'}
                  fontSize="13"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.5"
                >
                  {v.plate}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* scale */}
      {!compact && !isIso && (
        <g transform="translate(842 566)">
          <line x1="0" y1="0" x2="94" y2="0" stroke="hsl(217 12% 60%)" strokeWidth="1.5" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="hsl(217 12% 60%)" strokeWidth="1.5" />
          <line x1="94" y1="-4" x2="94" y2="4" stroke="hsl(217 12% 60%)" strokeWidth="1.5" />
          <text x="47" y="-8" fill="hsl(217 10% 60%)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
            100 m
          </text>
        </g>
      )}
    </svg>
  )
}
