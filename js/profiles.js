document.addEventListener("DOMContentLoaded", async () => {
  if (!window.SUPABASE_URL || !window.SUPABASE_KEY) {
    console.error("SUPABASE_URL или SUPABASE_KEY не определены!")
    return
  }

  if (!window.CLOUDINARY_CLOUD_NAME) {
    console.error("CLOUDINARY_CLOUD_NAME не определено!")
    return
  }

  const supabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_KEY
  )

  const profileList = document.getElementById("profile-list")
  const regionSelect = document.getElementById("region-select")
  const categorySelect = document.getElementById("category-select")
  const paginationContainer = document.getElementById("pagination-container")

  window.allProfilesData = []
  const pageSize = 4
  let currentPage = 1

  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  async function loadProfiles() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      window.allProfilesData = data

      populateFilters()
      renderPage(1)
    } catch (err) {
      console.error("Ошибка загрузки профилей:", err)
      if (profileList)
        profileList.innerHTML =
          "<p>Ошибка загрузки профилей. Проверьте Supabase.</p>"
    }
  }

  function populateFilters() {
    if (!window.allProfilesData || !regionSelect || !categorySelect) return

    const regions = [
      ...new Set(window.allProfilesData.map((p) => p.city).filter(Boolean)),
    ]
    const categories = [
      ...new Set(window.allProfilesData.map((p) => p.category).filter(Boolean)),
    ]

    regionSelect.innerHTML = '<option value="все">Все</option>'
    categorySelect.innerHTML = '<option value="все">Все</option>'

    regions.forEach((r) => regionSelect.appendChild(new Option(r, r)))
    categories.forEach((c) => categorySelect.appendChild(new Option(c, c)))
  }

  function filterProfiles() {
    const selectedRegion = regionSelect?.value || "все"
    const selectedCategory = categorySelect?.value || "все"

    return window.allProfilesData.filter(
      (p) =>
        (selectedRegion === "все" || p.city === selectedRegion) &&
        (selectedCategory === "все" || p.category === selectedCategory)
    )
  }

  function renderPage(page = 1) {
    const filtered = filterProfiles()
    const totalPages = Math.ceil(filtered.length / pageSize)
    currentPage = Math.min(Math.max(page, 1), totalPages)

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const pageData = filtered.slice(start, end)

    if (!profileList) return

    if (!pageData.length) {
      profileList.innerHTML = "<p>Нет профилей для отображения.</p>"
    } else {
      profileList.innerHTML = pageData
        .map((p) => {
          let imgSrc = p.image_url || "/img/placeholder.webp"
          let imgSrcSet = `${imgSrc} 300w, ${imgSrc} 600w, ${imgSrc} 1200w`

          if (imgSrc.includes("res.cloudinary.com")) {
            const path = imgSrc.split("/upload/").pop()
            imgSrc = `https://res.cloudinary.com/${window.CLOUDINARY_CLOUD_NAME}/image/upload/w_600,h_400,c_fill,q_auto,f_webp/${path}`
            imgSrcSet = `
              https://res.cloudinary.com/${window.CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_200,c_fill,q_auto,f_webp/${path} 300w,
              https://res.cloudinary.com/${window.CLOUDINARY_CLOUD_NAME}/image/upload/w_600,h_400,c_fill,q_auto,f_webp/${path} 600w,
              https://res.cloudinary.com/${window.CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_800,c_fill,q_auto,f_webp/${path} 1200w
            `
          }

          return `
            <article class="profile-card" data-region="${
              p.city
            }" data-category="${p.category}">
              <img class="profile-card__image" width="300" height="200"
                src="${imgSrc}"
                srcset="${imgSrcSet}"
                sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
                alt="Фото профиля ${p.name || "Без имени"}" loading="lazy"/>
              <div class="profile-card__description">
                <h3>${p.name || "Без имени"}</h3>
                <p>${p.city || "Регион не указан"}, ${
            p.category || "Категория не указана"
          }</p>
          <a href="/profiles/${p.name}/" aria-label="Подробнее о ${
            p.name
          }">Подробнее</a>


              </div>
            </article>
          `
        })
        .join("")
    }

    renderPagination(totalPages)
  }

  function renderPagination(totalPages) {
    if (!paginationContainer) return
    if (totalPages <= 1) {
      paginationContainer.innerHTML = ""
      return
    }

    let html = '<nav class="pagination" aria-label="Навигация по страницам">'
    if (currentPage > 1) html += `<a href="#" class="pagination-btn prev">←</a>`
    for (let i = 1; i <= totalPages; i++) {
      html += `<a href="#" class="pagination-btn ${
        i === currentPage ? "active" : ""
      }">${i}</a>`
    }
    if (currentPage < totalPages)
      html += `<a href="#" class="pagination-btn next">→</a>`
    html += "</nav>"

    paginationContainer.innerHTML = html
    paginationContainer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        if (link.classList.contains("prev")) renderPage(currentPage - 1)
        else if (link.classList.contains("next")) renderPage(currentPage + 1)
        else renderPage(Number(link.textContent))
      })
    })
  }

  regionSelect?.addEventListener("change", () => renderPage(1))
  categorySelect?.addEventListener("change", () => renderPage(1))

  await loadProfiles()
})
