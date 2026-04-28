import { cn } from "@/lib/utils"
import { categories } from "@/data/tools"
import { Star, Clock, LayoutGrid, X, Home } from "lucide-react"
import type { ToolCategory } from "@/types"
import { Link, useLocation } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeCategory: ToolCategory | "all" | "favorites" | "recent"
  onCategoryChange: (category: ToolCategory | "all" | "favorites" | "recent") => void
  favoriteCount: number
  recentCount: number
}

export function Sidebar({
  isOpen,
  onClose,
  activeCategory,
  onCategoryChange,
  favoriteCount,
  recentCount,
}: SidebarProps) {
  const location = useLocation()
  const handleClick = (cat: ToolCategory | "all" | "favorites" | "recent") => {
    onCategoryChange(cat)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 glass lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-[var(--sidebar-width)] flex-col border-r bg-gradient-sidebar transition-smooth lg:sticky",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-sm font-semibold">导航</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
          {/* Home Link */}
          <div className="mb-2">
            <Link
              to="/"
              onClick={onClose}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                location.pathname === "/"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              <span className="flex-1 text-left">首页</span>
            </Link>
          </div>

          {/* Quick Access */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              快捷入口
            </p>
            <SidebarItem
              icon={<LayoutGrid className="h-4 w-4" />}
              label="全部工具"
              active={activeCategory === "all"}
              onClick={() => handleClick("all")}
            />
            <SidebarItem
              icon={<Star className="h-4 w-4" />}
              label="我的收藏"
              active={activeCategory === "favorites"}
              onClick={() => handleClick("favorites")}
              badge={favoriteCount > 0 ? favoriteCount : undefined}
            />
            <SidebarItem
              icon={<Clock className="h-4 w-4" />}
              label="最近使用"
              active={activeCategory === "recent"}
              onClick={() => handleClick("recent")}
              badge={recentCount > 0 ? recentCount : undefined}
            />
          </div>

          {/* Categories */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              工具分类
            </p>
            {categories.map((cat) => (
              <SidebarItem
                key={cat.id}
                icon={<cat.icon className="h-4 w-4" />}
                label={cat.name}
                active={activeCategory === cat.id}
                onClick={() => handleClick(cat.id)}
              />
            ))}
          </div>
        </nav>

        <div className="border-t p-4">
          <div className="rounded-lg bg-gradient-primary p-3">
            <p className="text-xs font-medium text-primary-foreground">
              需要新工具？
            </p>
            <p className="mt-1 text-xs text-primary-foreground/70">
              联系管理员提交工具需求
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  badge?: number
}

function SidebarItem({ icon, label, active, onClick, badge }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
        active
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
            active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
