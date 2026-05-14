import { Router } from "express"
import db from "../db.js"

const router = Router()

interface BinLabelRecord {
  id: number
  user_id: string
  name: string
  data: string
  count: number
  created_at: string
}

// GET /api/bin-labels?userId=xxx — 查询当前用户的生成记录
router.get("/", (req, res) => {
  const userId = req.query.userId as string
  if (!userId) {
    res.status(400).json({ error: "缺少 userId" })
    return
  }
  const rows = db
    .prepare("SELECT id, user_id, name, count, created_at FROM bin_labels WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as BinLabelRecord[]
  res.json({ records: rows })
})

// GET /api/bin-labels/:id — 获取单条记录详情
router.get("/:id", (req, res) => {
  const id = req.params.id
  const row = db.prepare("SELECT * FROM bin_labels WHERE id = ?").get(id) as BinLabelRecord | undefined
  if (!row) {
    res.status(404).json({ error: "记录不存在" })
    return
  }
  res.json({ record: row })
})

// POST /api/bin-labels — 保存新的生成记录
router.post("/", (req, res) => {
  const { userId, name, data, count } = req.body
  if (!userId || !name || !data || typeof count !== "number") {
    res.status(400).json({ error: "缺少必要字段" })
    return
  }
  const result = db
    .prepare("INSERT INTO bin_labels (user_id, name, data, count) VALUES (?, ?, ?, ?)")
    .run(userId, name, data, count)
  res.json({ id: result.lastInsertRowid, message: "保存成功" })
})

// DELETE /api/bin-labels/:id — 删除记录
router.delete("/:id", (req, res) => {
  const id = req.params.id
  const userId = req.query.userId as string
  if (!userId) {
    res.status(400).json({ error: "缺少 userId" })
    return
  }
  db.prepare("DELETE FROM bin_labels WHERE id = ? AND user_id = ?").run(id, userId)
  res.json({ message: "删除成功" })
})

export default router
