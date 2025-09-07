import dotenv from "dotenv"
dotenv.config()
import fetch from "node-fetch"
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function allProfiles() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase URL или ключ не заданы!")
    return []
  }

  const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`

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
    console.log("Supabase returned profiles:", profiles.length)

    return profiles.map((profile) => {
      const idBase = profile.slug || profile.name || profile.id || ""
      const id = idBase.toString().toLowerCase().replace(/\s+/g, "-")

      return {
        ...profile,
        id,
        url: id ? `/profiles/${id}/` : null,
        name: profile.name || "",
        description: profile.description || "",
        region: profile.region || "",
        category: profile.category || "",
      }
    })
  } catch (err) {
    console.error("Supabase fetch error:", err)
    return []
  }
}
