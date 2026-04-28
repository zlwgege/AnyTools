import { Router } from "express"
import db from "../db.js"
import type { DbUser } from "../types.js"

const router = Router()

router.get("/users", (_req, res) => {
  const users = db.prepare("SELECT id, name, role, department FROM users").all() as DbUser[]
  res.json(users)
})

router.post("/login", (req, res) => {
  const { userId } = req.body as { userId: string }
  if (!userId) return res.status(400).json({ error: "userId is required" })

  const user = db.prepare("SELECT id, name, role, department FROM users WHERE id = ?").get(userId) as DbUser | undefined
  if (!user) return res.status(404).json({ error: "User not found" })

  res.json(user)
})

export default router
