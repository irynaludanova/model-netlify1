// _data/all-profiles.js
const fs = require("fs")
const path = require("path")
const fetch = (...args) => import("node-fetch").then((m) => m.default(...args))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

module.exports = async function () {
  const staticDir = path.join(__dirname, "static-profiles")
  const staticFiles = fs.existsSync(staticDir)
    ? fs.readdirSync(staticDir).filter((f) => f.endsWith(".json"))
    : []
  const staticProfiles = staticFiles.map((file) =>
    JSON.parse(fs.readFileSync(path.join(staticDir, file)))
  )

  let supabaseProfiles = []
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: "application/json",
        },
      }
    )
    if (res.ok) {
      supabaseProfiles = await res.json()
    } else {
      console.error("Supabase fetch failed", await res.text())
    }
  } catch (err) {
    console.error("Supabase fetch error", err)
  }

  const all = [...staticProfiles, ...supabaseProfiles].map((p) => {
    const id =
      p.id || p.slug || (p.name && p.name.toLowerCase().replace(/\s+/g, "-"))
    return { ...p, id, url: `/profiles/${id}/` }
  })

  return all
}
