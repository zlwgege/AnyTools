import { Layout } from "@/components/layout/Layout"
import { ToolGrid } from "@/components/tools/ToolGrid"

interface DashboardPageProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  userName: string
  userAvatar?: string
  onLogout: () => void
  favorites: string[]
  recentIds: string[]
  onToggleFavorite: (id: string) => void
  onOpenTool: (id: string) => void
  isAdmin?: boolean
}

export function DashboardPage({
  theme,
  onToggleTheme,
  userName,
  userAvatar,
  onLogout,
  favorites,
  recentIds,
  onToggleFavorite,
  onOpenTool,
  isAdmin,
}: DashboardPageProps) {
  return (
    <Layout
      theme={theme}
      onToggleTheme={onToggleTheme}
      userName={userName}
      userAvatar={userAvatar}
      onLogout={onLogout}
      favoriteCount={favorites.length}
      recentCount={recentIds.length}
      isAdmin={isAdmin}
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
