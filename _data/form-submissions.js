const fs = require("fs")
const path = require("path")

module.exports = () => {
  const formDir = path.join(__dirname, "form-submissions")
  return fs
    .readdirSync(formDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      try {
        const filePath = path.join(formDir, file)
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
        if (
          data.date &&
          typeof data.date === "string" &&
          !data.date.includes("T")
        ) {
          const [day, month, yearTime] = data.date.split(".")
          const [year, time] = yearTime.split(", ")
          data.date = new Date(
            `${year}-${month}-${day}T${time}:00.000Z`
          ).toISOString()
        }
        data.id = data.id || data.name.toLowerCase().replace(/\s+/g, "-")
        return data
      } catch (err) {
        console.error(`Ошибка обработки файла ${file}:`, err.message)
        return null
      }
    })
    .filter((item) => item !== null)
}
