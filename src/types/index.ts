import type { LucideIcon } from "lucide-react"

export interface Tool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: ToolCategory
  tags: string[]
  path: string
  isNew?: boolean
  isHot?: boolean
}

export type ToolCategory =
  | "development"
  | "conversion"
  | "text"
  | "image"
  | "security"
  | "network"

export interface CategoryInfo {
  id: ToolCategory
  name: string
  icon: LucideIcon
}

export interface User {
  id: string
  name: string
  avatar?: string
  department?: string
  role?: "admin" | "user" | "guest"
}
