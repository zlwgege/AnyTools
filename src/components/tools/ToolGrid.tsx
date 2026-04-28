import { ToolCard } from "./ToolCard"
import { tools as allTools, categories, getToolsByCategory, searchTools } from "@/data/tools"
import type { Tool, ToolCategory } from "@/types"
import { Inbox } from "lucide-react"

interface ToolGridProps {
  activeCategory: ToolCategory | "all" | "favorites" | "recent"
  searchQuery: string
  favorites: string[]
  recentIds: string[]
  onToggleFavorite: (id: string) => void
  onOpenTool: (id: string) => void
}

export function ToolGrid({
  activeCategory,
  searchQuery,
  favorites,
  recentIds,
  onToggleFavorite,
  onOpenTool,
}: ToolGridProps) {
  let displayTools: Tool[] = []
  let title = ""
  let subtitle = ""

  if (searchQuery.trim()) {
    displayTools = searchTools(searchQuery)
    title = `搜索结果`
    subtitle = `找到 ${displayTools.length} 个工具`
  } else if (activeCategory === "all") {
    displayTools = allTools
    title = "全部工具"
    subtitle = `共 ${allTools.length} 个工具`
  } else if (activeCategory === "favorites") {
    displayTools = allTools.filter((t) => favorites.includes(t.id))
    title = "我的收藏"
    subtitle = `${displayTools.length} 个收藏工具`
  } else if (activeCategory === "recent") {
    displayTools = recentIds
      .map((id) => allTools.find((t) => t.id === id))
      .filter(Boolean) as Tool[]
    title = "最近使用"
    subtitle = `${displayTools.length} 个最近使用的工具`
  } else {
    displayTools = getToolsByCategory(activeCategory)
    const cat = categories.find((c) => c.id === activeCategory)
    title = cat?.name || ""
    subtitle = `${displayTools.length} 个工具`
  }

  // Group by category when showing all
  const showGrouped = activeCategory === "all" && !searchQuery.trim()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {displayTools.length === 0 ? (
        <EmptyState category={activeCategory} hasSearch={!!searchQuery.trim()} />
      ) : showGrouped ? (
        <div className="space-y-10">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.id)
            return (
              <section key={cat.id}>
                <div className="mb-4 flex items-center gap-2">
                  <cat.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{cat.name}</h2>
                  <span className="text-xs text-muted-foreground">
                    ({catTools.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {catTools.map((tool, i) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={favorites.includes(tool.id)}
                      onToggleFavorite={onToggleFavorite}
                      onOpen={onOpenTool}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayTools.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
              onOpen={onOpenTool}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({
  category,
  hasSearch,
}: {
  category: string
  hasSearch: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">
        {hasSearch ? "未找到匹配工具" : "暂无工具"}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "尝试使用其他关键词搜索"
          : category === "favorites"
          ? "点击工具卡片上的星标添加收藏"
          : "最近使用的工具会显示在这里"}
      </p>
    </div>
  )
}
