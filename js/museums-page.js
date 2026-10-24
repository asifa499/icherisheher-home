// Museums page — /museums/
// Bütün data öz backend-imizdən: GET /api/museums (icherisheher-api, Railway).
// Sorğu uğursuz olarsa, data/museums.json-a (local) düşür; o da alınmasa boş vəziyyət.
import { getLang, onLangChange, t } from "./i18n.js";
import { siteUrl, imageUrl, onReady } from "./base-url.js";
import { picture } from "./picture.js";

const API_URL = "https://icherisheher-api-production.up.railway.app/api/museums";
const FALLBACK_URL = siteUrl("data/museums.json");
const IMG = imageUrl("assets/img/");
const MOBILE_INITIAL = 4;
let LANG = getLang();

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pickText = (field) => (field && (field[LANG] || field.en)) || "";

function cardMarkup(m) {
  const name = esc(pickText(m.name));
  const src = imageUrl(m.image);
  const rating = typeof m.rating === "number" ? m.rating.toFixed(1) : "";
  const badge = (inner) => `<span class="museums-card__badge">${inner}</span>`;
  return `
    <article class="mp-card" id="${esc(m.slug)}" data-id="${m.id}" data-slug="${esc(m.slug)}">
      <div class="mp-card__media">
        ${picture(src, `<img class="mp-card__photo" src="${esc(src)}" alt="${name}" loading="lazy" decoding="async" width="368" height="354">`)}
        <div class="mp-card__scrim" aria-hidden="true"></div>
        <div class="mp-card__overlay">
          <h3 class="mp-card__title">${name}</h3>
          <div class="mp-card__badges">
            ${m.working_hours ? badge(`<img src="${IMG}museum-icon-clock.svg" alt="" width="16" height="16">${esc(m.working_hours)}`) : ""}
            ${rating ? badge(`<span class="museums-card__google" aria-hidden="true"><img src="${IMG}museum-icon-google.svg" alt="" width="12" height="12"></span>${rating}<img class="museums-card__star" src="${IMG}museum-icon-star-gold.svg" alt="" width="14" height="14">`) : ""}
          </div>
        </div>
      </div>
      <div class="mp-card__body">
        <p class="mp-card__meta"><img src="${IMG}museum-icon-pin.svg" alt="" width="20" height="20">${esc(pickText(m.address))}</p>
        <p class="mp-card__meta"><img src="${IMG}museum-icon-money.svg" alt="" width="20" height="20">${esc(m.ticket_price)}</p>
        <a class="mp-card__cta" href="${esc(m.ticket_url || "#")}"><img src="${IMG}museum-icon-ticket-btn.svg" alt="" width="20" height="20">${t("museums.getTicket")}</a>
      </div>
    </article>`;
}

function storyMarkup(m, caption) {
  const name = esc(pickText(caption?.title) || pickText(m.name));
  const text = esc(pickText(caption?.text) || pickText(m.short_description));
  const src = imageUrl(m.image);
  return `
    <a class="mp-story" href="#${esc(m.slug)}" data-story-slug="${esc(m.slug)}">
      <span class="mp-story__media">
        ${picture(src, `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" width="272" height="195">`)}
      </span>
      <span class="mp-story__cap">
        <span class="mp-story__name">${name}</span>
        <span class="mp-story__desc">${text}</span>
      </span>
    </a>`;
}

// Hero şeridi: Home intro kollajı kimi sonsuz marquee — track iki dəfə təkrarlanır,
// translateX(-50%) görünməz tikişli dövr verir; hover/fokusda dayanır.
function renderStories(el, museums, captions) {
  const track = museums.map((m) => storyMarkup(m, captions[m.slug])).join("");
  el.innerHTML = `<div class="mp-stories__belt" style="--mp-count:${museums.length}"><div class="mp-stories__track">${track}</div><div class="mp-stories__track" aria-hidden="true">${track}</div></div>`;
  el.querySelectorAll(".mp-stories__track[aria-hidden] .mp-story").forEach((a) => a.setAttribute("tabindex", "-1"));
}

async function loadCaptions() {
  try {
    const res = await fetch(siteUrl("data/museums-stories.json"));
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

async function fetchList(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json && (json.data || json.museums || json.items)) || [];
  if (!Array.isArray(list) || !list.length) throw new Error("Museums payload is empty or in an unrecognized shape");
  return list;
}

async function loadMuseums() {
  try {
    return await fetchList(API_URL, { cache: "no-store" });
  } catch (apiErr) {
    console.error("Museums API fetch failed, falling back to local JSON:", apiErr);
    return fetchList(FALLBACK_URL);
  }
}

function init() {
  const grid = document.querySelector("[data-mp-grid]");
  const stories = document.querySelector("[data-mp-stories]");
  const more = document.querySelector("[data-mp-more]");
  if (!grid) return;
  const moreBtn = more.querySelector("[data-mp-show-more]");
  let museums = [];
  let captions = {};

  function render() {
    const sorted = [...museums].sort((a, b) => a.sort_order - b.sort_order);
    grid.innerHTML = sorted.map(cardMarkup).join("");
    grid.removeAttribute("data-state");
    renderStories(stories, sorted, captions);
    // "Show N more" yalnız mobildə (CSS), 4-dən çox muzey olanda
    const hidden = Math.max(0, sorted.length - MOBILE_INITIAL);
    more.hidden = hidden === 0;
    moreBtn.textContent = t("page.museums.showMore").replace("{n}", hidden);
    grid.classList.remove("is-expanded");
    more.classList.remove("is-expanded");
  }

  moreBtn.addEventListener("click", () => {
    grid.classList.add("is-expanded");
    more.classList.add("is-expanded");
  });
  more.querySelector("[data-mp-up]").addEventListener("click", () => {
    document.getElementById("museums-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  Promise.all([loadMuseums(), loadCaptions()]).then(([list, caps]) => {
    museums = list;
    captions = caps;
    render();
    onLangChange((lang) => { LANG = lang; render(); });
  }).catch((err) => {
    console.error("Museums fallback fetch failed:", err);
    grid.setAttribute("data-state", "error");
    grid.textContent = t("page.museums.empty");
  });
}

onReady(init);
