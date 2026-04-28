import { useState, useEffect } from "react"

const zones = [
  { label: "中国", tz: "Asia/Shanghai", emoji: "🌸", sub: "北京时间", color: "from-rose-50 to-pink-50", border: "border-rose-200/60", text: "text-rose-500", bg: "bg-rose-100/50" },
  { label: "加州", tz: "America/Los_Angeles", emoji: "🌴", sub: "太平洋时间", color: "from-sky-50 to-blue-50", border: "border-sky-200/60", text: "text-sky-500", bg: "bg-sky-100/50" },
  { label: "休斯顿", tz: "America/Chicago", emoji: "🌵", sub: "中部时间", color: "from-amber-50 to-orange-50", border: "border-amber-200/60", text: "text-amber-500", bg: "bg-amber-100/50" },
  { label: "新泽西", tz: "America/New_York", emoji: "🍎", sub: "东部时间", color: "from-violet-50 to-purple-50", border: "border-violet-200/60", text: "text-violet-500", bg: "bg-violet-100/50" },
  { label: "德国", tz: "Europe/Berlin", emoji: "🌿", sub: "中欧时间", color: "from-emerald-50 to-teal-50", border: "border-emerald-200/60", text: "text-emerald-500", bg: "bg-emerald-100/50" },
]

function getTimeString(tz: string) {
  return new Date().toLocaleTimeString("zh-CN", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function getDateString(tz: string) {
  return new Date().toLocaleDateString("zh-CN", {
    timeZone: tz,
    month: "short",
    day: "numeric",
    weekday: "short",
  })
}

export function WorldClock() {
  const [times, setTimes] = useState<Record<string, string>>({})
  const [dates, setDates] = useState<Record<string, string>>({})

  useEffect(() => {
    const update = () => {
      const t: Record<string, string> = {}
      const d: Record<string, string> = {}
      zones.forEach((z) => {
        t[z.tz] = getTimeString(z.tz)
        d[z.tz] = getDateString(z.tz)
      })
      setTimes(t)
      setDates(d)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {zones.map((z, i) => (
        <div
          key={z.tz}
          className={`group relative overflow-hidden rounded-2xl border ${z.border} bg-gradient-to-br ${z.color} p-5 transition-all duration-500 hover:shadow-lg hover:scale-[1.02]`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* subtle decorative dot */}
          <div className={`absolute -top-3 -right-3 h-12 w-12 rounded-full ${z.bg} opacity-60`} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{z.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{z.label}</p>
                <p className="text-[10px] text-slate-400">{z.sub}</p>
              </div>
            </div>
            <p className={`font-mono text-xl font-bold tracking-wider ${z.text} tabular-nums`}>
              {times[z.tz] || "--:--:--"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {dates[z.tz] || ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
