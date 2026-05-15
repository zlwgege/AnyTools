import { Router } from "express"
import dns from "dns"
import { exec } from "child_process"
import { promisify } from "util"

const router = Router()
const execAsync = promisify(exec)
const dnsResolve = promisify(dns.resolve)

// IP Lookup - uses ip-api.com (free, no key needed)
router.post("/ip", async (req, res) => {
  try {
    const { ip } = req.body as { ip?: string }
    const target = ip || ""
    const url = `http://ip-api.com/json/${target}?lang=zh-CN&fields=status,message,country,regionName,city,isp,org,as,query,lat,lon,timezone`
    const resp = await fetch(url)
    const data = await resp.json()
    if (data.status === "fail") {
      return res.status(400).json({ error: data.message || "Query failed" })
    }
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// DNS Lookup
router.post("/dns", async (req, res) => {
  try {
    const { domain, type } = req.body as { domain: string; type?: string }
    if (!domain) return res.status(400).json({ error: "domain is required" })

    const rrtype: string = type || "A"
    const records = await new Promise<string[] | object[]>((resolve, reject) => {
      dns.resolve(domain, rrtype, (err, addresses) => {
        if (err) reject(err)
        else resolve(addresses as string[] | object[])
      })
    })
    res.json({ domain, type: rrtype, records })
  } catch (e: unknown) {
    const err = e as { code?: string }
    res.status(400).json({ error: err.code || String(e) })
  }
})

// Ping
router.post("/ping", async (req, res) => {
  try {
    const { host, count } = req.body as { host: string; count?: number }
    if (!host) return res.status(400).json({ error: "host is required" })

    const n = Math.min(count || 4, 10)
    const isWin = process.platform === "win32"
    const cmd = isWin ? `ping -n ${n} ${host}` : `ping -c ${n} ${host}`

    const { stdout } = await execAsync(cmd, { timeout: 30000 })
    res.json({ host, output: stdout, count: n })
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    res.status(400).json({ error: "Ping failed", output: err.stdout || err.stderr || String(e) })
  }
})

// HTTP Proxy
router.post("/http", async (req, res) => {
  try {
    const { url, method, headers, body } = req.body as {
      url: string; method?: string; headers?: Record<string, string>; body?: string
    }
    if (!url) return res.status(400).json({ error: "url is required" })

    const start = Date.now()
    const fetchOpts: RequestInit = {
      method: method || "GET",
      headers: headers || {},
    }
    if (body && ["POST", "PUT", "PATCH"].includes((method || "GET").toUpperCase())) {
      fetchOpts.body = body
    }

    const resp = await fetch(url, fetchOpts)
    const elapsed = Date.now() - start
    const respHeaders: Record<string, string> = {}
    resp.headers.forEach((v, k) => { respHeaders[k] = v })

    let respBody: string
    const ct = resp.headers.get("content-type") || ""
    if (ct.includes("image") || ct.includes("octet-stream")) {
      respBody = `[Binary data, ${resp.headers.get("content-length") || "unknown"} bytes]`
    } else {
      respBody = await resp.text()
      if (respBody.length > 50000) respBody = respBody.substring(0, 50000) + "\n...(truncated)"
    }

    res.json({
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
      body: respBody,
      elapsed,
    })
  } catch (e) {
    res.status(400).json({ error: String(e) })
  }
})

export default router
