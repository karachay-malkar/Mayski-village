(function () {
  let selectedLot = null;

  function setSelectedLotInput(lot) {
    selectedLot = lot;

    const input = document.querySelector("[data-selected-lot-input]");
    if (!input || !lot) return;

    input.value = `Участок №${lot.number} — ${window.MAYSKI_UI.formatArea(lot.area)} — ${window.MAYSKI_UI.formatPrice(lot.price)}`;
  }

  function buildMessage(formData) {
    const lines = [
      "Здравствуйте! Хочу получить коммерческое предложение по коттеджному посёлку Майский.",
      "",
      `Имя: ${formData.get("name")}`,
      `Телефон: ${formData.get("phone")}`,
      `Участок: ${formData.get("lot") || "не выбран"}`,
      `Формат покупки: ${formData.get("format")}`,
    ];

    const comment = String(formData.get("comment") || "").trim();
    if (comment) {
      lines.push(`Комментарий: ${comment}`);
    }

    if (selectedLot) {
      lines.push("");
      lines.push(`ID участка: ${selectedLot.id}`);
      lines.push(`Статус: ${window.MAYSKI_UI.getLotStatusLabel(selectedLot.status)}`);
    }

    return lines.join("\n");
  }

  function initRequestForm() {
    const form = document.querySelector("[data-request-form]");
    if (!form) return;

    window.addEventListener("mayski:lot-selected", (event) => {
      if (event.detail && event.detail.lot) {
        setSelectedLotInput(event.detail.lot);
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const phone = String(formData.get("phone") || "").trim();

      if (phone.length < 6) {
        window.MAYSKI_UI.showToast("Укажите телефон для связи.");
        return;
      }

      const message = buildMessage(formData);
      const whatsappUrl = `https://wa.me/${window.MAYSKI_DATA.contacts.phoneRaw}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      window.MAYSKI_UI.showToast("Открываю WhatsApp с готовым сообщением.");
    });
  }

  window.MAYSKI_FORM = {
    initRequestForm,
  };
})();
