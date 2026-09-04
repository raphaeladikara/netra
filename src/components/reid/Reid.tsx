import { cameras, topology, cameraById, type Vehicle } from '../../lib/data'
import { frames } from '../../lib/frames'
import { cn } from '../../lib/cn'

/* ------------------------------------------------------------ fusion bars */

export type Signal = { label: string; value: number; weight: number; detail: string }

export function FusionBars({ signals, verdict }: { signals: Signal[]; verdict: number }) {
  return (
    <div>
      <ul className="space-y-3.5">
        {signals.map((s) => (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-paper">{s.label}</span>
              <span className="font-mono text-[12px] tabular-nums text-dim">
                {s.value.toFixed(2)}
                <span className="ml-2 text-faint">bobot {s.weight.toFixed(2)}</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised">
              <div
                className="h-full rounded-full bg-azure"
                style={{ width: `${s.value * 100}%`, opacity: 0.45 + s.weight }}
              />
            </div>
            <p className="mt-1 text-[11px] text-faint">{s.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Keyakinan identitas</div>
          <div className="mt-1 text-[13px] text-dim">Ambang gabung otomatis 92%</div>
        </div>
        <div className={cn('text-[38px] font-bold leading-none tabular-nums', verdict >= 92 ? 'text-ok' : 'text-warn')}>
          {verdict.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- the hand-off */

export function HandoffPair({
  a,
  b,
  gapSeconds,
}: {
  a: { cam: string; frame: string; time: string; plateConf: number | null; note: string }
  b: { cam: string; frame: string; time: string; plateConf: number | null; note: string }
  gapSeconds: number
}) {
  const Side = ({ s, tone }: { s: typeof a; tone: 'ok' | 'warn' }) => {
    const f = frames[s.frame]
    return (
      <div className="min-w-0 flex-1">
        <div className="relative overflow-hidden rounded-lg border border-line">
          <img src={f.src} alt="" loading="lazy" className="aspect-video w-full object-cover" />
          {s.plateConf != null &&
            f.boxes.map((box, i) => (
              <span
                key={i}
                className="absolute rounded-[2px] border-[1.5px] border-scan"
                style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
              />
            ))}
          <span className="absolute left-2 top-2 rounded bg-ink/75 px-1.5 py-[3px] font-mono text-[10px] text-paper backdrop-blur-sm">
            {s.cam} · {s.time}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md border px-2 py-[3px] font-mono text-[11px]',
              tone === 'ok' ? 'border-ok/35 bg-ok/12 text-ok' : 'border-warn/35 bg-warn/12 text-warn',
            )}
          >
            {s.plateConf != null ? `plat ${s.plateConf}%` : 'plat tidak terbaca'}
          </span>
          <span className="text-[12px] text-dim">{s.note}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start">
      <Side s={a} tone="ok" />
      <div className="flex shrink-0 flex-row items-center gap-2 self-center sm:flex-col">
        <span className="h-px w-8 bg-line-2 sm:h-8 sm:w-px" />
        <span className="whitespace-nowrap rounded-md border border-line-2 bg-raised/50 px-2 py-1 font-mono text-[11px] text-dim">
          +{gapSeconds} dtk
        </span>
        <span className="h-px w-8 bg-line-2 sm:h-8 sm:w-px" />
      </div>
      <Side s={b} tone="warn" />
    </div>
  )
}

/* ------------------------------------------------------- camera topology */

const VB = { w: 1000, h: 620 }

export function TopologyGraph({
  path,
  className,
  onSelect,
  selected,
}: {
  /** camera ids in visit order, drawn as the active route */
  path?: string[]
  className?: string
  onSelect?: (camId: string) => void
  selected?: string | null
}) {
  const pathSet = new Set(path ?? [])
  const pathEdges = new Set((path ?? []).slice(1).map((c, i) => `${path![i]}->${c}`))

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className={cn('h-full w-full', className)} role="img" aria-label="Topologi kamera">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="hsl(217 24% 34%)" />
        </marker>
      </defs>

      {topology.map((e) => {
        const a = cameraById(e.from)
        const b = cameraById(e.to)
        if (!a || !b) return null
        const active = pathEdges.has(`${e.from}->${e.to}`) || pathEdges.has(`${e.to}->${e.from}`)
        return (
          <g key={`${e.from}-${e.to}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={active ? 'var(--color-azure)' : 'hsl(217 24% 26%)'}
              strokeWidth={active ? 3 : 1.5}
              markerEnd={active ? undefined : 'url(#arrow)'}
              opacity={active ? 1 : 0.75}
            />
            {active && (
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 8}
                fill="hsl(205 95% 78%)"
                fontSize="13"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {e.seconds[0]}–{e.seconds[1]}s
              </text>
            )}
          </g>
        )
      })}

      {cameras.map((c) => {
        const on = pathSet.has(c.id)
        const isSel = selected === c.id
        return (
          <g
            key={c.id}
            className={onSelect ? 'cursor-pointer' : undefined}
            onClick={() => onSelect?.(c.id)}
          >
            {isSel && <circle cx={c.x} cy={c.y} r="18" fill="var(--color-azure)" opacity="0.18" />}
            <circle
              cx={c.x}
              cy={c.y}
              r={on ? 10 : 7}
              fill={on ? 'var(--color-azure)' : 'hsl(220 34% 12%)'}
              stroke={
                c.state === 'offline'
                  ? 'var(--color-alarm)'
                  : c.role === 'entry'
                    ? 'var(--color-ok)'
                    : c.role === 'exit'
                      ? 'var(--color-warn)'
                      : 'hsl(217 24% 40%)'
              }
              strokeWidth="2.5"
            />
            <text
              x={c.x}
              y={c.y - 16}
              fill={on ? 'hsl(213 32% 96%)' : 'hsl(215 14% 54%)'}
              fontSize="13"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {c.id.replace('CAM-', '')}
            </text>
            {on && (
              <text x={c.x} y={c.y + 26} fill="hsl(205 95% 78%)" fontSize="12" textAnchor="middle">
                {c.zone}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------ reid gallery */

/** the same vehicle as it was seen by every camera on its route */
export function ReidGallery({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {vehicle.hops.map((h, i) => {
        const f = h.frame ? frames[h.frame] : null
        return (
          <figure key={i} className="min-w-0">
            <div className="relative overflow-hidden rounded-lg border border-line bg-ink-2">
              {f ? (
                <img src={f.src} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full" />
              )}
              <span className="absolute left-1.5 top-1.5 rounded bg-ink/75 px-1 py-[2px] font-mono text-[9px] text-paper backdrop-blur-sm">
                {h.cam}
              </span>
            </div>
            <figcaption className="mt-1.5 flex items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] tabular-nums text-dim">{h.time}</span>
              <span
                className={cn(
                  'font-mono text-[10px]',
                  h.by === 'plate' ? 'text-ok' : h.by === 'fusion' ? 'text-scan' : 'text-warn',
                )}
              >
                {h.by === 'plate' ? 'plat' : h.by === 'fusion' ? 'plat+re-id' : 're-id'}
              </span>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}
