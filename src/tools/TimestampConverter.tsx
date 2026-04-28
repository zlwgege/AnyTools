import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check, Clock } from "lucide-react"

export default function TimestampConverter({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState("")
  const [results, setResults] = useState<{ label: string; value: string }[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const nowTs = Math.floor(Date.now() / 1000)

  const handleConvert = () => {
    const val = input.trim()
    if (!val) return
    const out: { label: string; value: string }[] = []

    // Detect if it's a timestamp or a date string
    if (/^\d+$/.test(val)) {
      const ts = parseInt(val)
      const date = new Date(ts > 1e11 ? ts : ts * 1000)
      out.push({ label: "本地时间", value: date.toLocaleString() })
      out.push({ label: "ISO 时间", value: date.toISOString() })
      out.push({ label: "秒级时间戳", value: String(Math.floor(date.getTime() / 1000)) })
      out.push({ label: "毫秒级时间戳", value: String(date.getTime()) })
    } else {
      const date = new Date(val)
      if (!isNaN(date.getTime())) {
        out.push({ label: "秒级时间戳", value: String(Math.floor(date.getTime() / 1000)) })
        out.push({ label: "毫秒级时间戳", value: String(date.getTime()) })
        out.push({ label: "ISO 时间", value: date.toISOString() })
        out.push({ label: "本地时间", value: date.toLocaleString() })
      } else {
        out.push({ label: "错误", value: "无法解析日期" })
      }
    }
    setResults(out)
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  const handleNow = () => {
    setInput(String(nowTs))
  }

  const copy = async (value: string, idx: number) => {
    await navigator.clipboard.writeText(value)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="输入时间戳或日期字符串..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 font-mono"
        />
        <Button variant="outline" onClick={handleNow}>
          <Clock className="mr-2 h-4 w-4" />
          当前时间
        </Button>
      </div>
      <Button onClick={handleConvert}>转换</Button>
      <div className="grid gap-2">
        {results.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-muted p-3">
            <div>
              <span className="text-xs text-muted-foreground">{r.label}</span>
              <p className="font-mono text-sm">{r.value}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => copy(r.value, i)}>
              {copiedIdx === i ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
