import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Shield,
  Users,
  LogIn,
  Activity,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const API_BASE = "/api"

interface AdminUser {
  id: string
  name: string
  role: string
  department: string
  created_at: string
}

interface LoginSession {
  id: number
  user_id: string
  user_name: string
  login_type: string
  ip: string
  browser: string
  os: string
  created_at: string
}

interface UsageLog {
  id: number
  user_id: string
  user_name: string
  user_role: string
  tool_id: string
  tool_name: string
  action: string
  details: string | null
  created_at: string
}

type AdminTab = "users" | "sessions" | "logs"

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("users")
  const userId = JSON.parse(localStorage.getItem("toolbox-user") || "{}").id || ""

  // Users
  const [users, setUsers] = useState<AdminUser[]>([])
  const [newUser, setNewUser] = useState({ id: "", name: "", role: "user", department: "" })
  const [showAddUser, setShowAddUser] = useState(false)

  // Sessions
  const [sessions, setSessions] = useState<LoginSession[]>([])
  const [sessionPage, setSessionPage] = useState(1)
  const [sessionTotal, setSessionTotal] = useState(0)

  // Logs
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [logPage, setLogPage] = useState(1)
  const [logTotal, setLogTotal] = useState(0)
  const [logKeyword, setLogKeyword] = useState("")

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: { "x-user-id": userId } })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }, [userId])

  const fetchSessions = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/sessions?page=${sessionPage}`, { headers: { "x-user-id": userId } })
    if (res.ok) {
      const data = await res.json()
      setSessions(data.data || [])
      setSessionTotal(data.total || 0)
    }
  }, [userId, sessionPage])

  const fetchLogs = useCallback(async () => {
    const url = `${API_BASE}/admin/logs?page=${logPage}${logKeyword ? `&keyword=${encodeURIComponent(logKeyword)}` : ""}`
    const res = await fetch(url, { headers: { "x-user-id": userId } })
    if (res.ok) {
      const data = await res.json()
      setLogs(data.data || [])
      setLogTotal(data.total || 0)
    }
  }, [userId, logPage, logKeyword])

  useEffect(() => {
    if (tab === "users") fetchUsers()
    if (tab === "sessions") fetchSessions()
    if (tab === "logs") fetchLogs()
  }, [tab, fetchUsers, fetchSessions, fetchLogs])

  async function addUser() {
    if (!newUser.id || !newUser.name) return
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      setNewUser({ id: "", name: "", role: "user", department: "" })
      setShowAddUser(false)
      fetchUsers()
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("确定删除该用户？")) return
    await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": userId },
    })
    fetchUsers()
  }

  const tabs = [
    { id: "users" as AdminTab, label: "用户管理", icon: <Users className="h-4 w-4" /> },
    { id: "sessions" as AdminTab, label: "登录记录", icon: <LogIn className="h-4 w-4" /> },
    { id: "logs" as AdminTab, label: "操作记录", icon: <Activity className="h-4 w-4" /> },
  ]

  const totalPages = (total: number) => Math.ceil(total / 20)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">管理后台</h1>
            <p className="text-sm text-muted-foreground">用户管理 · 登录记录 · 操作审计</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">用户列表</h2>
              <Button size="sm" onClick={() => setShowAddUser(!showAddUser)}>
                <Plus className="mr-1 h-4 w-4" />
                新增用户
              </Button>
            </div>

            {showAddUser && (
              <Card className="p-4">
                <div className="grid grid-cols-4 gap-3">
                  <Input placeholder="用户ID" value={newUser.id} onChange={(e) => setNewUser({ ...newUser, id: e.target.value })} />
                  <Input placeholder="姓名" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                  <Input placeholder="部门" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddUser(false)}>取消</Button>
                  <Button size="sm" onClick={addUser}>保存</Button>
                </div>
              </Card>
            )}

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">ID</th>
                    <th className="px-3 py-2 text-left font-medium">姓名</th>
                    <th className="px-3 py-2 text-left font-medium">角色</th>
                    <th className="px-3 py-2 text-left font-medium">部门</th>
                    <th className="px-3 py-2 text-left font-medium">创建时间</th>
                    <th className="px-3 py-2 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{u.id}</td>
                      <td className="px-3 py-2">{u.name}</td>
                      <td className="px-3 py-2">
                        <Badge variant={u.role === "admin" ? "accent" : "secondary"}>{u.role === "admin" ? "管理员" : "用户"}</Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{u.department || "-"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {tab === "sessions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">登录记录</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">用户</th>
                    <th className="px-3 py-2 text-left font-medium">登录方式</th>
                    <th className="px-3 py-2 text-left font-medium">IP</th>
                    <th className="px-3 py-2 text-left font-medium">浏览器</th>
                    <th className="px-3 py-2 text-left font-medium">系统</th>
                    <th className="px-3 py-2 text-left font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.user_name || s.user_id}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">
                          {s.login_type === "wechat" ? "企微" : s.login_type === "password" ? "密码" : "游客"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{s.ip || "-"}</td>
                      <td className="px-3 py-2 text-xs">{s.browser || "-"}</td>
                      <td className="px-3 py-2 text-xs">{s.os || "-"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSessionPage((p) => Math.max(1, p - 1))} disabled={sessionPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">第 {sessionPage} / {totalPages(sessionTotal)} 页</span>
              <Button variant="ghost" size="sm" onClick={() => setSessionPage((p) => p + 1)} disabled={sessionPage >= totalPages(sessionTotal)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {tab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">操作记录</h2>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索工具、操作或用户..."
                  value={logKeyword}
                  onChange={(e) => setLogKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                  className="h-8 pl-7 text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">用户</th>
                    <th className="px-3 py-2 text-left font-medium">工具</th>
                    <th className="px-3 py-2 text-left font-medium">动作</th>
                    <th className="px-3 py-2 text-left font-medium">详情</th>
                    <th className="px-3 py-2 text-left font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {l.user_name || l.user_id}
                          {l.user_role === "admin" && <Badge variant="outline" className="text-[10px]">管理员</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-2">{l.tool_name}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary" className="text-xs">{l.action}</Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">{l.details || "-"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={logPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">第 {logPage} / {totalPages(logTotal)} 页</span>
              <Button variant="ghost" size="sm" onClick={() => setLogPage((p) => p + 1)} disabled={logPage >= totalPages(logTotal)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
