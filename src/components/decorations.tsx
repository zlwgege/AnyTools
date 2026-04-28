// Decorative line-art SVG illustrations for fresh/anime style

export function CloudLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} style={style}>
      <path
        d="M10 45 Q10 25 30 25 Q35 10 55 10 Q75 10 80 25 Q100 25 100 45 Q100 55 80 55 L30 55 Q10 55 10 45Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M25 40 Q25 32 32 32"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  )
}

export function StarLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style}>
      <path
        d="M20 4 L23 15 L35 15 L25 22 L28 34 L20 27 L12 34 L15 22 L5 15 L17 15Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

export function SparkleLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 2 L13 9 L20 10 L13 11 L12 18 L11 11 L4 10 L11 9Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.5" />
    </svg>
  )
}

export function WaveLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 40" fill="none" className={className} style={style}>
      <path
        d="M0 20 Q25 5 50 20 Q75 35 100 20 Q125 5 150 20 Q175 35 200 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  )
}

export function CircleDots({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} style={style}>
      <circle cx="20" cy="20" r="3" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="50" cy="15" r="2" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="80" cy="25" r="4" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="15" cy="55" r="2.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="85" cy="60" r="3" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="45" cy="80" r="2" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="75" cy="85" r="3.5" stroke="currentColor" strokeWidth="1" opacity="0.15" />
    </svg>
  )
}

export function FlowerLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" className={className} style={style}>
      <circle cx="30" cy="20" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="20" cy="32" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="40" cy="32" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="25" cy="45" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="35" cy="45" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="30" cy="34" r="4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function DashedCircle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} style={style}>
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" opacity="0.25" />
      <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.2" />
    </svg>
  )
}

export function LeafLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style}>
      <path
        d="M20 35 Q5 25 5 15 Q5 5 20 5 Q35 5 35 15 Q35 25 20 35Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <path d="M20 5 L20 30" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
    </svg>
  )
}
