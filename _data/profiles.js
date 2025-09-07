const fetchAllProfiles = require("./all-profiles")

module.exports = async function () {
  try {
    const allProfiles = await fetchAllProfiles()
    return allProfiles
  } catch (err) {
    console.error("Ошибка загрузки профилей:", err)
    return []
  }
}
