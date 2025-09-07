const { createClient } = require("@supabase/supabase-js")

// 👇 ВАЖНО: именно так, с exports.handler
exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Метод не поддерживается" }),
    }
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const data = JSON.parse(event.body)

    const { error } = await supabase.from("profiles").insert([data])

    if (error) {
      console.error("❌ Ошибка добавления профиля:", error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    }
  } catch (err) {
    console.error("❌ Ошибка сервера:", err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
