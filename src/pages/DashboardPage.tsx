import { Layout } from "@/components/layout/Layout"
import { ToolGrid } from "@/components/tools/ToolGrid"

interface DashboardPageProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  userName: string
  onLogout: () => void
  favorites: string[]
  recentIds: string[]
  onToggleFavorite: (id: string) => void
  onOpenTool: (id: string) => void
}

export function DashboardPage({
  theme,
  onToggleTheme,
  userName,
  onLogout,
  favorites,
  recentIds,
  onToggleFavorite,
  onOpenTool,
}: DashboardPageProps) {
  return (
    <Layout
      theme={theme}
      onToggleTheme={onToggleTheme}
      userName={userName}
      onLogout={onLogout}
      favoriteCount={favorites.length}
      recentCount={recentIds.length}
    >
      {({ activeCategory, searchQuery }) => (
        <ToolGrid
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          favorites={favorites}
          recentIds={recentIds}
          onToggleFavorite={onToggleFavorite}
          onOpenTool={onOpenTool}
        />
      )}
    </Layout>
  )
}
