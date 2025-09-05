const fs = require("fs")
const path = require("path")

module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("profiles", async function () {
    const allProfiles = await require("./_data/all-profiles.js")()

    return allProfiles.map((p) => ({ data: { profile: p }, url: p.url }))
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
