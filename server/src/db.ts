import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, "..", "data.db")

const db = new Database(DB_PATH)
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
    department TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_logs_user ON usage_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_logs_tool ON usage_logs(tool_id);
  CREATE INDEX IF NOT EXISTS idx_logs_time ON usage_logs(created_at);

  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    PRIMARY KEY (user_id, tool_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bin_labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    count INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_bin_labels_user ON bin_labels(user_id);
  CREATE INDEX IF NOT EXISTS idx_bin_labels_time ON bin_labels(created_at);
`);

// Seed users if empty
const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }
if (userCount.c === 0) {
  const insertUser = db.prepare("INSERT INTO users (id, name, role, department) VALUES (?, ?, ?, ?)")
  insertUser.run("user-001", "张三", "user", "技术部")
  insertUser.run("user-002", "李四", "admin", "基础架构部")

  // Seed sample logs
  const insertLog = db.prepare(
    "INSERT INTO usage_logs (user_id, tool_id, tool_name, action, details, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  )

  const tools = [
    ["json-formatter", "JSON 格式化"],
    ["base64", "Base64 编解码"],
    ["regex-tester", "正则测试"],
    ["timestamp", "时间戳转换"],
    ["text-diff", "文本对比"],
    ["password-generator", "密码生成器"],
    ["hash-calculator", "Hash 计算"],
    ["image-compress", "图片压缩"],
    ["qr-generator", "二维码生成"],
    ["jwt-parser", "JWT 解析"],
    ["url-codec", "URL 编解码"],
    ["color-converter", "颜色转换"],
    ["ip-lookup", "IP 查询"],
    ["http-client", "HTTP 请求"],
  ]

  const actions = ["open", "execute", "execute", "execute", "open"]
  const now = Date.now()

  const seedMany = db.transaction(() => {
    for (let day = 0; day < 30; day++) {
      const count = Math.floor(Math.random() * 5) + 1
      for (let i = 0; i < count; i++) {
        const userId = Math.random() > 0.4 ? "user-001" : "user-002"
        const tool = tools[Math.floor(Math.random() * tools.length)]
        const action = actions[Math.floor(Math.random() * actions.length)]
        const ts = new Date(now - day * 86400000 - Math.random() * 86400000)
        const dateStr = ts.toISOString().replace("T", " ").substring(0, 19)
        insertLog.run(userId, tool[0], tool[1], action, null, dateStr)
      }
    }
  })
  seedMany()
}

export default db
