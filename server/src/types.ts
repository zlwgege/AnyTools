export interface DbUser {
  id: string
  name: string
  role: "user" | "admin"
  department: string
  created_at: string
}

export interface DbUsageLog {
  id: number
  user_id: string
  tool_id: string
  tool_name: string
  action: string
  details: string | null
  created_at: string
}

export interface LogQuery {
  userId?: string
  toolId?: string
  keyword?: string
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

export interface StatsQuery {
  userId?: string
  period: "day" | "week" | "month"
}

export interface DbLoginSession {
  id: number
  user_id: string
  login_type: "wechat" | "password" | "guest"
  ip: string | null
  user_agent: string | null
  browser: string | null
  os: string | null
  created_at: string
}
