// Etap 7 — See What's Nearby
// Data-driven xəritə bloku: museums.js / routes.js / events.js / news.js ilə
// eyni nümunə — əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/places.json fallback-ı.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/places";
const FALLBACK_URL = "data/places.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

// Xəritə: Figma-da olduğu kimi sabit İçərişəhər görünüşüdür və HTML-dəki
// <iframe> ilə bir dəfə yüklənir — bu modul ona toxunmur.
// Səbəb: iframe-i JS ilə əvəz etmək (və ya src-ni dəyişmək) həm brauzer
// tarixçəsini çirkləndirir, həm də kross-origin iframe-in yenidən
// kompozisiyasına görə xəritə blokun kənarlarından daşıb çıxırdı.
// Mərkəz/zoom index.html-dəki iframe URL-indədir; məkanın öz koordinatına
// yaxınlaşma lazım olsa, açarlı Maps JS API ilə əlavə olunmalıdır.

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

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

function closeCard(cardEl) {
  cardEl.hidden = true;
  cardEl.innerHTML = "";
  cardEl.removeAttribute("data-state");
}

function renderCard(cardEl, place) {
  cardEl.hidden = false;
  if (!place) {
    cardEl.innerHTML = "<p>No places in this category yet.</p>";
    cardEl.setAttribute("data-state", "empty");
    return;
  }
  cardEl.innerHTML = cardMarkup(place);
  cardEl.removeAttribute("data-state");
}

function renderError(cardEl) {
  cardEl.hidden = false;
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
function initChips(chipsEl, cardEl, items) {
  const chips = [...chipsEl.querySelectorAll("[data-places-category]")];

  function select(chip) {
    chips.forEach((el) => {
      const active = el === chip;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const category = chip.dataset.placesCategory || "";
    // "All" — filtr yoxdur, ona görə kart da göstərilmir: sadəcə xəritə.
    if (!category) {
      closeCard(cardEl);
      return;
    }
    renderCard(cardEl, placesOfCategory(items, category)[0] || null);
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

  // Kartdakı "×" kartı bağlayır və seçimi başlanğıc "All" vəziyyətinə qaytarır.
  cardEl.addEventListener("click", (event) => {
    if (event.target.closest("[data-places-close]")) select(chips[0]);
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
  if (!cardEl || !chipsEl) return;

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

  initChips(chipsEl, cardEl, items);
}

document.addEventListener("DOMContentLoaded", initPlaces);
