import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Search } from "lucide-react"

const API_BASE = "/api"

export default function DnsLookup({ tool, user }: { tool: Tool; user: User }) {
  const [domain, setDomain] = useState("")
  const [type, setType] = useState("A")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleLookup = async () => {
    if (!domain) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/network/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "查询失败")
      setResult(data)
      logUsage(user.id, tool.id, tool.name, "execute", type)
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
          placeholder="输入域名，例如: example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1"
        />
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {["A", "AAAA", "CNAME", "MX", "TXT", "NS"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Button onClick={handleLookup} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? "查询中..." : "查询"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-sm text-muted-foreground mb-2">{result.domain} ({result.type})</p>
          {result.records?.length > 0 ? (
            <ul className="space-y-1">
              {result.records.map((r: string, i: number) => (
                <li key={i} className="font-mono text-sm">{r}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">无记录</p>
          )}
        </div>
      )}
    </div>
  )
}
