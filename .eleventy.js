import dotenv from "dotenv"
import slugify from "slugify"
import fs from "fs"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

function loadProfilesCache() {
  const cachePath = "./_data/profiles_cache.json"
  let profilesData = []
  try {
    const rawData = fs.readFileSync(cachePath, "utf-8")
    profilesData = JSON.parse(rawData)
    console.log(
      `[eleventy] Loaded ${profilesData.length} profiles from cache ✅`
    )
  } catch (err) {
    console.warn(
      "[eleventy] Profiles cache not found, proceeding with empty array.",
      err
    )
    profilesData = []
  }
  return profilesData
}

export default function (eleventyConfig) {
  // Игнорировать profiles_cache.json в режиме наблюдения
  eleventyConfig.ignores.add("./_data/profiles_cache.json")
  console.log(
    "[eleventy] Ignoring changes to ./ _data/profiles_cache.json to prevent infinite loop"
  )

  eleventyConfig.addFilter("slugify", (str) => {
    return slugify(str || "", {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
  })

  let regionsData = []
  try {
    regionsData = JSON.parse(fs.readFileSync("./_data/regions.json", "utf-8"))
  } catch (e) {
    console.error("[eleventy] Error loading regions.json:", e)
  }

  let categoriesData = []
  try {
    categoriesData = JSON.parse(
      fs.readFileSync("./_data/categories.json", "utf-8")
    )
  } catch (e) {
    console.error("[eleventy] Error loading categories.json:", e)
  }

  eleventyConfig.addGlobalData("regionsData", regionsData)
  eleventyConfig.addGlobalData("categoriesData", categoriesData)

  const profilesData = loadProfilesCache()

  eleventyConfig.addCollection("profiles", () => {
    return profilesData.map((profile) => {
      const generatedSlug = slugify(profile.name || `unknown-${profile.id}`, {
        lower: true,
        strict: true,
      })
      console.log(
        "[eleventy] Processing profile:",
        profile.name,
        "Slug:",
        profile.slug || generatedSlug
      )
      return {
        ...profile,
        slug: profile.slug || generatedSlug,
      }
    })
  })

  eleventyConfig.addCollection("regions", () => {
    const regionsMap = {}
    profilesData.forEach((profile) => {
      const cityName = profile.city || "Не указан"
      const citySlug = slugify(cityName, { lower: true, strict: true })
      if (!regionsMap[citySlug]) {
        regionsMap[citySlug] = { name: cityName, slug: citySlug, profiles: [] }
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
        categoriesMap[catSlug] = { name: catName, slug: catSlug, profiles: [] }
      }
      categoriesMap[catSlug].profiles.push(profile)
    })
    return Object.values(categoriesMap)
  })

  eleventyConfig.addGlobalData("site", {
    url: "https://models-connect.netlify.app/" || "http://localhost:8080",
    supabase_url: process.env.SUPABASE_URL,
    supabase_anon_key: process.env.SUPABASE_ANON_KEY,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "default",
    cloudinary_upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "default",
    netlify_build_hook: process.env.NETLIFY_BUILD_HOOK,
  })

  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("js")
  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("favicon.ico")

  // Обновление кэша только если файл устарел или отсутствует
  eleventyConfig.on("eleventy.before", async () => {
    const cachePath = "./_data/profiles_cache.json"
    let shouldUpdateCache = false

    // Проверяем, существует ли кэш и его возраст
    try {
      const stats = fs.statSync(cachePath)
      const cacheAge = (Date.now() - stats.mtimeMs) / 1000 / 60 // Возраст в минутах
      if (cacheAge > 5) {
        // Обновлять кэш, если старше 5 минут
        shouldUpdateCache = true
        console.log("[eleventy] Cache is older than 5 minutes, updating...")
      }
    } catch (err) {
      shouldUpdateCache = true // Если кэш отсутствует, обновляем
      console.log("[eleventy] Cache file not found, will create new cache")
    }

    if (shouldUpdateCache) {
      console.log("[eleventy] Fetching profiles from Supabase for cache...")
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      )
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) {
        console.error(
          "[eleventy] Error fetching profiles from Supabase:",
          error
        )
        return
      }
      console.log("[eleventy] Fetched profiles:", data.length)
      try {
        fs.writeFileSync(cachePath, JSON.stringify(data, null, 2))
        console.log("[eleventy] Updated cache with", data.length, "profiles")
      } catch (err) {
        console.error("[eleventy] Error writing profiles_cache.json:", err)
      }
    } else {
      console.log("[eleventy] Cache is up-to-date, skipping Supabase fetch")
    }
  })

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
