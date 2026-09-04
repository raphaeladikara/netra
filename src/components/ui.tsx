import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export function Panel({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-line bg-panel/85 hairline',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function PanelHead({
  title,
  meta,
  children,
  className,
}: {
  title: ReactNode
  meta?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5', className)}>
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-paper">{title}</h2>
      {meta && <span className="text-xs text-faint">{meta}</span>}
      {children}
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'outline', size = 'md', className, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,transform,box-shadow] duration-150 active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-45',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        variant === 'primary' &&
          'bg-azure text-white shadow-[0_8px_24px_-12px_hsl(217_91%_58%/0.9)] hover:bg-azure-hi',
        variant === 'outline' && 'border border-line-2 bg-raised/50 text-paper hover:border-line-2 hover:bg-raised',
        variant === 'ghost' && 'text-dim hover:bg-raised/70 hover:text-paper',
        className,
      )}
      {...rest}
    />
  )
}

const TONES = {
  neutral: 'border-line-2 bg-raised/60 text-dim',
  azure: 'border-azure/40 bg-azure/15 text-ice',
  ok: 'border-ok/35 bg-ok/12 text-ok',
  warn: 'border-warn/35 bg-warn/12 text-warn',
  alarm: 'border-alarm/40 bg-alarm/14 text-alarm',
  scan: 'border-scan/35 bg-scan/12 text-scan',
} as const

export function Badge({
  tone = 'neutral',
  children,
  className,
  mono = false,
}: {
  tone?: keyof typeof TONES
  children: ReactNode
  className?: string
  mono?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-[3px] text-[11px] font-medium',
        mono && 'font-mono tracking-tight',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Dot({ tone = 'neutral', pulse = false }: { tone?: keyof typeof TONES; pulse?: boolean }) {
  const bg = {
    neutral: 'bg-faint',
    azure: 'bg-azure',
    ok: 'bg-ok',
    warn: 'bg-warn',
    alarm: 'bg-alarm',
    scan: 'bg-scan',
  }[tone]
  return (
    <span
      className={cn('inline-block size-2 shrink-0 rounded-full', bg)}
      style={pulse ? { animation: 'bt-pulse 2.2s ease-in-out infinite' } : undefined}
    />
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'paper',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'paper' | 'warn' | 'ok' | 'azure' | 'alarm'
}) {
  const color = {
    paper: 'text-paper',
    warn: 'text-warn',
    ok: 'text-ok',
    azure: 'text-ice',
    alarm: 'text-alarm',
  }[tone]
  return (
    <div className="rounded-[14px] border border-line bg-panel/85 px-5 py-4 hairline">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</div>
      <div className={cn('mt-2 text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums', color)}>{value}</div>
      {hint && <div className="mt-2 text-xs text-dim">{hint}</div>}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
  className?: string
}) {
  return (
    <div className={cn('inline-flex rounded-lg border border-line bg-ink-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
            value === o.value ? 'bg-azure text-white' : 'text-dim hover:text-paper',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** 14 daily uptime bars — the shape the camera-health page reads at a glance. */
export function UptimeBars({ seedValues, tone }: { seedValues: number[]; tone: 'ok' | 'warn' | 'alarm' }) {
  const color = { ok: 'bg-ok', warn: 'bg-warn', alarm: 'bg-alarm' }[tone]
  return (
    <div className="flex h-7 items-end gap-[3px]">
      {seedValues.map((v, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-[1.5px]', v < 0.35 ? 'bg-line-2' : color)}
          style={{ height: `${Math.max(18, v * 100)}%`, opacity: v < 0.35 ? 1 : 0.55 + v * 0.45 }}
        />
      ))}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
      <span className="text-[13px] text-dim">{label}</span>
      <span className="font-mono text-[13px] tabular-nums text-paper">{children}</span>
    </div>
  )
}
