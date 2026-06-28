document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelector(".hero__stats div:first-child strong");
  const statsLabel = document.querySelector(".hero__stats div:first-child span");
  const mapIntro = document.querySelector("#masterplan .section-head--dark > p");

  if (stats) stats.textContent = "40";
  if (statsLabel) statsLabel.textContent = "участков на генплане";
  if (mapIntro) {
    mapIntro.textContent = "Карта основана на актуальном SVG-контуре мастер-плана. Нажмите на участок, чтобы увидеть площадь, статус и отправить запрос.";
  }

  window.MAYSKI_UI.initHeader();
  window.MAYSKI_UI.renderHouses();
  window.MAYSKI_MAP.initMap();
  window.MAYSKI_FORM.initRequestForm();
});
