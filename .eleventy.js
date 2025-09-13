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
  eleventyConfig.ignores.add("./_data/profiles_cache.json")

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

  eleventyConfig.on("eleventy.before", async () => {
    const cachePath = "./_data/profiles_cache.json"
    let shouldUpdateCache = false

    try {
      const stats = fs.statSync(cachePath)
      const cacheAge = (Date.now() - stats.mtimeMs) / 1000 / 60
      if (cacheAge > 5) {
        shouldUpdateCache = true
      }
    } catch (err) {
      shouldUpdateCache = true
    }

    if (shouldUpdateCache) {
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
      try {
        fs.writeFileSync(cachePath, JSON.stringify(data, null, 2))
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
