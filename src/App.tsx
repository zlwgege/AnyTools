import { Routes, Route, Navigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/hooks/useAuth"
import { useFavorites } from "@/hooks/useFavorites"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { HomePage } from "@/pages/HomePage"
import ToolPage from "@/pages/ToolPage"
import VersionLogPage from "@/pages/VersionLogPage"
import AdminPage from "@/pages/AdminPage"
import ProfilePage from "@/pages/ProfilePage"

function App() {
  const { theme, toggleTheme } = useTheme()
  const { user, isLoading, loginError, login, register, updateProfile, changePassword, resetPassword, logout, isAdmin, newAccountInfo, clearNewAccountInfo } = useAuth()
  const { favorites, recentIds, toggleFavorite, addRecent } = useFavorites(user?.id)

  if (!user || newAccountInfo) {
    return <LoginPage onLogin={login} onRegister={register} onResetPassword={resetPassword} isLoading={isLoading} error={loginError} newAccountInfo={newAccountInfo} onClearNewAccountInfo={clearNewAccountInfo} />
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
            userAvatar={user.avatar}
            onLogout={logout}
            isAdmin={isAdmin}
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
            userAvatar={user.avatar}
            onLogout={logout}
            favorites={favorites}
            recentIds={recentIds}
            onToggleFavorite={toggleFavorite}
            onOpenTool={(id) => {
              addRecent(id)
              window.open(`/tools/${id}`, "_blank")
            }}
            isAdmin={isAdmin}
          />
        }
      />
      <Route path="/tools/:toolId" element={<ToolPage />} />
      <Route path="/version-log" element={<VersionLogPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/profile" element={<ProfilePage user={user} onUpdateProfile={updateProfile} onChangePassword={changePassword} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
