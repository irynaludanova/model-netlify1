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
    if (!url) return "/img/placeholder.png"
    const pathPrefix = eleventyConfig.pathPrefix || "/"
    const fullUrl = `${pathPrefix}${url.replace(/^\//, "")}`
    console.log(`assetUrl: ${url} -> ${fullUrl}`)
    return fullUrl
  })

  eleventyConfig.addFilter("uniq", function (array) {
    const seen = new Set()
    return array.filter((item) => {
      const key = item.id || JSON.stringify(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })

  eleventyConfig.addFilter("safe", function (value) {
    return value || ""
  })

  eleventyConfig.addCollection("allProfiles", function (collectionApi) {
    const staticProfiles = staticProfilesData() || []
    const formProfiles = formProfilesData() || []
    const allProfiles = [...staticProfiles, ...formProfiles].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )

    const uniqueProfiles = eleventyConfig.getFilter("uniq")(allProfiles)

    const ids = uniqueProfiles.map((profile) => profile.id).filter((id) => id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      console.warn("Обнаружены дублирующиеся ID:", duplicates)
    }

    console.log("Найдено статических профилей:", staticProfiles.length)
    console.log("Найдено профилей из формы:", formProfiles.length)
    console.log(
      "Все уникальные профили:",
      JSON.stringify(uniqueProfiles, null, 2)
    )
    return uniqueProfiles
  })

  return {
    dir: {
      input: "./",
      output: "_site",
    },
    pathPrefix: "/",
  }
}
