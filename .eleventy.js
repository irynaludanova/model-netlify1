import dotenv from "dotenv"
import slugify from "slugify"
import fs from "fs"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

export default async function (eleventyConfig) {
  eleventyConfig.addFilter("slugify", (str) => {
    return slugify(str, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
  })
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL)
  console.log(
    "SUPABASE_KEY:",
    process.env.SUPABASE_ANON_KEY ? "OK" : "NOT FOUND"
  )

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

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
  }

  eleventyConfig.addCollection("profiles", () => profilesData)

  eleventyConfig.addCollection("allRegions", () => {
    const data = fs.readFileSync("./_data/regions.json", "utf-8")
    return JSON.parse(data)
  })

  eleventyConfig.addCollection("allCategories", () => {
    const data = fs.readFileSync("./_data/categories.json", "utf-8")
    return JSON.parse(data)
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
