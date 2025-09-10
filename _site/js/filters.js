;(function () {
  const PAGE_SIZE = 4

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

  function createOption(value, text) {
    const opt = document.createElement("option")
    opt.value = normalizeString(value)
    opt.textContent = text
    return opt
  }

  document.addEventListener("profilesRendered", function () {
    const profileList = document.getElementById("profile-list")
    const regionSelect = document.getElementById("region-select")
    const categorySelect = document.getElementById("category-select")
    const paginationContainer = document.getElementById("pagination-container")

    if (!profileList || !regionSelect || !categorySelect) return

    const allProfiles = window.allProfilesData.map((p) => ({
      ...p,
      regionSlug: normalizeString(p.city),
      categorySlug: normalizeString(p.category),
    }))

    const regions = [...new Set(allProfiles.map((p) => p.city).filter(Boolean))]
    const categories = [
      ...new Set(allProfiles.map((p) => p.category).filter(Boolean)),
    ]

    regionSelect.innerHTML = ""
    regionSelect.appendChild(createOption("все", "Все регионы"))
    regions.forEach((r) => regionSelect.appendChild(createOption(r, r)))

    categorySelect.innerHTML = ""
    categorySelect.appendChild(createOption("все", "Все категории"))
    categories.forEach((c) => categorySelect.appendChild(createOption(c, c)))

    let currentPage = 1

    function getFilteredProfiles() {
      const region = normalizeString(regionSelect.value)
      const category = normalizeString(categorySelect.value)
      return allProfiles.filter(
        (p) =>
          (region === "все" || p.regionSlug === region) &&
          (category === "все" || p.categorySlug === category)
      )
    }

    function renderPage(page = 1) {
      const filtered = getFilteredProfiles()
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
      if (page < 1) page = 1
      if (page > totalPages) page = totalPages
      currentPage = page

      const start = (currentPage - 1) * PAGE_SIZE
      const end = start + PAGE_SIZE
      const pageProfiles = filtered.slice(start, end)

      profileList.innerHTML = ""
      if (!pageProfiles.length) {
        profileList.innerHTML = "<p>Профили не найдены.</p>"
        paginationContainer.innerHTML = ""
        return
      }

      pageProfiles.forEach((profile) => {
        const html = `
          <div class="profile-card" data-region="${
            profile.regionSlug
          }" data-category="${profile.categorySlug}">
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
              <a href="/profiles/${profile.id}/">Подробнее</a>
            </div>
          </div>
        `
        profileList.insertAdjacentHTML("beforeend", html)
      })

      renderPagination(totalPages)
    }

    function renderPagination(totalPages) {
      paginationContainer.innerHTML = ""
      if (totalPages <= 1) return

      if (currentPage > 1) {
        const prev = document.createElement("a")
        prev.href = "#"
        prev.textContent = "← Назад"
        prev.addEventListener("click", (e) => {
          e.preventDefault()
          renderPage(currentPage - 1)
        })
        paginationContainer.appendChild(prev)
      }

      for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("a")
        pageLink.href = "#"
        pageLink.textContent = i
        if (i === currentPage) pageLink.classList.add("active")
        pageLink.addEventListener("click", (e) => {
          e.preventDefault()
          renderPage(i)
        })
        paginationContainer.appendChild(pageLink)
      }

      if (currentPage < totalPages) {
        const next = document.createElement("a")
        next.href = "#"
        next.textContent = "Вперёд →"
        next.addEventListener("click", (e) => {
          e.preventDefault()
          renderPage(currentPage + 1)
        })
        paginationContainer.appendChild(next)
      }
    }

    regionSelect.addEventListener("change", () => renderPage(1))
    categorySelect.addEventListener("change", () => renderPage(1))

    renderPage(1)
  })
})()
