;(function () {
  const GA_MEASUREMENT_ID = "G-4CXZPMW012"

  const script = document.createElement("script")
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  document.head.appendChild(script)

  script.onload = () => {
    window.dataLayer = window.dataLayer || []
    function gtag() {
      dataLayer.push(arguments)
    }
    window.gtag = gtag
    gtag("js", new Date())
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true })
  }
})()
