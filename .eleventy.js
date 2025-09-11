import dotenv from "dotenv"
import slugify from "slugify"
import fs from "fs"

dotenv.config()

export default async function (eleventyConfig) {
  eleventyConfig.addFilter("slugify", (str) => {
    return slugify(str, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    })
  })

  eleventyConfig.addCollection("allRegions", () => {
    const data = fs.readFileSync("./_data/regions.json", "utf-8")
    return JSON.parse(data)
  })

  eleventyConfig.addCollection("allCategories", () => {
    const data = fs.readFileSync("./_data/categories.json", "utf-8")
    return JSON.parse(data)
  })

  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("js")
  eleventyConfig.addPassthroughCopy("img")
  eleventyConfig.addPassthroughCopy("favicon.ico")

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_includes",
    },
    templateFormats: ["liquid", "md", "njk", "html"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  }
}
