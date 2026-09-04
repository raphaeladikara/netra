import { cameras, vehicles, type Vehicle } from '../../lib/data'
import { cn } from '../../lib/cn'

const BLOCKS: Array<{ x: number; y: number; w: number; h: number; label: string; sub?: string }> = [
  { x: 64, y: 112, w: 236, h: 156, label: 'Blok Gudang B', sub: '18 unit' },
  { x: 376, y: 112, w: 188, h: 156, label: 'Blok Gudang C', sub: '12 unit' },
  { x: 636, y: 112, w: 316, h: 156, label: 'Gudang Sentosa', sub: '9 unit besar' },
  { x: 64, y: 332, w: 236, h: 212, label: 'Ruko Komersial', sub: '32 unit' },
  { x: 376, y: 332, w: 188, h: 212, label: 'Area Loading', sub: 'batas 45 menit' },
  { x: 636, y: 332, w: 316, h: 212, label: 'Blok Gudang L', sub: '14 unit' },
]

const STATUS_TONE: Record<Vehicle['status'], string> = {
  normal: 'var(--color-azure)',
  overstay: 'var(--color-warn)',
  unverified: 'var(--color-faint)',
  left: 'var(--color-ok)',
}

type Props = {
  selected?: string | null
  onSelect?: (plate: string) => void
  filter?: 'all' | 'truck' | 'overstay'
  showRoute?: boolean
  className?: string
  compact?: boolean
}

/** The route Cam 01 → Cam 03 → Cam 06 that the demo vehicle actually takes. */
const ROUTE = 'M340 74 L340 300 L452 300 L452 424'

export function SiteMap({ selected, onSelect, filter = 'all', showRoute = true, className, compact = false }: Props) {
  const shown = vehicles
    .filter((v) => v.status !== 'left')
    .filter((v) =>
      filter === 'all' ? true : filter === 'truck' ? v.type.includes('Truk') || v.type === 'Tronton' : v.status === 'overstay',
    )

  return (
    <svg viewBox="0 0 1000 620" className={cn('h-full w-full', className)} role="img" aria-label="Denah kawasan dengan posisi kamera dan kendaraan">
      <defs>
        <linearGradient id="blockFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(217 26% 13%)" />
          <stop offset="100%" stopColor="hsl(217 28% 10%)" />
        </linearGradient>
        <radialGradient id="coneFill">
          <stop offset="0%" stopColor="hsl(188 92% 56%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(188 92% 56%)" stopOpacity="0" />
        </radialGradient>
        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke="hsl(0 0% 100% / 0.035)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="1000" height="620" fill="url(#mapGrid)" />

      {/* estate boundary */}
      <rect x="24" y="34" width="952" height="552" rx="10" fill="none" stroke="hsl(217 22% 26%)" strokeWidth="1.5" strokeDasharray="8 7" />

      {/* roads */}
      <g fill="hsl(217 20% 15%)">
        <rect x="24" y="288" width="952" height="24" />
        <rect x="328" y="34" width="24" height="552" />
        <rect x="588" y="34" width="24" height="552" />
      </g>
      <g stroke="hsl(217 18% 30%)" strokeWidth="1.5" strokeDasharray="10 12">
        <line x1="24" y1="300" x2="976" y2="300" />
        <line x1="340" y1="34" x2="340" y2="586" />
        <line x1="600" y1="34" x2="600" y2="586" />
      </g>

      {/* blocks */}
      {BLOCKS.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="6" fill="url(#blockFill)" stroke="hsl(217 22% 21%)" strokeWidth="1" />
          <text x={b.x + 14} y={b.y + b.h - 20} fill="hsl(217 12% 70%)" fontSize="14" fontWeight="500">
            {b.label}
          </text>
          {!compact && b.sub && (
            <text x={b.x + 14} y={b.y + b.h - 6} fill="hsl(217 10% 46%)" fontSize="11" fontFamily="var(--font-mono)">
              {b.sub}
            </text>
          )}
        </g>
      ))}

      {/* gates */}
      <g>
        <rect x="310" y="52" width="60" height="14" rx="3" fill="hsl(217 55% 32%)" />
        <text x="340" y="44" fill="hsl(217 14% 76%)" fontSize="12" textAnchor="middle">Gerbang Utara</text>
        <rect x="570" y="558" width="60" height="14" rx="3" fill="hsl(217 55% 32%)" />
        <text x="600" y="596" fill="hsl(217 14% 76%)" fontSize="12" textAnchor="middle">Gerbang Selatan</text>
      </g>

      {/* camera cones + markers */}
      {cameras.map((c) => (
        <g key={c.id} opacity={c.state === 'offline' ? 0.35 : 1}>
          <g transform={`translate(${c.x} ${c.y}) rotate(${c.bearing})`}>
            <path d="M0 0 L72 -26 A78 78 0 0 1 72 26 Z" fill="url(#coneFill)" />
          </g>
          <circle cx={c.x} cy={c.y} r="5" fill="hsl(222 42% 5%)" stroke={c.state === 'offline' ? 'var(--color-alarm)' : c.state === 'attention' ? 'var(--color-warn)' : 'var(--color-scan)'} strokeWidth="2" />
          {!compact && (
            <text x={c.x} y={c.y - 12} fill="hsl(217 10% 52%)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" className="max-lg:hidden">
              {c.name}
            </text>
          )}
        </g>
      ))}

      {/* traced route of the selected vehicle */}
      {showRoute && selected === 'B 1234 XYZ' && (
        <path
          d={ROUTE}
          fill="none"
          stroke="var(--color-scan)"
          strokeWidth="2.5"
          strokeDasharray="7 7"
          strokeLinecap="round"
          style={{ animation: 'netra-track 3.2s linear infinite' }}
        />
      )}

      {/* vehicles */}
      {shown.map((v) => {
        const active = v.plate === selected
        const tone = STATUS_TONE[v.status]
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
            {active && <circle cx={v.x} cy={v.y} r="11" fill="none" stroke={tone} strokeWidth="2" style={{ animation: 'netra-ping 2s ease-out infinite' }} />}
            <circle cx={v.x} cy={v.y} r={active ? 7 : 5.5} fill={tone} stroke="hsl(222 42% 5%)" strokeWidth="2" />
            {(active || !compact) && (
              <g transform={`translate(${v.x + 12} ${v.y - 11})`} className={active ? undefined : 'max-lg:hidden'}>
                <rect width={v.plate.length * 8.6 + 14} height="22" rx="4" fill="hsl(222 42% 5% / 0.88)" stroke={active ? tone : 'hsl(217 22% 24%)'} strokeWidth="1" />
                <text x="7" y="15.5" fill={active ? '#fff' : 'hsl(217 20% 84%)'} fontSize="13" fontFamily="var(--font-mono)" letterSpacing="0.5">
                  {v.plate}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* scale */}
      {!compact && (
        <g transform="translate(842 566)">
          <line x1="0" y1="0" x2="94" y2="0" stroke="hsl(217 12% 60%)" strokeWidth="1.5" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="hsl(217 12% 60%)" strokeWidth="1.5" />
          <line x1="94" y1="-4" x2="94" y2="4" stroke="hsl(217 12% 60%)" strokeWidth="1.5" />
          <text x="47" y="-8" fill="hsl(217 10% 60%)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">100 m</text>
        </g>
      )}
    </svg>
  )
}
