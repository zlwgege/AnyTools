import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Upload, Download } from "lucide-react"

export default function ImageCompress({ tool, user }: { tool: Tool; user: User }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [quality, setQuality] = useState(0.7)
  const [compressed, setCompressed] = useState("")
  const [origSize, setOrigSize] = useState(0)
  const [compSize, setCompSize] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOrigSize(f.size)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
    logUsage(user.id, tool.id, tool.name, "execute", "upload")
  }

  const handleCompress = () => {
    if (!file || !preview) return
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompSize(blob.size)
            setCompressed(URL.createObjectURL(blob))
          }
        },
        "image/jpeg",
        quality
      )
    }
    img.src = preview
    logUsage(user.id, tool.id, tool.name, "execute", "compress")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer inline-flex">
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Upload className="mr-2 h-4 w-4" />选择图片
          </span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">质量</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{Math.round(quality * 100)}%</span>
        </div>
      </div>
      {preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">原始 ({(origSize / 1024).toFixed(1)} KB)</p>
            <img src={preview} alt="original" className="max-h-64 rounded-lg border object-contain" />
          </div>
          {compressed && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">压缩后 ({(compSize / 1024).toFixed(1)} KB)</p>
              <img src={compressed} alt="compressed" className="max-h-64 rounded-lg border object-contain" />
              <Button size="sm" variant="outline" onClick={() => {
                const a = document.createElement("a")
                a.href = compressed
                a.download = "compressed.jpg"
                a.click()
              }}>
                <Download className="mr-2 h-4 w-4" />下载
              </Button>
            </div>
          )}
        </div>
      )}
      {preview && !compressed && <Button onClick={handleCompress}>压缩</Button>}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
