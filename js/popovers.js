// [data-popover-trigger="<id>"] — düymə klikləndə həmin id-li panel açılır/bağlanır.
// Eyni anda yalnız biri açıq; kənara klik və Escape bağlayır. (Hero "+4" və intro "Explore now".)
import { onReady } from "./base-url.js";

function init() {
  const triggers = [...document.querySelectorAll("[data-popover-trigger]")];
  if (!triggers.length) return;

  const panelOf = (trigger) => document.getElementById(trigger.dataset.popoverTrigger);

  function close(trigger) {
    const panel = panelOf(trigger);
    if (panel) panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }
  function closeAll(except) {
    triggers.forEach((t) => { if (t !== except) close(t); });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const panel = panelOf(trigger);
      if (!panel) return;
      const willOpen = panel.hidden;
      closeAll(trigger);
      panel.hidden = !willOpen;
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", (event) => {
    triggers.forEach((trigger) => {
      const panel = panelOf(trigger);
      if (panel && !panel.hidden && !panel.contains(event.target)) close(trigger);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = triggers.find((t) => { const p = panelOf(t); return p && !p.hidden; });
    if (open) { close(open); open.focus(); }
  });
}

onReady(init);
