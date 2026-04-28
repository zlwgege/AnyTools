import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import logRoutes from "./routes/logs.js"
import networkRoutes from "./routes/network.js"
import favoritesRoutes from "./routes/favorites.js"

const app = express()
const PORT = 3001

app.use(cors({ origin: true }))
app.use(express.json({ limit: "5mb" }))

app.use("/api/auth", authRoutes)
app.use("/api/logs", logRoutes)
app.use("/api/network", networkRoutes)
app.use("/api/favorites", favoritesRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`ToolBox API server running on http://localhost:${PORT}`)
})
