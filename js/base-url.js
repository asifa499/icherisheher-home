// URL/path strategiyası (bax CLAUDE.md, "Yeni səhifə necə yaradılır").
// Sayt GitHub Pages "project site" kimi alt-qovluqda yaşayır
// (https://asifa499.github.io/icherisheher-home/), lokal serverdə isə kökdə (/).
// Ona görə BASE_URL hardcode edilmir — bu modulun öz URL-indən (js/ qovluğunun
// valideyni = saytın kökü) hesablanır: GH Pages-də "/icherisheher-home/",
// lokal-da "/". js/include.js (klassik skript) eyni dəyəri öz src-sindən
// hesablayıb `window.ICH.BASE_URL`-ə yazır — ikisi eyni qaydaya əsaslanır.
//
// Qayda: JS-lə yaradılan HƏR lokal yol (data/*.json, assets/img/*, daxili
// səhifə linkləri) `siteUrl()`-dən keçir ki, /museums/ kimi iç-içə səhifələrdə
// də düzgün açılsın. Mütləq URL-lər (https:, data:, mailto:, "/...", "#...")
// toxunulmadan qaytarılır.
export const BASE_URL = new URL("../", import.meta.url).pathname;

const ABSOLUTE = /^(?:[a-z][a-z\d+.-]*:|\/|#)/i;

export function siteUrl(path = "") {
  if (!path || ABSOLUTE.test(path)) return path;
  return BASE_URL + String(path).replace(/^\.?\//, "");
}

// Partial-lar (js/include.js) başlıq/footer-i inject edənə qədər gözləyir.
// include.js yüklənməyibsə (məs. köhnə səhifə) dərhal həll olunur.
export const includesReady = (window.ICH && window.ICH.includesReady) || Promise.resolve();

// Modul skriptləri (type="module") DOM tam parse olunduqdan sonra işləyir, amma
// top-level await-dən sonra DOMContentLoaded artıq keçmiş ola bilər — ona görə
// `document.addEventListener("DOMContentLoaded", fn)` əvəzinə bu işlədilir.
export function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}
