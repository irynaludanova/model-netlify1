import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL или ключ не заданы!")
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function () {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Ошибка Supabase:", error)
    return []
  }

  return data.map((p) => ({
    id: p.id || p.slug || p.name,
    name: p.name || "Без имени",
    city: p.city || "",
    category: p.category || "",
    description: p.description || "",
    image_url: p.image_url || "/img/placeholder.png",
    url: `/profiles/${p.id || p.slug || p.name}/`,
    region: p.city || "",
  }))
}
