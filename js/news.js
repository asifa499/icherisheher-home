// Etap 6 — Resources
// Data-driven məqalə bloku: museums.js / routes.js / events.js ilə eyni nümunə —
// əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/news.json fallback-ı.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/news";
const FALLBACK_URL = "data/news.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

// Figma-da kart yalnız şəkil + ağ başlıqdan ibarətdir; excerpt və
// published_date data sxemində saxlanılır (API və detal səhifəsi üçün),
// amma kartda göstərilmir — dizaynda belə element yoxdur.
function cardMarkup(item) {
  const title = pickText(item.title);
  const href = item.url || `#${escapeHtml(item.slug || "")}`;
  // image_position — Figma-dakı kadrın fokusu (məs. panoram şəkildə
  // qülləni kadrda saxlamaq üçün). Yoxdursa mərkəz işlənir.
  const position = item.image_position
    ? ` style="object-position: ${escapeHtml(item.image_position)}"`
    : "";

  return `
    <a class="resource-card" href="${href}">
      <span class="resource-card__media">
        <img class="resource-card__photo" src="${escapeHtml(item.image || "")}"
             alt="${escapeHtml(title)}" loading="lazy" width="212" height="280"${position}>
        <span class="resource-card__tint" aria-hidden="true"></span>
        <span class="resource-card__scrim" aria-hidden="true"></span>
        <span class="resource-card__title">${escapeHtml(title)}</span>
      </span>
    </a>
  `;
}

function renderTrack(trackEl, items) {
  if (!items.length) {
    trackEl.innerHTML = "";
    trackEl.setAttribute("data-state", "empty");
    return;
  }
  trackEl.innerHTML = items.map(cardMarkup).join("");
  trackEl.removeAttribute("data-state");
}

function renderError(trackEl) {
  trackEl.innerHTML = "";
  trackEl.setAttribute("data-state", "error");
}

function itemsOfType(items, type) {
  return items
    .filter((item) => item.type === type)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

// Tablar HTML-də statikdir (data gəlməsə də görünməlidirlər);
// burada yalnız seçim vəziyyəti və siyahının yenilənməsi idarə olunur.
function initTabs(tabsEl, trackEl, items) {
  const tabs = [...tabsEl.querySelectorAll("[data-resources-tab]")];

  function select(tab) {
    tabs.forEach((el) => {
      const active = el === tab;
      el.setAttribute("aria-selected", active ? "true" : "false");
      el.tabIndex = active ? 0 : -1;
    });
    if (tab.id) trackEl.setAttribute("aria-labelledby", tab.id);
    renderTrack(trackEl, itemsOfType(items, tab.dataset.resourcesTab));
    trackEl.scrollLeft = 0;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab));
  });

  // Klaviatura ilə tablar arasında keçid (WAI-ARIA tablist davranışı).
  tabsEl.addEventListener("keydown", (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const current = tabs.findIndex((el) => el.getAttribute("aria-selected") === "true");
    const next = tabs[(current + step + tabs.length) % tabs.length];
    next.focus();
    select(next);
    event.preventDefault();
  });

  const initial = tabs.find((el) => el.getAttribute("aria-selected") === "true") || tabs[0];
  if (initial) select(initial);
}

async function fetchNews(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// API cavabı bare array və ya wrapper object ola bilər
// (məs. { count, data: [...] }) — digər modullarla eyni davranış.
function unwrapNewsList(json) {
  const list = Array.isArray(json) ? json : (json && (json.data || json.news || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("News payload is empty or in an unrecognized shape");
  }
  return list;
}

async function initNews() {
  const trackEl = document.querySelector("[data-resources-track]");
  const tabsEl = document.querySelector("[data-resources-tabs]");
  if (!trackEl || !tabsEl) return;

  let items;
  try {
    items = unwrapNewsList(await fetchNews(API_URL, { cache: "no-store" }));
  } catch (apiErr) {
    console.error("News API fetch failed, falling back to local JSON:", apiErr);
    try {
      items = unwrapNewsList(await fetchNews(FALLBACK_URL));
    } catch (fallbackErr) {
      console.error("News fallback fetch failed:", fallbackErr);
      renderError(trackEl);
      return;
    }
  }

  initTabs(tabsEl, trackEl, items);
}

document.addEventListener("DOMContentLoaded", initNews);
