;(function () {
  function debug(...args) {
    console.log("[filters.js]", ...args)
  }

  function normalizeString(str) {
    if (str === undefined || str === null) return ""
    return String(str)
      .normalize("NFKD")
      .replace(/\u00A0/g, " ")
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, "-")
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      const profileList = document.getElementById("profile-list")
      const regionSelect = document.getElementById("region-select")
      const categorySelect = document.getElementById("category-select")

      if (!profileList) {
        debug("profile-list not found")
        return
      }
      if (!regionSelect || !categorySelect) {
        debug("selects not found")
        return
      }

      const nodes = profileList.querySelectorAll(".profile-card")
      debug("found profile cards:", nodes.length)

      const allProfiles = Array.from(nodes).map((profile) => ({
        city: normalizeString(
          profile.getAttribute("data-region") || profile.dataset.region
        ),
        category: normalizeString(
          profile.getAttribute("data-category") || profile.dataset.category
        ),
        innerHTML: profile.outerHTML,
      }))

      debug("unique cities:", [...new Set(allProfiles.map((p) => p.city))])
      debug("unique categories:", [
        ...new Set(allProfiles.map((p) => p.category)),
      ])
      debug(
        "region select options:",
        Array.from(regionSelect.options).map((o) => o.value)
      )

      function render(list) {
        profileList.innerHTML = ""
        if (!list.length) {
          profileList.innerHTML = "<p>Профили не найдены.</p>"
          return
        }
        list.forEach((p) =>
          profileList.insertAdjacentHTML("beforeend", p.innerHTML)
        )
      }

      function filterProfiles() {
        const region = normalizeString(regionSelect.value)
        const category = normalizeString(categorySelect.value)

        const filtered = allProfiles.filter((p) => {
          const matchRegion = region === "все" || p.city === region
          const matchCategory = category === "все" || p.category === category
          return matchRegion && matchCategory
        })

        debug(
          "filter -> region:",
          region,
          "category:",
          category,
          "result:",
          filtered.length
        )
        render(filtered)
      }

      regionSelect.addEventListener("change", filterProfiles)
      categorySelect.addEventListener("change", filterProfiles)

      filterProfiles()
    } catch (err) {
      console.error("[filters.js] error", err)
    }
  })
})()
