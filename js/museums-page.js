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
    <article class="mp-card" data-id="${m.id}" data-slug="${esc(m.slug)}">
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

function storyMarkup(m, i) {
  const name = esc(pickText(m.name));
  const src = imageUrl(m.image);
  return `
    <button class="mp-story${i === 0 ? " is-active" : ""}" type="button" data-story="${i}" aria-pressed="${i === 0}" aria-label="${name}">
      <span class="mp-story__media">
        ${picture(src, `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" width="272" height="195">`)}
      </span>
      <span class="mp-story__cap">
        <span class="mp-story__name">${name}</span>
        <span class="mp-story__desc">${esc(pickText(m.short_description))}</span>
      </span>
    </button>`;
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

  function render() {
    const sorted = [...museums].sort((a, b) => a.sort_order - b.sort_order);
    grid.innerHTML = sorted.map(cardMarkup).join("");
    grid.removeAttribute("data-state");
    const active = stories.querySelector(".is-active")?.dataset.story || 0;
    stories.innerHTML = sorted.map(storyMarkup).join("");
    stories.querySelectorAll(".mp-story").forEach((el, i) => {
      el.classList.toggle("is-active", i === Number(active));
      el.setAttribute("aria-pressed", String(i === Number(active)));
    });
    // "Show N more" yalnız mobildə (CSS), 4-dən çox muzey olanda
    const hidden = Math.max(0, sorted.length - MOBILE_INITIAL);
    more.hidden = hidden === 0;
    moreBtn.textContent = t("page.museums.showMore").replace("{n}", hidden);
    grid.classList.remove("is-expanded");
    more.classList.remove("is-expanded");
  }

  stories.addEventListener("click", (e) => {
    const btn = e.target.closest(".mp-story");
    if (!btn) return;
    stories.querySelectorAll(".mp-story").forEach((el) => {
      const on = el === btn;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-pressed", String(on));
    });
  });
  moreBtn.addEventListener("click", () => {
    grid.classList.add("is-expanded");
    more.classList.add("is-expanded");
  });
  more.querySelector("[data-mp-up]").addEventListener("click", () => {
    document.getElementById("museums-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  loadMuseums().then((list) => {
    museums = list;
    render();
    onLangChange((lang) => { LANG = lang; render(); });
  }).catch((err) => {
    console.error("Museums fallback fetch failed:", err);
    grid.setAttribute("data-state", "error");
    grid.textContent = t("page.museums.empty");
  });
}

onReady(init);
