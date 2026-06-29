(function () {
  const statusLabels = {
    available: "Свободен",
    reserved: "Бронь",
    sold: "Продан",
  };

  const purchaseFormats = [
    "Участок + готовый дом",
    "Участок + дом по вашему проекту",
    "Только участок",
  ];

  const houses = [
    {
      id: "HOUSE_001",
      name: "Дом A — Family Compact",
      area: 118,
      rooms: "3 спальни",
      image: "assets/images/house-01.png",
      description: "Современный одноэтажный дом для семьи с террасой, панорамными окнами и спокойной архитектурой.",
    },
    {
      id: "HOUSE_002",
      name: "Дом B — Premium Stone",
      area: 156,
      rooms: "4 спальни",
      image: "assets/images/house-02.png",
      description: "Выразительный вариант с современной кровлей, просторной гостиной и возможностью адаптации фасада.",
    },
    {
      id: "HOUSE_003",
      name: "Дом C — Modern Classic",
      area: 132,
      rooms: "3–4 спальни",
      image: "assets/images/house-03.png",
      description: "Лаконичный дом с тёмной кровлей, светлым фасадом и удобной планировкой для круглогодичного проживания.",
    },
  ];

  const contacts = {
    phoneHuman: "+7 900 000-00-00",
    phoneRaw: "79000000000",
    email: "sales@example.com",
  };

  const mapConfig = {
    image: "assets/images/masterplan_bg_cropped.png",
    overlay: "assets/map/masterplan_overlay_cropped.svg",
    plotsJson: "assets/data/masterplan_plots_cropped.json",
    viewBox: { width: 2400, height: 1800 },
    source: "masterplan_cropped_overlay_site_bundle",
  };

  window.MAYSKI_DATA = {
    contacts,
    houses,
    lots: [],
    mapConfig,
    purchaseFormats,
    statusLabels,
  };
})();
