import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, MessageCircle, KeyRound, UserCircle } from "lucide-react"
import type { LoginParams } from "@/hooks/useAuth"
import type { User as UserType } from "@/types"

type LoginTab = "wechat" | "password" | "guest"

interface LoginPageProps {
  users: UserType[]
  onLogin: (params: LoginParams) => void
  isLoading: boolean
  error?: string
}

export function LoginPage({ users, onLogin, isLoading, error }: LoginPageProps) {
  const [tab, setTab] = useState<LoginTab>("wechat")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin({ type: "password", username, password })
  }

  const tabs: { id: LoginTab; label: string; icon: React.ReactNode }[] = [
    { id: "wechat", label: "企微登录", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "password", label: "账号密码", icon: <KeyRound className="h-4 w-4" /> },
    { id: "guest", label: "游客访问", icon: <UserCircle className="h-4 w-4" /> },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left: Hero visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/login-hero.png"
          alt="ToolBox 开发者工具门户"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-foreground">
            一站式开发者工具集合
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            JSON 格式化、Base64 编解码、时间戳转换等 20+ 常用工具，
            助力日常开发效率提升
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">T</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tool<span className="text-gradient">Box</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">开发者工具门户</p>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex rounded-lg border bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  tab === t.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-xl border bg-card p-5">
            {error && (
              <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            {tab === "wechat" && (
              <div className="text-center">
                <p className="mb-3 text-sm font-medium">企业微信扫码登录</p>
                <div className="mx-auto mb-3 flex h-44 w-44 items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-surface-sunken">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <div className="text-center">
                      <QrCodeSvg />
                      <p className="mt-1 text-xs text-muted-foreground">打开企业微信扫一扫</p>
                    </div>
                  )}
                </div>
                <p className="mb-3 text-xs text-muted-foreground">选择用户快速登录（演示）</p>
                <div className="space-y-2">
                  {users.length === 0 ? (
                    <p className="text-xs text-muted-foreground">加载中...</p>
                  ) : (
                    users.map((u) => (
                      <Button
                        key={u.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => onLogin({ type: "wechat", userId: u.id })}
                        disabled={isLoading}
                      >
                        <User className="h-4 w-4" />
                        <span>{u.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{u.department}</span>
                        {u.role === "admin" && (
                          <span className="rounded bg-primary/10 px-1 text-[10px] text-primary">管理员</span>
                        )}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">用户名</label>
                  <Input
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">密码</label>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">演示密码为用户ID（如 user-001）</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !username || !password}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
                </Button>
              </form>
            )}

            {tab === "guest" && (
              <div className="text-center py-4">
                <UserCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-sm font-medium">以游客身份访问</p>
                <p className="mb-4 text-xs text-muted-foreground">部分功能可能需要登录后使用</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onLogin({ type: "guest" })}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "直接进入"}
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            登录即表示同意 <span className="cursor-pointer text-primary hover:underline">服务条款</span> 和{" "}
            <span className="cursor-pointer text-primary hover:underline">隐私政策</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function QrCodeSvg() {
  return (
    <svg width="100" height="100" viewBox="0 0 120 120" className="mx-auto" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="4" fill="currentColor" className="text-foreground" />
      <rect x="12" y="12" width="24" height="24" rx="2" fill="currentColor" className="text-card" />
      <rect x="16" y="16" width="16" height="16" rx="2" fill="currentColor" className="text-foreground" />
      <rect x="80" y="8" width="32" height="32" rx="4" fill="currentColor" className="text-foreground" />
      <rect x="84" y="12" width="24" height="24" rx="2" fill="currentColor" className="text-card" />
      <rect x="88" y="16" width="16" height="16" rx="2" fill="currentColor" className="text-foreground" />
      <rect x="8" y="80" width="32" height="32" rx="4" fill="currentColor" className="text-foreground" />
      <rect x="12" y="84" width="24" height="24" rx="2" fill="currentColor" className="text-card" />
      <rect x="16" y="88" width="16" height="16" rx="2" fill="currentColor" className="text-foreground" />
      {[
        [48, 8], [56, 8], [64, 16], [48, 24], [56, 16], [72, 8],
        [48, 48], [56, 48], [64, 48], [48, 56], [64, 56], [56, 64],
        [80, 48], [88, 56], [96, 48], [80, 64], [104, 56],
        [48, 80], [56, 88], [64, 80], [48, 96], [56, 104],
        [80, 80], [88, 88], [96, 96], [104, 80], [80, 104],
        [96, 104], [104, 96], [88, 104], [104, 104],
        [8, 48], [16, 56], [24, 48], [32, 56], [8, 64],
        [24, 64], [32, 48],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="currentColor" className="text-foreground" />
      ))}
    </svg>
  )
}
