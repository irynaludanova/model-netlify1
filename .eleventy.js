import dotenv from "dotenv"
import slugify from "slugify"
import fs from "fs"

dotenv.config()

function loadProfilesCache() {
  const cachePath = "./_data/profiles_cache.json"
  let profilesData = []
  try {
    const rawData = fs.readFileSync(cachePath, "utf-8")
    profilesData = JSON.parse(rawData)
    console.log(`Loaded ${profilesData.length} profiles from cache ✅`)
  } catch (err) {
    console.warn("Profiles cache not found, proceeding with empty array.", err)
    profilesData = []
  }
  return profilesData
}

export default function (eleventyConfig) {
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
    console.error("Ошибка при загрузке regions.json:", e)
  }

  let categoriesData = []
  try {
    categoriesData = JSON.parse(
      fs.readFileSync("./_data/categories.json", "utf-8")
    )
  } catch (e) {
    console.error("Ошибка при загрузке categories.json:", e)
  }

  eleventyConfig.addGlobalData("regionsData", regionsData)
  eleventyConfig.addGlobalData("categoriesData", categoriesData)

  const profilesData = loadProfilesCache()

  eleventyConfig.addCollection("profiles", () => {
    return profilesData.map((profile) => {
      return {
        ...profile,
        slug: slugify(profile.name || profile.id, {
          lower: true,
          strict: true,
        }),
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
    url: process.env.SITE_URL || "http://localhost:8080",
    supabase_url: process.env.SUPABASE_URL,
    supabase_anon_key: process.env.SUPABASE_ANON_KEY,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    netlify_build_hook: process.env.NETLIFY_BUILD_HOOK,
  })

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
