import { Router } from "express"
import db from "../db.js"
import type { DbUser, DbUsageLog, DbLoginSession } from "../types.js"

const router = Router()

// Middleware: check admin role
function requireAdmin(req: any, res: any, next: any) {
  const userId = req.headers["x-user-id"] as string
  if (!userId) return res.status(401).json({ error: "Unauthorized" })
  const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId) as { role: string } | undefined
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin required" })
  next()
}

// ===== User Management =====

// GET /api/admin/users
router.get("/users", requireAdmin, (_req, res) => {
  const users = db.prepare("SELECT id, name, role, department, wechat_id, created_at FROM users ORDER BY created_at DESC").all() as DbUser[]
  res.json({ users })
})

// POST /api/admin/users
router.post("/users", requireAdmin, (req, res) => {
  const { id, name, role, department, wechat_id, password } = req.body
  if (!id || !name || !role) return res.status(400).json({ error: "id, name, role are required" })
  try {
    db.prepare("INSERT INTO users (id, name, role, department, wechat_id, password) VALUES (?, ?, ?, ?, ?, ?)").run(id, name, role, department || "", wechat_id || null, password || id)
    res.json({ message: "User created" })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// PUT /api/admin/users/:id
router.put("/users/:id", requireAdmin, (req, res) => {
  const id = req.params.id
  const { name, role, department } = req.body
  db.prepare("UPDATE users SET name = ?, role = ?, department = ? WHERE id = ?").run(name, role, department, id)
  res.json({ message: "User updated" })
})

// DELETE /api/admin/users/:id
router.delete("/users/:id", requireAdmin, (req, res) => {
  const id = req.params.id
  db.prepare("DELETE FROM users WHERE id = ?").run(id)
  res.json({ message: "User deleted" })
})

// ===== Login Sessions =====

// GET /api/admin/sessions
router.get("/sessions", requireAdmin, (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100)
  const offset = (page - 1) * pageSize

  const total = (db.prepare("SELECT COUNT(*) as c FROM login_sessions").get() as { c: number }).c
  const sessions = db.prepare(
    `SELECT s.*, u.name as user_name FROM login_sessions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT ? OFFSET ?`
  ).all(pageSize, offset) as (DbLoginSession & { user_name: string })[]

  res.json({ data: sessions, total, page, pageSize })
})

// ===== Usage Logs (admin view - all users) =====

// GET /api/admin/logs
router.get("/logs", requireAdmin, (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100)
  const keyword = req.query.keyword as string | undefined
  const offset = (page - 1) * pageSize

  let where = ""
  const params: unknown[] = []
  if (keyword) {
    where = "WHERE l.tool_name LIKE ? OR l.action LIKE ? OR u.name LIKE ?"
    const kw = `%${keyword}%`
    params.push(kw, kw, kw)
  }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM usage_logs l LEFT JOIN users u ON l.user_id = u.id ${where}`).get(...params) as { c: number }).c
  const data = db.prepare(
    `SELECT l.*, u.name as user_name, u.role as user_role FROM usage_logs l LEFT JOIN users u ON l.user_id = u.id ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset) as (DbUsageLog & { user_name: string; user_role: string })[]

  res.json({ data, total, page, pageSize })
})

export default router
