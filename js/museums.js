// Etap 3 — Museums of Icherisheher & Gala
// Data-driven kart render: öz backend-imizdən (icherisheher-api, Railway) çəkilir.
// API sorğusu uğursuz olarsa (server yatıb, CORS və s.), avtomatik olaraq
// local data/museums.json fallback-ına keçilir — səhifə heç vaxt boş qalmır.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/museums";
const FALLBACK_URL = "data/museums.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function museumCardMarkup(museum) {
  const name = pickText(museum.name);
  const desc = pickText(museum.short_description);
  const address = pickText(museum.address);

  return `
    <article class="museums-card" data-id="${museum.id}" data-slug="${museum.slug}">
      <div class="museums-card__media">
        <img class="museums-card__photo" src="${museum.image}" alt="${name}" loading="lazy" width="368" height="354">
        <div class="museums-card__scrim" aria-hidden="true"></div>
        <div class="museums-card__overlay">
          <h3 class="museums-card__title">${name}</h3>
          <div class="museums-card__badges">
            <span class="museums-card__badge">
              <img src="assets/img/museum-icon-clock.svg" alt="" width="16" height="16">
              ${museum.working_hours}
            </span>
            <span class="museums-card__badge">
              <img src="assets/img/museum-icon-star.svg" alt="" width="16" height="16">
              ${museum.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div class="museums-card__body">
        <p class="museums-card__desc">${desc}</p>
        <p class="museums-card__meta">
          <img src="assets/img/museum-icon-pin.svg" alt="" width="20" height="20">
          ${address}
        </p>
        <p class="museums-card__meta">
          <img src="assets/img/museum-icon-ticket.svg" alt="" width="20" height="20">
          ${museum.ticket_price}
        </p>
        <a class="museums-card__cta" href="${museum.ticket_url}">
          <img src="assets/img/museum-icon-ticket-btn.svg" alt="" width="20" height="20">
          Get a ticket
        </a>
      </div>
    </article>
  `;
}

function renderMuseums(row, museums) {
  const sorted = [...museums].sort((a, b) => a.sort_order - b.sort_order);
  row.innerHTML = sorted.map(museumCardMarkup).join("");
  row.removeAttribute("data-state");
}

function renderFallback(row) {
  row.setAttribute("data-state", "error");
  row.innerHTML = "";
}

async function fetchMuseums(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function initMuseums() {
  const row = document.querySelector("[data-museums-row]");
  if (!row) return;

  try {
    const museums = await fetchMuseums(API_URL);
    renderMuseums(row, museums);
  } catch (apiErr) {
    console.error("Museums API fetch failed, falling back to local JSON:", apiErr);
    try {
      const museums = await fetchMuseums(FALLBACK_URL);
      renderMuseums(row, museums);
    } catch (fallbackErr) {
      console.error("Museums fallback fetch failed:", fallbackErr);
      renderFallback(row);
    }
  }
}

document.addEventListener("DOMContentLoaded", initMuseums);
