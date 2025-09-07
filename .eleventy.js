import dotenv from "dotenv"
dotenv.config()

export default function (eleventyConfig) {
  console.log(
    "SUPABASE_URL:",
    process.env.SUPABASE_URL ? "✅ задано" : "❌ пусто"
  )
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ задан" : "❌ пусто"
  )

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
