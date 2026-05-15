import { useState, useCallback, useEffect } from "react"
import type { User } from "@/types"

const API_BASE = "/api"

export interface LoginParams {
  type: "wechat" | "password" | "guest"
  userId?: string
  username?: string
  password?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("toolbox-user")
    return stored ? JSON.parse(stored) : null
  })
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>("")

  useEffect(() => {
    fetch(`${API_BASE}/auth/users`)
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(console.error)
  }, [])

  const login = useCallback(async (params: LoginParams) => {
    setIsLoading(true)
    setLoginError("")
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || "登录失败")
        return false
      }
      setUser(data)
      localStorage.setItem("toolbox-user", JSON.stringify(data))
      return true
    } catch (e) {
      setLoginError("网络错误，请稍后重试")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("toolbox-user")
    localStorage.removeItem("toolbox-recent")
  }, [])

  const isAdmin = user?.role === "admin"

  return { user, users, isLoading, loginError, login, logout, isAdmin }
}
