(function () {
  let selectedLotId = null;
  let activeFilter = "all";

  function getPolygonCenter(polygon) {
    const points = polygon.split(" ").map((pair) => pair.split(",").map(Number));
    const sum = points.reduce(
      (acc, point) => {
        acc.x += point[0];
        acc.y += point[1];
        return acc;
      },
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  }

  function createSvgElement(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function renderLotCard(lot) {
    const card = document.querySelector("[data-lot-card]");
    if (!card) return;

    if (!lot) {
      card.innerHTML = `
        <p class="eyebrow">Выбранный участок</p>
        <h3>Нажмите на участок</h3>
        <p class="muted">Карточка покажет площадь, стоимость, статус и кнопку заявки.</p>
      `;
      return;
    }

    const statusLabel = window.MAYSKI_UI.getLotStatusLabel(lot.status);

    card.innerHTML = `
      <p class="eyebrow">Выбранный участок</p>
      <h3>Участок №${lot.number}</h3>
      <span class="lot-card__status lot-card__status--${lot.status}">${statusLabel}</span>
      <div class="lot-card__data">
        <div><span>Площадь</span><strong>${window.MAYSKI_UI.formatArea(lot.area)}</strong></div>
        <div><span>Цена</span><strong>${window.MAYSKI_UI.formatPrice(lot.price)}</strong></div>
        <div><span>ID</span><strong>${lot.id}</strong></div>
      </div>
      <p class="muted">Можно запросить КП на участок, дом под ключ или строительство по индивидуальному проекту.</p>
      <div class="lot-card__actions">
        <a class="btn btn--primary" href="#request" data-fill-lot="${lot.id}">Получить КП по участку</a>
        <a class="btn btn--glass" href="tel:${window.MAYSKI_DATA.contacts.phoneRaw}">Позвонить</a>
      </div>
    `;
  }

  function setSelectedLot(lotId) {
    selectedLotId = lotId;
    const lot = window.MAYSKI_DATA.lots.find((item) => item.id === lotId);

    document.querySelectorAll("[data-lot-id]").forEach((shape) => {
      shape.classList.toggle("is-selected", shape.dataset.lotId === lotId);
    });

    renderLotCard(lot);
    window.dispatchEvent(new CustomEvent("mayski:lot-selected", { detail: { lot } }));
  }

  function applyFilter(status) {
    activeFilter = status;

    document.querySelectorAll("[data-status-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.statusFilter === status);
    });

    document.querySelectorAll("[data-lot-id]").forEach((shape) => {
      const isVisible = status === "all" || shape.dataset.status === status;
      shape.classList.toggle("is-dimmed", !isVisible);
    });
  }

  function showTooltip(event, lot) {
    const tooltip = document.querySelector("[data-map-tooltip]");
    if (!tooltip) return;

    tooltip.hidden = false;
    tooltip.innerHTML = `
      <strong>Участок №${lot.number}</strong>
      ${window.MAYSKI_UI.formatArea(lot.area)} · ${window.MAYSKI_UI.formatPrice(lot.price)}<br />
      ${window.MAYSKI_UI.getLotStatusLabel(lot.status)}
    `;

    const offset = 14;
    tooltip.style.left = `${event.clientX + offset}px`;
    tooltip.style.top = `${event.clientY + offset}px`;
  }

  function hideTooltip() {
    const tooltip = document.querySelector("[data-map-tooltip]");
    if (!tooltip) return;
    tooltip.hidden = true;
  }

  function renderLots() {
    const overlay = document.querySelector("[data-lot-overlay]");
    if (!overlay) return;

    overlay.innerHTML = "";

    const fragment = document.createDocumentFragment();

    window.MAYSKI_DATA.lots.forEach((lot) => {
      const polygon = createSvgElement("polygon");
      polygon.setAttribute("points", lot.polygon);
      polygon.setAttribute("tabindex", "0");
      polygon.setAttribute("role", "button");
      polygon.setAttribute("aria-label", `Участок №${lot.number}, ${window.MAYSKI_UI.formatArea(lot.area)}, ${window.MAYSKI_UI.getLotStatusLabel(lot.status)}`);
      polygon.classList.add("lot-shape", `lot-shape--${lot.status}`);
      polygon.dataset.lotId = lot.id;
      polygon.dataset.status = lot.status;

      polygon.addEventListener("click", () => setSelectedLot(lot.id));
      polygon.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelectedLot(lot.id);
        }
      });
      polygon.addEventListener("mousemove", (event) => showTooltip(event, lot));
      polygon.addEventListener("mouseleave", hideTooltip);

      fragment.appendChild(polygon);
    });

    window.MAYSKI_DATA.lots.forEach((lot) => {
      const center = getPolygonCenter(lot.polygon);
      const label = createSvgElement("text");
      label.setAttribute("x", center.x);
      label.setAttribute("y", center.y);
      label.classList.add("lot-label");
      label.textContent = lot.number;
      fragment.appendChild(label);
    });

    overlay.appendChild(fragment);
    applyFilter(activeFilter);
  }

  function initMapFilters() {
    document.querySelectorAll("[data-status-filter]").forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.dataset.statusFilter));
    });
  }

  function initCardActions() {
    document.addEventListener("click", (event) => {
      const fillButton = event.target.closest("[data-fill-lot]");
      if (!fillButton) return;

      const lot = window.MAYSKI_DATA.lots.find((item) => item.id === fillButton.dataset.fillLot);
      if (!lot) return;

      window.dispatchEvent(new CustomEvent("mayski:lot-selected", { detail: { lot } }));
    });
  }

  function initMap() {
    renderLots();
    initMapFilters();
    initCardActions();
  }

  window.MAYSKI_MAP = {
    initMap,
    setSelectedLot,
  };
})();
