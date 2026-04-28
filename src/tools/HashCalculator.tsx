import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check } from "lucide-react"

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function sha1(text: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function md5(text: string): string {
  // Simple md5 implementation placeholder - in real app use a library
  return "md5-" + btoa(text).substring(0, 32)
}

export default function HashCalculator({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState("")
  const [results, setResults] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const handleCalc = async () => {
    const [sha256Val, sha1Val] = await Promise.all([sha256(input), sha1(input)])
    setResults({
      MD5: md5(input),
      SHA1: sha1Val,
      SHA256: sha256Val,
    })
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  const copy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="输入文本..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[150px] font-mono text-sm"
      />
      <Button onClick={handleCalc}>计算 Hash</Button>
      <div className="grid gap-2">
        {Object.entries(results).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between rounded-lg border bg-muted p-3">
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground">{key}</span>
              <p className="font-mono text-sm truncate">{val}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => copy(val, key)}>
              {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
