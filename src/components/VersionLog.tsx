import { Link } from "react-router-dom"
import { Tag } from "lucide-react"

export const CURRENT_VERSION = "1.0.2"

export function VersionLogButton() {
  return (
    <Link
      to="/version-log"
      target="_blank"
      className="inline-flex items-center rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Tag className="mr-1 h-3 w-3" />
      v{CURRENT_VERSION}
    </Link>
  )
}
