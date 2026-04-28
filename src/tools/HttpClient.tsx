import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Send } from "lucide-react"

const API_BASE = "/api"

export default function HttpClient({ tool, user }: { tool: Tool; user: User }) {
  const [url, setUrl] = useState("")
  const [method, setMethod] = useState("GET")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSend = async () => {
    setLoading(true)
    setError("")
    setResponse(null)
    try {
      const res = await fetch(`${API_BASE}/network/http`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          method,
          body: body || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "请求失败")
      setResponse(data)
      logUsage(user.id, tool.id, tool.name, "execute", method)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <Input
          placeholder="https://api.example.com/data"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 font-mono"
        />
        <Button onClick={handleSend} disabled={loading}>
          <Send className="mr-2 h-4 w-4" />
          {loading ? "发送中..." : "发送"}
        </Button>
      </div>
      {["POST", "PUT", "PATCH"].includes(method) && (
        <Textarea
          placeholder="请求体 (JSON)..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {response && (
        <div className="space-y-2">
          <div className="flex gap-4 text-sm">
            <span>状态: <strong>{response.status}</strong></span>
            <span>耗时: <strong>{response.elapsed}ms</strong></span>
          </div>
          <pre className="rounded-lg border bg-muted p-3 font-mono text-xs overflow-auto max-h-[400px]">
            {typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
