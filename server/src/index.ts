import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import logRoutes from "./routes/logs.js"
import networkRoutes from "./routes/network.js"
import favoritesRoutes from "./routes/favorites.js"
import binLabelsRoutes from "./routes/binLabels.js"
import adminRoutes from "./routes/admin.js"

const app = express()
const PORT = Number(process.env.PORT) || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*"

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json({ limit: "5mb" }))

app.use("/api/auth", authRoutes)
app.use("/api/logs", logRoutes)
app.use("/api/network", networkRoutes)
app.use("/api/favorites", favoritesRoutes)
app.use("/api/bin-labels", binLabelsRoutes)
app.use("/api/admin", adminRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`ToolBox API server running on port ${PORT}`)
})
