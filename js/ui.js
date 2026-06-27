(function () {
  function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
      return "по запросу";
    }

    return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
  }

  function formatArea(value) {
    if (value === null || value === undefined || value === "") {
      return "площадь уточняется";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return String(value);
    }

    if (number >= 100) {
      const sotka = number / 100;
      return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(number)} м² / ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(sotka)} сот.`;
    }

    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(number) + " сот.";
  }

  function getLotStatusLabel(status) {
    return window.MAYSKI_DATA.statusLabels[status] || status;
  }

  function showToast(message) {
    let toast = document.querySelector("[data-toast]");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.dataset.toast = "";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function initHeader() {
    const header = document.querySelector("[data-header]");

    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function renderHouses() {
    const grid = document.querySelector("[data-houses-grid]");
    if (!grid) return;

    grid.innerHTML = window.MAYSKI_DATA.houses
      .map(
        (house) => `
          <article class="house-card">
            <div class="house-card__image">
              <img src="${house.image}" alt="${house.name}" loading="lazy" />
            </div>
            <div class="house-card__body">
              <div>
                <p class="eyebrow">${house.id}</p>
                <h3>${house.name}</h3>
              </div>
              <div class="house-card__meta">
                <span>${house.area} м²</span>
                <span>${house.rooms}</span>
              </div>
              <p>${house.description}</p>
              <a class="btn btn--ghost" href="#request" data-house-request="${house.id}">Узнать стоимость</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  window.MAYSKI_UI = {
    formatArea,
    formatPrice,
    getLotStatusLabel,
    initHeader,
    renderHouses,
    showToast,
  };
})();
