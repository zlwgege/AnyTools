import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check, Lock, Unlock } from "lucide-react"

// Simple XOR-based "encryption" for demo purposes
function xorEncrypt(text: string, key: string): string {
  if (!key) return btoa(unescape(encodeURIComponent(text)))
  let out = ""
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(unescape(encodeURIComponent(out)))
}

function xorDecrypt(b64: string, key: string): string {
  const text = decodeURIComponent(escape(atob(b64)))
  if (!key) return text
  let out = ""
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return out
}

export default function TextEncrypt({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState("")
  const [key, setKey] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt")
  const [copied, setCopied] = useState(false)

  const handleAction = () => {
    try {
      if (mode === "encrypt") {
        setOutput(xorEncrypt(input, key))
      } else {
        setOutput(xorDecrypt(input, key))
      }
      logUsage(user.id, tool.id, tool.name, "execute", mode)
    } catch (e) {
      setOutput("操作失败: " + String(e))
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
        <Button variant={mode === "encrypt" ? "default" : "outline"} onClick={() => setMode("encrypt")}>
          <Lock className="mr-2 h-4 w-4" />
          加密
        </Button>
        <Button variant={mode === "decrypt" ? "default" : "outline"} onClick={() => setMode("decrypt")}>
          <Unlock className="mr-2 h-4 w-4" />
          解密
        </Button>
      </div>
      <Input placeholder="密钥（可选）" value={key} onChange={(e) => setKey(e.target.value)} className="font-mono" />
      <Textarea
        placeholder={mode === "encrypt" ? "输入明文..." : "输入密文(Base64)..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[150px] font-mono text-sm"
      />
      <Button onClick={handleAction}>{mode === "encrypt" ? "加密" : "解密"}</Button>
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
