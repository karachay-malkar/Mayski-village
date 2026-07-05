const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function makeDots(root, count, onClick) {
  root.innerHTML = "";

  return Array.from({ length: count }, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Показать фото ${index + 1}`);
    button.addEventListener("click", () => onClick(index));
    root.appendChild(button);
    return button;
  });
}

function initPhotoSlider() {
  const slider = qs("#photoSlider");
  if (!slider) return;

  const slides = qsa("img", slider);
  let index = 0;

  const dots = makeDots(qs("#photoDots"), slides.length, setSlide);

  function setSlide(nextIndex) {
    slides[index].classList.remove("active");
    dots[index].classList.remove("active");

    index = nextIndex;

    slides[index].classList.add("active");
    dots[index].classList.add("active");
  }

  setSlide(0);

  setInterval(() => {
    setSlide((index + 1) % slides.length);
  }, 4200);
}

function initFormats() {
  const track = qs("#formatTrack");
  const tabs = qsa("#formatTabs button");

  function setFormat(index) {
    track.style.transform = `translateX(${-index * 100}%)`;

    tabs.forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === index);
    });
  }

  tabs.forEach((button, index) => {
    button.addEventListener("click", () => setFormat(index));
  });

  setFormat(0);
}

const plotData = {};

function getPlotId(element) {
  return String(element.dataset.plotId || element.id || "").replace("plot-", "");
}

function fillPlotPanel(id) {
  const plot = plotData[id] || {};

  qs("#plotKicker").textContent = id ? `Участок ${id}` : "Нажмите на участок";
  qs("#plotTitle").textContent = plot.title || `Участок ${id}`;
  qs("#plotArea").textContent = plot.areaLabel || "—";
  qs("#plotStatus").textContent = plot.statusLabel || "Свободен";
}

function addMapLabels(svg) {
  const labelLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");

  svg.querySelectorAll(".plot-hit").forEach((plotElement) => {
    const id = getPlotId(plotElement);

    try {
      const box = plotElement.getBBox();
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

      text.setAttribute("class", "plot-label");
      text.setAttribute("x", box.x + box.width / 2);
      text.setAttribute("y", box.y + box.height / 2);
      text.textContent = id;

      labelLayer.appendChild(text);
    } catch (error) {
      // Подписи не критичны: клики по участкам продолжают работать.
    }
  });

  svg.appendChild(labelLayer);
}

async function initMap() {
  try {
    const [svgResponse, jsonResponse] = await Promise.all([
      fetch("assets/map/masterplan_overlay_cropped.svg"),
      fetch("assets/map/masterplan_plots_cropped.json"),
    ]);

    if (!svgResponse.ok || !jsonResponse.ok) {
      throw new Error("Map files not loaded");
    }

    Object.assign(plotData, await jsonResponse.json());

    const host = qs("#mapOverlay");
    host.innerHTML = await svgResponse.text();

    const svg = qs("svg", host);
    svg.setAttribute("preserveAspectRatio", "none");

    const plots = qsa(".plot-hit", svg);

    plots.forEach((plotElement) => {
      const id = getPlotId(plotElement);

      plotElement.setAttribute("tabindex", "0");
      plotElement.setAttribute("role", "button");
      plotElement.setAttribute("aria-label", `Участок ${id}`);

      plotElement.addEventListener("click", () => {
        plots.forEach((element) => element.classList.remove("is-selected"));
        plotElement.classList.add("is-selected");
        fillPlotPanel(id);
      });

      plotElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          plotElement.click();
        }
      });
    });

    requestAnimationFrame(() => addMapLabels(svg));
  } catch (error) {
    qs("#mapOverlay").innerHTML = '<div class="map-error">Карта временно не загрузилась</div>';
    console.error(error);
  }
}

initPhotoSlider();
initFormats();
initMap();
