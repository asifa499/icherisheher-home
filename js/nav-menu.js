// Burger menyu + axtarış overlay (Figma web: 1627:4777 / 1641:10403, mobil:
// 3047:13848 / 3047:14878 / 3047:14211) — açma/bağlama
// + mobil accordion sətirlərinin açılıb-bağlanması. Dil seçici (data-lang) artıq
// lang.js tərəfindən ayrıca idarə olunur, panel daxilindəki nüsxə də ordan tutulur.
// Markup partials/header.html-dədir — js/include.js inject edənə qədər gözlənilir.
import { includesReady } from "./base-url.js";
import { t } from "./i18n.js";

// İki rejim: "menu" (burger düyməsi) və "search" (hero nav-dakı və ya panel
// daxilindəki axtarış düyməsi — Figma web 1641:10403, mobil 3047:14211).
// Rejim overlay-in data-mode atributundadır, nə görünəcəyini CSS həll edir.
function wireNavMenu(root) {
  const menuTrigger = document.querySelector("[data-nav-menu-trigger]");
  const searchTriggers = document.querySelectorAll("[data-nav-search-trigger]");
  const closers = root.querySelectorAll("[data-nav-menu-close]");
  const panel = root.querySelector('[role="dialog"]');
  const searchInput = root.querySelector("[data-nav-search-input]");
  const searchForm = root.querySelector("[data-nav-search-form]");
  const panelClose = root.querySelector(".nav-menu__actions [data-nav-menu-close]");
  if (!menuTrigger) return;

  let opener = null;

  function onKeydown(event) {
    if (event.key === "Escape") close();
  }

  function setMode(mode) {
    root.dataset.mode = mode;
    if (panel) panel.setAttribute("aria-label", t(mode === "search" ? "aria.search" : "aria.menu"));
    if (panelClose) panelClose.setAttribute("aria-label", t(mode === "search" ? "aria.closeSearch" : "aria.closeMenu"));
    if (mode === "search" && searchInput) {
      // Panel görünən olduqdan sonra fokus — yoxsa mobil Safari klaviaturanı açmır
      requestAnimationFrame(() => searchInput.focus());
    }
  }

  function open(mode, trigger) {
    opener = trigger;
    setMode(mode);
    root.hidden = false;
    document.body.style.overflow = "hidden";
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    if (root.hidden) return;
    root.hidden = true;
    document.body.style.overflow = "";
    if (opener) {
      opener.setAttribute("aria-expanded", "false");
      opener.focus();
    }
    opener = null;
    document.removeEventListener("keydown", onKeydown);
  }

  menuTrigger.addEventListener("click", () => open("menu", menuTrigger));
  searchTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Paneldəki axtarış düyməsi: overlay artıq açıqdır, sadəcə rejim dəyişir
      if (!root.hidden) setMode("search");
      else open("search", btn);
    });
  });
  closers.forEach((el) => el.addEventListener("click", close));

  // Axtarış hələ backend-ə bağlı deyil (nəticə səhifəsi yoxdur) — forma
  // səhifəni yeniləməsin.
  if (searchForm) searchForm.addEventListener("submit", (event) => event.preventDefault());

  root.querySelectorAll("[data-accordion-trigger]").forEach((row) => {
    const panelEl = row.nextElementSibling;
    if (!panelEl) return;
    row.addEventListener("click", () => {
      const isOpen = row.getAttribute("aria-expanded") === "true";
      row.setAttribute("aria-expanded", String(!isOpen));
      panelEl.hidden = isOpen;
      row.parentElement.classList.toggle("is-open", !isOpen);
    });
  });
}

await includesReady;
document.querySelectorAll("[data-nav-menu]").forEach(wireNavMenu);
