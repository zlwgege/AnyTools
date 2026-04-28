import { Router } from "express"
import db from "../db.js"
import type { DbUsageLog, LogQuery, StatsQuery } from "../types.js"

const router = Router()

// Create log entry
router.post("/", (req, res) => {
  const { userId, toolId, toolName, action, details } = req.body
  if (!userId || !toolId || !toolName || !action) {
    return res.status(400).json({ error: "Missing required fields" })
  }
  const result = db.prepare(
    "INSERT INTO usage_logs (user_id, tool_id, tool_name, action, details) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, toolId, toolName, action, details || null)

  res.json({ id: result.lastInsertRowid })
})

// Query logs with pagination and filters
router.get("/", (req, res) => {
  const q: LogQuery = {
    userId: req.query.userId as string | undefined,
    toolId: req.query.toolId as string | undefined,
    keyword: req.query.keyword as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    page: parseInt(req.query.page as string) || 1,
    pageSize: Math.min(parseInt(req.query.pageSize as string) || 20, 100),
  }

  const conditions: string[] = []
  const params: unknown[] = []

  if (q.userId) {
    conditions.push("l.user_id = ?")
    params.push(q.userId)
  }
  if (q.toolId) {
    conditions.push("l.tool_id = ?")
    params.push(q.toolId)
  }
  if (q.keyword) {
    conditions.push("(l.tool_name LIKE ? OR l.action LIKE ? OR l.details LIKE ?)")
    const kw = `%${q.keyword}%`
    params.push(kw, kw, kw)
  }
  if (q.startDate) {
    conditions.push("l.created_at >= ?")
    params.push(q.startDate)
  }
  if (q.endDate) {
    conditions.push("l.created_at <= ?")
    params.push(q.endDate + " 23:59:59")
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  const total = (db.prepare(
    `SELECT COUNT(*) as c FROM usage_logs l ${where}`
  ).get(...params) as { c: number }).c

  const offset = (q.page - 1) * q.pageSize
  const data = db.prepare(
    `SELECT l.*, u.name as user_name FROM usage_logs l LEFT JOIN users u ON l.user_id = u.id ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, q.pageSize, offset) as (DbUsageLog & { user_name: string })[]

  res.json({ data, total, page: q.page, pageSize: q.pageSize })
})

// Aggregated stats
router.get("/stats", (req, res) => {
  const q: StatsQuery = {
    userId: req.query.userId as string | undefined,
    period: (req.query.period as "day" | "week" | "month") || "week",
  }

  const userFilter = q.userId ? "WHERE user_id = ?" : ""
  const userParams = q.userId ? [q.userId] : []

  // Today count
  const todayCount = (db.prepare(
    `SELECT COUNT(*) as c FROM usage_logs ${userFilter ? userFilter + " AND" : "WHERE"} date(created_at) = date('now', 'localtime')`
  ).get(...userParams) as { c: number }).c

  // Week count
  const weekCount = (db.prepare(
    `SELECT COUNT(*) as c FROM usage_logs ${userFilter ? userFilter + " AND" : "WHERE"} created_at >= datetime('now', '-7 days', 'localtime')`
  ).get(...userParams) as { c: number }).c

  // Month count
  const monthCount = (db.prepare(
    `SELECT COUNT(*) as c FROM usage_logs ${userFilter ? userFilter + " AND" : "WHERE"} created_at >= datetime('now', '-30 days', 'localtime')`
  ).get(...userParams) as { c: number }).c

  // Total count
  const totalCount = (db.prepare(
    `SELECT COUNT(*) as c FROM usage_logs ${userFilter}`
  ).get(...userParams) as { c: number }).c

  // Top tools
  const topTools = db.prepare(
    `SELECT tool_id, tool_name, COUNT(*) as count FROM usage_logs ${userFilter} GROUP BY tool_id ORDER BY count DESC LIMIT 10`
  ).all(...userParams) as { tool_id: string; tool_name: string; count: number }[]

  // Daily trend (last 14 days)
  const dailyTrend = db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as count FROM usage_logs ${userFilter ? userFilter + " AND" : "WHERE"} created_at >= datetime('now', '-14 days', 'localtime') GROUP BY date(created_at) ORDER BY date`
  ).all(...userParams) as { date: string; count: number }[]

  // Recent logs
  const recentLogs = db.prepare(
    `SELECT l.*, u.name as user_name FROM usage_logs l LEFT JOIN users u ON l.user_id = u.id ${userFilter ? "WHERE l.user_id = ?" : ""} ORDER BY l.created_at DESC LIMIT 10`
  ).all(...userParams) as (DbUsageLog & { user_name: string })[]

  // Active users (admin only, no user filter)
  const activeUsers = db.prepare(
    `SELECT u.id, u.name, u.department, COUNT(l.id) as count FROM users u LEFT JOIN usage_logs l ON u.id = l.user_id GROUP BY u.id ORDER BY count DESC`
  ).all() as { id: string; name: string; department: string; count: number }[]

  res.json({
    todayUsages: todayCount,
    weekUsages: weekCount,
    monthUsages: monthCount,
    totalUsages: totalCount,
    topTools,
    dailyTrend,
    recentLogs,
    activeUsers,
  })
})

export default router
