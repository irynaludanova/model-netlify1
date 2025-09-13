async function cloudinaryUpload(file) {
  const form = new FormData()
  form.append("file", file)
  form.append("upload_preset", "unsigned_profiles")
  const res = await fetch("https://api.cloudinary.com/v1_1/dimallvw3/upload", {
    method: "POST",
    body: form,
  })
  const data = await res.json()
  if (!res.ok)
    throw new Error("Cloudinary upload failed: " + JSON.stringify(data))
  return data.secure_url
}

function slugify(text) {
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
  return result || null
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#add-profile-form")

  if (!form) {
    console.error("[add-profile.js] Form not found")
    alert("Ошибка: форма не найдена")
    return
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const fd = new FormData(form)

    let image_url = "/img/placeholder.webp"
    const file = fd.get("image")

    if (file && file.size) {
      try {
        image_url = await cloudinaryUpload(file)
      } catch (err) {
        console.error("[add-profile.js] Cloudinary upload error:", err.message)
        alert("Ошибка загрузки изображения: " + err.message)
        return
      }
    }

    const name = fd.get("name")?.trim()

    if (!name) {
      console.error("[add-profile.js] Name is empty or invalid")
      alert("Имя обязательно для заполнения")
      return
    }

    const slug = slugify(name)
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

    try {
      const body = JSON.stringify(payload)
      const resp = await fetch("/.netlify/functions/add-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
      const result = await resp.json()

      if (!resp.ok) throw new Error(result.error || "Ошибка сервера")

      window.location.href = "/submit-profile"
    } catch (err) {
      console.error("[add-profile.js] Form submission error:", err.message)
      alert("Ошибка при отправке формы: " + err.message)
    }
  })
})
