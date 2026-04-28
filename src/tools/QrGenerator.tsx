import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Download } from "lucide-react"

function downloadWithCaption(imageUrl: string, caption: string, fileName: string) {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    const padding = 16
    const captionHeight = caption ? 36 : 0
    const canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height + captionHeight + padding * 2
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw image
    ctx.drawImage(img, 0, padding)

    // draw caption
    if (caption) {
      ctx.fillStyle = "#334155"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(caption, canvas.width / 2, img.height + padding + captionHeight / 2)
    }

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    })
  }
  img.src = imageUrl
}

export default function QrGenerator({ tool, user }: { tool: Tool; user: User }) {
  const [text, setText] = useState("")
  const [caption, setCaption] = useState("")
  const [size, setSize] = useState(200)
  const [qrUrl, setQrUrl] = useState("")

  const generate = () => {
    if (!text) return
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
    setQrUrl(url)
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  return (
    <div className="space-y-4">
      <Input placeholder="输入文本或链接..." value={text} onChange={(e) => setText(e.target.value)} />
      <Input placeholder="配文字显示（可选，显示在二维码下方）..." value={caption} onChange={(e) => setCaption(e.target.value)} />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">尺寸</span>
        <input type="range" min={100} max={400} step={50} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-32" />
        <span className="text-sm">{size}px</span>
      </div>
      <Button onClick={generate}>生成二维码</Button>
      {qrUrl && (
        <div className="space-y-3">
          <div className="inline-block rounded-lg border bg-white p-4">
            <img src={qrUrl} alt="QR Code" />
            {(caption || text) && (
              <p className="mt-3 text-center text-sm font-medium text-slate-600">
                {caption || text}
              </p>
            )}
          </div>
          <div>
            <Button size="sm" variant="outline" onClick={() => downloadWithCaption(qrUrl, caption || text, "qrcode.png")}>
              <Download className="mr-2 h-4 w-4" />下载
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
