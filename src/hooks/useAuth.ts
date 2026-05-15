import { useState, useCallback, useEffect } from "react"
import type { User } from "@/types"

const API_BASE = "/api"

export interface LoginParams {
  type: "wechat" | "password" | "guest"
  userId?: string
  username?: string
  password?: string
  wechatId?: string
}

export interface LoginResult {
  success: boolean
  isNewAccount?: boolean
  defaultPassword?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("toolbox-user")
    return stored ? JSON.parse(stored) : null
  })
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>("")
  const [newAccountInfo, setNewAccountInfo] = useState<{ userId: string; password: string } | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/auth/users`)
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(console.error)
  }, [])

  const login = useCallback(async (params: LoginParams): Promise<LoginResult> => {
    setIsLoading(true)
    setLoginError("")
    setNewAccountInfo(null)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || "登录失败")
        return { success: false }
      }

      // Handle different response formats
      const userData = data.user || data
      const isNewAccount = data.isNewAccount || false
      const defaultPassword = data.defaultPassword || ""

      setUser(userData)
      localStorage.setItem("toolbox-user", JSON.stringify(userData))

      if (isNewAccount && defaultPassword) {
        setNewAccountInfo({ userId: userData.id, password: defaultPassword })
      }

      return { success: true, isNewAccount, defaultPassword }
    } catch (e) {
      setLoginError("网络错误，请稍后重试")
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("toolbox-user")
    localStorage.removeItem("toolbox-recent")
    setNewAccountInfo(null)
  }, [])

  const clearNewAccountInfo = useCallback(() => {
    setNewAccountInfo(null)
  }, [])

  const isAdmin = user?.role === "admin"

  return { user, users, isLoading, loginError, login, logout, isAdmin, newAccountInfo, clearNewAccountInfo }
}
