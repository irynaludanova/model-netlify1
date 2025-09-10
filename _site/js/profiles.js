import { createClient } from "@supabase/supabase-js"

document.addEventListener("DOMContentLoaded", async function () {
  const supabaseUrl = "https://zftnzsbflzfhfyfnyqza.supabase.co"
  const supabaseKey = "YOUR_SUPABASE_KEY"
  const supabase = createClient(supabaseUrl, supabaseKey)

  const profileList = document.getElementById("profile-list")
  if (!profileList) return console.log("[profiles.js] profile-list not found")

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("id", { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) {
      profileList.innerHTML = "<p>Профили не найдены.</p>"
      return
    }

    window.allProfilesData = data

    window.renderProfileCard = function (profile) {
      return `
      <div class="profile-card"
           data-region="${
             profile.city?.toLowerCase().replace(/\s+/g, "-") || ""
           }"
           data-category="${profile.category?.toLowerCase() || ""}">
        <img class="profile-card__image"
             width="300" height="200"
             src="https://res.cloudinary.com/dimallvw3/image/upload/w_300,h_200,c_fill,q_auto,f_webp/${
               profile.image_url?.replace(
                 "https://res.cloudinary.com/dimallvw3/image/upload/",
                 ""
               ) || "placeholder.webp"
             }"
             alt="Фото профиля ${profile.name || ""}"
             loading="lazy">
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
      </div>`
    }

    document.dispatchEvent(new Event("profilesRendered"))
  } catch (err) {
    console.error("[profiles.js] error", err)
    profileList.innerHTML = "<p>Ошибка загрузки профилей.</p>"
  }
})
