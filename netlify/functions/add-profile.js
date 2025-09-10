import fetch from "node-fetch"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      }
    }

    const body = JSON.parse(event.body)

    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation", // Возвращаем созданную запись
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: "Ошибка сохранения",
          details: errorText,
        }),
      }
    }

    const profile = await res.json() // Получаем данные созданного профиля
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Профиль сохранён",
        profile: profile[0],
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
