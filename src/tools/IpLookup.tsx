import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Search } from "lucide-react"

const API_BASE = "http://localhost:3001/api"

export default function IpLookup({ tool, user }: { tool: Tool; user: User }) {
  const [ip, setIp] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState("")

  const handleLookup = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/network/ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "查询失败")
      setResult(data)
      logUsage(user.id, tool.id, tool.name, "execute")
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="输入 IP 地址（留空查询本机）"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="flex-1 font-mono"
        />
        <Button onClick={handleLookup} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? "查询中..." : "查询"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="grid gap-2">
          {[
            { key: "query", label: "IP 地址" },
            { key: "country", label: "国家" },
            { key: "regionName", label: "地区" },
            { key: "city", label: "城市" },
            { key: "isp", label: "运营商" },
            { key: "timezone", label: "时区" },
          ].map((item) => (
            <div key={item.key} className="flex justify-between rounded-lg border bg-muted p-3">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{result[item.key] || "-"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
