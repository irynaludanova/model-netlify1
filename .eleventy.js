const fetch = require("node-fetch")
const dotenv = require("dotenv")
dotenv.config() // ← подтянет .env локально

module.exports = function (eleventyConfig) {
  // Отладка переменных
  console.log(
    "SUPABASE_URL:",
    process.env.SUPABASE_URL ? "✅ задано" : "❌ пусто"
  )
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ задан" : "❌ пусто"
  )

  // Глобальные данные для отладки (можно удалить потом)
  eleventyConfig.addGlobalData("env", {
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ задан"
      : null,
  })

  // Коллекция профилей
  eleventyConfig.addCollection("profiles", async function () {
    const allProfiles = await require("./_data/all-profiles.js")()
    return allProfiles.map((p) => ({
      data: { profile: p },
      url: p.url,
    }))
  })

  // Статичные файлы
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
