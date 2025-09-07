import fetch from "node-fetch"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function allProfiles() {
  const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&approved=eq.true&order=created_at.desc`

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
