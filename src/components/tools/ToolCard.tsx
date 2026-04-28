import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Tool } from "@/types"

interface ToolCardProps {
  tool: Tool
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onOpen: (id: string) => void
  index: number
}

export function ToolCard({ tool, isFavorite, onToggleFavorite, onOpen, index }: ToolCardProps) {
  const Icon = tool.icon

  return (
    <div
      className="group relative rounded-xl border bg-card p-5 transition-smooth hover:shadow-card-hover hover:border-primary/20 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => onOpen(tool.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(tool.id)
      }}
    >
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(tool.id)
        }}
        className={cn(
          "absolute right-4 top-4 rounded-full p-1.5 transition-smooth",
          isFavorite
            ? "text-amber-500"
            : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-amber-500"
        )}
        aria-label={isFavorite ? "取消收藏" : "收藏"}
      >
        <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>

      {/* Icon */}
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow">
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <h3 className="mb-1 text-sm font-semibold leading-tight">
        {tool.name}
      </h3>
      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {tool.description}
      </p>

      {/* Badges */}
      <div className="mt-3 flex items-center gap-1.5">
        {tool.isNew && <Badge variant="accent" className="text-[10px] px-1.5 py-0">NEW</Badge>}
        {tool.isHot && <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-orange-500/90">HOT</Badge>}
      </div>
    </div>
  )
}
