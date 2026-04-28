import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"

const categories = {
  length: {
    name: "长度",
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, inch: 0.0254, ft: 0.3048, mi: 1609.34 },
  },
  weight: {
    name: "重量",
    units: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.453592, oz: 0.0283495 },
  },
  temperature: {
    name: "温度",
    units: { C: 1, F: 1, K: 1 },
  },
}

function convertTemperature(value: number, from: string, to: string) {
  let c = value
  if (from === "F") c = (value - 32) * 5 / 9
  if (from === "K") c = value - 273.15
  if (to === "C") return c
  if (to === "F") return c * 9 / 5 + 32
  if (to === "K") return c + 273.15
  return c
}

export default function UnitConverter({ tool, user }: { tool: Tool; user: User }) {
  const [category, setCategory] = useState<keyof typeof categories>("length")
  const [value, setValue] = useState("")
  const [fromUnit, setFromUnit] = useState("m")
  const [toUnit, setToUnit] = useState("km")
  const [result, setResult] = useState("")

  const handleConvert = () => {
    const val = parseFloat(value)
    if (isNaN(val)) return
    const cat = categories[category]
    let out = 0
    if (category === "temperature") {
      out = convertTemperature(val, fromUnit, toUnit)
    } else {
      const base = val * cat.units[fromUnit as keyof typeof cat.units]
      out = base / cat.units[toUnit as keyof typeof cat.units]
    }
    setResult(out.toLocaleString(undefined, { maximumFractionDigits: 6 }))
    logUsage(user.id, tool.id, tool.name, "execute")
  }

  const cat = categories[category]
  const unitKeys = Object.keys(cat.units)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Object.entries(categories).map(([key, c]) => (
          <Button
            key={key}
            variant={category === key ? "default" : "outline"}
            onClick={() => {
              setCategory(key as keyof typeof categories)
              const units = Object.keys(c.units)
              setFromUnit(units[0])
              setToUnit(units[1] || units[0])
              setResult("")
            }}
          >
            {c.name}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="数值"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
        />
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
        >
          {unitKeys.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <span className="text-muted-foreground">→</span>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
        >
          {unitKeys.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <Button onClick={handleConvert}>转换</Button>
      {result && (
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-sm text-muted-foreground">结果</p>
          <p className="text-2xl font-mono font-semibold">{result} {toUnit}</p>
        </div>
      )}
    </div>
  )
}
