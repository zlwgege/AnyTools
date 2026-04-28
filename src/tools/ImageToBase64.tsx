import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Upload, Copy, Check } from "lucide-react"

export default function ImageToBase64({ tool, user }: { tool: Tool; user: User }) {
  const [preview, setPreview] = useState("")
  const [base64, setBase64] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      setBase64(result.split(",")[1])
    }
    reader.readAsDataURL(f)
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(base64)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <label className="cursor-pointer inline-flex">
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          <Upload className="mr-2 h-4 w-4" />选择图片
        </span>
      </label>
      {preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <img src={preview} alt="preview" className="max-h-64 rounded-lg border object-contain" />
          <div className="relative">
            <Button size="sm" variant="ghost" className="absolute right-2 top-2" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Textarea value={base64} readOnly className="min-h-[200px] font-mono text-xs" />
          </div>
        </div>
      )}
    </div>
  )
}
