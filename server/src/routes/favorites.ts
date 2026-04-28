import { Router } from "express"
import db from "../db.js"

const router = Router()

// Get user's favorite tool ids
router.get("/:userId", (req, res) => {
  const { userId } = req.params
  const rows = db.prepare("SELECT tool_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC").all(userId) as { tool_id: string }[]
  res.json(rows.map((r) => r.tool_id))
})

// Add favorite
router.post("/:userId", (req, res) => {
  const { userId } = req.params
  const { toolId } = req.body as { toolId: string }
  if (!toolId) return res.status(400).json({ error: "toolId is required" })

  db.prepare("INSERT OR IGNORE INTO favorites (user_id, tool_id) VALUES (?, ?)").run(userId, toolId)
  res.json({ ok: true })
})

// Remove favorite
router.delete("/:userId/:toolId", (req, res) => {
  const { userId, toolId } = req.params
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND tool_id = ?").run(userId, toolId)
  res.json({ ok: true })
})

export default router
