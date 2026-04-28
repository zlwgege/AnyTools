import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"

function parseJwt(token: string) {
  try {
    const [header, payload] = token.split(".")
    return {
      header: JSON.parse(atob(header.replace(/-/g, "+").replace(/_/g, "/"))),
      payload: JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))),
    }
  } catch {
    return null
  }
}

export default function JwtParser({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState("")
  const [parsed, setParsed] = useState<{ header: unknown; payload: unknown } | null>(null)
  const [error, setError] = useState("")

  const handleParse = () => {
    const result = parseJwt(input.trim())
    if (result) {
      setParsed(result)
      setError("")
      logUsage(user.id, tool.id, tool.name, "execute")
    } else {
      setError("无效的 JWT Token")
      setParsed(null)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="粘贴 JWT Token..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[120px] font-mono text-sm"
      />
      <Button onClick={handleParse}>解析</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {parsed && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">Header</p>
            <pre className="font-mono text-xs overflow-auto">{JSON.stringify(parsed.header, null, 2)}</pre>
          </div>
          <div className="rounded-lg border bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">Payload</p>
            <pre className="font-mono text-xs overflow-auto">{JSON.stringify(parsed.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
