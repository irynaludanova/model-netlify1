import dotenv from "dotenv"
dotenv.config()

import allProfiles from "./_data/all-profiles.js"

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
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ задан"
      : null,
  })

eleventyConfig.addCollection("profiles", async function () {
  return await allProfiles()
})


  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("favicon.ico")

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    dataTemplateEngine: "liquid",
  }
}
