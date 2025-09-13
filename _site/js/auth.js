import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = window.SUPABASE_URL
const SUPABASE_KEY = window.SUPABASE_KEY
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://models-connect.netlify.app/auth/callback",
    },
  })
  if (error) console.error("Ошибка входа:", error.message)
}

export async function handleAuthRedirect() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) {
      console.error("Ошибка авторизации:", error.message)
      return
    }

    if (session) {
      console.log("Вошёл пользователь:", session.user)
      window.location.href = "/account/"
    } else {
      supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          console.log("Вошёл пользователь:", session.user)
          window.location.href = "/account/"
        }
      })
    }
  } catch (err) {
    console.error("Ошибка в handleAuthRedirect:", err)
  }
}

export function onAuthChange(cb) {
  supabase.auth.onAuthStateChange((event, session) => cb(event, session))
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = "/"
}
