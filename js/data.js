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
      name: "Дом B — Premium Wood",
      area: 156,
      rooms: "4 спальни",
      image: "assets/images/house-02.png",
      description: "Более выразительный вариант с деревянными акцентами, высоким потолком и просторной гостиной.",
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

  function interpolate(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function bilinear(a, b, c, d, x, y) {
    const top = interpolate(a, b, x);
    const bottom = interpolate(d, c, x);
    return interpolate(top, bottom, y);
  }

  function polygonString(points) {
    return points.map((point) => `${Math.round(point[0])},${Math.round(point[1])}`).join(" ");
  }

  function makeGridLots({ startNumber, prefix, a, b, c, d, columns, rows, baseArea, basePrice, statuses }) {
    const lots = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = lots.length;
        const number = startNumber + index;
        const x0 = column / columns;
        const x1 = (column + 1) / columns;
        const y0 = row / rows;
        const y1 = (row + 1) / rows;
        const points = [
          bilinear(a, b, c, d, x0, y0),
          bilinear(a, b, c, d, x1, y0),
          bilinear(a, b, c, d, x1, y1),
          bilinear(a, b, c, d, x0, y1),
        ];

        lots.push({
          id: `${prefix}_${String(number).padStart(3, "0")}`,
          number: String(number),
          cluster: prefix,
          area: Number((baseArea + ((number % 5) * 0.35) + (row * 0.18)).toFixed(1)),
          price: basePrice + (number % 7) * 180000 + row * 120000,
          status: statuses[index % statuses.length],
          polygon: polygonString(points),
        });
      }
    }

    return lots;
  }

  const lots = [
    ...makeGridLots({
      startNumber: 1,
      prefix: "L",
      a: [231, 197],
      b: [382, 293],
      c: [307, 407],
      d: [185, 286],
      columns: 3,
      rows: 2,
      baseArea: 7.8,
      basePrice: 3900000,
      statuses: ["available", "reserved", "available", "available", "sold", "available"],
    }),
    ...makeGridLots({
      startNumber: 7,
      prefix: "C",
      a: [430, 331],
      b: [626, 489],
      c: [503, 589],
      d: [348, 404],
      columns: 3,
      rows: 3,
      baseArea: 8.4,
      basePrice: 4300000,
      statuses: ["available", "available", "reserved", "available", "sold", "available", "available", "available", "reserved"],
    }),
    ...makeGridLots({
      startNumber: 16,
      prefix: "R",
      a: [526, 218],
      b: [755, 399],
      c: [675, 488],
      d: [447, 309],
      columns: 5,
      rows: 2,
      baseArea: 8.1,
      basePrice: 4100000,
      statuses: ["available", "available", "reserved", "available", "available", "sold", "available", "available", "available", "reserved"],
    }),
    ...makeGridLots({
      startNumber: 26,
      prefix: "T",
      a: [642, 56],
      b: [737, 93],
      c: [790, 253],
      d: [542, 154],
      columns: 5,
      rows: 2,
      baseArea: 7.6,
      basePrice: 3800000,
      statuses: ["sold", "available", "available", "available", "reserved", "available", "available", "sold", "available", "available"],
    }),
  ];

  window.MAYSKI_DATA = {
    contacts,
    houses,
    lots,
    purchaseFormats,
    statusLabels,
  };
})();
