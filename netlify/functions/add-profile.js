const fs = require("fs")
const path = require("path")

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Метод не поддерживается" }),
    }
  }

  try {
    const data = JSON.parse(event.body)

    const submissionsDir = path.join(__dirname, "../../form-submissions")

    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true })
    }

    const filePath = path.join(submissionsDir, `${Date.now()}.json`)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Профиль сохранен!", profile: data }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Ошибка сохранения",
        details: err.message,
      }),
    }
  }
}
