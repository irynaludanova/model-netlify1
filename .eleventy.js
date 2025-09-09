import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import slugify from "slugify"

dotenv.config()

export default async function (eleventyConfig) {
  eleventyConfig.addFilter("slugify", (str) => {
    return slugify(str, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
      locale: "ru",
    })
  })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let profiles = []
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Ошибка Supabase:", error.message)
    } else {
      profiles = data || []

      profiles = profiles.map((profile) => ({
        ...profile,
        city: profile.city ? profile.city.trim() : "",
      }))
    }
  } catch (err) {
    console.error("Ошибка загрузки профилей:", err.message)
  }

  eleventyConfig.addGlobalData("allProfiles", profiles)

  eleventyConfig.addGlobalData("allRegions", () => {
    const regions = [
      ...new Set(profiles.map((p) => p.city).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, "ru"))
    console.log("Все регионы:", JSON.stringify(regions, null, 2))
    return regions
  })

  eleventyConfig.addGlobalData("allCategories", () => {
    const categories = [
      ...new Set(profiles.map((p) => p.category).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, "ru"))

    return categories
  })

  eleventyConfig.addCollection("categories", () => {
    if (!profiles || !profiles.length) {
      console.log(
        "Профили отсутствуют или пусты, возвращается пустая коллекция categories"
      )
      return []
    }
    const categories = {}
    profiles.forEach((p) => {
      if (p.category) {
        const slug = slugify(p.category, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
          locale: "ru",
        })
        if (!categories[slug]) {
          categories[slug] = { name: p.category, slug, profiles: [] }
        }
        categories[slug].profiles.push(p)
      }
    })
    const categoriesArray = Object.values(categories).sort((a, b) =>
      a.name.localeCompare(b.name, "ru")
    )
    return categoriesArray
  })

  eleventyConfig.addCollection("regions", () => {
    if (!profiles || !profiles.length) {
      return []
    }
    const regions = {}
    profiles.forEach((p) => {
      if (p.city) {
        const slug = slugify(p.city, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
          locale: "ru",
        })
        if (!regions[slug]) {
          regions[slug] = { name: p.city, slug, profiles: [] }
        }
        regions[slug].profiles.push(p)
      }
    })
    const regionsArray = Object.values(regions).sort((a, b) =>
      a.name.localeCompare(b.name, "ru")
    )

    return regionsArray
  })

  eleventyConfig.addCollection("profiles", () => {
    if (!profiles || !profiles.length) {
      return []
    }
    return profiles
  })

  eleventyConfig.addGlobalData("env", {
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
  })

  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("favicon.ico")
  eleventyConfig.addPassthroughCopy("_headers")

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["liquid", "html", "njk"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  }
}
