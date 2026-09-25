// Etap 8 — One QR. The whole Old City (City Pass)
// Data-driven kart render: öz backend-imizdən (icherisheher-api, Railway) çəkilir.
// API sorğusu uğursuz olarsa (server yatıb, CORS və s.), avtomatik olaraq
// local data/passes.json fallback-ına keçilir — səhifə heç vaxt boş qalmır.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/passes";
const FALLBACK_URL = "data/passes.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

// Backend "/adult" kimi bir vahid etiketi qaytarmır (bu, məzmun sahəsi deyil,
// sabit UI şəkilçisidir) — ona görə client tərəfdə saxlanılır, museums.js-dəki
// "ticket_price" kimi plain string sahələr üçün də eyni yanaşma tətbiq olunub.
const CURRENCY_SYMBOLS = { AZN: "₼" };
const PRICE_UNIT = { az: "/nəfər", en: "/adult", ru: "/чел." };

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function featureMarkup(feature) {
  const icon = feature.included
    ? `<img class="pass-card__feature-icon" src="assets/img/citypass-icon-check.svg" alt="" width="20" height="20">`
    : `<img class="pass-card__feature-icon" src="assets/img/citypass-icon-cross.svg" alt="" width="20" height="20">`;
  const state = feature.included ? "included" : "excluded";
  return `
    <li class="pass-card__feature" data-state="${state}">
      ${icon}
      <span>${pickText(feature.label)}</span>
    </li>
  `;
}

function passCardMarkup(pass) {
  const name = pickText(pass.name);
  const description = pickText(pass.description);
  const symbol = CURRENCY_SYMBOLS[pass.currency] || pass.currency;
  const unit = PRICE_UNIT[LANG] || PRICE_UNIT.en;
  const featured = pass.is_featured ? " pass-card--featured" : "";

  return `
    <article class="pass-card${featured}" data-id="${pass.id}" data-slug="${pass.slug}">
      <div class="pass-card__head">
        <div class="pass-card__name-row">
          <h3 class="pass-card__name">${name}</h3>
          <span class="pass-card__duration">${pass.duration}</span>
        </div>
        <p class="pass-card__tagline">${description}</p>
      </div>
      <p class="pass-card__price">
        <span class="pass-card__price-value">${symbol} ${pass.price}</span>
        <span class="pass-card__price-unit">${unit}</span>
      </p>
      <ul class="pass-card__features">
        ${pass.features.map(featureMarkup).join("")}
      </ul>
      <a class="pass-card__buy" href="${pass.buy_url}">
        <img src="assets/img/museum-icon-ticket-btn.svg" alt="" width="20" height="20">Buy ${name}
      </a>
    </article>
  `;
}

function renderPasses(row, passes) {
  const sorted = [...passes].sort((a, b) => a.sort_order - b.sort_order);
  row.innerHTML = sorted.map(passCardMarkup).join("");
  row.removeAttribute("data-state");

  const featured = row.querySelector(".pass-card--featured");
  if (featured) featured.scrollIntoView({ block: "nearest", inline: "center" });
}

function renderFallback(row) {
  row.setAttribute("data-state", "error");
  row.innerHTML = "";
}

async function fetchPasses(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// API cavabı bəzən bare array deyil, wrapper object ola bilər
// (məs. { count, data: [...] }). Hər iki formatı dəstəklə; siyahı
// boş çıxarsa uğursuz sorğu kimi rəftar et ki, fallback işə düşsün.
function unwrapPassesList(json) {
  const list = Array.isArray(json) ? json : (json && (json.data || json.passes || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Passes payload is empty or in an unrecognized shape");
  }
  return list;
}

async function initPasses() {
  const row = document.querySelector("[data-passes-row]");
  if (!row) return;

  try {
    const json = await fetchPasses(API_URL, { cache: "no-store" });
    const passes = unwrapPassesList(json);
    renderPasses(row, passes);
  } catch (apiErr) {
    console.error("Passes API fetch failed, falling back to local JSON:", apiErr);
    try {
      const json = await fetchPasses(FALLBACK_URL);
      const passes = unwrapPassesList(json);
      renderPasses(row, passes);
    } catch (fallbackErr) {
      console.error("Passes fallback fetch failed:", fallbackErr);
      renderFallback(row);
    }
  }
}

document.addEventListener("DOMContentLoaded", initPasses);
