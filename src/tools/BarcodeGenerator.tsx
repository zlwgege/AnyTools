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

export default function BarcodeGenerator({ tool, user }: { tool: Tool; user: User }) {
  const [text, setText] = useState("")
  const [caption, setCaption] = useState("")
  const [barcodeUrl, setBarcodeUrl] = useState("")

  const generate = () => {
    if (!text) return
    // bwip-js API: generate Code128 barcode
    const url = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(text)}&scale=3&height=12&includetext&textxalign=center`
    setBarcodeUrl(url)
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="输入条码内容（如商品编码、ISBN 等）..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Input
        placeholder="配文字显示（可选，显示在条码下方）..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <Button onClick={generate}>生成条码</Button>
      {barcodeUrl && (
        <div className="space-y-3">
          <div className="inline-block rounded-lg border bg-white p-4">
            <img src={barcodeUrl} alt="Barcode" className="block" />
            {(caption || text) && (
              <p className="mt-2 text-center text-sm font-medium text-slate-600">
                {caption || text}
              </p>
            )}
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadWithCaption(barcodeUrl, caption || text, "barcode.png")}
            >
              <Download className="mr-2 h-4 w-4" />
              下载
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
