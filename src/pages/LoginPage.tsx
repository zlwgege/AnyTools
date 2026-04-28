import { Button } from "@/components/ui/button"
import { Loader2, User } from "lucide-react"
import type { User as UserType } from "@/types"

interface LoginPageProps {
  users: UserType[]
  onLogin: (userId: string) => void
  isLoading: boolean
}

export function LoginPage({ users, onLogin, isLoading }: LoginPageProps) {
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
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">T</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tool<span className="text-gradient">Box</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              开发者工具门户
            </p>
          </div>

          {/* QR Code Area */}
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="mb-4 text-sm font-medium">
              企业微信扫码登录
            </p>

            {/* Mock QR code */}
            <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-surface-sunken">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <div className="text-center">
                  <QrCodeSvg />
                  <p className="mt-2 text-xs text-muted-foreground">
                    打开企业微信扫一扫
                  </p>
                </div>
              )}
            </div>

            <p className="mb-4 text-xs text-muted-foreground">
              {isLoading ? "正在验证登录信息..." : "使用企业微信扫描二维码登录"}
            </p>

            {/* User selection */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">选择用户登录（演示环境）</p>
              {users.length === 0 ? (
                <p className="text-xs text-muted-foreground">加载用户列表中...</p>
              ) : (
                users.map((u) => (
                  <Button
                    key={u.id}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => onLogin(u.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span>{u.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{u.department}</span>
                  </Button>
                ))
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            登录即表示同意 <span className="text-primary cursor-pointer hover:underline">服务条款</span> 和 <span className="text-primary cursor-pointer hover:underline">隐私政策</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/** Simple QR code placeholder SVG */
function QrCodeSvg() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className="mx-auto"
      aria-hidden="true"
    >
      {/* Top-left finder */}
      <rect x="8" y="8" width="32" height="32" rx="4" fill="currentColor" className="text-foreground" />
      <rect x="12" y="12" width="24" height="24" rx="2" fill="currentColor" className="text-card" />
      <rect x="16" y="16" width="16" height="16" rx="2" fill="currentColor" className="text-foreground" />

      {/* Top-right finder */}
      <rect x="80" y="8" width="32" height="32" rx="4" fill="currentColor" className="text-foreground" />
      <rect x="84" y="12" width="24" height="24" rx="2" fill="currentColor" className="text-card" />
      <rect x="88" y="16" width="16" height="16" rx="2" fill="currentColor" className="text-foreground" />

      {/* Bottom-left finder */}
      <rect x="8" y="80" width="32" height="32" rx="4" fill="currentColor" className="text-foreground" />
      <rect x="12" y="84" width="24" height="24" rx="2" fill="currentColor" className="text-card" />
      <rect x="16" y="88" width="16" height="16" rx="2" fill="currentColor" className="text-foreground" />

      {/* Data modules */}
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
        <rect
          key={i}
          x={x}
          y={y}
          width="6"
          height="6"
          rx="1"
          fill="currentColor"
          className="text-foreground"
        />
      ))}
    </svg>
  )
}
