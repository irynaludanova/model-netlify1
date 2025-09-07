import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

export default async function allProfiles() {
  const filePath = path.join(process.cwd(), "_data", "profiles.json")
  let localProfiles = []
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8")
    localProfiles = JSON.parse(raw)
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase не инициализирован — загружены только локальные профили"
    )
    return localProfiles
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  let { data: dbProfiles, error } = await supabase.from("profiles").select("*")

  if (error) {
    console.error("Ошибка получения профилей из Supabase:", error.message)
    dbProfiles = []
  }

  const combinedProfiles = [...localProfiles, ...dbProfiles]

  return combinedProfiles
}
