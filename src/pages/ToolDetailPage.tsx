import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tool, User } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { useState, useEffect, lazy, Suspense } from "react"
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
  "image-compress": lazy(() => import("@/tools/ImageCompress")),
  "qr-generator": lazy(() => import("@/tools/QrGenerator")),
  "image-to-base64": lazy(() => import("@/tools/ImageToBase64")),
  "password-generator": lazy(() => import("@/tools/PasswordGenerator")),
  "hash-calculator": lazy(() => import("@/tools/HashCalculator")),
  "jwt-parser": lazy(() => import("@/tools/JwtParser")),
  "cert-viewer": lazy(() => import("@/tools/CertViewer")),
  "ip-lookup": lazy(() => import("@/tools/IpLookup")),
  "http-client": lazy(() => import("@/tools/HttpClient")),
  "dns-lookup": lazy(() => import("@/tools/DnsLookup")),
  "ping-test": lazy(() => import("@/tools/PingTest")),
}

interface ToolDetailPageProps {
  tool: Tool
  onBack: () => void
  theme: "light" | "dark"
  onToggleTheme: () => void
  user: User
  onLogout: () => void
  favorites: string[]
  recentIds: string[]
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
}

export function ToolDetailPage({
  tool,
  onBack,
  theme,
  onToggleTheme,
  user,
  onLogout,
  onToggleFavorite,
  isFavorite,
}: ToolDetailPageProps) {
  const [_searchQuery, setSearchQuery] = useState("")
  const Icon = tool.icon

  useEffect(() => {
    logUsage(user.id, tool.id, tool.name, "open")
  }, [user.id, tool.id, tool.name])

  const ToolComponent = toolComponents[tool.id]

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToggleSidebar={() => {}}
        userName={user.name}
        onLogout={onLogout}
        searchQuery={_searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="mx-auto max-w-5xl p-4 lg:p-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回
          </Button>
        </div>

        {/* Tool header */}
        <div className="mb-8 flex items-start gap-4">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleFavorite(tool.id)}
              className={cn(isFavorite && "border-amber-500/50 text-amber-500")}
            >
              <Star className={cn("mr-1 h-4 w-4", isFavorite && "fill-current")} />
              {isFavorite ? "已收藏" : "收藏"}
            </Button>
          </div>
        </div>

        {/* Tool workspace */}
        <div className="rounded-xl border bg-card p-6">
          {ToolComponent ? (
            <Suspense fallback={<div className="py-16 text-center text-muted-foreground">加载工具中...</div>}>
              <ToolComponent tool={tool} user={user} />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5">
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">{tool.name}</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                工具功能正在开发中，敬请期待。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
