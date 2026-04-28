import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check } from "lucide-react"

const bases = [
  { label: "二进制", base: 2 },
  { label: "八进制", base: 8 },
  { label: "十进制", base: 10 },
  { label: "十六进制", base: 16 },
]

export default function NumberBaseConverter({ tool, user }: { tool: Tool; user: User }) {
  const [value, setValue] = useState("")
  const [fromBase, setFromBase] = useState(10)
  const [results, setResults] = useState<Record<number, string>>({})
  const [copiedBase, setCopiedBase] = useState<number | null>(null)

  const handleConvert = () => {
    try {
      const num = parseInt(value, fromBase)
      if (isNaN(num)) throw new Error("无效数字")
      const out: Record<number, string> = {}
      bases.forEach((b) => {
        out[b.base] = num.toString(b.base).toUpperCase()
      })
      setResults(out)
      logUsage(user.id, tool.id, tool.name, "execute")
    } catch (e) {
      setResults({ error: String(e) } as any)
    }
  }

  const copy = async (val: string, base: number) => {
    await navigator.clipboard.writeText(val)
    setCopiedBase(base)
    setTimeout(() => setCopiedBase(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="输入数字..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 font-mono"
        />
        <select
          className="rounded-md border bg-background px-3 text-sm"
          value={fromBase}
          onChange={(e) => setFromBase(Number(e.target.value))}
        >
          {bases.map((b) => (
            <option key={b.base} value={b.base}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleConvert}>转换</Button>
      <div className="grid gap-2">
        {bases.map((b) => (
          <div key={b.base} className="flex items-center justify-between rounded-lg border bg-muted p-3">
            <div>
              <span className="text-xs text-muted-foreground">{b.label}</span>
              <p className="font-mono text-sm">{results[b.base] || "-"}</p>
            </div>
            {results[b.base] && (
              <Button size="sm" variant="ghost" onClick={() => copy(results[b.base], b.base)}>
                {copiedBase === b.base ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
