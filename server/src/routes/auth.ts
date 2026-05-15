import { Router } from "express"
import db from "../db.js"
import type { DbUser } from "../types.js"

const router = Router()

function getClientInfo(req: any) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""
  const userAgent = req.headers["user-agent"] || ""
  // Simple browser/OS detection
  let browser = "Unknown"
  let os = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  return { ip: String(ip).split(",")[0].trim(), userAgent, browser, os }
}

function recordSession(userId: string, loginType: "wechat" | "password" | "guest", req: any) {
  const info = getClientInfo(req)
  db.prepare(
    "INSERT INTO login_sessions (user_id, login_type, ip, user_agent, browser, os) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, loginType, info.ip, info.userAgent, info.browser, info.os)
}

router.get("/users", (_req, res) => {
  const users = db.prepare("SELECT id, name, role, department FROM users").all() as DbUser[]
  res.json(users)
})

router.post("/login", (req, res) => {
  const { type, userId, username, password } = req.body as {
    type?: string
    userId?: string
    username?: string
    password?: string
  }

  // Guest login
  if (type === "guest") {
    const guestId = `guest-${Date.now()}`
    const guestUser = { id: guestId, name: "访客", role: "guest" as const, department: "-" }
    recordSession(guestId, "guest", req)
    return res.json(guestUser)
  }

  // WeChat login (mock - use userId for demo)
  if (type === "wechat") {
    if (!userId) return res.status(400).json({ error: "userId is required" })
    const user = db.prepare("SELECT id, name, role, department FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    recordSession(user.id, "wechat", req)
    return res.json(user)
  }

  // Password login
  if (type === "password") {
    if (!username || !password) return res.status(400).json({ error: "username and password are required" })
    // Simple demo: username maps to user id, password must match username
    const user = db.prepare("SELECT id, name, role, department FROM users WHERE name = ?").get(username) as DbUser | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    // Demo password check: password equals user id
    if (password !== user.id) return res.status(401).json({ error: "Invalid password" })
    recordSession(user.id, "password", req)
    return res.json(user)
  }

  // Legacy fallback: just userId (for backward compatibility)
  if (userId) {
    const user = db.prepare("SELECT id, name, role, department FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    recordSession(user.id, "wechat", req)
    return res.json(user)
  }

  res.status(400).json({ error: "Invalid login parameters" })
})

export default router
