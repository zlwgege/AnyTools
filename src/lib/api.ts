const API_BASE = "http://localhost:3001/api"

export async function logUsage(
  userId: string,
  toolId: string,
  toolName: string,
  action: string,
  details?: string
) {
  try {
    await fetch(`${API_BASE}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, toolId, toolName, action, details }),
    })
  } catch (e) {
    console.error("Log failed:", e)
  }
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/auth/users`)
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function loginUser(userId: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Login failed")
  return res.json()
}
