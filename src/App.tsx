import { Routes, Route, Navigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/hooks/useAuth"
import { useFavorites } from "@/hooks/useFavorites"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { HomePage } from "@/pages/HomePage"
import ToolPage from "@/pages/ToolPage"

function App() {
  const { theme, toggleTheme } = useTheme()
  const { user, users, isLoading, login, logout } = useAuth()
  const { favorites, recentIds, toggleFavorite, addRecent } = useFavorites(user?.id)

  if (!user) {
    return <LoginPage users={users} onLogin={login} isLoading={isLoading} />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            theme={theme}
            onToggleTheme={toggleTheme}
            userName={user.name}
            onLogout={logout}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <DashboardPage
            theme={theme}
            onToggleTheme={toggleTheme}
            userName={user.name}
            onLogout={logout}
            favorites={favorites}
            recentIds={recentIds}
            onToggleFavorite={toggleFavorite}
            onOpenTool={(id) => {
              addRecent(id)
              window.open(`/tools/${id}`, "_blank")
            }}
          />
        }
      />
      <Route path="/tools/:toolId" element={<ToolPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
