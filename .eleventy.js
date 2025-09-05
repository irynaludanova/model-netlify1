module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("favicon.ico")

  eleventyConfig.addCollection("profiles", function () {
    const profiles = require("./_data/static-profiles.js")()
    return profiles.map((profile) => ({
      data: { profile },
      url: `/profiles/${profile.id}/`,
    }))
  })

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
