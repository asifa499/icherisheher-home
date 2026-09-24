// Etap 7 — See What's Nearby
// Data-driven xəritə bloku: museums.js / routes.js / events.js / news.js ilə
// eyni nümunə — əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/places.json fallback-ı.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/places";
const FALLBACK_URL = "data/places.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

// Xəritənin başlanğıc mərkəzi — İçərişəhər (Figma-dakı kadr ilə eyni).
const MAP_CENTER = { lat: 40.3665, lng: 49.8352 };
const MAP_ZOOM = 16;

// Figma 1523:8263-də kart "Muhammad Mosque"-u göstərir; "All" seçili olanda
// eyni məkanla açılırıq ki, canlı səhifə dizaynla üst-üstə düşsün.
// Məkan siyahıda yoxdursa sort_order-ə görə birinci məkan götürülür.
const DEFAULT_SLUG = "muhammad-mosque";

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

// Keyless Google Maps embed — API açarı tələb etmir.
function mapSrc(lat, lng, zoom) {
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);
  const point = hasPin
    ? `${lat},${lng}`
    : `${MAP_CENTER.lat},${MAP_CENTER.lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(point)}&z=${zoom}&hl=${LANG}&output=embed`;
}

// iframe-in src-ni dəyişmək brauzer tarixçəsinə yazı əlavə edir (geri düyməsi
// xəritə addımlarını gəzməyə başlayır), ona görə elementin özünü əvəz edirik.
function setMap(mapEl, place) {
  const frame = document.createElement("iframe");
  frame.src = mapSrc(place && place.lat, place && place.lng, MAP_ZOOM);
  frame.title = place
    ? `${pickText(place.name)} — map`
    : "Map of Icherisheher";
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  frame.setAttribute("allowfullscreen", "");
  mapEl.replaceChildren(frame);
}

// Figma kartında iki 228×136 foto var (image 79 / image 80). API sxemində
// hələ yalnız tək `image` sütunu var, ona görə `images` massivi olmayanda
// mövcud tək foto bütün cərgəni tutur (boş yuva göstərmirik).
// Backend `images` sütununu əlavə edəndə kart avtomatik 2 fotoya keçir.
function photosMarkup(place, alt) {
  const images = (Array.isArray(place.images) && place.images.length
    ? place.images
    : [place.image]).filter(Boolean).slice(0, 2);

  if (!images.length) return "";

  const tiles = images.map((src) => `
    <div class="nearby__photo">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy"
           width="228" height="136" onerror="this.closest('.nearby__photo').remove()">
    </div>
  `).join("");

  // Şəkil yüklənmirsə həmin yuva tamamilə silinir; cərgə boşalsa
  // (.nearby__photos:empty) CSS onu gizlədir — boş boz blok qalmır.
  return `<div class="nearby__photos"${images.length === 1 ? ' data-single' : ""}>${tiles}</div>`;
}

// Figma kartında ikinci sütun "Ticket price"dır, amma API sxemində hələ belə
// sahə yoxdur — ticket_price gələnə qədər həmin yuvada `status` göstərilir.
function secondFact(place) {
  if (place.ticket_price) {
    return { label: "Ticket price", value: pickText(place.ticket_price) || place.ticket_price };
  }
  const status = String(place.status || "").toLowerCase();
  return {
    label: "Status",
    value: status === "open" ? "Open" : status === "closed" ? "Closed" : "—",
  };
}

function cardMarkup(place) {
  const name = pickText(place.name);
  const fact = secondFact(place);

  return `
    <div class="nearby__card-head">
      <div class="nearby__card-top">
        <h3 class="nearby__name">${escapeHtml(name)}</h3>
        <button class="nearby__close" type="button" data-places-close aria-label="Close">
          <img src="assets/img/nearby-icon-close.svg" alt="" width="20" height="20">
        </button>
      </div>
      <p class="nearby__desc">${escapeHtml(pickText(place.description))}</p>
    </div>

    <div class="nearby__meta">
      <div class="nearby__meta-item">
        <span class="nearby__meta-label">Open hours</span>
        <span class="nearby__meta-value">${escapeHtml(place.open_hours || "—")}</span>
      </div>
      <div class="nearby__meta-item">
        <span class="nearby__meta-label">${escapeHtml(fact.label)}</span>
        <span class="nearby__meta-value">${escapeHtml(fact.value)}</span>
      </div>
    </div>

    ${photosMarkup(place, name)}

    <div class="nearby__actions">
      <button class="nearby__btn nearby__btn--ghost" type="button">
        <img src="assets/img/nearby-icon-audio.svg" alt="" width="20" height="20">Audio guide
      </button>
      <a class="nearby__btn nearby__btn--solid" href="#${escapeHtml(place.slug || "")}">More details</a>
    </div>
  `;
}

function renderCard(cardEl, mapEl, place) {
  if (!place) {
    cardEl.innerHTML = "<p>No places in this category yet.</p>";
    cardEl.setAttribute("data-state", "empty");
    setMap(mapEl, null);
    return;
  }
  cardEl.innerHTML = cardMarkup(place);
  cardEl.removeAttribute("data-state");
  cardEl.hidden = false;
  setMap(mapEl, place);
}

function renderError(cardEl) {
  cardEl.innerHTML = "<p>Places could not be loaded right now.</p>";
  cardEl.setAttribute("data-state", "error");
}

function placesOfCategory(items, category) {
  const list = category
    ? items.filter((item) => item.category === category)
    : items.slice();
  return list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

// Çiplər HTML-də statikdir (data gəlməsə də görünməlidirlər); burada yalnız
// seçim vəziyyəti və kartın yenilənməsi idarə olunur.
function initChips(chipsEl, cardEl, mapEl, items) {
  const chips = [...chipsEl.querySelectorAll("[data-places-category]")];

  function select(chip) {
    chips.forEach((el) => {
      const active = el === chip;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const category = chip.dataset.placesCategory || "";
    const list = placesOfCategory(items, category);
    const preferred = !category && list.find((item) => item.slug === DEFAULT_SLUG);
    renderCard(cardEl, mapEl, preferred || list[0] || null);
  }

  chipsEl.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-places-category]");
    if (!chip) return;
    // Aktiv çipdəki "×" seçimi "All"-a qaytarır (Figma: 1523:5684).
    if (chip.classList.contains("is-active") && event.target.closest("[data-places-clear]")) {
      select(chips[0]);
      return;
    }
    select(chip);
  });

  // Kartdakı "×" yalnız kartı bağlayır, filtri dəyişmir.
  cardEl.addEventListener("click", (event) => {
    if (event.target.closest("[data-places-close]")) cardEl.hidden = true;
  });

  select(chips.find((el) => el.classList.contains("is-active")) || chips[0]);
}

async function fetchPlaces(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// API cavabı bare array və ya wrapper object ola bilər
// (məs. { count, data: [...] }) — digər modullarla eyni davranış.
function unwrapPlaceList(json) {
  const list = Array.isArray(json) ? json : (json && (json.data || json.places || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Places payload is empty or in an unrecognized shape");
  }
  return list;
}

async function initPlaces() {
  const cardEl = document.querySelector("[data-places-card]");
  const chipsEl = document.querySelector("[data-places-chips]");
  const mapEl = document.querySelector("[data-places-map]");
  if (!cardEl || !chipsEl || !mapEl) return;

  let items;
  try {
    items = unwrapPlaceList(await fetchPlaces(API_URL, { cache: "no-store" }));
  } catch (apiErr) {
    console.error("Places API fetch failed, falling back to local JSON:", apiErr);
    try {
      items = unwrapPlaceList(await fetchPlaces(FALLBACK_URL));
    } catch (fallbackErr) {
      console.error("Places fallback fetch failed:", fallbackErr);
      renderError(cardEl);
      return;
    }
  }

  initChips(chipsEl, cardEl, mapEl, items);
}

document.addEventListener("DOMContentLoaded", initPlaces);
