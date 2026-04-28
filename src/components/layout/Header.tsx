import { Search, Sun, Moon, Menu, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"

interface HeaderProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  onToggleSidebar: () => void
  userName?: string
  onLogout: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({
  theme,
  onToggleTheme,
  onToggleSidebar,
  userName,
  onLogout,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
          <span className="text-sm font-bold text-primary-foreground">T</span>
        </div>
        <span className="hidden text-lg font-bold tracking-tight sm:inline-block">
          Tool<span className="text-gradient">Box</span>
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
            <Avatar fallback={userName || "U"} size="sm" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-card p-1 shadow-lg animate-scale-in">
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">技术部</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false) }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-fast"
              >
                <UserIcon className="h-4 w-4" />
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
  )
}
