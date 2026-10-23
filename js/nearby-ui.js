// See What's Nearby — kiçik UI davranışları (2026-10-23 yeni dizayn):
// çip cərgəsinin sağ ox düyməsi (scroll) və xəritənin tam ekrana açılması.
// Çip/kart/xəritə sinxronu js/places.js-dədir, bura toxunmur.
import { onReady } from "./base-url.js";

function init() {
  const chips = document.querySelector(".nearby__chips");
  const fade = document.querySelector(".nearby__chips-fade");
  const next = document.querySelector("[data-chips-next]");
  if (chips && fade && next) {
    const update = () => {
      fade.hidden = chips.scrollLeft + chips.clientWidth >= chips.scrollWidth - 4;
    };
    next.addEventListener("click", () => {
      chips.scrollBy({ left: Math.max(240, chips.clientWidth * 0.6), behavior: "smooth" });
    });
    chips.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  const expand = document.querySelector("[data-nearby-expand]");
  const section = document.getElementById("nearby");
  if (expand && section && section.requestFullscreen) {
    expand.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else section.requestFullscreen();
    });
  } else if (expand) {
    expand.hidden = true;
  }
}

onReady(init);
