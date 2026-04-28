import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

export function Avatar({ src, alt, fallback, className, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-gradient-primary",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || fallback}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-primary-foreground">
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  )
}
