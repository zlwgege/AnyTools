import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check, Wand2, Minimize2 } from "lucide-react"

export default function JsonFormatter({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFormat = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj, null, 2))
      setError("")
      logUsage(user.id, tool.id, tool.name, "execute", "format")
    } catch (e) {
      setError(String(e))
      setOutput("")
    }
  }

  const handleMinify = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj))
      setError("")
      logUsage(user.id, tool.id, tool.name, "execute", "minify")
    } catch (e) {
      setError(String(e))
      setOutput("")
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="输入 JSON 字符串..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[200px] font-mono text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleFormat}>
          <Wand2 className="mr-2 h-4 w-4" />
          格式化
        </Button>
        <Button variant="outline" onClick={handleMinify}>
          <Minimize2 className="mr-2 h-4 w-4" />
          压缩
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {output && (
        <div className="relative">
          <Button size="sm" variant="ghost" className="absolute right-2 top-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <pre className="rounded-lg border bg-muted p-4 overflow-auto max-h-[400px] font-mono text-sm">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
