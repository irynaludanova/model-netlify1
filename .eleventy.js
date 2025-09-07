import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

export default async function (eleventyConfig) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let profiles = []
  try {
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) {
      console.error("Ошибка Supabase:", error.message)
    } else {
      profiles = data
    }
  } catch (err) {
    console.error("Ошибка загрузки профилей:", err.message)
  }

  eleventyConfig.addGlobalData("allProfiles", profiles)

  eleventyConfig.addGlobalData("env", {
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
  })

  eleventyConfig.addCollection("regions", () => {
    if (!profiles.length) return []
    const regions = {}
    profiles.forEach((p) => {
      if (p.region) {
        const slug = p.region.toLowerCase().replace(/\s+/g, "-")
        if (!regions[slug]) {
          regions[slug] = {
            name: p.region,
            slug,
            profiles: [],
          }
        }
        regions[slug].profiles.push(p)
      }
    })
    return Object.values(regions)
  })

  eleventyConfig.addCollection("categories", () => {
    if (!profiles.length) return []
    const categories = {}
    profiles.forEach((p) => {
      if (p.category) {
        const slug = p.category.toLowerCase().replace(/\s+/g, "-")
        if (!categories[slug]) {
          categories[slug] = {
            name: p.category,
            slug,
            profiles: [],
          }
        }
        categories[slug].profiles.push(p)
      }
    })
    return Object.values(categories)
  })

  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("favicon.ico")

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
