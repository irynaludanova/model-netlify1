const fs = require("fs")
const path = require("path")

module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("profiles", function () {
    const staticDir = "./_data/static-profiles"
    const staticFiles = fs.existsSync(staticDir)
      ? fs.readdirSync(staticDir).filter((f) => f.endsWith(".json"))
      : []
    const staticProfiles = staticFiles.map((file) => {
      const profile = JSON.parse(fs.readFileSync(path.join(staticDir, file)))
      return {
        data: { profile },
        url: `/profiles/${profile.id || profile.name.toLowerCase()}/`,
      }
    })

    const submissionsDir = path.join(__dirname, "_data/form-submissions")
    const submissionFiles = fs.existsSync(submissionsDir)
      ? fs.readdirSync(submissionsDir).filter((f) => f.endsWith(".json"))
      : []
    const submissionProfiles = submissionFiles.map((file) => {
      const profile = JSON.parse(
        fs.readFileSync(path.join(submissionsDir, file))
      )
      return {
        data: { profile },
        url: `/profiles/${profile.id || profile.name.toLowerCase()}/`,
      }
    })

    return [...staticProfiles, ...submissionProfiles]
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
