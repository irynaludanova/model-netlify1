const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" }
  }

  try {
    const data = JSON.parse(event.body)

    const id = data.name.toLowerCase().replace(/\s+/g, "-")

    const profile = {
      id,
      name: data.name,
      city: data.city,
      category: data.category,
      description: data.description,
      age: data.age,
      email: data.email,
      phone: data.phone || "",
      image: data.image || "/img/placeholder.png",
    }

    const submissionsDir = path.join(__dirname, "../../_data/form-submissions")
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true })
    }

    fs.writeFileSync(
      path.join(submissionsDir, `${id}.json`),
      JSON.stringify(profile, null, 2)
    )

    const buildHookURL = process.env.NETLIFY_BUILD_HOOK
    if (buildHookURL) {
      await fetch(buildHookURL, { method: "POST" })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Профиль успешно добавлен" }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: "Ошибка сервера" }
  }
}
