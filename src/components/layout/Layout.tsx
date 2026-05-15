import { useState } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import type { ToolCategory } from "@/types"

interface LayoutProps {
  children: (props: {
    activeCategory: ToolCategory | "all" | "favorites" | "recent"
    searchQuery: string
  }) => React.ReactNode
  theme: "light" | "dark"
  onToggleTheme: () => void
  userName: string
  onLogout: () => void
  favoriteCount: number
  recentCount: number
  isAdmin?: boolean
}

export function Layout({
  children,
  theme,
  onToggleTheme,
  userName,
  onLogout,
  favoriteCount,
  recentCount,
  isAdmin,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<
    ToolCategory | "all" | "favorites" | "recent"
  >("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userName={userName}
        onLogout={onLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
      />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          favoriteCount={favoriteCount}
          recentCount={recentCount}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-8">
            {children({ activeCategory, searchQuery })}
          </div>
        </main>
      </div>
      <footer className="border-t py-3 text-center text-xs text-muted-foreground">
        ToolBox · 开发者工具门户 · 大帅哥出品，必属精品
      </footer>
    </div>
  )
}
