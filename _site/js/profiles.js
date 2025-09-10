import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zftnzsbflzfhfyfnyqza.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdG56c2JmbHpmaGZ5Zm55cXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODQyMjQsImV4cCI6MjA3MjY2MDIyNH0.ZiNtVmNKFPsW7NPngNvRrDsRFwcPQw0aE6m8FwmCvZg"
const supabase = createClient(supabaseUrl, supabaseKey)

function debug(...args) {
  console.log("[profiles.js]", ...args)
}

async function fetchProfiles() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("id", { ascending: false })

    if (error) throw error
    debug("fetched profiles:", data.length)

    return data
  } catch (err) {
    console.error("[profiles.js] error", err)
    return []
  }
}

function normalizeString(str) {
  if (!str) return ""
  return str
    .toString()
    .normalize("NFKD")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, "-")
}

function renderProfiles(list) {
  const profileList = document.getElementById("profile-list")
  if (!profileList) return

  profileList.innerHTML = ""
  if (!list.length) {
    profileList.innerHTML = "<p>Профили не найдены.</p>"
    return
  }

  list.forEach((profile) => {
    const regionSlug = normalizeString(profile.city)
    const categorySlug = normalizeString(profile.category)

    const html = `
      <div class="profile-card" data-region="${regionSlug}" data-category="${categorySlug}">
        <img
          class="profile-card__image"
          width="300"
          height="200"
          src="https://res.cloudinary.com/dimallvw3/image/upload/w_300,h_200,c_fill,q_auto,f_webp/${
            profile.image_url?.replace(
              "https://res.cloudinary.com/dimallvw3/image/upload/",
              ""
            ) || "placeholder.webp"
          }"
          alt="Фото профиля ${profile.name || ""}"
          loading="lazy"
        />
        <div class="profile-card__description">
          <h3>${profile.name || "Без имени"}</h3>
          <p>${profile.city || "Регион не указан"}, ${
      profile.category || "Категория не указана"
    }</p>
          ${profile.description ? `<p>${profile.description}</p>` : ""}
          ${profile.age ? `<p>Возраст: ${profile.age}</p>` : ""}
          ${
            profile.email
              ? `<p>Email: <a href="mailto:${profile.email}">${profile.email}</a></p>`
              : ""
          }
          ${
            profile.phone
              ? `<p>Телефон: <a href="tel:${profile.phone}">${profile.phone}</a></p>`
              : ""
          }
          <a href="/profiles/${profile.id}/">Подробнее</a>
        </div>
      </div>
    `
    profileList.insertAdjacentHTML("beforeend", html)
  })
}

async function initProfiles() {
  const profiles = await fetchProfiles()
  window.allProfilesData = profiles

  document.dispatchEvent(new Event("profilesRendered"))
}

initProfiles()
