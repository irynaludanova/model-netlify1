import fs from "fs"
import path from "path"

export default function () {
  const filePath = path.join(process.cwd(), "_data", "profiles.json")
  if (fs.existsSync(filePath)) {
    const profiles = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    return profiles.map((p, index) => ({
      ...p,
      id: index + 1,
      url: `/profiles/${index + 1}/`,
    }))
  }
  return []
}
