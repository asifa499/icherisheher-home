// Etap 4 — Ready-made routes
// Data-driven marşrut bloku: js/museums.js ilə eyni nümunə —
// əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/routes.json fallback-ı. /api/routes endpoint-i hələ
// yoxdur, ona görə hazırda praktiki olaraq həmişə fallback işləyir.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/routes";
const FALLBACK_URL = "data/routes.json";
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

function chipMarkup(route, isActive) {
  return `
    <button class="routes__chip${isActive ? " is-active" : ""}" type="button"
            data-route-slug="${escapeHtml(route.slug)}"
            aria-pressed="${isActive ? "true" : "false"}">
      ${escapeHtml(pickText(route.title))}
    </button>
  `;
}

function stopMarkup(stop, index) {
  return `
    <li class="routes-card__stop">
      <span class="routes-card__marker" aria-hidden="true">${index + 1}</span>
      <span class="routes-card__stop-text">
        <span class="routes-card__stop-name">${escapeHtml(pickText(stop.name))}</span>
        <span class="routes-card__stop-desc">${escapeHtml(pickText(stop.description))}</span>
      </span>
    </li>
  `;
}

function cardMarkup(route) {
  const title = pickText(route.title);
  const stops = [...route.stops].sort((a, b) => a.sort_order - b.sort_order);

  return `
    <div class="routes-card__media">
      <img class="routes-card__photo" src="${escapeHtml(route.image)}" alt="${escapeHtml(title)}"
           loading="lazy" width="464" height="352">
      <div class="routes-card__badges">
        <span class="routes-card__badge">
          <img src="assets/img/route-icon-clock.svg" alt="" width="16" height="16">
          ${escapeHtml(pickText(route.duration))}
        </span>
        <span class="routes-card__badge">
          <img src="assets/img/route-icon-distance.svg" alt="" width="20" height="20">
          ${escapeHtml(pickText(route.distance))}
        </span>
      </div>
    </div>
    <div class="routes-card__body">
      <ol class="routes-card__stops">
        ${stops.map(stopMarkup).join("")}
      </ol>
      <a class="routes-card__cta" href="${escapeHtml(route.pass_url || "#")}">
        <img src="assets/img/route-icon-pass.svg" alt="" width="20" height="20">
        Get a Pass
      </a>
    </div>
  `;
}

function renderRoutes(chipsEl, cardEl, routes, activeSlug) {
  const sorted = [...routes].sort((a, b) => a.sort_order - b.sort_order);
  const active = sorted.find((r) => r.slug === activeSlug) || sorted[0];

  chipsEl.innerHTML = sorted.map((r) => chipMarkup(r, r.slug === active.slug)).join("");
  cardEl.innerHTML = cardMarkup(active);
  cardEl.removeAttribute("data-state");
  cardEl.dataset.activeSlug = active.slug;
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
  return list;
}

async function initRoutes() {
  const chipsEl = document.querySelector("[data-routes-chips]");
  const cardEl = document.querySelector("[data-routes-card]");
  if (!chipsEl || !cardEl) return;

  let routes;
  try {
    routes = unwrapRoutesList(await fetchRoutes(API_URL, { cache: "no-store" }));
  } catch (apiErr) {
    console.error("Routes API fetch failed, falling back to local JSON:", apiErr);
    try {
      routes = unwrapRoutesList(await fetchRoutes(FALLBACK_URL));
    } catch (fallbackErr) {
      console.error("Routes fallback fetch failed:", fallbackErr);
      renderError(chipsEl, cardEl);
      return;
    }
  }

  renderRoutes(chipsEl, cardEl, routes);

  // Çiplər göstərilən marşrutu dəyişir. Figma-da bu keçid üçün
  // prototip/variant yoxdur (yalnız 1-ci marşrutun məzmunu çəkilib),
  // davranış dizaynın məntiqindən götürülüb.
  chipsEl.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-route-slug]");
    if (!chip || chip.classList.contains("is-active")) return;
    renderRoutes(chipsEl, cardEl, routes, chip.dataset.routeSlug);
  });
}

document.addEventListener("DOMContentLoaded", initRoutes);
