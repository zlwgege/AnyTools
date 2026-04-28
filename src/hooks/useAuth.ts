import { useState, useCallback, useEffect } from "react"
import type { User } from "@/types"

const API_BASE = "http://localhost:3001/api"

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("toolbox-user")
    return stored ? JSON.parse(stored) : null
  })
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/auth/users`)
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(console.error)
  }, [])

  const login = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error("Login failed")
      const data = await res.json()
      setUser(data)
      localStorage.setItem("toolbox-user", JSON.stringify(data))
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("toolbox-user")
    localStorage.removeItem("toolbox-recent")
  }, [])

  return { user, users, isLoading, login, logout }
}
