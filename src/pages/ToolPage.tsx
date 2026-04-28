import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { lazy, Suspense } from "react"
import { tools } from "@/data/tools"
import type { Tool, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { logUsage } from "@/lib/api"

const toolComponents: Record<string, React.LazyExoticComponent<React.FC<{ tool: Tool; user: User }>>> = {
  "json-formatter": lazy(() => import("@/tools/JsonFormatter")),
  base64: lazy(() => import("@/tools/Base64Tool")),
  "regex-tester": lazy(() => import("@/tools/RegexTester")),
  "url-codec": lazy(() => import("@/tools/UrlCodec")),
  timestamp: lazy(() => import("@/tools/TimestampConverter")),
  "number-base": lazy(() => import("@/tools/NumberBaseConverter")),
  "color-converter": lazy(() => import("@/tools/ColorConverter")),
  "unit-converter": lazy(() => import("@/tools/UnitConverter")),
  "text-diff": lazy(() => import("@/tools/TextDiff")),
  "markdown-preview": lazy(() => import("@/tools/MarkdownPreview")),
  "text-encrypt": lazy(() => import("@/tools/TextEncrypt")),
  "word-counter": lazy(() => import("@/tools/WordCounter")),
  "barcode-generator": lazy(() => import("@/tools/BarcodeGenerator")),
  "qr-generator": lazy(() => import("@/tools/QrGenerator")),
  "image-compress": lazy(() => import("@/tools/ImageCompress")),
  "image-to-base64": lazy(() => import("@/tools/ImageToBase64")),
  "password-generator": lazy(() => import("@/tools/PasswordGenerator")),
  "hash-calculator": lazy(() => import("@/tools/HashCalculator")),
  "jwt-parser": lazy(() => import("@/tools/JwtParser")),
  "cert-viewer": lazy(() => import("@/tools/CertViewer")),
  "ip-lookup": lazy(() => import("@/tools/IpLookup")),
  "http-client": lazy(() => import("@/tools/HttpClient")),
  "dns-lookup": lazy(() => import("@/tools/DnsLookup")),
  "ping-test": lazy(() => import("@/tools/PingTest")),
  "speed-test": lazy(() => import("@/tools/SpeedTest")),
}

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("toolbox-user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const tool = tools.find((t) => t.id === toolId)
  if (!tool) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">工具未找到</h1>
          <p className="mt-2 text-muted-foreground">请检查 URL 是否正确</p>
          <Button className="mt-4" onClick={() => navigate("/")}>返回首页</Button>
        </div>
      </div>
    )
  }

  const Icon = tool.icon
  const ToolComponent = toolComponents[tool.id]

  useEffect(() => {
    if (user) {
      logUsage(user.id, tool.id, tool.name, "open")
    }
  }, [user, tool.id, tool.name])

  const defaultUser: User = user || { id: "guest", name: "访客" }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回
          </Button>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              {tool.isNew && <Badge variant="accent">NEW</Badge>}
              {tool.isHot && <Badge className="bg-orange-500/90 text-primary-foreground border-transparent">HOT</Badge>}
            </div>
            <p className="mt-1 text-muted-foreground">{tool.description}</p>
          </div>
        </div>

        {/* Tool workspace */}
        <div className="rounded-xl border bg-card p-6">
          {ToolComponent ? (
            <Suspense fallback={<div className="py-16 text-center text-muted-foreground">加载工具中...</div>}>
              <ToolComponent tool={tool} user={defaultUser} />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon className="h-10 w-10 text-primary mb-4" />
              <p className="text-muted-foreground">工具功能正在开发中</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
