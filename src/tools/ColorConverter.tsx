import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Copy, Check } from "lucide-react"

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

export default function ColorConverter({ tool, user }: { tool: Tool; user: User }) {
  const [hex, setHex] = useState("")
  const [results, setResults] = useState<{ hex: string; rgb: string; hsl: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleConvert = () => {
    const rgb = hexToRgb(hex)
    if (!rgb) {
      setResults(null)
      return
    }
    const out = {
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
    }
    setResults(out)
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  const copy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="#FF5733"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="flex-1 font-mono"
        />
        <Button onClick={handleConvert}>转换</Button>
      </div>
      {results && (
        <div className="space-y-3">
          <div className="h-20 rounded-lg border" style={{ backgroundColor: results.hex }} />
          {Object.entries(results).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border bg-muted p-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase">{key}</span>
                <p className="font-mono text-sm">{val}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copy(val, key)}>
                {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
