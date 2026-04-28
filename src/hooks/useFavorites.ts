import { useState, useCallback, useEffect } from "react"

const API_BASE = "http://localhost:3001/api"
const STORAGE_KEY_RECENT = "toolbox-recent"
const MAX_RECENT = 8

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>([])

  const [recentIds, setRecentIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(STORAGE_KEY_RECENT, [])
  )

  useEffect(() => {
    if (!userId) {
      setFavorites([])
      return
    }
    fetch(`${API_BASE}/favorites/${userId}`)
      .then((r) => r.json())
      .then((data) => setFavorites(data))
      .catch(console.error)
  }, [userId])

  const toggleFavorite = useCallback(
    async (toolId: string) => {
      if (!userId) return
      const isFav = favorites.includes(toolId)
      if (isFav) {
        await fetch(`${API_BASE}/favorites/${userId}/${toolId}`, {
          method: "DELETE",
        })
        setFavorites((prev) => prev.filter((id) => id !== toolId))
      } else {
        await fetch(`${API_BASE}/favorites/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolId }),
        })
        setFavorites((prev) => [...prev, toolId])
      }
    },
    [favorites, userId]
  )

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  )

  const addRecent = useCallback((toolId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== toolId)
      const next = [toolId, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(next))
      return next
    })
  }, [])

  return { favorites, recentIds, toggleFavorite, isFavorite, addRecent }
}
