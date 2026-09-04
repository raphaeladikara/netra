import { cn } from '../../lib/cn'

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden>
      <defs>
        <linearGradient id="markG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(213 94% 66%)" />
          <stop offset="100%" stopColor="hsl(224 76% 42%)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#markG)" />
      <rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="hsl(205 95% 84% / 0.45)" strokeWidth="1" />
      {/* aperture blades */}
      <g stroke="hsl(205 95% 92%)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.92">
        <path d="M16 6.5 L23.5 12 L20.6 20.8 L11.4 20.8 L8.5 12 Z" />
      </g>
      <circle cx="16" cy="15.4" r="3.4" fill="hsl(220 45% 10%)" />
      <circle cx="16" cy="15.4" r="1.5" fill="hsl(186 92% 68%)" />
    </svg>
  )
}

export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Mark />
      <span className="leading-none">
        <span className="block text-[17px] font-bold tracking-[-0.035em] text-paper">byte<span className="text-ice">track</span></span>
        {sub && <span className="mt-[3px] block font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{sub}</span>}
      </span>
    </span>
  )
}
