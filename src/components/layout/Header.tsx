import { Search, Sun, Moon, Menu, LogOut, User as UserIcon, Shield, Settings } from "lucide-react"
import { VersionLogButton } from "@/components/VersionLog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { AppLogo } from "@/components/AppLogo"
import { useState, useRef, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMixedJokes } from "@/data/jokes"

interface HeaderProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  onToggleSidebar: () => void
  userName?: string
  userAvatar?: string
  onLogout: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isAdmin?: boolean
}

export function Header({
  theme,
  onToggleTheme,
  onToggleSidebar,
  userName,
  userAvatar,
  onLogout,
  searchQuery,
  onSearchChange,
  isAdmin,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const jokes = useMemo(() => getMixedJokes(3), [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Marquee */}
      <div className="z-40 overflow-hidden whitespace-nowrap border-b bg-gradient-to-r from-amber-50 via-rose-50 to-sky-50 py-1 text-xs text-muted-foreground">
        <div className="inline-block animate-marquee">
          <span className="mx-8">🎉 开心一笑：{jokes[0]}</span>
          <span className="mx-8">🎉 开心一笑：{jokes[1]}</span>
          <span className="mx-8">🎉 开心一笑：{jokes[2]}</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 px-4 glass lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link to="/" className="flex items-center gap-2">
        <AppLogo size={28} />
        <span className="hidden text-lg font-bold tracking-tight sm:inline-block">
          海外仓<span className="text-gradient">工具箱</span>
        </span>
      </Link>

      <div className="flex-1 px-4 lg:px-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9 bg-surface-sunken border-transparent focus-visible:border-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
            >
              <span className="text-xs">ESC</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <VersionLogButton />

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="transition-spring"
        >
          {theme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="transition-smooth rounded-full ring-2 ring-transparent hover:ring-primary/30"
          >
            {userAvatar ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-lg bg-primary/10">
                {userAvatar}
              </div>
            ) : (
              <Avatar fallback={userName || "U"} size="sm" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-card p-1 shadow-lg animate-scale-in">
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">技术部</p>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-fast"
                >
                  <Shield className="h-4 w-4" />
                  管理后台
                </Link>
              )}
              <button
                onClick={() => { setMenuOpen(false); navigate("/profile") }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-fast"
              >
                <Settings className="h-4 w-4" />
                个人设置
              </button>
              <button
                onClick={() => { setMenuOpen(false); onLogout() }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-fast"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  )
}
