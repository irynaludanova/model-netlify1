const fs = require("fs")
const path = require("path")

module.exports = () => {
  const dir = path.join(__dirname, "static-profiles")
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))

  return files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file))
    return JSON.parse(content)
  })
}
