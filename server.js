import express from "express"
import fs from "fs"
import path from "path"

const app = express()
app.use(express.json())

const profilesFile = path.join(process.cwd(), "_data", "profiles.json")

app.post("/submit-profile", (req, res) => {
  const profile = req.body

  let profiles = []
  if (fs.existsSync(profilesFile)) {
    profiles = JSON.parse(fs.readFileSync(profilesFile, "utf-8"))
  }

  profiles.push(profile)
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2))
  res.status(200).json({ message: "Profile saved" })
})

app.listen(3000, () => console.log("Server running on port 3000"))
