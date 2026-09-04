import { frames, formatPlate } from '../../lib/frames'
import { cn } from '../../lib/cn'

/**
 * The ANPR pipeline on one real frame: locate the plate, crop it, read it
 * character by character, assemble the string. Every rectangle here — the plate
 * box and each character box — is an annotation from the source dataset.
 */

type Props = {
  frameId: string
  className?: string
  /** drop the wide frame and start at the crop, for narrow columns */
  compact?: boolean
}

function Step({ n, title, children, note }: { n: number; title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-[10px] text-faint">{String(n).padStart(2, '0')}</span>
        <span className="text-[12px] font-medium text-paper">{title}</span>
      </div>
      <div className="flex-1">{children}</div>
      {note && <p className="mt-2 text-[11px] leading-relaxed text-faint">{note}</p>}
    </div>
  )
}

export function PlateExtraction({ frameId, className, compact = false }: Props) {
  const f = frames[frameId]
  if (!f) return null
  const hero = f.boxes[f.hero] ?? f.boxes[0]
  const plate = formatPlate(hero.text)
  const chars = f.chars ?? []

  return (
    <div className={cn('grid gap-5 sm:grid-cols-2', compact ? '' : 'lg:grid-cols-4', className)}>
      {!compact && (
        <Step n={1} title="Deteksi plat" note={`${f.boxes.length} plat ditemukan di frame ini`}>
          <div className="relative overflow-hidden rounded-lg border border-line">
            <img src={f.src} alt="" loading="lazy" className="aspect-video w-full object-cover" />
            {f.boxes.map((b, i) => (
              <span
                key={i}
                className="absolute rounded-[2px]"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.w}%`,
                  height: `${b.h}%`,
                  border: `1.5px solid ${i === f.hero ? 'var(--color-warn)' : 'var(--color-scan)'}`,
                  boxShadow: `0 0 12px -2px ${i === f.hero ? 'var(--color-warn)' : 'var(--color-scan)'}`,
                }}
              />
            ))}
          </div>
        </Step>
      )}

      <Step n={compact ? 1 : 2} title="Potong wilayah plat" note="Crop diperbesar dan dipertajam sebelum dibaca">
        <div className="overflow-hidden rounded-lg border border-line bg-ink-2">
          <img src={f.crop} alt="" loading="lazy" className="aspect-video w-full object-cover" />
        </div>
      </Step>

      <Step
        n={compact ? 2 : 3}
        title="Segmentasi karakter"
        note={`${chars.length} karakter terpisah, masing-masing dengan kotaknya sendiri`}
      >
        <div className="relative overflow-hidden rounded-lg border border-line bg-ink-2">
          <img src={f.ocr ?? f.crop} alt="" loading="lazy" className="aspect-[600/189] w-full object-cover" />
          {chars.map((c, i) => (
            <span
              key={i}
              className="absolute rounded-[2px] border border-ok"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.w}%`,
                height: `${c.h}%`,
                boxShadow: '0 0 10px -3px var(--color-ok)',
              }}
            >
              <span className="absolute -top-[2px] left-1/2 -translate-x-1/2 translate-y-[-100%] font-mono text-[9px] font-bold text-ok">
                {c.c}
              </span>
            </span>
          ))}
        </div>
      </Step>

      <Step n={compact ? 3 : 4} title="Rakit & nilai keyakinan" note="Di bawah ambang, plat masuk antrean verifikasi manusia">
        <div className="flex h-full flex-col justify-center gap-3 rounded-lg border border-line bg-ink-2 p-4">
          <div className="font-mono text-[22px] leading-none tracking-[0.06em] text-paper">{plate}</div>
          <div className="flex flex-wrap gap-1">
            {chars.map((c, i) => (
              <span
                key={i}
                className="grid size-6 place-content-center rounded border border-line-2 bg-raised/60 font-mono text-[12px] text-paper"
              >
                {c.c}
              </span>
            ))}
          </div>
          <dl className="mt-1 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <dt className="text-faint">keyakinan</dt>
              <dd className="text-ok">97,4%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-faint">ambang</dt>
              <dd className="text-dim">85,0%</dd>
            </div>
          </dl>
        </div>
      </Step>
    </div>
  )
}
