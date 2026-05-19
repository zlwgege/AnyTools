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

function safeUserRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    wechat_id: row.wechat_id,
    email: row.email || null,
    avatar: row.avatar || null,
  }
}

router.get("/users", (_req, res) => {
  const users = db.prepare("SELECT id, name, role, department, wechat_id, email, avatar FROM users").all() as DbUser[]
  res.json(users)
})

// Register a new user
router.post("/register", (req, res) => {
  const { username, password, email } = req.body as {
    username?: string
    password?: string
    email?: string
  }
  if (!username || !password) {
    return res.status(400).json({ error: "用户名和密码不能为空" })
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "密码长度至少4位" })
  }
  // Check if username already exists
  const existing = db.prepare("SELECT id FROM users WHERE name = ?").get(username) as DbUser | undefined
  if (existing) {
    return res.status(409).json({ error: "用户名已存在" })
  }
  // Check if email already bound
  if (email) {
    const emailExists = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as DbUser | undefined
    if (emailExists) {
      return res.status(409).json({ error: "该邮箱已被绑定" })
    }
  }
  const newUserId = `user-${Date.now()}`
  db.prepare(
    "INSERT INTO users (id, name, role, department, password, email) VALUES (?, ?, 'user', '待设置', ?, ?)"
  ).run(newUserId, username, password, email || null)

  recordSession(newUserId, "password", req)
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(newUserId) as DbUser
  return res.json({ user: safeUserRow(user) })
})

// Get current user profile
router.get("/profile/:userId", (req, res) => {
  const user = db.prepare("SELECT id, name, role, department, wechat_id, email, avatar FROM users WHERE id = ?").get(req.params.userId) as DbUser | undefined
  if (!user) return res.status(404).json({ error: "用户不存在" })
  return res.json(safeUserRow(user))
})

// Update user profile (nickname, email, avatar)
router.put("/profile/:userId", (req, res) => {
  const { name, email, avatar } = req.body as {
    name?: string
    email?: string
    avatar?: string
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.userId) as DbUser | undefined
  if (!user) return res.status(404).json({ error: "用户不存在" })

  // Check email uniqueness
  if (email && email !== user.email) {
    const emailExists = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, user.id) as DbUser | undefined
    if (emailExists) return res.status(409).json({ error: "该邮箱已被其他用户绑定" })
  }

  const updates: string[] = []
  const values: any[] = []
  if (name !== undefined) { updates.push("name = ?"); values.push(name) }
  if (email !== undefined) { updates.push("email = ?"); values.push(email) }
  if (avatar !== undefined) { updates.push("avatar = ?"); values.push(avatar) }
  if (updates.length === 0) return res.status(400).json({ error: "没有需要更新的字段" })

  values.push(req.params.userId)
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values)

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.userId) as DbUser
  return res.json({ user: safeUserRow(updated) })
})

// Change password
router.put("/password/:userId", (req, res) => {
  const { oldPassword, newPassword } = req.body as {
    oldPassword?: string
    newPassword?: string
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "旧密码和新密码不能为空" })
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: "新密码长度至少4位" })
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.userId) as (DbUser & { password: string | null }) | undefined
  if (!user) return res.status(404).json({ error: "用户不存在" })

  const validPassword = user.password || user.id
  if (oldPassword !== validPassword) {
    return res.status(401).json({ error: "旧密码不正确" })
  }

  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, user.id)
  return res.json({ success: true })
})

// Reset password via email verification
router.post("/reset-password", (req, res) => {
  const { email, newPassword } = req.body as {
    email?: string
    newPassword?: string
  }
  if (!email || !newPassword) {
    return res.status(400).json({ error: "邮箱和新密码不能为空" })
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: "新密码长度至少4位" })
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as (DbUser & { password: string | null }) | undefined
  if (!user) {
    return res.status(404).json({ error: "该邮箱未绑定任何帐号" })
  }

  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, user.id)
  return res.json({ success: true, message: "密码重置成功" })
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
    const guestUser = { id: guestId, name: "访客", role: "guest" as const, department: "-", email: null, avatar: null }
    recordSession(guestId, "guest", req)
    return res.json(guestUser)
  }

  // WeChat login
  if (type === "wechat") {
    if (!wechatId) return res.status(400).json({ error: "wechatId is required" })

    const existingUser = db.prepare("SELECT * FROM users WHERE wechat_id = ?").get(wechatId) as DbUser | undefined

    if (existingUser) {
      recordSession(existingUser.id, "wechat", req)
      return res.json({ user: safeUserRow(existingUser) })
    }

    const newUserId = `user-${Date.now()}`
    const defaultPassword = newUserId
    const defaultName = `企微用户${Date.now().toString().slice(-4)}`

    db.prepare(
      "INSERT INTO users (id, name, role, department, wechat_id, password) VALUES (?, ?, 'user', '待设置', ?, ?)"
    ).run(newUserId, defaultName, wechatId, defaultPassword)

    recordSession(newUserId, "wechat", req)

    return res.json({
      user: { id: newUserId, name: defaultName, role: "user", department: "待设置", wechat_id: wechatId, email: null, avatar: null },
      isNewAccount: true,
      defaultPassword,
    })
  }

  // Password login
  if (type === "password") {
    if (!username || !password) return res.status(400).json({ error: "username and password are required" })
    const user = db.prepare("SELECT * FROM users WHERE name = ? OR id = ?").get(username, username) as (DbUser & { password: string | null }) | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    const validPassword = user.password || user.id
    if (password !== validPassword) return res.status(401).json({ error: "Invalid password" })
    recordSession(user.id, "password", req)
    return res.json({ user: safeUserRow(user) })
  }

  // Legacy fallback
  if (userId) {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return res.status(404).json({ error: "User not found" })
    recordSession(user.id, "wechat", req)
    return res.json({ user: safeUserRow(user) })
  }

  res.status(400).json({ error: "Invalid login parameters" })
})

export default router
