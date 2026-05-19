import { useState } from "react"
import { WorldClock } from "@/components/WorldClock"
import { tools, categories } from "@/data/tools"
import type { Tool } from "@/types"
import { Header } from "@/components/layout/Header"
import { Sparkles, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CloudLine, StarLine, SparkleLine, WaveLine, CircleDots, FlowerLine, DashedCircle, LeafLine } from "@/components/decorations"
import { AppLogo } from "@/components/AppLogo"

interface HomePageProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  userName: string
  userAvatar?: string
  onLogout: () => void
  isAdmin?: boolean
}

export function HomePage({ theme, onToggleTheme, userName, userAvatar, onLogout, isAdmin }: HomePageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-pink-50/30">
      {/* Soft gradient orbs */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-rose-100/40 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full bg-amber-100/30 blur-3xl" />

      {/* Line art decorations */}
      <CloudLine className="absolute top-20 left-[5%] w-24 text-slate-300" />
      <CloudLine className="absolute top-40 right-[8%] w-20 text-slate-200 rotate-12" />
      <StarLine className="absolute top-32 left-[20%] w-8 text-amber-300 animate-pulse" />
      <StarLine className="absolute top-16 right-[25%] w-6 text-rose-300 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <SparkleLine className="absolute top-28 right-[15%] w-5 text-sky-300 animate-pulse" style={{ animationDelay: "1s" }} />
      <WaveLine className="absolute bottom-40 left-0 w-48 text-slate-200" />
      <WaveLine className="absolute bottom-60 right-0 w-40 text-slate-200 rotate-180" />
      <CircleDots className="absolute top-60 right-[5%] w-24 text-slate-200" />
      <FlowerLine className="absolute bottom-32 left-[10%] w-16 text-rose-200" />
      <FlowerLine className="absolute top-48 right-[30%] w-12 text-sky-200 rotate-45" />
      <DashedCircle className="absolute bottom-20 right-[20%] w-28 text-slate-200" />
      <LeafLine className="absolute top-24 left-[35%] w-8 text-emerald-200 -rotate-12" />
      <LeafLine className="absolute bottom-48 right-[35%] w-6 text-emerald-200 rotate-45" />

      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToggleSidebar={() => {}}
        userName={userName}
        userAvatar={userAvatar}
        onLogout={onLogout}
        searchQuery={""}
        onSearchChange={() => {}}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-500 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>海外仓现场管理工具箱</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-700 sm:text-5xl">
            海外仓{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-violet-400 to-sky-400">
                工具箱
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8 Q50 2 100 6 Q150 10 198 4" stroke="url(#underline)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underline" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#fb7185" />
                    <stop offset="0.5" stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 leading-relaxed">
            库位码生成、条码生成、JSON格式化等实用工具，助力海外仓现场管理效率提升。
          </p>
        </div>

        {/* World Clock */}
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">全球时间</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>
          <WorldClock />
        </section>

        {/* Tool shortcuts */}
        <section>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">功能快捷入口</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>

          <div className="space-y-8">
            {categories.map((cat) => {
              const catTools = tools.filter((t) => t.category === cat.id)
              return (
                <div key={cat.id}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                      <cat.icon className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-600">{cat.name}</h3>
                    <span className="text-[10px] text-slate-300">({catTools.length})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {catTools.map((tool) => (
                      <ToolShortcutCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer decoration */}
        <div className="mt-16 flex items-center justify-center gap-4 text-slate-300">
          <div className="h-px w-12 bg-slate-200" />
          <LeafLine className="w-5" />
          <StarLine className="w-4" />
          <LeafLine className="w-5 -scale-x-100" />
          <div className="h-px w-12 bg-slate-200" />
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-300">
          海外仓工具箱 · 现场管理工具门户 · 大帅哥出品，必属精品
        </p>
      </main>
    </div>
  )
}

function ToolShortcutCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  const [isHovered, setIsHovered] = useState(false)

  const categoryColors: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
    development: { bg: "bg-sky-50", text: "text-sky-500", border: "border-sky-200/60", shadow: "shadow-sky-100" },
    conversion: { bg: "bg-amber-50", text: "text-amber-500", border: "border-amber-200/60", shadow: "shadow-amber-100" },
    text: { bg: "bg-emerald-50", text: "text-emerald-500", border: "border-emerald-200/60", shadow: "shadow-emerald-100" },
    image: { bg: "bg-rose-50", text: "text-rose-500", border: "border-rose-200/60", shadow: "shadow-rose-100" },
    security: { bg: "bg-violet-50", text: "text-violet-500", border: "border-violet-200/60", shadow: "shadow-violet-100" },
    network: { bg: "bg-cyan-50", text: "text-cyan-500", border: "border-cyan-200/60", shadow: "shadow-cyan-100" },
  }

  const colors = categoryColors[tool.category] || categoryColors.development

  return (
    <button
      onClick={() => window.open(`/tools/${tool.id}`, "_blank")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 transition-all duration-300",
        "hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5",
        isHovered && colors.shadow
      )}
    >
      {/* Corner arrow */}
      <div
        className={cn(
          "absolute right-2 top-2 rounded-full p-0.5 text-slate-300 transition-all duration-200",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
      >
        <ArrowUpRight className="h-2.5 w-2.5" />
      </div>

      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
          colors.bg,
          colors.text,
          "group-hover:scale-110"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-[11px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors leading-tight">
          {tool.name}
        </p>
      </div>

      {/* Hot / New badge */}
      {(tool.isHot || tool.isNew) && (
        <div className="absolute -top-1.5 -right-1">
          <span
            className={cn(
              "flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[7px] font-bold",
              tool.isHot ? "bg-orange-400 text-white" : "bg-sky-400 text-white"
            )}
          >
            {tool.isHot ? "H" : "N"}
          </span>
        </div>
      )}
    </button>
  )
}
