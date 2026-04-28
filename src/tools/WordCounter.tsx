import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Type, AlignLeft, FileText, Split } from "lucide-react"

export default function WordCounter({ tool, user }: { tool: Tool; user: User }) {
  const [text, setText] = useState("")

  const stats = {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split("\n").length : 0,
    paragraphs: text.trim() ? text.trim().split(/\n\s*\n/).length : 0,
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="输入或粘贴文本..."
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          logUsage(user.id, tool.id, tool.name, "execute")
        }}
        className="min-h-[250px]"
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "字符数", value: stats.chars, icon: Type },
          { label: "不含空格", value: stats.charsNoSpace, icon: AlignLeft },
          { label: "词数", value: stats.words, icon: FileText },
          { label: "行数", value: stats.lines, icon: Split },
          { label: "段落数", value: stats.paragraphs, icon: FileText },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-muted p-3 text-center">
            <s.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
