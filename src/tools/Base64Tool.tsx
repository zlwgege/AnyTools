import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check, ArrowDown } from "lucide-react"

export default function Base64Tool({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
      logUsage(user.id, tool.id, tool.name, "execute", mode)
    } catch (e) {
      setOutput("转换失败: " + String(e))
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === "encode" ? "default" : "outline"} onClick={() => setMode("encode")}>
          编码
        </Button>
        <Button variant={mode === "decode" ? "default" : "outline"} onClick={() => setMode("decode")}>
          解码
        </Button>
      </div>
      <Textarea
        placeholder={mode === "encode" ? "输入文本..." : "输入 Base64..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[150px] font-mono text-sm"
      />
      <Button onClick={handleConvert} className="w-full">
        <ArrowDown className="mr-2 h-4 w-4" />
        {mode === "encode" ? "编码为 Base64" : "解码为文本"}
      </Button>
      {output && (
        <div className="relative">
          <Button size="sm" variant="ghost" className="absolute right-2 top-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Textarea value={output} readOnly className="min-h-[150px] font-mono text-sm" />
        </div>
      )}
    </div>
  )
}
