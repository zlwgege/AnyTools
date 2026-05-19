/**
 * 海外仓现场管理工具箱 Logo
 * 设计元素：仓库建筑 + 地球(海外) + 扳手(工具)
 */
interface LogoProps {
  size?: number
  className?: string
}

export function AppLogo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logoGrad)" />

      {/* Globe (overseas) */}
      <circle cx="32" cy="26" r="12" stroke="white" strokeWidth="1.8" fill="none" opacity="0.9" />
      <ellipse cx="32" cy="26" rx="5.5" ry="12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7" />
      <line x1="20" y1="26" x2="44" y2="26" stroke="white" strokeWidth="1.2" opacity="0.7" />
      <line x1="21" y1="20" x2="43" y2="20" stroke="white" strokeWidth="0.8" opacity="0.5" />
      <line x1="21" y1="32" x2="43" y2="32" stroke="white" strokeWidth="0.8" opacity="0.5" />

      {/* Warehouse base */}
      <path
        d="M14 40 L14 52 L50 52 L50 40"
        fill="white"
        fillOpacity="0.25"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Warehouse roof */}
      <path
        d="M12 40 L32 30 L52 40"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Warehouse door */}
      <rect x="26" y="43" width="12" height="9" rx="1.5" fill="white" fillOpacity="0.4" stroke="white" strokeWidth="1.2" />
      {/* Warehouse boxes */}
      <rect x="16" y="45" width="5" height="5" rx="0.8" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="0.8" />
      <rect x="43" y="45" width="5" height="5" rx="0.8" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="0.8" />

      {/* Wrench icon (tool) - bottom right */}
      <g transform="translate(44, 44) rotate(-45)">
        <rect x="-1.5" y="-7" width="3" height="10" rx="1.2" fill="white" fillOpacity="0.85" />
        <circle cx="0" cy="-8" r="3" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
      </g>

      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * 纯白版本，用于深色背景
 */
export function AppLogoWhite({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logoGradW)" />
      <circle cx="32" cy="26" r="12" stroke="white" strokeWidth="1.8" fill="none" opacity="0.9" />
      <ellipse cx="32" cy="26" rx="5.5" ry="12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7" />
      <line x1="20" y1="26" x2="44" y2="26" stroke="white" strokeWidth="1.2" opacity="0.7" />
      <line x1="21" y1="20" x2="43" y2="20" stroke="white" strokeWidth="0.8" opacity="0.5" />
      <line x1="21" y1="32" x2="43" y2="32" stroke="white" strokeWidth="0.8" opacity="0.5" />
      <path
        d="M14 40 L14 52 L50 52 L50 40"
        fill="white"
        fillOpacity="0.25"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 40 L32 30 L52 40"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect x="26" y="43" width="12" height="9" rx="1.5" fill="white" fillOpacity="0.4" stroke="white" strokeWidth="1.2" />
      <rect x="16" y="45" width="5" height="5" rx="0.8" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="0.8" />
      <rect x="43" y="45" width="5" height="5" rx="0.8" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="0.8" />
      <g transform="translate(44, 44) rotate(-45)">
        <rect x="-1.5" y="-7" width="3" height="10" rx="1.2" fill="white" fillOpacity="0.85" />
        <circle cx="0" cy="-8" r="3" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
      </g>
      <defs>
        <linearGradient id="logoGradW" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
