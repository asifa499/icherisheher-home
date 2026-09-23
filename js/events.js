// Etap 5 — This season in the Old City
// Data-driven tədbir bloku: js/museums.js və js/routes.js ilə eyni nümunə —
// əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/events.json fallback-ı.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/events";
const FALLBACK_URL = "data/events.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

// Figma-da tarix nişanı gün rəqəmi + 3 hərfli ay qısaltmasıdır (21 / MAR).
// JSON-da yalnız ISO start_date saxlanılır, qısaltma burada qurulur ki,
// backend-dən gələn data üçün də eyni işləsin.
const MONTHS = {
  az: ["YAN", "FEV", "MAR", "APR", "MAY", "İYN", "İYL", "AVQ", "SEN", "OKT", "NOY", "DEK"],
  en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  ru: ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"],
};

// Figma kompozisiyası: sol tərəfdə 2 fotolu kart, sağda 3 kompakt
// (yalnız tarix + mətn) kart. Say bu sərhədləri keçsə, artıq tədbirlər
// göstərilmir — şəbəkə eni Figma-da bu say üçün qurulub.
const FEATURED_LIMIT = 2;
const COMPACT_LIMIT = 3;

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

// "2026-03-21" → { day: "21", month: "MAR" }. ISO sətri parçalayırıq
// (Date() ilə yox) ki, brauzerin saat qurşağı günü sürüşdürməsin.
function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));
  if (!match) return { day: "", month: "" };
  const months = MONTHS[LANG] || MONTHS.en;
  return {
    day: String(Number(match[3])),
    month: months[Number(match[2]) - 1] || "",
  };
}

function dateBadgeMarkup(event) {
  const { day, month } = parseDate(event.start_date);
  return `
    <time class="event-card__date" datetime="${escapeHtml(event.start_date || "")}">
      <span class="event-card__day">${escapeHtml(day)}</span>
      <span class="event-card__month">${escapeHtml(month)}</span>
    </time>
  `;
}

function bodyMarkup(event) {
  const time = escapeHtml(event.time || "");
  const venue = escapeHtml(pickText(event.venue));
  const meta = [time, venue].filter(Boolean).join(" · ");

  return `
    ${dateBadgeMarkup(event)}
    <span class="event-card__text">
      <span class="event-card__category">${escapeHtml(pickText(event.category))}</span>
      <span class="event-card__title">${escapeHtml(pickText(event.title))}</span>
      <span class="event-card__meta">${meta}</span>
    </span>
  `;
}

function featuredCardMarkup(event) {
  const title = escapeHtml(pickText(event.title));
  return `
    <a class="event-card event-card--featured" href="${escapeHtml(event.ticket_url || "#")}">
      <img class="event-card__photo" src="${escapeHtml(event.image)}" alt="${title}"
           loading="lazy" width="368" height="226">
      <span class="event-card__body">${bodyMarkup(event)}</span>
    </a>
  `;
}

function compactCardMarkup(event) {
  return `
    <a class="event-card event-card--compact" href="${escapeHtml(event.ticket_url || "#")}">
      <span class="event-card__body">${bodyMarkup(event)}</span>
    </a>
  `;
}

// Fotolu tədbirlər böyük kartlara, qalanları kompakt sütuna düşür.
// Fotolu tədbir çatmasa, boşluğu qalan tədbirlər doldurur ki, şəbəkə
// heç vaxt yarımçıq qalmasın.
function splitEvents(events) {
  const sorted = [...events].sort((a, b) => a.sort_order - b.sort_order);
  const featured = sorted.filter((e) => e.image).slice(0, FEATURED_LIMIT);
  const rest = sorted.filter((e) => !featured.includes(e));
  return { featured, compact: rest.slice(0, COMPACT_LIMIT) };
}

function renderEvents(gridEl, events) {
  const { featured, compact } = splitEvents(events);

  gridEl.innerHTML = `
    <div class="season__featured">${featured.map(featuredCardMarkup).join("")}</div>
    <div class="season__list">${compact.map(compactCardMarkup).join("")}</div>
  `;
  gridEl.removeAttribute("data-state");
}

function renderError(gridEl) {
  gridEl.innerHTML = "";
  gridEl.setAttribute("data-state", "error");
}

async function fetchEvents(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// API cavabı bare array və ya wrapper object ola bilər
// (məs. { count, data: [...] }) — museums.js/routes.js ilə eyni davranış.
function unwrapEventsList(json) {
  const list = Array.isArray(json) ? json : (json && (json.data || json.events || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Events payload is empty or in an unrecognized shape");
  }
  return list;
}

async function initEvents() {
  const gridEl = document.querySelector("[data-events-grid]");
  if (!gridEl) return;

  let events;
  try {
    events = unwrapEventsList(await fetchEvents(API_URL, { cache: "no-store" }));
  } catch (apiErr) {
    console.error("Events API fetch failed, falling back to local JSON:", apiErr);
    try {
      events = unwrapEventsList(await fetchEvents(FALLBACK_URL));
    } catch (fallbackErr) {
      console.error("Events fallback fetch failed:", fallbackErr);
      renderError(gridEl);
      return;
    }
  }

  renderEvents(gridEl, events);
}

document.addEventListener("DOMContentLoaded", initEvents);
