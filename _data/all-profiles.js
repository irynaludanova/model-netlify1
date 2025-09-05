const fetch = (...args) => import("node-fetch").then((m) => m.default(...args))
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

module.exports = async function () {
  const NETLIFY_DEPLOY_HOOK = process.env.NETLIFY_DEPLOY_HOOK
  if (NETLIFY_DEPLOY_HOOK) {
    try {
      await fetch(NETLIFY_DEPLOY_HOOK, { method: "POST" })
    } catch (err) {
      console.error("Failed to call Netlify build hook", err)
    }
  }
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
