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
  const users = db.prepare("SELECT id, name, role, department, wechat_id FROM users").all() as DbUser[]
  res.json(users)
})

router.post("/login", (req, res) => {
  const { type, userId, username, password, wechatId } = req.body as {
    type?: string
    userId?: string
    username?: string
    password?: string
    wechatId?: string
  }

  // Guest login
  if (type === "guest") {
    const guestId = `guest-${Date.now()}`
    const guestUser = { id: guestId, name: "访客", role: "guest" as const, department: "-" }
    recordSession(guestId, "guest", req)
    return res.json(guestUser)
  }

  // WeChat login
  if (type === "wechat") {
    if (!wechatId) return res.status(400).json({ error: "wechatId is required" })

    // Check if this wechatId is already bound to a user
    const existingUser = db.prepare("SELECT id, name, role, department, wechat_id FROM users WHERE wechat_id = ?").get(wechatId) as DbUser | undefined

    if (existingUser) {
      // Already bound - login with this user
      recordSession(existingUser.id, "wechat", req)
      return res.json({ user: { id: existingUser.id, name: existingUser.name, role: existingUser.role, department: existingUser.department, wechat_id: existingUser.wechat_id } })
    }

    // New WeChat ID - auto-create a regular user
    const newUserId = `user-${Date.now()}`
    const defaultPassword = newUserId
    const defaultName = `企微用户${Date.now().toString().slice(-4)}`

    db.prepare(
      "INSERT INTO users (id, name, role, department, wechat_id, password) VALUES (?, ?, 'user', '待设置', ?, ?)"
    ).run(newUserId, defaultName, wechatId, defaultPassword)

    recordSession(newUserId, "wechat", req)

    return res.json({
      user: { id: newUserId, name: defaultName, role: "user", department: "待设置", wechat_id: wechatId },
      isNewAccount: true,
      defaultPassword,
    })
  }

  // Password login
  if (type === "password") {
    if (!username || !password) return res.status(400).json({ error: "username and password are required" })
    // Find user by name or id
    const user = db.prepare("SELECT id, name, role, department, wechat_id, password FROM users WHERE name = ? OR id = ?").get(username, username) as (DbUser & { password: string | null }) | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    // Password check: password field or fallback to user id
    const validPassword = user.password || user.id
    if (password !== validPassword) return res.status(401).json({ error: "Invalid password" })
    recordSession(user.id, "password", req)
    return res.json({ user: { id: user.id, name: user.name, role: user.role, department: user.department, wechat_id: user.wechat_id } })
  }

  // Legacy fallback: just userId (for backward compatibility)
  if (userId) {
    const user = db.prepare("SELECT id, name, role, department, wechat_id FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    recordSession(user.id, "wechat", req)
    return res.json({ user: { id: user.id, name: user.name, role: user.role, department: user.department, wechat_id: user.wechat_id } })
  }

  res.status(400).json({ error: "Invalid login parameters" })
})

export default router
