import { CctvScene } from './CctvScene'
import { cn } from '../../lib/cn'
import type { SceneKind } from '../../lib/data'

export type Box = {
  /** percentages of the frame */
  x: number
  y: number
  w: number
  h: number
  label: string
  conf?: number
  tone?: 'scan' | 'warn' | 'alarm' | 'ok'
}

const BOXES: Record<SceneKind, Box[]> = {
  gate: [
    { x: 27, y: 60, w: 21, h: 24, label: 'Truk kontainer', conf: 97, tone: 'scan' },
    { x: 33.5, y: 71, w: 6, h: 5, label: 'B 1234 XYZ', conf: 98, tone: 'ok' },
    { x: 74, y: 60, w: 12, h: 12, label: 'Mobil', conf: 93, tone: 'scan' },
  ],
  road: [
    { x: 51, y: 66, w: 21, h: 22, label: 'Truk box', conf: 96, tone: 'scan' },
    { x: 31, y: 52, w: 12, h: 12, label: 'Mobil', conf: 94, tone: 'scan' },
    { x: 42, y: 45, w: 8, h: 9, label: 'Mobil', conf: 88, tone: 'scan' },
  ],
  loading: [
    { x: 20, y: 56, w: 20, h: 22, label: 'Truk · berhenti 47 mnt', conf: 95, tone: 'warn' },
    { x: 71, y: 68, w: 23, h: 24, label: 'Tronton', conf: 97, tone: 'scan' },
  ],
  warehouse: [
    { x: 40, y: 66, w: 15, h: 20, label: 'Forklift', conf: 96, tone: 'scan' },
    { x: 63, y: 68, w: 9, h: 24, label: 'Pekerja · APD lengkap', conf: 92, tone: 'ok' },
  ],
  parking: [
    { x: 9, y: 45, w: 14, h: 15, label: 'Mobil', conf: 95, tone: 'scan' },
    { x: 25, y: 45, w: 14, h: 15, label: 'Mobil', conf: 94, tone: 'scan' },
    { x: 8, y: 76, w: 19, h: 20, label: 'Mobil · 3 jam', conf: 96, tone: 'warn' },
    { x: 84, y: 74, w: 15, h: 22, label: 'Truk', conf: 93, tone: 'scan' },
  ],
  perimeter: [
    { x: 24, y: 54, w: 11, h: 33, label: 'Orang · zona terlarang', conf: 91, tone: 'alarm' },
  ],
}

const TONE: Record<NonNullable<Box['tone']>, { stroke: string; chip: string }> = {
  scan: { stroke: 'var(--color-scan)', chip: 'bg-scan/90 text-ink' },
  ok: { stroke: 'var(--color-ok)', chip: 'bg-ok/90 text-ink' },
  warn: { stroke: 'var(--color-warn)', chip: 'bg-warn/90 text-ink' },
  alarm: { stroke: 'var(--color-alarm)', chip: 'bg-alarm text-white' },
}

type Props = {
  camera: { id: string; name: string; zone: string; scene: SceneKind; state: 'online' | 'attention' | 'offline' }
  time?: string
  boxes?: Box[] | false
  night?: boolean
  live?: boolean
  compact?: boolean
  className?: string
  /** drop a real snapshot in here once pilot footage exists */
  src?: string
}

export function CameraFeed({
  camera,
  time = '09:31:04',
  boxes,
  night = true,
  live = true,
  compact = false,
  className,
  src,
}: Props) {
  const offline = camera.state === 'offline'
  const list = boxes === false ? [] : (boxes ?? BOXES[camera.scene])

  return (
    <div className={cn('relative isolate overflow-hidden bg-ink-2', className)}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <CctvScene kind={camera.scene} seed={camera.id} night={night} />
      )}

      {/* detections */}
      {!offline &&
        list.map((b, i) => {
          const tone = TONE[b.tone ?? 'scan']
          return (
            <div
              key={i}
              className="pointer-events-none absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            >
              <div
                className="absolute inset-0 rounded-[3px]"
                style={{ border: `1.5px solid ${tone.stroke}`, boxShadow: `0 0 0 1px rgb(0 0 0 / 0.45), 0 0 18px -4px ${tone.stroke}` }}
              />
              {!compact && (
                <span
                  className={cn(
                    'absolute -top-[7px] left-0 translate-y-[-100%] whitespace-nowrap rounded-[3px] px-1.5 py-[2px] font-mono text-[9px] font-medium tracking-tight',
                    tone.chip,
                  )}
                >
                  {b.label}
                  {b.conf ? ` ${b.conf}%` : ''}
                </span>
              )}
            </div>
          )
        })}

      {/* offline state */}
      {offline && (
        <div className="absolute inset-0 grid place-content-center gap-2 bg-ink/78 text-center backdrop-blur-[2px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-alarm">Sinyal hilang</span>
          <span className="text-xs text-dim">Terakhir menerima frame 06:12</span>
        </div>
      )}

      {/* chrome */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          <div className="flex items-center gap-1.5 rounded bg-ink/62 px-1.5 py-[3px] backdrop-blur-sm">
            <span
              className={cn(
                'size-1.5 rounded-full',
                offline ? 'bg-alarm' : camera.state === 'attention' ? 'bg-warn' : 'bg-ok',
              )}
              style={live && !compact && !offline ? { animation: 'netra-pulse 2.4s ease-in-out infinite' } : undefined}
            />
            <span className="font-mono text-[10px] tracking-tight text-paper/90">{camera.name}</span>
            {!compact && <span className="text-[10px] text-dim">· {camera.zone}</span>}
          </div>
          {!offline && (
            <span className="rounded bg-ink/62 px-1.5 py-[3px] font-mono text-[10px] tabular-nums text-paper/75 backdrop-blur-sm">
              {time}
            </span>
          )}
        </div>

        {!compact && !offline && (
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2">
            <span className="rounded bg-ink/62 px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-dim backdrop-blur-sm">
              {camera.id}
            </span>
            <span className="flex items-center gap-1 rounded bg-ink/62 px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-alarm backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-alarm" style={live ? { animation: 'netra-pulse 1.6s ease-in-out infinite' } : undefined} />
              rec
            </span>
          </div>
        )}

        {/* analysis sweep */}
        {live && !compact && !offline && (
          <div
            className="absolute inset-x-0 top-0 h-6"
            style={{
              background: 'linear-gradient(to bottom, transparent, hsl(188 92% 56% / 0.18), transparent)',
              animation: 'netra-scan 5.5s linear infinite',
            }}
          />
        )}
      </div>
    </div>
  )
}

export { BOXES }
