import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MessageCircle, KeyRound, UserCircle, CheckCircle2, Copy, Check, ScanLine } from "lucide-react"
import type { LoginParams } from "@/hooks/useAuth"

type LoginTab = "guest" | "password" | "wechat"

interface NewAccountInfo {
  userId: string
  password: string
}

interface LoginPageProps {
  onLogin: (params: LoginParams) => Promise<{ success: boolean; isNewAccount?: boolean; defaultPassword?: string }>
  isLoading: boolean
  error?: string
  newAccountInfo?: NewAccountInfo | null
  onClearNewAccountInfo?: () => void
}

export function LoginPage({ onLogin, isLoading, error, newAccountInfo, onClearNewAccountInfo }: LoginPageProps) {
  const [tab, setTab] = useState<LoginTab>("guest")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [wechatId, setWechatId] = useState("")
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPwd, setCopiedPwd] = useState(false)

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin({ type: "password", username, password })
  }

  const handleWechatLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wechatId.trim()) return
    onLogin({ type: "wechat", wechatId: wechatId.trim() })
  }

  const copyToClipboard = async (text: string, type: "id" | "pwd") => {
    await navigator.clipboard.writeText(text)
    if (type === "id") {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 1500)
    } else {
      setCopiedPwd(true)
      setTimeout(() => setCopiedPwd(false), 1500)
    }
  }

  const tabs: { id: LoginTab; label: string; icon: React.ReactNode }[] = [
    { id: "guest", label: "游客访问", icon: <UserCircle className="h-4 w-4" /> },
    { id: "password", label: "账号密码", icon: <KeyRound className="h-4 w-4" /> },
    { id: "wechat", label: "企微登录", icon: <MessageCircle className="h-4 w-4" /> },
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

          {/* New Account Notification */}
          {newAccountInfo && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    已为您自动创建帐号
                  </p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    首次企微登录，系统已自动创建普通用户帐号并与您的企微绑定。您后续可选择企微扫码或账号密码登录。
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 rounded-md bg-white/60 px-2 py-1 dark:bg-black/20">
                      <span className="text-xs text-muted-foreground">帐号:</span>
                      <code className="flex-1 text-xs font-mono">{newAccountInfo.userId}</code>
                      <button onClick={() => copyToClipboard(newAccountInfo.userId, "id")} className="text-muted-foreground hover:text-foreground">
                        {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 rounded-md bg-white/60 px-2 py-1 dark:bg-black/20">
                      <span className="text-xs text-muted-foreground">密码:</span>
                      <code className="flex-1 text-xs font-mono">{newAccountInfo.password}</code>
                      <button onClick={() => copyToClipboard(newAccountInfo.password, "pwd")} className="text-muted-foreground hover:text-foreground">
                        {copiedPwd ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900"
                    onClick={onClearNewAccountInfo}
                  >
                    我已记下，进入系统
                  </Button>
                </div>
              </div>
            </div>
          )}

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

            {tab === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">用户名</label>
                  <Input
                    placeholder="请输入用户名或用户ID"
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
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !username || !password}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
                </Button>
              </form>
            )}

            {tab === "wechat" && (
              <form onSubmit={handleWechatLogin} className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-surface-sunken cursor-pointer hover:border-primary/40 transition-colors" onClick={() => document.getElementById('wechat-id-input')?.focus()}>
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <div className="text-center">
                        <ScanLine className="mx-auto h-8 w-8 text-primary/50" />
                        <p className="mt-1 text-[10px] text-muted-foreground">点击下方输入企微ID</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">打开企业微信，扫描二维码或输入企微ID登录</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">企微ID</label>
                  <div className="flex gap-2">
                    <Input
                      id="wechat-id-input"
                      placeholder="输入企微ID，如 wx-zhangsan"
                      value={wechatId}
                      onChange={(e) => setWechatId(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={isLoading || !wechatId.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
                    </Button>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">首次登录将自动创建帐号并绑定企微</p>
                </div>
              </form>
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
