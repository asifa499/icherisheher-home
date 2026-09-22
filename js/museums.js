// Etap 3 — Museums of Icherisheher & Gala
// Data-driven kart render: hazırda data/museums.json (local mock) istifadə olunur.
// Etap 3b-də API_URL öz backend-imizə (icherisheher-api, Railway) yönləndiriləcək;
// fetch uğursuz olarsa local JSON fallback qalacaq.

// TODO(Etap 3b): will be switched to our own icherisheher-api on Railway
// (https://icherisheher-api-production.up.railway.app).
const API_URL = "data/museums.json";
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

async function initMuseums() {
  const row = document.querySelector("[data-museums-row]");
  if (!row) return;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const museums = await res.json();
    renderMuseums(row, museums);
  } catch (err) {
    console.error("Museums fetch failed:", err);
    renderFallback(row);
  }
}

document.addEventListener("DOMContentLoaded", initMuseums);
