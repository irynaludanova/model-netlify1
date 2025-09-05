const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")

module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("profiles", async function () {
    const localProfiles = await require("./_data/all-profiles.js")()

    const localMapped = localProfiles.map((p) => ({
      data: { profile: p },
      url: p.url,
    }))

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    let remoteMapped = []
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      })

      if (!res.ok) {
        console.error(" Ошибка Supabase:", res.status, res.statusText)
      } else {
        const rows = await res.json()

        remoteMapped = rows.map((profile) => ({
          data: { profile },
          url: `/profiles/${profile.id || profile.name.toLowerCase()}/`,
        }))
      }
    } catch (err) {
      console.error(" Ошибка при запросе Supabase:", err)
    }

    return [...localMapped, ...remoteMapped]
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
