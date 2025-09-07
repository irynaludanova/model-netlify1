import dotenv from "dotenv"
dotenv.config() // Подгрузка .env

import allProfiles from "./_data/all-profiles.js"

export default function (eleventyConfig) {
  // Лог переменных окружения
  console.log(
    "SUPABASE_URL:",
    process.env.SUPABASE_URL ? "✅ задано" : "❌ пусто"
  )
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ задан" : "❌ пусто"
  )

  // Глобальные данные для отладки
  eleventyConfig.addGlobalData("env", {
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ задан"
      : null,
  })

  // Коллекция профилей (берем напрямую allProfiles)
  eleventyConfig.addCollection("profiles", async function () {
    const profiles = await allProfiles()
    return profiles.map((p) => ({
      data: { profile: p },
      url: p.url || null,
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
