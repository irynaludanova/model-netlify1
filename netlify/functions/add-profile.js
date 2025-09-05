const fetch = (...args) => import("node-fetch").then((m) => m.default(...args))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function slugify(s = "") {
  return s
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch (err) {
    return { statusCode: 400, body: "Invalid JSON" }
  }

  const name = body.name || ""
  const profile = {
    slug: body.slug || slugify(name),
    name: name,
    city: body.city || null,
    category: body.category || null,
    description: body.description || null,
    age: body.age ? Number(body.age) : null,
    email: body.email || null,
    phone: body.phone || null,
    image_url: body.image_url || null,
    created_at: new Date().toISOString(),
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(profile),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Supabase insert failed",
          detail: data,
        }),
      }
    }

    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 500, body: "Server error: " + err.message }
  }
}
