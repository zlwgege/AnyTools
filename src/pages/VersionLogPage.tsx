import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Tag, Calendar, ListChecks } from "lucide-react"

export const CURRENT_VERSION = "1.0.1"

interface VersionEntry {
  version: string
  date: string
  content: string[]
}

const VERSION_LOGS: VersionEntry[] = [
  {
    version: "1.0.1",
    date: "2026-05-12",
    content: [
      "新增库位码批量生成功能",
      "支持导入 Excel/CSV 模板批量生成库位码标签",
      "每个标签包含 Code128 条码、方向箭头、库位码文字",
      "支持 PDF 分页输出，每页一个标签",
      "生成记录支持保存到后端，可随时重新下载",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-04-27",
    content: [
      "前后端分离架构定版",
      "生产环境部署适配（Nginx、PM2、环境变量）",
      "新增部署手册",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-04-27",
    content: [
      "V0.1 初始定版",
      "包含 20+ 开发者工具",
      "前后端分离（登录、收藏、日志）",
    ],
  },
]

export default function VersionLogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">版本更新日志</h1>
            <p className="text-sm text-muted-foreground">当前版本 v{CURRENT_VERSION}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {VERSION_LOGS.map((entry) => (
            <Card key={entry.version} className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <Badge variant={entry.version === CURRENT_VERSION ? "accent" : "secondary"}>
                  <Tag className="mr-1 h-3 w-3" />
                  v{entry.version}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {entry.date}
                </span>
                {entry.version === CURRENT_VERSION && (
                  <Badge variant="outline" className="text-xs">当前版本</Badge>
                )}
              </div>
              <ul className="space-y-2">
                {entry.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-muted-foreground">
          ToolBox 开发者工具门户 · 持续迭代中
        </div>
      </div>
    </div>
  )
}
