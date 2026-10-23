// [data-scroll-to="<section-id>"] — düymə/link klikləndə həmin bölməyə hamar sürüşdürür.
// Hədəf səhifədə yoxdursa (məs. daxili səhifədən "Download App"), link-in öz href-ini izləyir
// (partial-larda href="{{BASE}}#<id>" yazılır). URL hash-i dəyişmir (places.js hash sinxronuna toxunmasın).
import { onReady } from "./base-url.js";

function init() {
  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-scroll-to]");
    if (!el) return;
    const target = document.getElementById(el.dataset.scrollTo);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

onReady(init);
