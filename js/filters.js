export function initFilters(profilesData) {
  const profileList = document.getElementById("profile-list")
  const categorySelect = document.getElementById("category-select")
  const regionSelect = document.getElementById("region-select")
  const slugify = window.slugify

  if (!profileList || !categorySelect || !regionSelect) return

  function renderProfiles(profiles) {
    if (!profiles || profiles.length === 0) {
      profileList.innerHTML = "<p>Нет профилей для отображения.</p>"
      return
    }

    profileList.innerHTML = profiles
      .map((p) => {
        const category = p.category || "Категория не указана"
        const region = p.city || "Регион не указан"
        const name = p.name || "Без имени"

        const slug = slugify(name, { lower: true, strict: true })

        const image = p.image_url
          ? `https://res.cloudinary.com/dimallvw3/image/upload/w_300,h_200,c_fill,q_auto,f_webp/${p.image_url.replace(
              "https://res.cloudinary.com/dimallvw3/image/upload/",
              ""
            )}`
          : "/img/placeholder.webp"

        return `
          <div class="profile-card" data-category="${p.category}" data-region="${p.city}">
            <img class="profile-card__image" src="${image}" width="300" height="200" alt="Фото профиля ${name}" loading="lazy">
            <div class="profile-card__description">
              <h3>${name}</h3>
              <p>${region}, ${category}</p>
              <a href="/profiles/${slug}/">Подробнее</a>
            </div>
          </div>
        `
      })
      .join("")
  }

  function populateFilters(profiles) {
    const regions = [
      ...new Set(profiles.map((p) => p.city).filter(Boolean)),
    ].sort()
    const categories = [
      ...new Set(profiles.map((p) => p.category).filter(Boolean)),
    ].sort()

    while (regionSelect.options.length > 1) regionSelect.remove(1)
    while (categorySelect.options.length > 1) categorySelect.remove(1)

    regions.forEach((r) => {
      const option = document.createElement("option")
      option.value = r
      option.textContent = r
      regionSelect.appendChild(option)
    })

    categories.forEach((c) => {
      const option = document.createElement("option")
      option.value = c
      option.textContent = c
      categorySelect.appendChild(option)
    })
  }

  function filterProfiles() {
    const selectedCategory = categorySelect.value
    const selectedRegion = regionSelect.value

    const filtered = profilesData.filter((p) => {
      const matchCategory =
        selectedCategory === "все" || p.category === selectedCategory
      const matchRegion = selectedRegion === "все" || p.city === selectedRegion
      return matchCategory && matchRegion
    })

    renderProfiles(filtered)
  }

  populateFilters(profilesData)
  renderProfiles(profilesData)

  categorySelect.addEventListener("change", filterProfiles)
  regionSelect.addEventListener("change", filterProfiles)
}
