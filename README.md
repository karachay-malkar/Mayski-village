# Mayski Development Project — full upload package v0.3

Готовый пакет для ручной загрузки в GitHub.

## Что внутри

- Новый интерактивный генплан из `masterplan_cropped_overlay_site_bundle.zip`:
  - `assets/images/masterplan_bg_cropped.png`
  - `assets/images/masterplan_bg_cropped.webp`
  - `assets/map/masterplan_overlay_cropped.svg`
  - `assets/data/masterplan_plots_cropped.json`
- JS-fallback файлы для локального открытия без сервера:
  - `assets/map/masterplan_overlay_cropped.js`
  - `assets/data/masterplan_plots_cropped.js`
- Фотографии домов:
  - `assets/images/hero.png`
  - `assets/images/house-01.png`
  - `assets/images/house-02.png`
  - `assets/images/house-03.png`
- Полный комплект HTML/CSS/JS сайта.

## Как загрузить

Загрузить содержимое архива в корень репозитория `karachay-malkar/Mayski-village` с заменой существующих файлов.

## Проверка

Открыть `index.html` через локальный сервер:

```bash
python3 -m http.server 8080
```

Затем открыть:

```text
http://localhost:8080
```

Карта должна показать фон 2400×1800, SVG-контур и 40 кликабельных участков.
