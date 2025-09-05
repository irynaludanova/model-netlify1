const fs = require("fs")
const path = require("path")

module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("profiles", function () {
    const profilesDir = "./_data/static-profiles"
    const files = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".json"))

    return files.map((file) => {
      const profile = JSON.parse(fs.readFileSync(path.join(profilesDir, file)))
      return {
        data: { profile },
        url: `/profiles/${profile.id}/`,
      }
    })
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
