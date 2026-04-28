import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Play } from "lucide-react"

export default function RegexTester({ tool, user }: { tool: Tool; user: User }) {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [text, setText] = useState("")
  const [matches, setMatches] = useState<string[]>([])
  const [error, setError] = useState("")

  const handleTest = () => {
    try {
      const regex = new RegExp(pattern, flags)
      const result = text.match(regex)
      setMatches(result || [])
      setError("")
      logUsage(user.id, tool.id, tool.name, "execute")
    } catch (e) {
      setError("正则表达式错误: " + String(e))
      setMatches([])
    }
  }

  const highlighted = useMemo(() => {
    if (!pattern || !text) return text
    try {
      const regex = new RegExp(`(${pattern})`, flags.includes("g") ? flags.replace("g", "") : flags)
      return text.replace(regex, "<mark class=\"bg-yellow-200 dark:bg-yellow-700\">$1</mark>")
    } catch {
      return text
    }
  }, [pattern, text, flags])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="正则表达式，例如: \\d+"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="flex-1 font-mono"
        />
        <Input
          placeholder="flags"
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          className="w-24 font-mono"
        />
      </div>
      <Textarea
        placeholder="输入测试文本..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[150px] font-mono text-sm"
      />
      <Button onClick={handleTest}>
        <Play className="mr-2 h-4 w-4" />
        测试匹配
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {matches.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">匹配结果 ({matches.length} 个):</p>
          <div className="rounded-lg border bg-muted p-4">
            <div dangerouslySetInnerHTML={{ __html: highlighted }} className="font-mono text-sm whitespace-pre-wrap" />
          </div>
        </div>
      )}
      {pattern && text && matches.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">未匹配到结果</p>
      )}
    </div>
  )
}
