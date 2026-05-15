import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { logUsage } from "@/lib/api"
import {
  Download,
  Upload,
  FileSpreadsheet,
  Eye,
  Printer,
  Save,
  Trash2,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { Tool, User } from "@/types"
import * as XLSX from "xlsx"

const API_BASE = "/api"

interface BinItem {
  code: string
  direction: string
  barWidth: number
  barHeight: number
  fontSize: number
  paperSize: string
}

interface HistoryRecord {
  id: number
  name: string
  count: number
  created_at: string
}

const DEFAULT_ITEM: BinItem = {
  code: "",
  direction: "down",
  barWidth: 100,
  barHeight: 30,
  fontSize: 30,
  paperSize: "a5",
}

const TEMPLATE_CSV = `库位码,方向,条码宽度(mm),条码高度(mm),文字大小(pt),纸张尺寸
HC-01-B-002,down,100,30,30,a5
HC-01-C-002,down,100,30,30,a5
HC-01-D-002,down,100,30,30,a5
HC-02-A-001,down,100,30,30,a5
HC-02-B-001,down,100,30,30,a5`

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function createArrowDataURL(direction: string, size: number = 40): string {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#000000"
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = Math.max(4, size / 7.5)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  const cx = size / 2
  const pad = size * 0.15
  const head = size * 0.25

  ctx.beginPath()
  if (direction === "down") {
    ctx.moveTo(cx, pad)
    ctx.lineTo(cx, size - pad - head)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - head, size - pad - head)
    ctx.lineTo(cx, size - pad)
    ctx.lineTo(cx + head, size - pad - head)
    ctx.fill()
  } else if (direction === "up") {
    ctx.moveTo(cx, size - pad)
    ctx.lineTo(cx, pad + head)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - head, pad + head)
    ctx.lineTo(cx, pad)
    ctx.lineTo(cx + head, pad + head)
    ctx.fill()
  } else if (direction === "left") {
    ctx.moveTo(size - pad, cx)
    ctx.lineTo(pad + head, cx)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pad + head, cx - head)
    ctx.lineTo(pad, cx)
    ctx.lineTo(pad + head, cx + head)
    ctx.fill()
  } else if (direction === "right") {
    ctx.moveTo(pad, cx)
    ctx.lineTo(size - pad - head, cx)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(size - pad - head, cx - head)
    ctx.lineTo(size - pad, cx)
    ctx.lineTo(size - pad - head, cx + head)
    ctx.fill()
  }
  return canvas.toDataURL("image/png")
}

async function fetchImageDataURL(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const PAPER_SIZES: Record<string, { w: number; h: number }> = {
  a3: { w: 297, h: 420 },
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
  a6: { w: 105, h: 148 },
  letter: { w: 216, h: 279 },
}

async function generateBinLabelsPDF(items: BinItem[], _filename: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf")

  const firstPaper = items[0]?.paperSize || "a4"
  const doc = new jsPDF({ unit: "mm", format: firstPaper as any })

  const pageSize = PAPER_SIZES[firstPaper] || PAPER_SIZES.a4
  const pageW = pageSize.w
  const pageH = pageSize.h
  const margin = 20

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (i > 0) doc.addPage()

    // Barcode image
    const bcUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(item.code)}&scale=3&height=10&includetext=false`
    let bcData: string
    try {
      bcData = await fetchImageDataURL(bcUrl)
    } catch {
      // fallback: draw placeholder text
      doc.setFontSize(10)
      doc.text(`[条码生成失败: ${item.code}]`, pageW / 2, 100, { align: "center" })
      continue
    }

    // Layout: barcode centered horizontally, arrow on the right
    const barW = Math.min(item.barWidth, pageW - margin * 2 - 30)
    const barH = item.barHeight
    const barX = (pageW - barW) / 2 - 12
    const barY = (pageH - barH - item.fontSize - 10) / 2 - 10

    doc.addImage(bcData, "PNG", barX, barY, barW, barH)

    // Arrow
    const arrowSize = Math.min(barH, 30)
    const arrowData = createArrowDataURL(item.direction, arrowSize * 3)
    doc.addImage(arrowData, "PNG", barX + barW + 8, barY + (barH - arrowSize) / 2, arrowSize, arrowSize)

    // Text below barcode
    doc.setFontSize(item.fontSize)
    doc.setFont("helvetica", "bold")
    const textW = doc.getTextWidth(item.code)
    doc.text(item.code, (pageW - textW) / 2, barY + barH + 10)
  }

  return doc.output("blob")
}

export default function BinLocationGenerator({ tool, user }: { tool: Tool; user: User }) {
  const [items, setItems] = useState<BinItem[]>([{ ...DEFAULT_ITEM }])
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [previewIndex, setPreviewIndex] = useState(0)
  const [taskName, setTaskName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewCancelRef = useRef(false)
  const prevPreviewUrlRef = useRef<string>("")

  const userId = user.id || "guest"

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bin-labels?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.records || [])
      }
    } catch {
      // ignore
    }
  }, [userId])

  useEffect(() => {
    logUsage(userId, tool.id, tool.name, "open")
    loadHistory()
  }, [userId, tool, loadHistory])

  useEffect(() => {
    if (items.length === 0) return
    previewCancelRef.current = false
    const item = items[previewIndex] || items[0]
    generatePreview(item)
    return () => {
      previewCancelRef.current = true
      if (prevPreviewUrlRef.current) {
        URL.revokeObjectURL(prevPreviewUrlRef.current)
        prevPreviewUrlRef.current = ""
      }
    }
  }, [items, previewIndex])

  async function generatePreview(item: BinItem) {
    if (!item.code) return
    try {
      const single = [item]
      const blob = await generateBinLabelsPDF(single, "preview.pdf")
      if (previewCancelRef.current) return
      const url = URL.createObjectURL(blob)
      if (prevPreviewUrlRef.current) {
        URL.revokeObjectURL(prevPreviewUrlRef.current)
      }
      prevPreviewUrlRef.current = url
      setPreviewUrl(url)
    } catch {
      if (!previewCancelRef.current) {
        setPreviewUrl("")
      }
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" })
    downloadBlob(blob, "库位码导入模板.csv")
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      if (!data) return
      try {
        let rows: string[][] = []
        if (file.name.endsWith(".csv")) {
          const text = data as string
          rows = text.split("\n").map((r) => r.split(",").map((c) => c.trim()))
        } else {
          const wb = XLSX.read(data, { type: "binary" })
          const ws = wb.Sheets[wb.SheetNames[0]]
          rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]
        }
        // skip header
        const parsed: BinItem[] = rows
          .slice(1)
          .filter((r) => r[0])
          .map((r) => ({
            code: String(r[0] || ""),
            direction: String(r[1] || "down").toLowerCase(),
            barWidth: Number(r[2]) || 70,
            barHeight: Number(r[3]) || 25,
            fontSize: Number(r[4]) || 16,
            paperSize: String(r[5] || "a4").toLowerCase(),
          }))
        if (parsed.length > 0) {
          setItems(parsed)
          setPreviewIndex(0)
        }
      } catch (err) {
        alert("文件解析失败，请检查格式")
      }
    }
    if (file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
    e.target.value = ""
  }

  function updateItem(idx: number, field: keyof BinItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    )
  }

  function addItem() {
    setItems((prev) => [...prev, { ...DEFAULT_ITEM }])
  }

  function removeItem(idx: number) {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      return next.length ? next : [{ ...DEFAULT_ITEM }]
    })
    if (previewIndex >= idx && previewIndex > 0) {
      setPreviewIndex((p) => p - 1)
    }
  }

  async function handleGeneratePDF() {
    const validItems = items.filter((i) => i.code.trim())
    if (validItems.length === 0) {
      alert("请至少输入一个库位码")
      return
    }
    setLoading(true)
    try {
      const name = taskName.trim() || `库位码_${new Date().toLocaleDateString()}`
      const blob = await generateBinLabelsPDF(validItems, name)
      downloadBlob(blob, `${name}.pdf`)
      logUsage(userId, tool.id, tool.name, "execute", `生成 ${validItems.length} 个库位码`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveRecord() {
    const validItems = items.filter((i) => i.code.trim())
    if (validItems.length === 0) {
      alert("请至少输入一个库位码")
      return
    }
    const name = taskName.trim() || `库位码_${new Date().toLocaleDateString()}`
    try {
      const res = await fetch(`${API_BASE}/bin-labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          data: JSON.stringify(validItems),
          count: validItems.length,
        }),
      })
      if (res.ok) {
        alert("保存成功")
        loadHistory()
      } else {
        alert("保存失败")
      }
    } catch {
      alert("保存失败")
    }
  }

  async function handleReDownload(record: HistoryRecord) {
    try {
      const res = await fetch(`${API_BASE}/bin-labels/${record.id}`)
      if (!res.ok) return
      const data = await res.json()
      const recordData: BinItem[] = JSON.parse(data.record.data)
      const blob = await generateBinLabelsPDF(recordData, record.name)
      downloadBlob(blob, `${record.name}.pdf`)
    } catch {
      alert("重新下载失败")
    }
  }

  async function handleDeleteRecord(id: number) {
    if (!confirm("确定删除这条记录？")) return
    try {
      await fetch(`${API_BASE}/bin-labels/${id}?userId=${userId}`, { method: "DELETE" })
      loadHistory()
    } catch {
      alert("删除失败")
    }
  }

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          下载模板
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          导入文件
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="flex-1" />
        <Input
          placeholder="任务名称（用于保存记录）"
          className="w-64"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <Button size="sm" onClick={handleGeneratePDF} disabled={loading}>
          <Printer className="mr-2 h-4 w-4" />
          {loading ? "生成中..." : "生成 PDF"}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSaveRecord}>
          <Save className="mr-2 h-4 w-4" />
          保存记录
        </Button>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">库位码</th>
              <th className="px-3 py-2 text-left font-medium">方向</th>
              <th className="px-3 py-2 text-left font-medium">条码宽(mm)</th>
              <th className="px-3 py-2 text-left font-medium">条码高(mm)</th>
              <th className="px-3 py-2 text-left font-medium">文字大小(pt)</th>
              <th className="px-3 py-2 text-left font-medium">纸张尺寸</th>
              <th className="px-3 py-2 text-center font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">
                  <Input
                    value={item.code}
                    onChange={(e) => updateItem(idx, "code", e.target.value)}
                    placeholder="HC-01-B-002"
                    className="h-8"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.direction}
                    onChange={(e) => updateItem(idx, "direction", e.target.value)}
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="down">向下</option>
                    <option value="up">向上</option>
                    <option value="left">向左</option>
                    <option value="right">向右</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.barWidth}
                    onChange={(e) => updateItem(idx, "barWidth", Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.barHeight}
                    onChange={(e) => updateItem(idx, "barHeight", Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.fontSize}
                    onChange={(e) => updateItem(idx, "fontSize", Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.paperSize}
                    onChange={(e) => updateItem(idx, "paperSize", e.target.value)}
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="a3">A3</option>
                    <option value="a4">A4</option>
                    <option value="a5">A5</option>
                    <option value="a6">A6</option>
                    <option value="letter">Letter</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addItem}>
        + 添加一行
      </Button>

      {/* Preview */}
      {items.length > 0 && items[0].code && (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">PDF 预览（第 {previewIndex + 1} / {items.length} 页）</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPreviewIndex((p) => Math.max(0, p - 1))} disabled={previewIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPreviewIndex((p) => Math.min(items.length - 1, p + 1))} disabled={previewIndex >= items.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {previewUrl ? (
            <iframe src={previewUrl} className="h-[600px] w-full rounded border" />
          ) : (
            <div className="flex h-40 items-center justify-center text-muted-foreground">预览生成中...</div>
          )}
        </Card>
      )}

      {/* History */}
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">生成记录</span>
          <Badge variant="secondary">{history.length}</Badge>
        </div>
        {history.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">暂无生成记录</div>
        ) : (
          <div className="space-y-2">
            {history.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{rec.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rec.count} 个库位码 · {new Date(rec.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleReDownload(rec)}>
                    <Download className="mr-1 h-4 w-4" />
                    重新下载
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(rec.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
