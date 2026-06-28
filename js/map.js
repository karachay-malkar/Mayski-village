(function () {
  let selectedLotId = null;
  let activeFilter = "all";
  let plots = [];

  function createSvgElement(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function normalizePlotKey(value) {
    return String(value || "").replace(/^plot-/i, "").trim();
  }

  function normalizeStatus(status) {
    return status || "available";
  }

  function formatPlotTitle(plot) {
    return plot ? plot.title || `Участок ${plot.number || normalizePlotKey(plot.id)}` : "Участок";
  }

  function formatAreaLabel(plot) {
    return plot && plot.areaLabel ? plot.areaLabel : "площадь уточняется";
  }

  function formatHouseAreaLabel(plot) {
    return plot && plot.houseAreaLabel ? plot.houseAreaLabel : "площадь дома уточняется";
  }

  function getPlotStatusLabel(plot) {
    if (!plot) return "";
    return plot.statusLabel || window.MAYSKI_UI.getLotStatusLabel(normalizeStatus(plot.status));
  }

  function getPlotTypeLabel(plot) {
    if (!plot || !plot.type) return "не указан";
    if (plot.type === "large_residential") return "увеличенный жилой участок";
    if (plot.type === "residential") return "жилой участок";
    return plot.type;
  }

  function buildPlotsArray(rawPlots) {
    return Object.entries(rawPlots || {})
      .map(([key, plot]) => ({
        ...plot,
        key: normalizePlotKey(key),
        id: plot.id || `plot-${normalizePlotKey(key)}`,
        status: normalizeStatus(plot.status),
      }))
      .sort((a, b) => Number(a.number || a.key) - Number(b.number || b.key));
  }

  function findPlotByKey(key) {
    const normalizedKey = normalizePlotKey(key);
    return plots.find((plot) => normalizePlotKey(plot.key) === normalizedKey || normalizePlotKey(plot.id) === normalizedKey);
  }

  async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Не удалось загрузить ${url}`);
    return response.text();
  }

  async function loadJsonAsset(config) {
    if (window.MAYSKI_MASTERPLAN_PLOTS) return window.MAYSKI_MASTERPLAN_PLOTS;
    const response = await fetch(config.plotsJson);
    if (!response.ok) throw new Error(`Не удалось загрузить ${config.plotsJson}`);
    return response.json();
  }

  async function loadOverlayAsset(config) {
    if (window.MAYSKI_MASTERPLAN_OVERLAY) return window.MAYSKI_MASTERPLAN_OVERLAY;
    if (Array.isArray(config.overlayBase64Chunks) && config.overlayBase64Chunks.length) {
      const encoded = (await Promise.all(config.overlayBase64Chunks.map(fetchText))).join("");
      return decodeURIComponent(escape(window.atob(encoded)));
    }
    const response = await fetch(config.overlay);
    if (!response.ok) throw new Error(`Не удалось загрузить ${config.overlay}`);
    return response.text();
  }

  function configureMapCanvas() {
    const config = window.MAYSKI_DATA.mapConfig;
    const image = document.querySelector("[data-map-image]");
    const overlay = document.querySelector("[data-lot-overlay]");
    if (!config || !overlay) return;
    if (config.viewBox) overlay.setAttribute("viewBox", `0 0 ${config.viewBox.width} ${config.viewBox.height}`);
    if (image && config.image) image.src = config.image;
  }

  function renderLotCard(plot) {
    const card = document.querySelector("[data-lot-card]");
    if (!card) return;
    if (!plot) {
      card.innerHTML = `
        <p class="eyebrow">Выбранный участок</p>
        <h3>Нажмите на участок</h3>
        <p class="muted">Карточка покажет площадь, статус и кнопку заявки.</p>
      `;
      return;
    }
    const status = normalizeStatus(plot.status);
    card.innerHTML = `
      <p class="eyebrow">Выбранный участок</p>
      <h3>${formatPlotTitle(plot)}</h3>
      <span class="lot-card__status lot-card__status--${status}">${getPlotStatusLabel(plot)}</span>
      <div class="lot-card__data">
        <div><span>Площадь участка</span><strong>${formatAreaLabel(plot)}</strong></div>
        <div><span>Площадь дома</span><strong>${formatHouseAreaLabel(plot)}</strong></div>
        <div><span>Тип</span><strong>${getPlotTypeLabel(plot)}</strong></div>
        <div><span>ID</span><strong>${plot.id}</strong></div>
      </div>
      <p class="muted">Можно запросить КП на участок, дом под ключ или строительство по индивидуальному проекту.</p>
      <div class="lot-card__actions">
        <a class="btn btn--primary" href="#request" data-fill-lot="${plot.id}">Получить КП по участку</a>
        <a class="btn btn--glass" href="tel:${window.MAYSKI_DATA.contacts.phoneRaw}">Позвонить</a>
      </div>
    `;
  }

  function setSelectedLot(plotId) {
    selectedLotId = normalizePlotKey(plotId);
    const plot = findPlotByKey(plotId);
    document.querySelectorAll("[data-plot-id]").forEach((shape) => {
      shape.classList.toggle("is-selected", normalizePlotKey(shape.dataset.plotId) === selectedLotId);
    });
    renderLotCard(plot);
    window.dispatchEvent(new CustomEvent("mayski:lot-selected", { detail: { lot: plot } }));
  }

  function applyFilter(status) {
    activeFilter = status;
    document.querySelectorAll("[data-status-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.statusFilter === status);
    });
    document.querySelectorAll("[data-plot-id]").forEach((shape) => {
      const isVisible = status === "all" || shape.dataset.status === status;
      shape.classList.toggle("is-dimmed", !isVisible);
    });
  }

  function showTooltip(event, plot) {
    const tooltip = document.querySelector("[data-map-tooltip]");
    if (!tooltip || !plot) return;
    tooltip.hidden = false;
    tooltip.innerHTML = `
      <strong>${formatPlotTitle(plot)}</strong>
      ${formatAreaLabel(plot)} · дом ${formatHouseAreaLabel(plot)}<br />
      ${getPlotStatusLabel(plot)}
    `;
    tooltip.style.left = `${event.clientX + 14}px`;
    tooltip.style.top = `${event.clientY + 14}px`;
  }

  function hideTooltip() {
    const tooltip = document.querySelector("[data-map-tooltip]");
    if (tooltip) tooltip.hidden = true;
  }

  function addPlotLabels() {
    const overlay = document.querySelector("[data-lot-overlay]");
    if (!overlay) return;
    overlay.querySelectorAll(".mp-label").forEach((label) => label.remove());
    overlay.querySelectorAll(".plot-hit").forEach((shape) => {
      const plot = findPlotByKey(shape.dataset.plotId);
      if (!plot) return;
      try {
        const box = shape.getBBox();
        const label = createSvgElement("text");
        label.setAttribute("x", box.x + box.width / 2);
        label.setAttribute("y", box.y + box.height / 2);
        label.classList.add("lot-label", "mp-label");
        label.textContent = plot.number || normalizePlotKey(plot.id);
        overlay.appendChild(label);
      } catch (error) {
        // Labels are optional if a browser cannot measure a path immediately.
      }
    });
  }

  function wirePlotShape(shape) {
    const plotKey = normalizePlotKey(shape.dataset.plotId || shape.id);
    const plot = findPlotByKey(plotKey);
    if (!plot) return;
    shape.dataset.plotId = plotKey;
    shape.dataset.status = normalizeStatus(plot.status);
    shape.setAttribute("tabindex", "0");
    shape.setAttribute("role", "button");
    shape.setAttribute("aria-label", `${formatPlotTitle(plot)}, ${formatAreaLabel(plot)}, ${getPlotStatusLabel(plot)}`);
    shape.classList.add("plot-hit", `plot-hit--${normalizeStatus(plot.status)}`);
    shape.addEventListener("click", () => setSelectedLot(plotKey));
    shape.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSelectedLot(plotKey);
      }
    });
    shape.addEventListener("mousemove", (event) => showTooltip(event, plot));
    shape.addEventListener("mouseleave", hideTooltip);
  }

  function renderOverlay(svgText) {
    const overlay = document.querySelector("[data-lot-overlay]");
    if (!overlay) return;
    const parsed = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const sourceSvg = parsed.querySelector("svg");
    overlay.innerHTML = "";
    if (!sourceSvg) throw new Error("SVG-контур не найден");
    Array.from(sourceSvg.children).forEach((child) => overlay.appendChild(document.importNode(child, true)));
    overlay.querySelectorAll(".plot-hit").forEach(wirePlotShape);
    addPlotLabels();
    applyFilter(activeFilter);
  }

  async function renderLots() {
    const config = window.MAYSKI_DATA.mapConfig;
    try {
      plots = buildPlotsArray(await loadJsonAsset(config));
      renderOverlay(await loadOverlayAsset(config));
    } catch (error) {
      console.error(error);
      renderLotCard(null);
      window.MAYSKI_UI.showToast("Не удалось загрузить интерактивную карту.");
    }
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
      const plot = findPlotByKey(fillButton.dataset.fillLot);
      if (plot) window.dispatchEvent(new CustomEvent("mayski:lot-selected", { detail: { lot: plot } }));
    });
  }

  function initMap() {
    configureMapCanvas();
    initMapFilters();
    initCardActions();
    renderLots();
  }

  window.MAYSKI_MAP = {
    initMap,
    setSelectedLot,
  };
})();
