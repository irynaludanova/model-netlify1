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
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) {
      console.error("Ошибка Supabase:", error.message)
    } else {
      profiles = data || []
      console.log("Загруженные профили:", JSON.stringify(profiles, null, 2))
    }
  } catch (err) {
    console.error("Ошибка загрузки профилей:", err.message)
  }

  eleventyConfig.addGlobalData("allProfiles", profiles)

  let debugCategories = null
  let debugRegions = null

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
          categories[slug] = {
            name: p.category,
            slug,
            profiles: [],
          }
        }
        categories[slug].profiles.push(p)
      }
    })
    const categoriesArray = Object.values(categories)
    debugCategories = categoriesArray
    console.log(
      "Созданная коллекция categories:",
      JSON.stringify(categoriesArray, null, 2)
    )
    return categoriesArray
  })

  eleventyConfig.addCollection("regions", () => {
    if (!profiles || !profiles.length) {
      console.log(
        "Профили отсутствуют или пусты, возвращается пустая коллекция regions"
      )
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
          regions[slug] = {
            name: p.city,
            slug,
            profiles: [],
          }
        }
        regions[slug].profiles.push(p)
      }
    })
    const regionsArray = Object.values(regions)
    debugRegions = regionsArray
    console.log(
      "Созданная коллекция regions:",
      JSON.stringify(regionsArray, null, 2)
    )
    return regionsArray
  })

  eleventyConfig.on("eleventy.after", async ({ collections }) => {
    console.log("Все коллекции:", Object.keys(collections || {}))
    console.log(
      "Коллекция categories после сборки:",
      JSON.stringify(collections?.categories || [], null, 2)
    )
    console.log(
      "Коллекция regions после сборки:",
      JSON.stringify(collections?.regions || [], null, 2)
    )
    console.log(
      "Debug categories:",
      JSON.stringify(debugCategories || [], null, 2)
    )
    console.log("Debug regions:", JSON.stringify(debugRegions || [], null, 2))
  })

  eleventyConfig.addGlobalData("env", {
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
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
