import { cn } from '../../lib/cn'

/**
 * Three camera cones closing on one point: many viewpoints, one identity. At
 * 16px the wedges read as an iris, which is what "netra" means. The geometry is
 * one wedge rotated 120°, so gaps and weights stay identical at any size.
 */

const WEDGE = 'M16 10.4 L10.76 3.02 A14 14 0 0 1 21.24 3.02 Z'

export function Mark({ className, id = 'nm' }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="hsl(205 95% 78%)" />
          <stop offset="100%" stopColor="hsl(217 91% 58%)" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(217 91% 58%)" />
          <stop offset="100%" stopColor="hsl(224 76% 42%)" />
        </linearGradient>
        <radialGradient id={`${id}-c`}>
          <stop offset="0%" stopColor="hsl(188 92% 74%)" />
          <stop offset="100%" stopColor="hsl(188 92% 50%)" />
        </radialGradient>
      </defs>

      <path d={WEDGE} fill={`url(#${id}-a)`} />
      <path d={WEDGE} fill={`url(#${id}-b)`} transform="rotate(120 16 16)" opacity="0.9" />
      <path d={WEDGE} fill={`url(#${id}-b)`} transform="rotate(240 16 16)" opacity="0.68" />

      {/* the subject every cone is pointed at */}
      <circle cx="16" cy="16" r="3.2" fill="hsl(222 42% 5%)" />
      <circle cx="16" cy="16" r="2.2" fill={`url(#${id}-c)`} />
    </svg>
  )
}

export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Mark />
      <span className="leading-none">
        <span className="block text-[18px] font-extrabold tracking-[-0.045em] text-paper">netra</span>
        {sub && (
          <span className="mt-[3px] block font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{sub}</span>
        )}
      </span>
    </span>
  )
}
