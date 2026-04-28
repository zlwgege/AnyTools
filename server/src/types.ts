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
