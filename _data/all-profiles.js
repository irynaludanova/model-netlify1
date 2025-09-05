const fs = require("fs")
const path = require("path")
const fetch = (...args) => import("node-fetch").then((m) => m.default(...args))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

module.exports = async function () {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      " SUPABASE env variables not found, using local fallback data."
    )

    const localFile = path.join(__dirname, "profiles.json")
    if (fs.existsSync(localFile)) {
      const raw = fs.readFileSync(localFile)
      const profiles = JSON.parse(raw)
      return profiles.map((p) => {
        const id =
          p.slug || (p.name ? p.name.toLowerCase().replace(/\s+/g, "-") : p.id)
        return {
          ...p,
          id,
          url: `/profiles/${id}/`,
        }
      })
    }
    return []
  }

  const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&approved=is.true&order=created_at.desc`

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      console.error("Supabase fetch failed:", res.status, await res.text())
      return []
    }

    const profiles = await res.json()

    return profiles.map((p) => {
      const id =
        p.slug || (p.name ? p.name.toLowerCase().replace(/\s+/g, "-") : p.id)
      return {
        ...p,
        id,
        url: `/profiles/${id}/`,
      }
    })
  } catch (err) {
    console.error("Supabase fetch error:", err)
    return []
  }
}
