import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Tool, User } from "@/types"
import { logUsage } from "@/lib/api"
import { Gauge, Download, Upload, Activity, RotateCcw, ChevronDown, Globe, MapPin } from "lucide-react"

interface TestResult {
  ping: number
  jitter: number
  download: number
  upload: number
}

interface SpeedNode {
  id: string
  name: string
  flag: string
  pingUrl: string
  useCors: boolean
}

interface LocationInfo {
  country: string
  countryCode: string
  city: string
}

const nodes: SpeedNode[] = [
  { id: "global", name: "全球自动", flag: "🌍", pingUrl: "https://httpbin.org/get", useCors: true },
  { id: "cn", name: "中国", flag: "🇨🇳", pingUrl: "https://www.baidu.com/favicon.ico", useCors: false },
  { id: "us", name: "美国", flag: "🇺🇸", pingUrl: "https://www.google.com/favicon.ico", useCors: false },
  { id: "de", name: "德国", flag: "🇩🇪", pingUrl: "https://www.heise.de/favicon.ico", useCors: false },
  { id: "jp", name: "日本", flag: "🇯🇵", pingUrl: "https://www.yahoo.co.jp/favicon.ico", useCors: false },
  { id: "sg", name: "新加坡", flag: "🇸🇬", pingUrl: "https://shopee.sg/favicon.ico", useCors: false },
]

// Country code to node mapping
const countryToNode: Record<string, string> = {
  CN: "cn",
  US: "us", CA: "us",
  DE: "de", AT: "de", CH: "de",
  JP: "jp",
  SG: "sg", MY: "sg", TH: "sg", ID: "sg", VN: "sg", PH: "sg", KR: "sg",
}

function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`
  if (mbps >= 1) return `${mbps.toFixed(2)} Mbps`
  return `${(mbps * 1000).toFixed(0)} Kbps`
}

async function pingUrl(url: string, useCors: boolean): Promise<number> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  const start = performance.now()
  try {
    if (useCors) {
      await fetch(url, { method: "HEAD", cache: "no-store", signal: controller.signal })
    } else {
      await fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store", signal: controller.signal })
    }
  } catch {
    // ignore
  }
  clearTimeout(timeout)
  return performance.now() - start
}

async function measurePing(node: SpeedNode): Promise<{ ping: number; jitter: number }> {
  const times: number[] = []
  for (let i = 0; i < 10; i++) {
    const elapsed = await pingUrl(node.pingUrl, node.useCors)
    if (elapsed > 0 && elapsed < 8000) times.push(elapsed)
  }
  if (times.length < 3) return { ping: 0, jitter: 0 }
  times.sort((a, b) => a - b)
  const trimmed = times.slice(1, -1)
  const median = trimmed[Math.floor(trimmed.length / 2)]
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
  const jitter = trimmed.reduce((sum, t) => sum + Math.abs(t - avg), 0) / trimmed.length
  return { ping: Math.round(median), jitter: Math.round(jitter) }
}

// Quick probe: 2 pings per node, pick lowest latency
async function probeNode(node: SpeedNode): Promise<number> {
  const t1 = await pingUrl(node.pingUrl, node.useCors)
  const t2 = await pingUrl(node.pingUrl, node.useCors)
  const valid = [t1, t2].filter((t) => t > 10 && t < 8000)
  return valid.length ? Math.min(...valid) : Infinity
}

function measureDownload(onProgress: (pct: number) => void): Promise<number> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "https://speed.cloudflare.com/__down?bytes=25000000", true)
    xhr.responseType = "arraybuffer"

    const speeds: number[] = []
    let lastTime = 0
    let lastLoaded = 0

    xhr.onloadstart = () => {
      lastTime = performance.now()
    }

    xhr.onprogress = (e) => {
      const now = performance.now()
      if (lastTime > 0 && e.loaded > lastLoaded) {
        const duration = (now - lastTime) / 1000
        const bytes = e.loaded - lastLoaded
        const speed = (bytes * 8) / 1024 / 1024 / duration
        if (speed > 0 && duration > 0.05) speeds.push(speed)
      }
      lastTime = now
      lastLoaded = e.loaded

      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      const valid = speeds.slice(Math.floor(speeds.length * 0.2), Math.floor(speeds.length * 0.9))
      const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
      resolve(avg)
    }

    xhr.onerror = () => resolve(0)
    xhr.ontimeout = () => resolve(0)
    xhr.timeout = 60000
    xhr.send()
  })
}

function measureUpload(onProgress: (pct: number) => void): Promise<number> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "https://httpbin.org/post", true)

    const speeds: number[] = []
    let lastTime = 0
    let lastLoaded = 0

    xhr.upload.onloadstart = () => {
      lastTime = performance.now()
    }

    xhr.upload.onprogress = (e) => {
      const now = performance.now()
      if (lastTime > 0 && e.loaded > lastLoaded) {
        const duration = (now - lastTime) / 1000
        const bytes = e.loaded - lastLoaded
        const speed = (bytes * 8) / 1024 / 1024 / duration
        if (speed > 0 && duration > 0.05) speeds.push(speed)
      }
      lastTime = now
      lastLoaded = e.loaded

      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      const valid = speeds.slice(Math.floor(speeds.length * 0.2), Math.floor(speeds.length * 0.9))
      const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
      resolve(avg)
    }

    xhr.onerror = () => resolve(0)
    xhr.ontimeout = () => resolve(0)
    xhr.timeout = 60000

    const size = 8 * 1024 * 1024
    const data = new Uint8Array(size)
    const chunk = 65536
    for (let i = 0; i < size; i += chunk) {
      const end = Math.min(i + chunk, size)
      for (let j = i; j < end; j++) data[j] = Math.floor(Math.random() * 256)
    }
    xhr.send(data)
  })
}

export default function SpeedTest({ tool, user }: { tool: Tool; user: User }) {
  const [selectedNode, setSelectedNode] = useState<SpeedNode>(nodes[0])
  const [status, setStatus] = useState<"idle" | "ping" | "download" | "upload" | "done">("idle")
  const [result, setResult] = useState<TestResult>({ ping: 0, jitter: 0, download: 0, upload: 0 })
  const [progress, setProgress] = useState(0)
  const [liveSpeed, setLiveSpeed] = useState(0)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectResults, setDetectResults] = useState<Record<string, number>>({})
  const abortRef = useRef(false)

  // Auto-detect location and best node on mount
  useEffect(() => {
    let cancelled = false

    async function autoDetect() {
      setIsDetecting(true)

      // 1. Get location from IP
      let loc: LocationInfo | null = null
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const data = await res.json()
          loc = {
            country: data.country_name || data.country || "未知",
            countryCode: data.country_code || "",
            city: data.city || "",
          }
        }
      } catch {
        // fallback
      }
      if (cancelled) return
      setLocation(loc)

      // 2. Try to map country code to node
      let bestNodeId = "global"
      if (loc?.countryCode && countryToNode[loc.countryCode]) {
        bestNodeId = countryToNode[loc.countryCode]
      }

      // 3. Probe all nodes to find the actual fastest one (2 pings each)
      const probes: Record<string, number> = {}
      for (const node of nodes) {
        if (cancelled) return
        const latency = await probeNode(node)
        probes[node.id] = latency
      }
      if (cancelled) return
      setDetectResults(probes)

      // 4. Pick the node with lowest latency (but prefer the location-mapped one if it's close)
      const mappedLatency = probes[bestNodeId] ?? Infinity
      let actualBest = bestNodeId
      let bestLatency = mappedLatency

      for (const [id, latency] of Object.entries(probes)) {
        if (latency < bestLatency) {
          bestLatency = latency
          actualBest = id
        }
      }

      const found = nodes.find((n) => n.id === actualBest)
      if (found) setSelectedNode(found)
      setIsDetecting(false)
    }

    autoDetect()
    return () => { cancelled = true }
  }, [])

  const runTest = useCallback(async () => {
    abortRef.current = false
    setStatus("ping")
    setProgress(5)
    setLiveSpeed(0)
    setResult({ ping: 0, jitter: 0, download: 0, upload: 0 })

    const { ping, jitter } = await measurePing(selectedNode)
    if (abortRef.current) return
    setResult((r) => ({ ...r, ping, jitter }))

    setStatus("download")
    setProgress(20)
    const downloadSpeed = await measureDownload((pct) => {
      setProgress(20 + Math.floor((pct / 100) * 50))
    })
    if (abortRef.current) return
    setResult((r) => ({ ...r, download: downloadSpeed }))
    setLiveSpeed(downloadSpeed)

    setStatus("upload")
    setProgress(75)
    const uploadSpeed = await measureUpload((pct) => {
      setProgress(75 + Math.floor((pct / 100) * 20))
    })
    if (abortRef.current) return
    setResult((r) => ({ ...r, upload: uploadSpeed }))

    setProgress(100)
    setStatus("done")
    logUsage(user.id, tool.id, tool.name, "execute")
  }, [selectedNode, user.id, tool.id, tool.name])

  const cancel = () => {
    abortRef.current = true
    setStatus("idle")
    setProgress(0)
    setLiveSpeed(0)
  }

  return (
    <div className="space-y-5">
      {/* Location info */}
      <div className="flex items-center gap-2 rounded-lg border bg-slate-50/50 px-3 py-2">
        <MapPin className="h-3.5 w-3.5 text-rose-400" />
        {isDetecting ? (
          <span className="text-xs text-slate-400">正在定位并探测最优节点...</span>
        ) : location ? (
          <span className="text-xs text-slate-600">
            当前位置：{location.country}
            {location.city ? ` · ${location.city}` : ""}
            {detectResults[selectedNode.id] ? (
              <span className="ml-1 text-emerald-500">
                （已自动选择最优节点 {selectedNode.flag} {selectedNode.name}）
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-xs text-slate-400">位置获取失败，使用默认节点</span>
        )}
      </div>

      {/* Node selector */}
      <div className="flex items-center gap-3 rounded-lg border bg-slate-50/50 p-3">
        <Globe className="h-4 w-4 text-slate-400" />
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">测速节点</label>
          <div className="relative">
            <select
              value={selectedNode.id}
              onChange={(e) => {
                const node = nodes.find((n) => n.id === e.target.value)
                if (node) setSelectedNode(node)
              }}
              disabled={status !== "idle" && status !== "done"}
              className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.flag} {n.name}
                  {detectResults[n.id] && detectResults[n.id] !== Infinity
                    ? ` ~${Math.round(detectResults[n.id])}ms`
                    : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-300 leading-relaxed">
        延迟测试针对所选节点地区；下载/上传通过 Cloudflare 全球 CDN 自动路由到最近节点。
      </p>

      {/* Start / Done state */}
      {status === "idle" || status === "done" ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Gauge className="h-10 w-10 text-slate-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            {status === "done"
              ? "测试完成，点击下方按钮重新测试"
              : `点击按钮开始测试 — ${selectedNode.flag} ${selectedNode.name}`}
          </p>
          <Button onClick={runTest} size="lg" className="gap-2">
            {status === "done" ? <RotateCcw className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            {status === "done" ? "重新测试" : "开始测速"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="6" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#3b82f6"
                strokeWidth="6"
                fill="none"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              {status === "ping" && `正在测试 ${selectedNode.flag} ${selectedNode.name} 延迟...`}
              {status === "download" && "正在测试下载速度..."}
              {status === "upload" && "正在测试上传速度..."}
            </p>
            {(status === "download" || status === "upload") && liveSpeed > 0 && (
              <p className="mt-1 text-xs text-slate-400">实时: {formatSpeed(liveSpeed)}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={cancel} className="text-slate-400 hover:text-slate-600">
            取消
          </Button>
        </div>
      )}

      {/* Results */}
      {status === "done" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultCard
              icon={<Activity className="h-5 w-5 text-emerald-500" />}
              label={`延迟 (${selectedNode.flag})`}
              value={`${result.ping} ms`}
              color="bg-emerald-50 border-emerald-200"
            />
            <ResultCard
              icon={<Activity className="h-5 w-5 text-amber-500" />}
              label="抖动"
              value={`${result.jitter} ms`}
              color="bg-amber-50 border-amber-200"
            />
            <ResultCard
              icon={<Download className="h-5 w-5 text-sky-500" />}
              label="下载速度"
              value={formatSpeed(result.download)}
              color="bg-sky-50 border-sky-200"
            />
            <ResultCard
              icon={<Upload className="h-5 w-5 text-violet-500" />}
              label="上传速度"
              value={formatSpeed(result.upload)}
              color="bg-violet-50 border-violet-200"
            />
          </div>

          {result.download > 0 && (
            <div className="rounded-xl border bg-white p-4">
              <p className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">下载速度参考</p>
              <SpeedBar speed={result.download} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ResultCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${color}`}>
      {icon}
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-700">{value}</p>
    </div>
  )
}

function SpeedBar({ speed }: { speed: number }) {
  const levels = [
    { label: "慢", threshold: 10, color: "bg-red-400" },
    { label: "一般", threshold: 50, color: "bg-amber-400" },
    { label: "良好", threshold: 100, color: "bg-sky-400" },
    { label: "优秀", threshold: 300, color: "bg-emerald-400" },
    { label: "极速", threshold: Infinity, color: "bg-violet-400" },
  ]

  const maxDisplay = 500
  const percentage = Math.min((speed / maxDisplay) * 100, 100)
  const currentLevel = levels.find((l) => speed < l.threshold) || levels[levels.length - 1]

  return (
    <div className="space-y-2">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${currentLevel.color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
        <span>500+ Mbps</span>
      </div>
      <p className="text-center text-xs font-medium text-slate-500">
        当前评级：<span className={`font-bold ${currentLevel.color.replace("bg-", "text-")}`}>{currentLevel.label}</span>
      </p>
    </div>
  )
}
