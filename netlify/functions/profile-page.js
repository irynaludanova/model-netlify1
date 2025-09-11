import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export async function handler(event) {
  try {
    const { id } = event.queryStringParameters
    if (!id) return { statusCode: 400, body: "Profile ID is required" }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !profile) return { statusCode: 404, body: "Profile not found" }

    const html = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <title>${profile.name} — ${
      profile.category
    } | ModelConnect Miami</title>
        <meta name="description" content="Профиль ${profile.name} из ${
      profile.city
    }. Категория: ${profile.category}.">
        ${
          profile.image_url
            ? `<meta property="og:image" content="${profile.image_url}" />`
            : ""
        }
      </head>
      <body>
        <h1>${profile.name}</h1>
        <div class="profile-card__description">
        <p><strong>Категория:</strong> ${profile.category}</p>
        <p><strong>Город:</strong> ${profile.city}</p>
        ${profile.age ? `<p><strong>Возраст:</strong> ${profile.age}</p>` : ""}
        ${profile.description ? `<p>${profile.description}</p>` : ""}
        ${
          profile.email
            ? `<p>Email: <a href="mailto:${profile.email}">${profile.email}</a></p>`
            : ""
        }
        ${
          profile.phone
            ? `<p>Телефон: <a href="tel:${profile.phone}">${profile.phone}</a></p>`
            : ""
        }
        </div>

        ${
          profile.image_url
            ? `<img src="${profile.image_url}" alt="Фото ${profile.name}" class="profile-card__image"/>`
            : ""
        }
        <p><a href="/">← Вернуться на главную</a></p>
      </body>
      </html>
    `

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
