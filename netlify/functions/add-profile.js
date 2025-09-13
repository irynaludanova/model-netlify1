import fetch from "node-fetch"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const NETLIFY_BUILD_HOOK = process.env.NETLIFY_BUILD_HOOK

function slugify(text) {
  if (!text || typeof text !== "string" || text.trim() === "") {
    console.error("[add-profile-function] Invalid input for slugify:", text)
    return null
  }
  const result = text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return result || null
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch (err) {
    console.error("[add-profile-function] JSON parse error:", err.message)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON", details: err.message }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  }

  const name = body.name?.trim()
  let slug = body.slug?.trim()

  if (!slug && name) {
    slug = slugify(name)
  }

  if (!slug) {
    console.warn(
      "[add-profile-function] No slug provided, relying on Supabase trigger"
    )
  }

  const profileData = {
    name: name || null,
    slug: slug || null,
    city: body.city || null,
    category: body.category || null,
    description: body.description || null,
    age: body.age || null,
    email: body.email || null,
    phone: body.phone || null,
    image_url: body.image_url || null,
  }

  if (!profileData.name) {
    console.error("[add-profile-function] Missing name:", profileData)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name is required" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  }

  if (slug) {
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?slug=eq.${slug}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const existing = await checkRes.json()
    if (existing.length > 0) {
      console.error("[add-profile-function] Slug already exists:", slug)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Slug already exists" }),
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    }
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(profileData),
  })

  const text = await res.text()
  let result
  try {
    result = JSON.parse(text)
   } catch (err) {
    console.error("[add-profile-function] Supabase response parse error:", text)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Invalid JSON from Supabase", raw: text }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  }

  if (!res.ok) {
    console.error("[add-profile-function] Supabase error:", result)
    return {
      statusCode: res.status,
      body: JSON.stringify({ error: "Ошибка сохранения", details: result }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  }

  if (NETLIFY_BUILD_HOOK) {
    await fetch(NETLIFY_BUILD_HOOK, { method: "POST" }).catch((err) =>
      console.error("[add-profile-function] Build hook error:", err)
    )
  }

  const savedSlug =
    result[0]?.slug || slug || slugify(name || `temp-${Date.now()}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Профиль сохранён",
      profile: result[0],
      slug: savedSlug,
    }),
    headers: { "Access-Control-Allow-Origin": "*" },
  }
}
