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

export interface RegisterParams {
  username: string
  password: string
  email?: string
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

  const register = useCallback(async (params: RegisterParams): Promise<LoginResult> => {
    setIsLoading(true)
    setLoginError("")
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || "注册失败")
        return { success: false }
      }
      const userData = data.user
      setUser(userData)
      localStorage.setItem("toolbox-user", JSON.stringify(userData))
      return { success: true }
    } catch {
      setLoginError("网络错误，请稍后重试")
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: { name?: string; email?: string; avatar?: string }): Promise<boolean> => {
    if (!user) return false
    try {
      const res = await fetch(`${API_BASE}/auth/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "更新失败")
        return false
      }
      const updated = data.user
      setUser(updated)
      localStorage.setItem("toolbox-user", JSON.stringify(updated))
      return true
    } catch {
      alert("网络错误，请稍后重试")
      return false
    }
  }, [user])

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false
    try {
      const res = await fetch(`${API_BASE}/auth/password/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "修改密码失败")
        return false
      }
      return true
    } catch {
      alert("网络错误，请稍后重试")
      return false
    }
  }, [user])

  const resetPassword = useCallback(async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "重置密码失败")
        return false
      }
      return true
    } catch {
      alert("网络错误，请稍后重试")
      return false
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

  return { user, users, isLoading, loginError, login, register, updateProfile, changePassword, resetPassword, logout, isAdmin, newAccountInfo, clearNewAccountInfo }
}
