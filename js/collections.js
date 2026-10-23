// Icherisheher Digital Collections (2026-10-23, yeni Figma 40000068:5610)
// Data-driven: data/collections.json (backend endpoint hələ yoxdur — API_URL cəhd edilir,
// alınmasa/qeyri-uyğun olarsa local fallback). Tab-lar `tabs` massivi üzrə süzür.
import { getLang, onLangChange, t } from "./i18n.js";
import { siteUrl, imageUrl, onReady } from "./base-url.js";
import { picture } from "./picture.js";

const API_URL = "https://icherisheher-api-production.up.railway.app/api/collections";
const FALLBACK_URL = siteUrl("data/collections.json");
const IMG = imageUrl("assets/img/");
let LANG = getLang();

const TABS = [
  { key: "photo", label: "collections.tab.photo" },
  { key: "artworks", label: "collections.tab.artworks" },
];

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

function tabMarkup(tab, isActive) {
  return `
    <button class="collections__tab${isActive ? " is-active" : ""}" type="button"
            data-collections-tab="${tab.key}" aria-pressed="${isActive ? "true" : "false"}">
      ${escapeHtml(t(tab.label))}
    </button>
  `;
}

function cardMarkup(item) {
  const title = pickText(item.title);
  const src = imageUrl(item.image);
  const img = picture(src, `<img class="collections-card__photo" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" style="object-position:${escapeHtml(item.position || "50% 50%")}" loading="lazy" decoding="async" width="272" height="372">`);
  if (!title) {
    return `<article class="collections-card"><div class="collections-card__media">${img}</div></article>`;
  }
  return `
    <a class="collections-card collections-card--caption" href="${escapeHtml(item.link || "#")}">
      <div class="collections-card__media">${img}</div>
      <div class="collections-card__caption">
        <span class="collections-card__title">${escapeHtml(title)}<img src="${IMG}dcoll-icon-arrow.svg" alt="" width="16" height="16"></span>
        <span class="collections-card__desc">${escapeHtml(pickText(item.description))}</span>
      </div>
    </a>
  `;
}

function render(tabsEl, rowEl, items, activeTab = "photo") {
  const sorted = [...items].sort((a, b) => a.id - b.id);
  const visible = sorted.filter((x) => (x.tabs || []).includes(activeTab));
  tabsEl.querySelectorAll("[data-collections-tab]").forEach((el) => el.remove());
  tabsEl.insertAdjacentHTML("afterbegin", TABS.map((tab) => tabMarkup(tab, tab.key === activeTab)).join(""));
  rowEl.innerHTML = visible.map(cardMarkup).join("");
  rowEl.removeAttribute("data-state");
  rowEl.dataset.activeTab = activeTab;
  // Desktop: 2-ci kart başlıq xəttinə düşsün, 1-ci solda yarı görünsün (Figma 40000068:5610)
  const first = rowEl.firstElementChild;
  rowEl.scrollLeft = visible.length >= 5 && first && window.innerWidth > 768 ? first.offsetWidth + 16 : 0;
}

async function fetchList(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json && (json.data || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) throw new Error("Collections payload is empty");
  if (!list.every((x) => x && x.image && Array.isArray(x.tabs))) throw new Error("Collections payload shape not recognized");
  return list;
}

async function init() {
  const tabsEl = document.querySelector("[data-collections-tabs]");
  const rowEl = document.querySelector("[data-collections-row]");
  if (!tabsEl || !rowEl) return;

  let items;
  try {
    items = await fetchList(API_URL, { cache: "no-store" });
  } catch (apiErr) {
    try {
      items = await fetchList(FALLBACK_URL);
    } catch (fallbackErr) {
      console.error("Collections fetch failed:", fallbackErr);
      rowEl.setAttribute("data-state", "error");
      return;
    }
  }

  render(tabsEl, rowEl, items);
  tabsEl.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-collections-tab]");
    if (!tab || tab.classList.contains("is-active")) return;
    render(tabsEl, rowEl, items, tab.dataset.collectionsTab);
  });
  onLangChange((lang) => {
    LANG = lang;
    render(tabsEl, rowEl, items, rowEl.dataset.activeTab);
  });
}

onReady(init);
