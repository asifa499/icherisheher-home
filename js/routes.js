// Etap 4 — Ready-made routes (2026-10-23: yeni dizayn — tab-lı tur kartları cərgəsi, sxem data/routes.json-da)
// Data-driven marşrut bloku: js/museums.js ilə eyni nümunə —
// əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/routes.json fallback-ı. /api/routes endpoint-i hələ
// yoxdur, ona görə hazırda praktiki olaraq həmişə fallback işləyir.
import { getLang, onLangChange, t } from "./i18n.js";
import { siteUrl, imageUrl, onReady } from "./base-url.js";
import { picture } from "./picture.js";

const API_URL = "https://icherisheher-api-production.up.railway.app/api/routes";
const FALLBACK_URL = siteUrl("data/routes.json");
const IMG = imageUrl("assets/img/");
let LANG = getLang();

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

const TABS = [
  { key: "first-time", label: "routes.tab.firstTime" },
  { key: "group", label: "routes.tab.group" },
  { key: "private", label: "routes.tab.private" },
  { key: "qala", label: "routes.tab.qala" },
];
const TYPE_ICON = { restaurant: "route-icon-restaurant.svg", museums: "route-icon-castle.svg", walk: "route-icon-walk.svg" };
const MODE_ICON = { private: "route-icon-user.svg", group: "route-icon-group.svg" };

function tabMarkup(tab, isActive) {
  return `
    <button class="routes__chip${isActive ? " is-active" : ""}" type="button"
            data-route-tab="${tab.key}" aria-pressed="${isActive ? "true" : "false"}">
      ${escapeHtml(t(tab.label))}
    </button>
  `;
}

function cardMarkup(tour) {
  const title = pickText(tour.title);
  const src = imageUrl(tour.image);
  return `
    <article class="routes-card" data-slug="${escapeHtml(tour.slug)}">
      <div class="routes-card__media">
        ${picture(src, `<img class="routes-card__photo" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" width="368" height="354">`)}
        <div class="routes-card__scrim" aria-hidden="true"></div>
        <div class="routes-card__overlay">
          <h3 class="routes-card__title"${tour.title_width ? ` style="max-width:${Number(tour.title_width)}px"` : ""}>${escapeHtml(title)}</h3>
          <div class="routes-card__badges">
            <span class="routes-card__badge"><img src="${IMG}${TYPE_ICON[tour.type] || TYPE_ICON.walk}" alt="" width="16" height="16">${escapeHtml(t("routes.type." + tour.type))}</span>
            <span class="routes-card__badge"><img src="${IMG}museum-icon-clock.svg" alt="" width="16" height="16">${escapeHtml(tour.working_hours)}</span>
            <span class="routes-card__badge"><img src="${IMG}${MODE_ICON[tour.mode] || MODE_ICON.group}" alt="" width="16" height="16">${escapeHtml(t("routes.mode." + tour.mode))}</span>
          </div>
        </div>
        <span class="routes-card__badge routes-card__badge--rating">
          <span class="routes-card__google" aria-hidden="true"><img src="${IMG}museum-icon-google.svg" alt="" width="12" height="12"></span>
          ${Number(tour.rating).toFixed(1)}
          <img class="routes-card__star" src="${IMG}museum-icon-star-gold.svg" alt="" width="16" height="16">
        </span>
      </div>
      <div class="routes-card__body">
        <p class="routes-card__desc">${escapeHtml(pickText(tour.short_description))}</p>
        <div class="routes-card__facts">
          <p class="routes-card__meta"><img src="${IMG}museum-icon-pin.svg" alt="" width="20" height="20">${escapeHtml(pickText(tour.address))}</p>
          <p class="routes-card__meta"><img src="${IMG}museum-icon-money.svg" alt="" width="20" height="20">${escapeHtml(pickText(tour.price))}</p>
        </div>
        <a class="routes-card__cta" href="${escapeHtml(tour.book_url || "#")}">${escapeHtml(t("routes.bookNow"))}</a>
      </div>
    </article>
  `;
}

// activeTab: "first-time" | "group" | "private" | "qala" | "all" ("All tours" düyməsi süzgəci götürür)
function renderRoutes(chipsEl, rowEl, tours, activeTab = "first-time") {
  const sorted = [...tours].sort((a, b) => a.sort_order - b.sort_order);
  const visible = activeTab === "all" ? sorted : sorted.filter((x) => (x.tags || []).includes(activeTab));

  chipsEl.innerHTML = TABS.map((tab) => tabMarkup(tab, tab.key === activeTab)).join("");
  rowEl.innerHTML = visible.map(cardMarkup).join("");
  rowEl.removeAttribute("data-state");
  rowEl.dataset.activeTab = activeTab;
}

function renderError(chipsEl, cardEl) {
  chipsEl.innerHTML = "";
  cardEl.innerHTML = "";
  cardEl.setAttribute("data-state", "error");
}

async function fetchRoutes(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// API cavabı bare array və ya wrapper object ola bilər
// (məs. { count, data: [...] }) — museums.js-dəki eyni davranış.
function unwrapRoutesList(json) {
  const list = Array.isArray(json) ? json : (json && (json.data || json.routes || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Routes payload is empty or in an unrecognized shape");
  }
  // 2026-10-23: backend (icherisheher-api) hələ köhnə sxemi (title/duration/stops) qaytarır —
  // yeni tur kartı sxemi (type/mode/address/price) olmayan cavab fallback-a düşür.
  if (!list.every((x) => x && x.type && x.mode && x.address)) {
    throw new Error("Routes payload uses the legacy schema (no tour card fields)");
  }
  return list;
}

async function initRoutes() {
  const chipsEl = document.querySelector("[data-routes-chips]");
  const cardEl = document.querySelector("[data-routes-row]");
  const allEl = document.querySelector("[data-routes-all]");
  if (!chipsEl || !cardEl) return;

  let tours;
  try {
    tours = unwrapRoutesList(await fetchRoutes(API_URL, { cache: "no-store" }));
  } catch (apiErr) {
    console.error("Routes API fetch failed, falling back to local JSON:", apiErr);
    try {
      tours = unwrapRoutesList(await fetchRoutes(FALLBACK_URL));
    } catch (fallbackErr) {
      console.error("Routes fallback fetch failed:", fallbackErr);
      renderError(chipsEl, cardEl);
      return;
    }
  }

  renderRoutes(chipsEl, cardEl, tours);

  // Tab-lar kartları `tags` üzrə süzür; "All tours" süzgəci götürür.
  chipsEl.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-route-tab]");
    if (!tab || tab.classList.contains("is-active")) return;
    renderRoutes(chipsEl, cardEl, tours, tab.dataset.routeTab);
  });
  allEl?.addEventListener("click", (event) => {
    event.preventDefault();
    renderRoutes(chipsEl, cardEl, tours, "all");
  });

  // Dil dəyişəndə eyni data ilə yenidən çəkir, aktiv tab-ı saxlayır.
  onLangChange((lang) => {
    LANG = lang;
    renderRoutes(chipsEl, cardEl, tours, cardEl.dataset.activeTab);
  });
}

onReady(initRoutes);
