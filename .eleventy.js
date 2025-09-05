const fs = require("fs")
const path = require("path")

module.exports = function (eleventyConfig) {
  // Создаём коллекцию profiles из static + form submissions
  eleventyConfig.addCollection("profiles", function () {
    // 1. Static profiles
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

    // 2. Form submissions
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

    // 3. Объединяем
    return [...staticProfiles, ...submissionProfiles]
  })

  // Копируем статические файлы
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
