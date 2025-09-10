const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    }

    const body = JSON.parse(event.body)

    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    })

    const result = await res.json()

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "Ошибка сохранения", details: result }),
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Профиль сохранён",
        profile: result[0],
      }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  }
}
