// Burger menyu overlay (Figma web: 1627:4777, mobil: 1638:7180) — açma/bağlama
// + mobil accordion sətirlərinin açılıb-bağlanması. Dil seçici (data-lang) artıq
// lang.js tərəfindən ayrıca idarə olunur, panel daxilindəki nüsxə də ordan tutulur.
// Markup partials/header.html-dədir — js/include.js inject edənə qədər gözlənilir.
import { includesReady } from "./base-url.js";

function wireNavMenu(root) {
  const trigger = document.querySelector("[data-nav-menu-trigger]");
  const closers = root.querySelectorAll("[data-nav-menu-close]");
  if (!trigger) return;

  function onKeydown(event) {
    if (event.key === "Escape") close();
  }

  function open() {
    root.hidden = false;
    document.body.style.overflow = "hidden";
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    root.hidden = true;
    document.body.style.overflow = "";
    trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKeydown);
  }

  trigger.addEventListener("click", open);
  closers.forEach((el) => el.addEventListener("click", close));

  root.querySelectorAll("[data-accordion-trigger]").forEach((row) => {
    const panel = row.nextElementSibling;
    if (!panel) return;
    row.addEventListener("click", () => {
      const isOpen = row.getAttribute("aria-expanded") === "true";
      row.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
}

await includesReady;
document.querySelectorAll("[data-nav-menu]").forEach(wireNavMenu);
