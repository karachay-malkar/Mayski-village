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
    image: "assets/images/masterplan.png",
    viewBox: { width: 975, height: 1475 },
    source: "PDF vector extraction, crop x=500 y=150 w=975 h=1475",
  };

  const lots = [
    {
        "id": "LOT_001",
        "number": "1",
        "area": 792,
        "status": "available",
        "price": null,
        "polygon": "271.8,76.3 355.8,81.6 364.0,302.5 239.8,307.0",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_002",
        "number": "2",
        "area": 760,
        "status": "available",
        "price": null,
        "polygon": "355.8,81.6 469.6,88.6 477.2,298.4 364.0,302.5",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_003",
        "number": "3",
        "area": 720,
        "status": "available",
        "price": null,
        "polygon": "469.6,88.6 583.2,95.8 590.5,294.2 477.2,298.4",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_004",
        "number": "4",
        "area": 680,
        "status": "available",
        "price": null,
        "polygon": "583.2,95.8 697.0,103.0 703.9,290.0 590.5,294.2",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_005",
        "number": "5",
        "area": 640,
        "status": "available",
        "price": null,
        "polygon": "697.0,103.0 810.7,110.2 817.2,285.8 703.9,290.0",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_006",
        "number": "6",
        "area": 737,
        "status": "available",
        "price": null,
        "polygon": "239.8,307.0 364.0,302.5 370.2,472.5 216.1,478.2",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_007",
        "number": "7",
        "area": 600,
        "status": "reserved",
        "price": null,
        "polygon": "364.0,302.5 477.2,298.4 483.5,468.3 370.2,472.5",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_008",
        "number": "8",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "477.2,298.4 590.5,294.2 596.8,464.1 483.5,468.3",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_009",
        "number": "9",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "590.5,294.2 703.9,290.0 710.2,459.9 596.8,464.1",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_010",
        "number": "10",
        "area": 600,
        "status": "sold",
        "price": null,
        "polygon": "703.9,290.0 817.2,285.8 823.4,455.8 710.2,459.9",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_011",
        "number": "11",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "208.2,535.2 259.0,533.4 271.4,873.2 160.7,877.3",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_012",
        "number": "12",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "259.0,533.4 372.2,529.2 378.5,699.1 265.2,703.3",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_013",
        "number": "13",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "372.2,529.2 485.6,525.0 491.9,694.9 378.5,699.1",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_014",
        "number": "14",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "485.6,525.0 598.9,520.8 605.2,690.8 491.9,694.9",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_015",
        "number": "15",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "598.9,520.8 712.2,516.7 718.4,686.6 605.2,690.8",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_016",
        "number": "16",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "712.2,516.7 825.5,512.5 831.8,682.4 718.4,686.6",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_017",
        "number": "17",
        "area": 855,
        "status": "available",
        "price": null,
        "polygon": "265.2,703.3 378.5,699.1 384.8,869.2 271.4,873.2",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_018",
        "number": "18",
        "area": 600,
        "status": "reserved",
        "price": null,
        "polygon": "378.5,699.1 491.9,694.9 498.1,864.9 384.8,869.1",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_019",
        "number": "19",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "491.9,694.9 605.2,690.8 611.4,860.7 498.1,864.9",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_020",
        "number": "20",
        "area": 600,
        "status": "available",
        "price": null,
        "polygon": "605.2,690.8 718.4,686.6 724.7,856.5 611.4,860.7",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_021",
        "number": "21",
        "area": 600,
        "status": "sold",
        "price": null,
        "polygon": "718.4,686.6 831.8,682.4 838.1,852.3 724.7,856.5",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_022",
        "number": "22",
        "area": 794,
        "status": "available",
        "price": null,
        "polygon": "152.8,934.3 245.3,930.9 253.6,1157.6 121.2,1162.4",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_023",
        "number": "23",
        "area": 700,
        "status": "available",
        "price": null,
        "polygon": "245.3,930.9 344.4,927.3 352.7,1153.9 253.6,1157.6",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_024",
        "number": "24",
        "area": 700,
        "status": "available",
        "price": null,
        "polygon": "443.5,923.6 542.6,920.0 551.0,1146.6 451.9,1150.3",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_025",
        "number": "25",
        "area": 700,
        "status": "available",
        "price": null,
        "polygon": "542.6,920.0 641.9,916.3 650.2,1143.0 551.0,1146.6",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_026",
        "number": "26",
        "area": 700,
        "status": "reserved",
        "price": null,
        "polygon": "641.9,916.3 741.0,912.7 749.3,1139.2 650.2,1143.0",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_027",
        "number": "27",
        "area": 700,
        "status": "available",
        "price": null,
        "polygon": "741.0,912.7 840.1,909.1 848.5,1135.6 749.3,1139.2",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_028",
        "number": "28",
        "area": 650,
        "status": "available",
        "price": null,
        "polygon": "551.0,1146.6 650.2,1143.0 658.6,1369.5 559.3,1373.2",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_029",
        "number": "29",
        "area": 700,
        "status": "available",
        "price": null,
        "polygon": "650.2,1143.0 749.3,1139.2 757.7,1365.9 658.6,1369.5",
        "source": "pdf-vector"
    },
    {
        "id": "LOT_030",
        "number": "30",
        "area": 700,
        "status": "available",
        "price": null,
        "polygon": "749.3,1139.2 848.5,1135.6 856.8,1362.2 757.7,1365.9",
        "source": "pdf-vector"
    }
];

  window.MAYSKI_DATA = {
    contacts,
    houses,
    lots,
    mapConfig,
    purchaseFormats,
    statusLabels,
  };
})();
