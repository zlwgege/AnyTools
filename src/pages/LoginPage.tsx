import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MessageCircle, KeyRound, UserCircle, CheckCircle2, Copy, Check, ScanLine, UserPlus, RotateCcw } from "lucide-react"
import type { LoginParams, RegisterParams } from "@/hooks/useAuth"
import { AppLogo } from "@/components/AppLogo"

type LoginTab = "guest" | "password" | "wechat"
type AuthView = "login" | "register" | "reset-password"

interface NewAccountInfo {
  userId: string
  password: string
}

interface LoginPageProps {
  onLogin: (params: LoginParams) => Promise<{ success: boolean; isNewAccount?: boolean; defaultPassword?: string }>
  onRegister: (params: RegisterParams) => Promise<{ success: boolean }>
  onResetPassword: (email: string, newPassword: string) => Promise<boolean>
  isLoading: boolean
  error?: string
  newAccountInfo?: NewAccountInfo | null
  onClearNewAccountInfo?: () => void
}

export function LoginPage({ onLogin, onRegister, onResetPassword, isLoading, error, newAccountInfo, onClearNewAccountInfo }: LoginPageProps) {
  const [tab, setTab] = useState<LoginTab>("guest")
  const [authView, setAuthView] = useState<AuthView>("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [wechatId, setWechatId] = useState("")
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPwd, setCopiedPwd] = useState(false)

  // Register form
  const [regUsername, setRegUsername] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPwd, setRegConfirmPwd] = useState("")
  const [regEmail, setRegEmail] = useState("")

  // Reset password form
  const [resetEmail, setResetEmail] = useState("")
  const [resetNewPwd, setResetNewPwd] = useState("")
  const [resetConfirmPwd, setResetConfirmPwd] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin({ type: "password", username, password })
  }

  const handleWechatLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wechatId.trim()) return
    onLogin({ type: "wechat", wechatId: wechatId.trim() })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (regPassword !== regConfirmPwd) {
      alert("两次输入的密码不一致")
      return
    }
    onRegister({ username: regUsername, password: regPassword, email: regEmail || undefined })
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (resetNewPwd !== resetConfirmPwd) {
      alert("两次输入的密码不一致")
      return
    }
    const ok = await onResetPassword(resetEmail, resetNewPwd)
    if (ok) {
      setResetSuccess(true)
    }
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

  const switchToLogin = () => {
    setAuthView("login")
    setResetSuccess(false)
  }

  const tabs: { id: LoginTab; label: string; icon: React.ReactNode }[] = [
    { id: "guest", label: "游客访问", icon: <UserCircle className="h-4 w-4" /> },
    { id: "password", label: "账号密码", icon: <KeyRound className="h-4 w-4" /> },
    { id: "wechat", label: "企微登录", icon: <MessageCircle className="h-4 w-4" /> },
  ]

  // Register view
  if (authView === "register") {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img src="/images/login-hero.png" alt="海外仓工具箱" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-hero opacity-60" />
          <div className="relative z-10 flex flex-col justify-end p-12">
            <h2 className="text-3xl font-bold text-foreground">海外仓现场管理工具箱</h2>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              库位码生成、条码生成、JSON格式化等实用工具，助力海外仓现场管理效率提升
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <UserPlus className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">注册帐号</h1>
              <p className="mt-2 text-sm text-muted-foreground">创建帐号以使用完整功能</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              {error && (
                <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
              )}
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">用户名</label>
                  <Input placeholder="请输入用户名" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">密码</label>
                  <Input type="password" placeholder="至少4位密码" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">确认密码</label>
                  <Input type="password" placeholder="再次输入密码" value={regConfirmPwd} onChange={(e) => setRegConfirmPwd(e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">邮箱 <span className="text-muted-foreground">（选填，用于重置密码）</span></label>
                  <Input type="email" placeholder="your@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !regUsername || !regPassword || !regConfirmPwd}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "注册"}
                </Button>
              </form>
              <div className="mt-3 text-center">
                <button onClick={switchToLogin} className="text-xs text-primary hover:underline">已有帐号？去登录</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reset password view
  if (authView === "reset-password") {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img src="/images/login-hero.png" alt="海外仓工具箱" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-hero opacity-60" />
          <div className="relative z-10 flex flex-col justify-end p-12">
            <h2 className="text-3xl font-bold text-foreground">海外仓现场管理工具箱</h2>
            <p className="mt-3 max-w-md text-base text-muted-foreground">库位码生成、条码生成、JSON格式化等实用工具</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <RotateCcw className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">重置密码</h1>
              <p className="mt-2 text-sm text-muted-foreground">通过绑定邮箱重置密码</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              {resetSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
                  <p className="mb-1 text-sm font-medium">密码重置成功</p>
                  <p className="mb-4 text-xs text-muted-foreground">请使用新密码登录</p>
                  <Button variant="outline" className="w-full" onClick={switchToLogin}>返回登录</Button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
                  )}
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">绑定邮箱</label>
                      <Input type="email" placeholder="输入注册时绑定的邮箱" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} disabled={isLoading} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">新密码</label>
                      <Input type="password" placeholder="至少4位新密码" value={resetNewPwd} onChange={(e) => setResetNewPwd(e.target.value)} disabled={isLoading} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">确认新密码</label>
                      <Input type="password" placeholder="再次输入新密码" value={resetConfirmPwd} onChange={(e) => setResetConfirmPwd(e.target.value)} disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !resetEmail || !resetNewPwd || !resetConfirmPwd}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "重置密码"}
                    </Button>
                  </form>
                  <div className="mt-3 text-center">
                    <button onClick={switchToLogin} className="text-xs text-primary hover:underline">返回登录</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Login view (default)
  return (
    <div className="flex min-h-screen">
      {/* Left: Hero visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/login-hero.png"
          alt="海外仓工具箱"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-3xl font-bold text-foreground">
            海外仓现场管理工具箱
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            库位码生成、条码生成、JSON格式化等实用工具，
            助力海外仓现场管理效率提升
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow">
              <AppLogo size={44} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              海外仓<span className="text-gradient">工具箱</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">现场管理工具门户</p>
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
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">没有帐号？</p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setAuthView("register")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    注册新帐号
                  </Button>
                </div>
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
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => setAuthView("register")} className="text-primary hover:underline">
                    没有帐号？注册
                  </button>
                  <button type="button" onClick={() => setAuthView("reset-password")} className="text-primary hover:underline">
                    忘记密码？
                  </button>
                </div>
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
