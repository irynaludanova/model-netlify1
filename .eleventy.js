import dotenv from "dotenv"
import slugify from "slugify"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"

dotenv.config()

export default async function (eleventyConfig) {
  // 🔹 Фильтр для slugify
  eleventyConfig.addFilter("slugify", (str) => {
    return slugify(str || "", {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
  })

  // 🔹 Загружаем JSON из _data
  let regionsData = []
  try {
    const rawRegions = fs.readFileSync("./_data/regions.json", "utf-8")
    regionsData = JSON.parse(rawRegions)
  } catch (e) {
    console.error("Ошибка при загрузке regions.json:", e)
  }

  let categoriesData = []
  try {
    const rawCategories = fs.readFileSync("./_data/categories.json", "utf-8")
    categoriesData = JSON.parse(rawCategories)
  } catch (e) {
    console.error("Ошибка при загрузке categories.json:", e)
  }

  eleventyConfig.addGlobalData("regionsData", regionsData)
  eleventyConfig.addGlobalData("categoriesData", categoriesData)

  // 🔹 Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  // 🔹 Загружаем профили
  let profilesData = []
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    profilesData = data
    console.log(`Fetched ${profilesData.length} profiles from Supabase ✅`)
  } catch (err) {
    console.error("Ошибка при загрузке профилей из Supabase:", err)
    profilesData = []
  }

  // 🔹 Коллекции
  eleventyConfig.addCollection("profiles", () => profilesData)

  eleventyConfig.addCollection("regions", () => {
    const regionsMap = {}
    profilesData.forEach((profile) => {
      const cityName = profile.city || "Не указан"
      const citySlug = slugify(cityName, { lower: true, strict: true })

      if (!regionsMap[citySlug]) {
        regionsMap[citySlug] = {
          name: cityName,
          slug: citySlug,
          profiles: [],
        }
      }
      regionsMap[citySlug].profiles.push(profile)
    })
    return Object.values(regionsMap)
  })

  eleventyConfig.addCollection("categories", () => {
    const categoriesMap = {}
    profilesData.forEach((profile) => {
      const catName = profile.category || "Без категории"
      const catSlug = slugify(catName, { lower: true, strict: true })

      if (!categoriesMap[catSlug]) {
        categoriesMap[catSlug] = {
          name: catName,
          slug: catSlug,
          profiles: [],
        }
      }
      categoriesMap[catSlug].profiles.push(profile)
    })
    return Object.values(categoriesMap)
  })

  // 🔹 Пробрасываем env в глобальные данные
  eleventyConfig.addGlobalData("site", {
    url: process.env.SITE_URL || "http://localhost:8080",
    supabase_url: process.env.SUPABASE_URL,
    supabase_anon_key: process.env.SUPABASE_ANON_KEY,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    netlify_build_hook: process.env.NETLIFY_BUILD_HOOK,
  })

  // 🔹 Статические файлы
  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("js")
  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("favicon.ico")

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_includes",
    },
    templateFormats: ["liquid", "md", "njk", "html"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  }
}
