const staticProfilesData = require("./_data/static-profiles")
const formProfilesData = require("./_data/form-submissions")

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css/style.css": "style.css" })
  eleventyConfig.addPassthroughCopy("img")

  eleventyConfig.on("beforeBuild", () => {
    console.log("Проверка: Копирование css/style.css и img...")
  })
  eleventyConfig.on("afterBuild", () => {
    console.log("Проверка: Копирование завершено.")
  })

  eleventyConfig.addFilter("assetUrl", function (url) {
    const pathPrefix = eleventyConfig.pathPrefix || "/"
    const fullUrl = `${pathPrefix}${url.replace(/^\//, "")}`
    console.log(`assetUrl: ${url} -> ${fullUrl}`)
    return fullUrl
  })

  eleventyConfig.addCollection("allProfiles", function (collectionApi) {
    const staticProfiles = staticProfilesData() || []
    const formProfiles = formProfilesData() || []
    const allProfiles = [...staticProfiles, ...formProfiles]
    eleventyConfig.addPassthroughCopy({ "/favicon.ico": "favicon.ico" })
    const ids = allProfiles.map((profile) => profile.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      console.warn("Обнаружены дублирующиеся ID:", duplicates)
    }

    console.log("Найдено статических профилей:", staticProfiles.length)
    console.log("Найдено профилей из формы:", formProfiles.length)
    return allProfiles
  })

  return {
    dir: {
      input: "./",
      output: "_site",
    },
    pathPrefix: "/",
  }
}
