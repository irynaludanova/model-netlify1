async function cloudinaryUpload(file) {
  console.log(
    "[add-profile.js] Starting Cloudinary upload for file:",
    file?.name || "no file"
  )
  const form = new FormData()
  form.append("file", file)
  form.append("upload_preset", "unsigned_profiles")
  const res = await fetch("https://api.cloudinary.com/v1_1/dimallvw3/upload", {
    method: "POST",
    body: form,
  })
  const data = await res.json()
  console.log("[add-profile.js] Cloudinary response:", data)
  if (!res.ok)
    throw new Error("Cloudinary upload failed: " + JSON.stringify(data))
  return data.secure_url
}

function slugify(text) {
  console.log("[add-profile.js] Input to slugify:", text)
  if (!text || typeof text !== "string" || text.trim() === "") {
    console.error("[add-profile.js] Invalid input for slugify:", text)
    return null
  }
  const result = text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  console.log("[add-profile.js] Generated slug:", result)
  return result || null
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#add-profile-form")
  console.log("[add-profile.js] Form initialized:", !!form)

  if (!form) {
    console.error("[add-profile.js] Form not found")
    alert("Ошибка: форма не найдена")
    return
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    console.log("[add-profile.js] Form submitted")
    const fd = new FormData(form)

    console.log("[add-profile.js] Form data:", Object.fromEntries(fd))

    let image_url = "/img/placeholder.webp"
    const file = fd.get("image")
    console.log("[add-profile.js] Image file:", file?.name || "no file")
    if (file && file.size) {
      try {
        image_url = await cloudinaryUpload(file)
        console.log("[add-profile.js] Image uploaded, URL:", image_url)
      } catch (err) {
        console.error("[add-profile.js] Cloudinary upload error:", err.message)
        alert("Ошибка загрузки изображения: " + err.message)
        return
      }
    }

    const name = fd.get("name")?.trim()
    console.log("[add-profile.js] Name from form:", name)
    if (!name) {
      console.error("[add-profile.js] Name is empty or invalid")
      alert("Имя обязательно для заполнения")
      return
    }

    const slug = slugify(name)
    console.log("[add-profile.js] Generated slug for redirect:", slug)
    if (!slug) {
      console.error("[add-profile.js] Slug generation failed for name:", name)
      alert("Ошибка: невозможно создать slug для имени")
      return
    }

    const payload = {
      name,
      slug,
      city: fd.get("city") || null,
      category: fd.get("category") || null,
      description: fd.get("description") || null,
      age: parseInt(fd.get("age")) || null,
      email: fd.get("email") || null,
      phone: fd.get("phone") || null,
      image_url,
    }
    console.log("[add-profile.js] Payload to send:", payload)

    try {
      const body = JSON.stringify(payload)
      console.log("[add-profile.js] JSON payload:", body)
      const resp = await fetch("/.netlify/functions/add-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
      console.log("[add-profile.js] Fetch response status:", resp.status)
      const result = await resp.json()
      console.log("[add-profile.js] Fetch response data:", result)
      if (!resp.ok) throw new Error(result.error || "Ошибка сервера")

      alert(
        `Профиль добавлен! Страница /profiles/${
          result.slug || slug
        }/ будет доступна через 1-2 минуты после пересборки сайта.`
      )
      console.log("[add-profile.js] Redirecting to home")
      window.location.href = "/"
    } catch (err) {
      console.error("[add-profile.js] Form submission error:", err.message)
      alert("Ошибка при отправке формы: " + err.message)
    }
  })
})
