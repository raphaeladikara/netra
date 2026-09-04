import { seeded, between } from '../../lib/rng'
import type { SceneKind } from '../../lib/data'

/**
 * Procedural CCTV frames. Every camera in the demo draws its own scene from a
 * seed, so the wall looks like twenty-four different lenses instead of one
 * stock photo repeated. Swap `<CameraFeed src>` for a real snapshot when the
 * pilot footage arrives — the overlay layer stays the same.
 */

type Props = { kind: SceneKind; seed: string; night?: boolean }

const sky = (night: boolean) => (night ? ['#060c18', '#0d1a33'] : ['#22314a', '#3d5578'])
const ground = (night: boolean) => (night ? ['#080f1e', '#111f38'] : ['#1a2739', '#293c56'])

function Truck({ x, y, s = 1, hue = 210, flip = false }: { x: number; y: number; s?: number; hue?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x="-34" y="-22" width="42" height="21" rx="2" fill={`hsl(${hue} 22% 34%)`} />
      <rect x="-34" y="-22" width="42" height="6" rx="2" fill={`hsl(${hue} 22% 42%)`} />
      <path d="M8 -1 L8 -16 L20 -16 L26 -6 L26 -1 Z" fill={`hsl(${hue} 26% 27%)`} />
      <rect x="11" y="-14" width="10" height="7" rx="1.5" fill="hsl(196 60% 62%)" opacity="0.5" />
      <circle cx="-24" cy="0" r="3.6" fill="#050a12" />
      <circle cx="-14" cy="0" r="3.6" fill="#050a12" />
      <circle cx="18" cy="0" r="3.6" fill="#050a12" />
      <rect x="-2" y="-9" width="9" height="4" rx="1" fill="none" stroke="hsl(188 92% 56%)" strokeWidth="1" opacity="0.8" />
    </g>
  )
}

function Car({ x, y, s = 1, hue = 210 }: { x: number; y: number; s?: number; hue?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-18 0 L-18 -6 L-11 -12 L7 -12 L14 -6 L14 0 Z" fill={`hsl(${hue} 18% 36%)`} />
      <path d="M-10 -7 L-6 -11 L4 -11 L8 -7 Z" fill="hsl(200 40% 58%)" opacity="0.45" />
      <circle cx="-10" cy="0" r="3" fill="#050a12" />
      <circle cx="7" cy="0" r="3" fill="#050a12" />
    </g>
  )
}

function LampPool({ x, y, w = 120, h = 40, night }: { x: number; y: number; w?: number; h?: number; night: boolean }) {
  return (
    <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill="url(#lampPool)" opacity={night ? 0.5 : 0.16} />
  )
}

function Rack({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y - h} width="26" height={h} fill="#111e34" />
      <rect x={x} y={y - h} width="26" height="4" fill="#1b2d4c" />
      <rect x={x} y={y - h * 0.62} width="26" height="4" fill="#1b2d4c" />
      <rect x={x} y={y - h * 0.3} width="26" height="4" fill="#1b2d4c" />
      <rect x={x + 3} y={y - h * 0.58} width="9" height="12" fill="#3a2f24" />
      <rect x={x + 14} y={y - h * 0.26} width="9" height="12" fill="#3a2f24" />
    </g>
  )
}

export function CctvScene({ kind, seed, night = true }: Props) {
  const r = seeded(seed)
  const [s1, s2] = sky(night)
  const [g1, g2] = ground(night)
  const gid = seed.replace(/[^a-z0-9]/gi, '')

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`sky-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s1} />
          <stop offset="100%" stopColor={s2} />
        </linearGradient>
        <linearGradient id={`gnd-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={g1} />
          <stop offset="100%" stopColor={g2} />
        </linearGradient>
        <radialGradient id="lampPool">
          <stop offset="0%" stopColor="hsl(40 90% 70%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(40 90% 60%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`vig-${gid}`} cx="50%" cy="45%" r="72%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#sky-${gid})`} />

      {kind === 'gate' && (
        <>
          <rect y="86" width="320" height="94" fill={`url(#gnd-${gid})`} />
          <path d="M0 180 L118 86 L196 86 L320 180 Z" fill="#101c31" />
          <path d="M150 86 L162 86 L200 180 L176 180 Z" fill="#16263d" opacity="0.7" />
          <LampPool x={160} y={150} w={230} h={70} night={night} />
          <rect x="222" y="52" width="66" height="46" fill="#122134" />
          <rect x="230" y="62" width="24" height="18" fill="hsl(44 80% 62%)" opacity="0.35" />
          <rect x="262" y="62" width="18" height="18" fill="hsl(44 80% 62%)" opacity="0.2" />
          <rect x="216" y="48" width="78" height="5" fill="#1c2f4e" />
          <rect x="206" y="96" width="6" height="26" fill="#203450" />
          <rect x="94" y="98" width="118" height="5" rx="2" fill="#c0cfe4" />
          <rect x="94" y="98" width="118" height="5" rx="2" fill="hsl(356 78% 60%)" opacity="0.35" />
          <rect x="38" y="30" width="4" height="60" fill="#17273f" />
          <circle cx="40" cy="30" r="5" fill="hsl(40 90% 72%)" opacity="0.8" />
          <LampPool x={40} y={120} w={110} h={40} night={night} />
          <Truck x={132} y={140} s={1.35} hue={205} />
          <Car x={252} y={120} s={0.7} hue={212} />
        </>
      )}

      {kind === 'road' && (
        <>
          <rect y="78" width="320" height="102" fill={`url(#gnd-${gid})`} />
          <path d="M96 78 L224 78 L320 180 L-20 180 Z" fill="#0c1726" />
          <path d="M158 78 L162 78 L176 180 L142 180 Z" fill="#2b4670" opacity="0.55" />
          <rect x="0" y="42" width="92" height="38" fill="#0f1b2d" />
          <rect x="0" y="38" width="92" height="5" fill="#172742" />
          <rect x="228" y="46" width="92" height="34" fill="#0f1b2d" />
          <rect x="228" y="42" width="92" height="5" fill="#172742" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={14 + i * 26} y={54} width="14" height="10" fill="hsl(44 80% 62%)" opacity={0.18 + i * 0.08} />
          ))}
          <rect x="60" y="24" width="3" height="56" fill="#17273f" />
          <circle cx="61" cy="24" r="4" fill="hsl(40 90% 72%)" opacity="0.8" />
          <LampPool x={70} y={126} w={170} h={54} night={night} />
          <rect x="256" y="28" width="3" height="52" fill="#17273f" />
          <circle cx="257" cy="28" r="4" fill="hsl(40 90% 72%)" opacity="0.7" />
          <LampPool x={250} y={116} w={140} h={44} night={night} />
          <Truck x={198} y={148} s={1.2} hue={198} flip />
          <Car x={118} y={108} s={0.62} hue={206} />
          <Car x={146} y={95} s={0.45} hue={196} />
        </>
      )}

      {kind === 'loading' && (
        <>
          <rect y="70" width="320" height="110" fill={`url(#gnd-${gid})`} />
          <rect x="0" y="16" width="320" height="62" fill="#0e1b2c" />
          <rect x="0" y="12" width="320" height="6" fill="#16263e" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={16 + i * 78} y={34} width="54" height="44" fill="#070f1c" />
              <rect x={16 + i * 78} y={30} width="54" height="5" fill="#1c2f4e" />
              <rect x={20 + i * 78} y={40} width="46" height="30" fill="#101e31" opacity={i === 1 ? 0.4 : 1} />
              <text x={43 + i * 78} y={26} fill="#66798f" fontSize="7" fontFamily="monospace" textAnchor="middle">
                D{i + 1}
              </text>
            </g>
          ))}
          <rect x="0" y="78" width="320" height="4" fill="#1c2f4e" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={10 + i * 100} y={96} width="86" height="2" fill="hsl(44 80% 62%)" opacity="0.22" />
          ))}
          <LampPool x={80} y={122} w={200} h={70} night={night} />
          <LampPool x={250} y={128} w={180} h={64} night={night} />
          <Truck x={104} y={132} s={1.25} hue={210} />
          <Truck x={262} y={158} s={1.5} hue={24} flip />
        </>
      )}

      {kind === 'warehouse' && (
        <>
          <rect width="320" height="180" fill="#091220" />
          <path d="M0 180 L110 62 L210 62 L320 180 Z" fill="#171334" />
          <rect x="110" y="18" width="100" height="46" fill="#060d18" />
          <path d="M110 62 L210 62 L210 18 L110 18 Z" fill="#060d18" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={126 + i * 20} y={22} width="8" height="3" fill="hsl(48 90% 78%)" opacity="0.7" />
          ))}
          <Rack x={10} y={168} h={104} />
          <Rack x={48} y={150} h={82} />
          <Rack x={80} y={134} h={64} />
          <Rack x={238} y={134} h={64} />
          <Rack x={266} y={150} h={82} />
          <Rack x={294} y={168} h={104} />
          <rect x="122" y="150" width="76" height="4" fill="hsl(44 80% 62%)" opacity="0.2" />
          <g transform="translate(150 148)">
            <rect x="-14" y="-18" width="26" height="18" rx="2" fill="hsl(38 70% 48%)" />
            <rect x="12" y="-34" width="3" height="34" fill="#2a3d5a" />
            <rect x="15" y="-10" width="14" height="4" fill="#2a3d5a" />
            <circle cx="-8" cy="2" r="3.4" fill="#040910" />
            <circle cx="6" cy="2" r="3.4" fill="#040910" />
          </g>
          <g transform="translate(214 152)">
            <circle cx="0" cy="-20" r="4.4" fill="#d8cfae" />
            <path d="M-5 -15 L5 -15 L7 0 L-7 0 Z" fill="hsl(48 92% 56%)" />
            <path d="M-4 0 L-2 12 L-6 12 Z M4 0 L6 12 L2 12 Z" fill="#1c2f4e" />
          </g>
        </>
      )}

      {kind === 'parking' && (
        <>
          <rect y="52" width="320" height="128" fill={`url(#gnd-${gid})`} />
          <rect x="0" y="0" width="320" height="54" fill="#0d192b" />
          <rect x="0" y="50" width="320" height="4" fill="#16263e" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={24 + i * 50} y={66} width="2" height="34" fill="#3a5077" opacity="0.5" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={`b-${i}`} x={6 + i * 46} y={126} width="2" height="46" fill="#3a5077" opacity="0.45" />
          ))}
          <LampPool x={160} y={110} w={280} h={90} night={night} />
          {[0, 1, 2, 3].map((i) => (
            <Car key={i} x={44 + i * 50} y={96} s={0.72} hue={198 + i * 8} />
          ))}
          {[0, 1, 2].map((i) => (
            <Car key={`c-${i}`} x={54 + i * 92} y={156} s={1.05} hue={210 + i * 6} />
          ))}
          <Truck x={286} y={158} s={1.15} hue={16} flip />
        </>
      )}

      {kind === 'perimeter' && (
        <>
          <rect y="96" width="320" height="84" fill="#0a1a1d" />
          <rect y="88" width="320" height="10" fill="#122224" />
          <path d="M0 180 L320 180 L320 128 L0 150 Z" fill="#091618" />
          {Array.from({ length: 26 }, (_, i) => (
            <rect key={i} x={i * 12.6} y={40 - (i % 2)} width="1.6" height={62} fill="#24374f" opacity="0.85" />
          ))}
          <rect x="0" y="40" width="320" height="2" fill="#31486a" />
          <rect x="0" y="70" width="320" height="1.4" fill="#2a4060" />
          <rect x="0" y="96" width="320" height="1.4" fill="#2a4060" />
          <path d="M0 40 Q160 22 320 40" fill="none" stroke="#35507a" strokeWidth="1.2" strokeDasharray="3 5" />
          <rect x="272" y="8" width="4" height="96" fill="#20233a" />
          <circle cx="274" cy="8" r="5" fill="hsl(40 90% 74%)" opacity="0.85" />
          <LampPool x={266} y={132} w={190} h={62} night={night} />
          {Array.from({ length: 9 }, (_, i) => {
            const rr = seeded(`${seed}-bush-${i}`)
            return (
              <ellipse
                key={i}
                cx={between(rr, 8, 312)}
                cy={between(rr, 132, 174)}
                rx={between(rr, 6, 15)}
                ry={between(rr, 3, 6)}
                fill="#0e2224"
              />
            )
          })}
          <g transform="translate(96 128)">
            <circle cx="0" cy="-26" r="5" fill="#cdbfae" />
            <path d="M-6 -21 L6 -21 L8 -4 L-8 -4 Z" fill="#2f3a4e" />
            <path d="M-5 -4 L-3 12 L-8 12 Z M5 -4 L8 12 L3 12 Z" fill="#222a3a" />
          </g>
        </>
      )}

      <rect width="320" height="180" fill={`url(#vig-${gid})`} />
      <rect width="320" height="180" fill={night ? '#0a1c40' : '#12305c'} opacity={night ? 0.24 : 0.12} style={{ mixBlendMode: 'overlay' }} />
      <rect width="320" height="180" fill="none" />
      {/* faint interlace, the tell of a compressed stream */}
      {Array.from({ length: 45 }, (_, i) => (
        <rect key={i} y={i * 4} width="320" height="1" fill="#000" opacity={0.07 + (r() * 0.03)} />
      ))}
    </svg>
  )
}
