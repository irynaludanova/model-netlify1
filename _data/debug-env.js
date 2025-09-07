module.exports = () => {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || "❌ пусто",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ задано"
      : "❌ пусто",
  }
}
