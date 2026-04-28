import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check, RefreshCw } from "lucide-react"

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; number: boolean; symbol: boolean }) {
  const chars = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    symbol: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  }
  let pool = ""
  if (opts.upper) pool += chars.upper
  if (opts.lower) pool += chars.lower
  if (opts.number) pool += chars.number
  if (opts.symbol) pool += chars.symbol
  if (!pool) pool = chars.lower

  let out = ""
  for (let i = 0; i < length; i++) {
    out += pool[Math.floor(Math.random() * pool.length)]
  }
  return out
}

export default function PasswordGenerator({ tool, user }: { tool: Tool; user: User }) {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, number: true, symbol: true })
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setPassword(generatePassword(length, opts))
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">长度</span>
        <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-40" />
        <span className="text-sm font-mono">{length}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          { key: "upper" as const, label: "大写字母" },
          { key: "lower" as const, label: "小写字母" },
          { key: "number" as const, label: "数字" },
          { key: "symbol" as const, label: "特殊符号" },
        ].map((o) => (
          <label key={o.key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={opts[o.key]}
              onChange={(e) => setOpts((prev) => ({ ...prev, [o.key]: e.target.checked }))}
            />
            {o.label}
          </label>
        ))}
      </div>
      <Button onClick={handleGenerate}>
        <RefreshCw className="mr-2 h-4 w-4" />
        生成密码
      </Button>
      {password && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
          <code className="flex-1 font-mono text-lg">{password}</code>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
