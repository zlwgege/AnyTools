import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Wifi } from "lucide-react"

const API_BASE = "http://localhost:3001/api"

export default function PingTest({ tool, user }: { tool: Tool; user: User }) {
  const [host, setHost] = useState("")
  const [count, setCount] = useState(4)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  const handlePing = async () => {
    if (!host) return
    setLoading(true)
    setError("")
    setOutput("")
    try {
      const res = await fetch(`${API_BASE}/network/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ping 失败")
      setOutput(data.output)
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
          placeholder="输入主机地址，例如: baidu.com"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">次数</span>
          <input
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-16 rounded-md border bg-background px-2 py-2 text-sm"
          />
        </div>
        <Button onClick={handlePing} disabled={loading}>
          <Wifi className="mr-2 h-4 w-4" />
          {loading ? "检测中..." : "Ping"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {output && (
        <pre className="rounded-lg border bg-muted p-4 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-[400px]">
          {output}
        </pre>
      )}
    </div>
  )
}
