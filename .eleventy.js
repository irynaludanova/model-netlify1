const staticProfilesData = require("./_data/static-profiles")
const formProfilesData = require("./_data/form-submissions")

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img")

  eleventyConfig.addCollection("allProfiles", function (collectionApi) {
    const staticProfiles = staticProfilesData() || []
    const formProfiles = formProfilesData() || []

    const allProfiles = [...staticProfiles, ...formProfiles]

    console.log("Найдено статических профилей:", staticProfiles.length)
    console.log("Найдено профилей из формы:", formProfiles.length)
    console.log("Все профили:", allProfiles)

    return allProfiles
  })

  return {
    dir: {
      input: "./",
      output: "_site",
    },
  }
}
