import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"

function simpleMarkdown(html: string): string {
  return html
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>')
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-muted p-3 rounded-lg overflow-auto my-2"><code>$1</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\n/gim, '<br />')
}

export default function MarkdownPreview({ tool, user }: { tool: Tool; user: User }) {
  const [input, setInput] = useState(`# 欢迎使用 Markdown 预览

**粗体文字** 和 *斜体文字*

- 列表项 1
- 列表项 2

\`\`\`js
console.log("Hello World")
\`\`\`

[链接示例](https://example.com)
`)

  const handleChange = (v: string) => {
    setInput(v)
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Textarea
        placeholder="输入 Markdown..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[400px] font-mono text-sm"
      />
      <div
        className="rounded-lg border bg-card p-4 prose dark:prose-invert max-w-none min-h-[400px] overflow-auto"
        dangerouslySetInnerHTML={{ __html: simpleMarkdown(input) }}
      />
    </div>
  )
}
