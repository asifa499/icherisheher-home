// Icherisheher Pass page — /pass/
// Pass datası (ad, qiymət, müddət) js/passes.js-in çəkdiyi GET /api/passes cavabından gəlir
// (API uğursuz olarsa orada data/passes.json fallback-ı işləyir). Bu modul həmin cavabı
// hero statistikasında və "What each pass opens" tab-larında istifadə edir; təkrar sorğu yoxdur.
import { getLang, onLangChange, t } from "./i18n.js";
import { imageUrl, onReady } from "./base-url.js";
import { picture } from "./picture.js";

const IMG = imageUrl("assets/img/");
const CURRENCY_SYMBOLS = { AZN: "₼" };
let LANG = getLang();

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pickText = (field) => (field && (field[LANG] || field.en)) || "";

// API pass-a muzey siyahısı vermir — tab etiketləri və siyahı dizayndan (Figma 3124:23263) götürülüb.
// Explorer/Premium siyahıları dizaynda göstərilməyib: hələlik Core ilə eyni 5 obyekt (Asifdən gözlənilir).
const TAB_META = {
  "core-pass": { count: 5, short: { en: "Core", az: "Əsas", ru: "Базовый" } },
  "explorer-pass": { count: 13, short: { en: "Explorer", az: "Kəşfiyyatçı", ru: "Исследователь" } },
  "premium-pass": { count: 17, short: { en: "Premium", az: "Premium", ru: "Премиум" } },
};
const HERO_MUSEUMS = 13;

const SITES = [
  { img: "pass-maiden-tower", type: { en: "Monument", az: "Abidə", ru: "Памятник" }, name: { en: "The Maiden Tower", az: "Qız Qalası", ru: "Девичья башня" } },
  { img: "pass-shirvanshah", type: { en: "Royal complex", az: "Kral kompleksi", ru: "Царский комплекс" }, name: { en: "Palace of the Shirvanshahs", az: "Şirvanşahlar Sarayı", ru: "Дворец Ширваншахов" } },
  { img: "pass-miniature", type: { en: "Art museum", az: "İncəsənət muzeyi", ru: "Художественный музей" }, name: { en: "Museum of Miniature Art", az: "Miniatür Sənət Muzeyi", ru: "Музей миниатюрного искусства" } },
  { img: "pass-market-square", type: { en: "Monument", az: "Abidə", ru: "Памятник" }, name: { en: "Market Square Excavations", az: "Bazar Meydanı Qazıntıları", ru: "Раскопки Базарной площади" } },
  { img: "pass-maiden-tower", type: { en: "Royal complex", az: "Kral kompleksi", ru: "Царский комплекс" }, name: { en: "Qala Archaeological & Ethnographic Complex", az: "Qala Arxeoloji və Etnoqrafik Kompleksi", ru: "Археолого-этнографический комплекс «Гала»" } },
];

let passes = [];
let activeSlug = null;

const sortedPasses = () => [...passes].sort((a, b) => a.sort_order - b.sort_order);

function renderStats() {
  const list = sortedPasses();
  if (!list.length) return;
  const cheapest = list.reduce((a, b) => (b.price < a.price ? b : a));
  const shortest = list.reduce((a, b) => (parseInt(b.duration, 10) < parseInt(a.duration, 10) ? b : a));
  const set = (key, text) => {
    const el = document.querySelector(`[data-pp-stat="${key}"]`);
    if (el) el.textContent = text;
  };
  set("museums", String(HERO_MUSEUMS));
  set("use", shortest.duration);
  set("from", `${cheapest.price} ${CURRENCY_SYMBOLS[cheapest.currency] || cheapest.currency}`);
}

function renderTabs() {
  const box = document.querySelector("[data-pp-tabs]");
  if (!box) return;
  box.innerHTML = sortedPasses().map((p) => {
    const meta = TAB_META[p.slug];
    const label = meta
      ? `${esc(meta.short[LANG] || meta.short.en)} · ${meta.count} ${esc(t("page.pass.museums"))}`
      : esc(pickText(p.name));
    const on = p.slug === activeSlug;
    return `<button class="pp-tab${on ? " is-active" : ""}" type="button" data-slug="${esc(p.slug)}" aria-pressed="${on}">${label}</button>`;
  }).join("");
}

function renderSites() {
  const box = document.querySelector("[data-pp-sites]");
  const more = document.querySelector("[data-pp-more]");
  if (!box) return;
  box.classList.remove("is-expanded");
  box.innerHTML = SITES.map((s) => `
    <article class="pp-site">
      <div class="pp-site__media">${picture(`${IMG}${s.img}.jpg`, `<img src="${IMG}${s.img}.jpg" alt="" width="80" height="80" loading="lazy" decoding="async">`)}</div>
      <div class="pp-site__body">
        <p class="pp-site__type">${esc(s.type[LANG] || s.type.en)}</p>
        <h3 class="pp-site__name">${esc(s.name[LANG] || s.name.en)}</h3>
      </div>
    </article>`).join("");
  if (more) more.hidden = SITES.length <= 3;
}

function renderAll() {
  if (!passes.length) return;
  if (!activeSlug || !passes.some((p) => p.slug === activeSlug)) {
    const featured = passes.find((p) => p.is_featured);
    activeSlug = (sortedPasses()[0] || featured).slug;
  }
  renderStats();
  renderTabs();
  renderSites();
}

function onPasses(list) {
  passes = list;
  renderAll();
}

function initFaq() {
  const list = document.querySelector("[data-pp-faq]");
  if (!list) return;
  list.addEventListener("click", (event) => {
    const btn = event.target.closest(".pp-qa__q");
    if (!btn) return;
    const item = btn.closest(".pp-qa");
    const open = !item.classList.contains("is-open");
    item.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
}

function init() {
  initFaq();

  const tabs = document.querySelector("[data-pp-tabs]");
  tabs?.addEventListener("click", (event) => {
    const btn = event.target.closest(".pp-tab");
    if (!btn || btn.dataset.slug === activeSlug) return;
    activeSlug = btn.dataset.slug;
    renderTabs();
    renderSites();
  });

  document.querySelector("[data-pp-more]")?.addEventListener("click", () => {
    document.querySelector("[data-pp-sites]")?.classList.add("is-expanded");
    document.querySelector("[data-pp-more]").hidden = true;
  });

  if (window.ICH && window.ICH.passes) onPasses(window.ICH.passes);
  document.addEventListener("ich:passes", (e) => onPasses(e.detail));
  onLangChange((lang) => {
    LANG = lang;
    renderAll();
  });
}

onReady(init);
