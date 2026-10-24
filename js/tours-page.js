// Tours page — /tours/
// Bütün data öz backend-imizdən: GET /api/routes (icherisheher-api, Railway).
// Sorğu uğursuz olarsa (və ya cavab köhnə sxemdədirsə), data/routes.json-a (local) düşür; o da alınmasa boş vəziyyət.
import { getLang, onLangChange, t } from "./i18n.js";
import { siteUrl, imageUrl, onReady } from "./base-url.js";
import { picture } from "./picture.js";

const API_URL = "https://icherisheher-api-production.up.railway.app/api/routes";
const FALLBACK_URL = siteUrl("data/routes.json");
const IMG = imageUrl("assets/img/");
let LANG = getLang();

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pickText = (field) => (field && (field[LANG] || field.en)) || "";

const TYPE_ICON = { restaurant: "route-icon-restaurant.svg", museums: "route-icon-castle.svg", walk: "route-icon-walk.svg" };

// Süzgəc çipləri → kartın `type` və ya `tags` dəyərləri (hər çip bir neçə açara uyğun ola bilər).
const FILTERS = [
  { key: "all", label: "page.tours.filter.all", match: null },
  { key: "historical", label: "page.tours.filter.historical", match: ["historical", "museums"] },
  { key: "walk", label: "page.tours.filter.walk", match: ["walk"] },
  { key: "thematic", label: "page.tours.filter.thematic", match: ["thematic"] },
  { key: "restaurant", label: "page.tours.filter.restaurant", match: ["restaurant"] },
  { key: "food", label: "page.tours.filter.food", match: ["food", "restaurant"] },
];

function matchesFilter(tour, filter) {
  if (!filter.match) return true;
  const keys = [tour.type, tour.mode, ...(tour.tags || [])];
  return filter.match.some((k) => keys.includes(k));
}

function cardMarkup(tour) {
  const title = esc(pickText(tour.title));
  const src = imageUrl(tour.image);
  const rating = typeof tour.rating === "number" ? tour.rating.toFixed(1) : "";
  const badge = (inner) => `<span class="museums-card__badge">${inner}</span>`;
  return `
    <article class="mp-card tp-card" data-slug="${esc(tour.slug)}">
      <div class="mp-card__media">
        ${picture(src, `<img class="mp-card__photo" src="${esc(src)}" alt="${title}" loading="lazy" decoding="async" width="368" height="354">`)}
        <div class="mp-card__scrim" aria-hidden="true"></div>
        <div class="mp-card__overlay">
          <h3 class="mp-card__title"${tour.title_width ? ` style="max-width:${Number(tour.title_width)}px"` : ""}>${title}</h3>
          <div class="mp-card__badges">
            ${tour.type ? badge(`<img src="${IMG}${TYPE_ICON[tour.type] || TYPE_ICON.walk}" alt="" width="16" height="16">${esc(t("routes.type." + tour.type))}`) : ""}
            ${tour.working_hours ? badge(`<img src="${IMG}museum-icon-clock.svg" alt="" width="16" height="16">${esc(tour.working_hours)}`) : ""}
            ${rating ? badge(`<img src="${IMG}museum-icon-star.svg" alt="" width="16" height="16">${rating}`) : ""}
          </div>
        </div>
      </div>
      <div class="mp-card__body">
        <p class="mp-card__meta"><img src="${IMG}museum-icon-pin.svg" alt="" width="20" height="20">${esc(pickText(tour.address))}</p>
        <p class="mp-card__meta"><img src="${IMG}museum-icon-money.svg" alt="" width="20" height="20">${esc(pickText(tour.price))}</p>
        <a class="mp-card__cta" href="${esc(tour.book_url || "#")}"><img src="${IMG}museum-icon-ticket-btn.svg" alt="" width="20" height="20">${esc(t("museums.getTicket"))}</a>
      </div>
    </article>`;
}

function storyMarkup(tour) {
  const name = esc(pickText(tour.title));
  const text = esc(pickText(tour.short_description));
  const src = imageUrl(tour.image);
  return `
    <a class="mp-story" href="#${esc(tour.slug)}" data-story-slug="${esc(tour.slug)}">
      <span class="mp-story__media">
        ${picture(src, `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" width="272" height="195">`)}
      </span>
      <span class="mp-story__cap">
        <span class="mp-story__name">${name}</span>
        <span class="mp-story__desc">${text}</span>
      </span>
    </a>`;
}

// Hero şeridi: museums səhifəsindəki kimi sonsuz marquee (track iki dəfə təkrarlanır).
function renderStories(el, tours) {
  const track = tours.map(storyMarkup).join("");
  el.innerHTML = `<div class="mp-stories__belt" style="--mp-count:${tours.length}"><div class="mp-stories__track">${track}</div><div class="mp-stories__track" aria-hidden="true">${track}</div></div>`;
  el.querySelectorAll(".mp-stories__track[aria-hidden] .mp-story").forEach((a) => a.setAttribute("tabindex", "-1"));
}

async function fetchList(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json && (json.data || json.routes || json.items)) || [];
  if (!Array.isArray(list) || !list.length) throw new Error("Routes payload is empty or in an unrecognized shape");
  // Köhnə sxem (type/mode/address olmayan) fallback-a düşür — js/routes.js ilə eyni qayda.
  if (!list.every((x) => x && x.type && x.mode && x.address)) throw new Error("Routes payload uses the legacy schema");
  return list;
}

async function loadTours() {
  try {
    return await fetchList(API_URL, { cache: "no-store" });
  } catch (apiErr) {
    console.error("Routes API fetch failed, falling back to local JSON:", apiErr);
    return fetchList(FALLBACK_URL);
  }
}

function initForm() {
  // Forma hələ heç yerə göndərmir — yalnız çiplərin seçim vəziyyəti dəyişir.
  document.querySelectorAll("[data-tp-single], [data-tp-multi]").forEach((group) => {
    const single = group.hasAttribute("data-tp-single");
    group.addEventListener("click", (event) => {
      const pill = event.target.closest(".tp-pill");
      if (!pill) return;
      const on = single ? true : !pill.classList.contains("is-active");
      if (single) group.querySelectorAll(".tp-pill").forEach((p) => { p.classList.remove("is-active"); p.setAttribute("aria-pressed", "false"); });
      pill.classList.toggle("is-active", on);
      pill.setAttribute("aria-pressed", String(on));
    });
  });
}

function init() {
  initForm();
  const grid = document.querySelector("[data-tp-grid]");
  const chips = document.querySelector("[data-tp-chips]");
  const stories = document.querySelector("[data-tp-stories]");
  if (!grid || !chips) return;
  let tours = [];
  let active = "all";

  function render() {
    const sorted = [...tours].sort((a, b) => a.sort_order - b.sort_order);
    const filter = FILTERS.find((f) => f.key === active) || FILTERS[0];
    const visible = sorted.filter((x) => matchesFilter(x, filter));
    chips.innerHTML = FILTERS.map((f) => `<button class="tp-chip${f.key === active ? " is-active" : ""}" type="button" data-tp-filter="${f.key}" aria-pressed="${f.key === active}">${esc(t(f.label))}</button>`).join("");
    if (visible.length) {
      grid.innerHTML = visible.map(cardMarkup).join("");
      grid.removeAttribute("data-state");
    } else {
      grid.innerHTML = esc(t("page.tours.emptyCategory"));
      grid.setAttribute("data-state", "empty");
    }
    if (stories) renderStories(stories, sorted);
  }

  chips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-tp-filter]");
    if (!chip || chip.dataset.tpFilter === active) return;
    active = chip.dataset.tpFilter;
    render();
  });

  loadTours().then((list) => {
    tours = list;
    render();
    onLangChange((lang) => { LANG = lang; render(); });
  }).catch((err) => {
    console.error("Routes fallback fetch failed:", err);
    grid.setAttribute("data-state", "error");
    grid.textContent = t("page.tours.empty");
  });
}

onReady(init);
