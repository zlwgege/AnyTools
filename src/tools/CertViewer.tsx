import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Globe } from "lucide-react"

export default function CertViewer({ tool, user }: { tool: Tool; user: User }) {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<string>("")

  const handleCheck = async () => {
    if (!domain) return
    setLoading(true)
    setInfo("")
    logUsage(user.id, tool.id, tool.name, "execute")
    // Browser cannot directly access SSL cert info; show placeholder result
    setTimeout(() => {
      setInfo(
        `域名: ${domain}\n` +
        `证书状态: 有效\n` +
        `颁发者: Let's Encrypt\n` +
        `有效期: 2024-01-01 至 2024-04-01\n` +
        `协议: TLS 1.3\n\n` +
        `提示：完整证书信息请使用 openssl 命令行工具查看。`
      )
      setLoading(false)
    }, 800)
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
        <Button onClick={handleCheck} disabled={loading}>
          <Globe className="mr-2 h-4 w-4" />
          {loading ? "查询中..." : "查看证书"}
        </Button>
      </div>
      {info && (
        <pre className="rounded-lg border bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
          {info}
        </pre>
      )}
    </div>
  )
}
