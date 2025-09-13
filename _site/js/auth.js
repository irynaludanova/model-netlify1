import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = window.SUPABASE_URL
const SUPABASE_KEY = window.SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback/`,
    },
  })
  if (error) console.error("Ошибка входа:", error.message)
}

export async function handleAuthRedirect() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSessionFromUrl({ storeSession: true })
    if (error) {
      console.error("Ошибка авторизации:", error.message)
      return
    }

    if (session) {
      console.log("Вошёл пользователь:", session.user)
      window.location.href = "/account/"
    } else {
      console.error("Пользователь не найден после редиректа")
    }
  } catch (err) {
    console.error("Ошибка в handleAuthRedirect:", err)
  }
}

export function onAuthChange(cb) {
  supabase.auth.onAuthStateChange((event, session) => cb(event, session))
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = "/"
}
