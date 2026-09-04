import { CctvScene } from './CctvScene'
import { cn } from '../../lib/cn'
import { frames, formatPlate } from '../../lib/frames'
import type { Camera } from '../../lib/data'

/**
 * One camera tile. Three sources, in order of preference:
 *
 *   clip   a looping CCTV clip — motion, no overlay, because we have no
 *          per-frame ground truth for it and drawing invented boxes on real
 *          footage would be a lie
 *   frame  a still from the Indonesian plate dataset — every rectangle drawn
 *          on it is that dataset's own annotation
 *   —      the procedural SVG scene, for cameras with no footage at all
 */

export type Box = {
  x: number
  y: number
  w: number
  h: number
  label: string
  conf?: number
  tone?: 'scan' | 'warn' | 'alarm' | 'ok'
}

const TONE: Record<NonNullable<Box['tone']>, { stroke: string; chip: string }> = {
  scan: { stroke: 'var(--color-scan)', chip: 'bg-scan/90 text-ink' },
  ok: { stroke: 'var(--color-ok)', chip: 'bg-ok/90 text-ink' },
  warn: { stroke: 'var(--color-warn)', chip: 'bg-warn/90 text-ink' },
  alarm: { stroke: 'var(--color-alarm)', chip: 'bg-alarm text-white' },
}

type CamLike = Pick<Camera, 'id' | 'name' | 'zone' | 'state'> & {
  frame?: string | null
  clip?: string | null
  kind?: Camera['kind']
}

type Props = {
  camera: CamLike
  time?: string
  /** override the dataset boxes, or pass false to draw none */
  boxes?: Box[] | false
  live?: boolean
  compact?: boolean
  className?: string
  /** show plate text on the box labels */
  labels?: boolean
  onLoad?: () => void
}

/** the dataset's plate boxes, dressed as ANPR detections */
export function plateBoxes(frameId: string | null | undefined, tone: Box['tone'] = 'scan'): Box[] {
  if (!frameId) return []
  const f = frames[frameId]
  if (!f) return []
  return f.boxes.map((b, i) => ({
    x: b.x,
    y: b.y,
    w: b.w,
    h: b.h,
    label: formatPlate(b.text),
    conf: 91 + ((b.text.charCodeAt(0) + i * 7) % 9),
    tone: i === f.hero ? tone : 'scan',
  }))
}

export function CameraFeed({
  camera,
  time = '09:31:04',
  boxes,
  live = true,
  compact = false,
  className,
  labels = true,
  onLoad,
}: Props) {
  const offline = camera.state === 'offline'
  const frame = camera.frame ? frames[camera.frame] : null
  const list = offline ? [] : boxes === false ? [] : (boxes ?? plateBoxes(camera.frame))
  const isClip = Boolean(camera.clip)

  return (
    <div className={cn('relative isolate overflow-hidden bg-ink-2', className)}>
      {isClip ? (
        <video
          src={camera.clip!}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={onLoad}
          className="h-full w-full object-cover"
          style={{ filter: 'saturate(0.75) contrast(1.06)' }}
        />
      ) : frame ? (
        <img
          src={frame.src}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
          className="h-full w-full object-cover"
        />
      ) : (
        <CctvScene kind={camera.kind ?? 'road'} seed={camera.id} />
      )}

      {/* detections — real dataset rectangles */}
      {list.map((b, i) => {
        const tone = TONE[b.tone ?? 'scan']
        return (
          <div
            key={i}
            className="pointer-events-none absolute"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
          >
            <div
              className="absolute inset-0 rounded-[2px]"
              style={{
                border: `1.5px solid ${tone.stroke}`,
                boxShadow: `0 0 0 1px rgb(0 0 0 / 0.5), 0 0 14px -3px ${tone.stroke}`,
              }}
            />
            {labels && !compact && (
              <span
                className={cn(
                  'absolute -top-[5px] left-1/2 -translate-x-1/2 translate-y-[-100%] whitespace-nowrap rounded-[3px] px-1 py-[1px] font-mono text-[9px] font-medium tracking-tight',
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

      {offline && (
        <div className="absolute inset-0 grid place-content-center gap-2 bg-ink/82 text-center backdrop-blur-[2px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-alarm">Sinyal hilang</span>
          <span className="text-xs text-dim">Terakhir menerima frame 06:12</span>
        </div>
      )}

      {/* chrome */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          <span className="flex items-center gap-1.5 rounded bg-ink/70 px-1.5 py-[3px] backdrop-blur-sm">
            <span
              className={cn(
                'size-1.5 rounded-full',
                offline ? 'bg-alarm' : camera.state === 'attention' ? 'bg-warn' : 'bg-ok',
              )}
              style={live && !compact && !offline ? { animation: 'bt-pulse 2.4s ease-in-out infinite' } : undefined}
            />
            <span className="font-mono text-[10px] tracking-tight text-paper/90">{camera.name}</span>
            {!compact && <span className="text-[10px] text-dim">· {camera.zone}</span>}
          </span>
          {!offline && (
            <span className="rounded bg-ink/70 px-1.5 py-[3px] font-mono text-[10px] tabular-nums text-paper/75 backdrop-blur-sm">
              {isClip ? 'LIVE' : time}
            </span>
          )}
        </div>

        {!compact && !offline && (
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2">
            <span className="rounded bg-ink/70 px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-dim backdrop-blur-sm">
              {list.length > 0 ? `${list.length} plat terdeteksi` : camera.id}
            </span>
            <span className="flex items-center gap-1 rounded bg-ink/70 px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-alarm backdrop-blur-sm">
              <span
                className="size-1.5 rounded-full bg-alarm"
                style={live ? { animation: 'bt-pulse 1.6s ease-in-out infinite' } : undefined}
              />
              rec
            </span>
          </div>
        )}

        {live && !compact && !offline && (
          <div
            className="absolute inset-x-0 top-0 h-6"
            style={{
              background: 'linear-gradient(to bottom, transparent, hsl(188 92% 56% / 0.16), transparent)',
              animation: 'bt-scan 5.5s linear infinite',
            }}
          />
        )}
      </div>
    </div>
  )
}
