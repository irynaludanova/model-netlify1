import dotenv from "dotenv"
dotenv.config()

export default function (eleventyConfig) {
  eleventyConfig.addGlobalData("env", {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_ANON_KEY,
  })
}
