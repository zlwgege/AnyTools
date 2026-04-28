import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Diff } from "lucide-react"

function computeDiff(a: string, b: string): { type: "same" | "del" | "ins"; text: string }[] {
  const al = a.split("\n")
  const bl = b.split("\n")
  const result: { type: "same" | "del" | "ins"; text: string }[] = []
  let i = 0, j = 0
  while (i < al.length || j < bl.length) {
    if (i < al.length && j < bl.length && al[i] === bl[j]) {
      result.push({ type: "same", text: al[i] })
      i++; j++
    } else if (i < al.length && (j >= bl.length || !bl.slice(j).includes(al[i]))) {
      result.push({ type: "del", text: al[i] })
      i++
    } else if (j < bl.length) {
      result.push({ type: "ins", text: bl[j] })
      j++
    } else {
      break
    }
  }
  return result
}

export default function TextDiff({ tool, user }: { tool: Tool; user: User }) {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")
  const [diff, setDiff] = useState<ReturnType<typeof computeDiff>>([])

  const handleDiff = () => {
    setDiff(computeDiff(left, right))
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea placeholder="原始文本..." value={left} onChange={(e) => setLeft(e.target.value)} className="min-h-[150px]" />
        <Textarea placeholder="对比文本..." value={right} onChange={(e) => setRight(e.target.value)} className="min-h-[150px]" />
      </div>
      <Button onClick={handleDiff}>
        <Diff className="mr-2 h-4 w-4" />
        对比差异
      </Button>
      {diff.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          {diff.map((d, i) => (
            <div
              key={i}
              className={`px-3 py-1 font-mono text-sm ${
                d.type === "del" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                d.type === "ins" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                ""
              }`}
            >
              <span className="mr-2 select-none">{d.type === "del" ? "-" : d.type === "ins" ? "+" : " "}</span>
              {d.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
