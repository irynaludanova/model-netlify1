import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = window.SUPABASE_URL
const SUPABASE_ANON_KEY = window.SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function signInWithGoogle() {
  console.log("SIGN CLICKED")
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) console.error("Sign in error", error.message)
}

export function onAuthChange(cb) {
  supabase.auth.onAuthStateChange((event, session) => {
    cb(event, session)
  })
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
