import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { ArrowLeft, User, Mail, Lock, Camera, Save, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import type { User as UserType } from "@/types"

const AVATAR_OPTIONS = [
  "😎", "🤓", "👨‍💻", "👩‍💻", "🧑‍🔬", "🎨", "🔥", "⚡", "🌟", "🎯",
  "🚀", "💎", "🐱", "🐶", "🦊", "🐼", "🦁", "🐸", "🦄", "🐙",
]

interface ProfilePageProps {
  user: UserType
  onUpdateProfile: (updates: { name?: string; email?: string; avatar?: string }) => Promise<boolean>
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
}

export default function ProfilePage({ user, onUpdateProfile, onChangePassword }: ProfilePageProps) {
  const navigate = useNavigate()
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || "")
  const [saving, setSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Password change
  const [oldPwd, setOldPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdSaved, setPwdSaved] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    setProfileSaved(false)
    const ok = await onUpdateProfile({
      name: name !== user.name ? name : undefined,
      email: email !== (user.email || "") ? email : undefined,
      avatar: selectedAvatar !== (user.avatar || "") ? selectedAvatar : undefined,
    })
    setSaving(false)
    if (ok) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
  }

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) {
      alert("两次输入的密码不一致")
      return
    }
    if (newPwd.length < 4) {
      alert("新密码长度至少4位")
      return
    }
    setPwdSaving(true)
    setPwdSaved(false)
    const ok = await onChangePassword(oldPwd, newPwd)
    setPwdSaving(false)
    if (ok) {
      setPwdSaved(true)
      setOldPwd("")
      setNewPwd("")
      setConfirmPwd("")
      setTimeout(() => setPwdSaved(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">个人设置</h1>
            <p className="text-sm text-muted-foreground">管理你的帐号信息</p>
          </div>
        </div>

        {/* Avatar & Basic Info */}
        <Card className="p-5 mb-4">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">基本信息</h2>

          {/* Avatar selection */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium">
              <Camera className="mr-1 inline h-3.5 w-3.5" />
              头像
            </label>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl ring-2 ring-primary/20">
                {selectedAvatar || <Avatar fallback={name || "U"} size="lg" />}
              </div>
              <span className="text-xs text-muted-foreground">选择一个表情作为头像</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all hover:scale-110 ${
                    selectedAvatar === emoji
                      ? "bg-primary/20 ring-2 ring-primary shadow-sm"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium">
              <User className="mr-1 inline h-3.5 w-3.5" />
              昵称
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入昵称"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium">
              <Mail className="mr-1 inline h-3.5 w-3.5" />
              邮箱 <span className="text-muted-foreground">（绑定后可用于重置密码）</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
            {saving ? (
              "保存中..."
            ) : profileSaved ? (
              <>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="mr-1 h-4 w-4" />
                保存修改
              </>
            )}
          </Button>
        </Card>

        {/* Account Info (readonly) */}
        <Card className="p-5 mb-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">帐号信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">用户ID</span>
              <code className="rounded bg-secondary px-2 py-0.5 text-xs font-mono">{user.id}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">角色</span>
              <span className="text-xs">{user.role === "admin" ? "管理员" : user.role === "guest" ? "游客" : "普通用户"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">部门</span>
              <span className="text-xs">{user.department || "未设置"}</span>
            </div>
            {user.wechat_id && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">企微ID</span>
                <span className="text-xs">{user.wechat_id}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Change Password */}
        {user.role !== "guest" && (
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              <Lock className="mr-1 inline h-3.5 w-3.5" />
              修改密码
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">旧密码</label>
                <Input
                  type="password"
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  placeholder="输入旧密码"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">新密码</label>
                <Input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="至少4位新密码"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">确认新密码</label>
                <Input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="再次输入新密码"
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleChangePassword}
                disabled={pwdSaving || !oldPwd || !newPwd || !confirmPwd}
                className="w-full"
              >
                {pwdSaving ? (
                  "修改中..."
                ) : pwdSaved ? (
                  <>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    密码已修改
                  </>
                ) : (
                  "修改密码"
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
