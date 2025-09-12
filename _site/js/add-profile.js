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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#add-profile-form")
  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const fd = new FormData(form)
    let image_url = "/img/placeholder.webp"
    const file = fd.get("image")
    if (file && file.size) {
      try {
        image_url = await cloudinaryUpload(file)
      } catch (err) {
        alert("Ошибка загрузки изображения: " + err.message)
        return
      }
    }

    const payload = {
      name: fd.get("name").trim(),
      city: fd.get("city"),
      category: fd.get("category"),
      description: fd.get("description"),
      age: parseInt(fd.get("age")),
      email: fd.get("email"),
      phone: fd.get("phone") || null,
      image_url,
    }

    try {
      const resp = await fetch("/.netlify/functions/add-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await resp.json()
      if (!resp.ok) throw new Error(result.error || "Ошибка сервера")

      window.location.href = `/profiles/${result.profile.id}/`
    } catch (err) {
      alert("Ошибка при отправке профиля: " + err.message)
    }
  })
})
