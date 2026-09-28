// Partial include (header/footer) — build addımı olmadan.
// KLASSİK skriptdir (type="module" DEYİL) və <head>-də, CSS-dən sonra, defer/async
// OLMADAN yüklənməlidir: beləcə partial sorğuları HTML parse olunmamışdan
// əvvəl başlayır və səhifə partial-lar yerləşənə qədər gizli qalır (layout
// flash yoxdur — ilk görünən kadr artıq tam başlıq/footer-lidir).
//
// İstifadə:
//   <div data-include="header"></div>   → partials/header.html ilə ƏVƏZ olunur
//   <div data-include="footer"></div>   → partials/footer.html ilə ƏVƏZ olunur
// Placeholder elementin özü silinir (wrapper qalmır), ona görə DOM partial-ın
// əvvəl birbaşa səhifədə yazıldığı hal ilə eynidir.
//
// Partial daxilində:
//   {{BASE}}           → BASE_URL ilə əvəz olunur (bax js/base-url.js)
//   data-include-portal → bu top-level element placeholder yerinə <body>-nin
//                        sonuna əlavə olunur (tam-ekran overlay-lər üçün, məs.
//                        burger menyu — .hero-nun `isolation`/`overflow`
//                        kontekstindən çıxsın deyə).
//
// window.ICH.includesReady — inject bitəndə həll olunan Promise. DOM-dakı
// partial məzmununa toxunan modullar (i18n.js, lang.js, nav-menu.js,
// config.js) onu gözləyir (js/base-url.js → includesReady).
(function () {
  var script = document.currentScript;
  var BASE_URL = new URL("../", script.src).pathname;
  var PRELOAD = ["header", "footer"]; // hər səhifədə var — parse-dan əvvəl çəkilir
  var CLOAK_TIMEOUT_MS = 3000; // şəbəkə ilişsə belə səhifə gizli qalmasın

  var ICH = (window.ICH = window.ICH || {});
  ICH.BASE_URL = BASE_URL;

  var root = document.documentElement;
  root.classList.add("is-including");
  var cloak = document.createElement("style");
  cloak.textContent = "html.is-including body{visibility:hidden}";
  document.head.appendChild(cloak);

  var cache = {};
  function load(name) {
    if (!cache[name]) {
      cache[name] = fetch(BASE_URL + "partials/" + name + ".html")
        .then(function (res) {
          if (!res.ok) throw new Error(res.status + " " + res.url);
          return res.text();
        })
        .then(function (html) { return html.split("{{BASE}}").join(BASE_URL); });
    }
    return cache[name];
  }
  PRELOAD.forEach(load);

  function reveal() {
    root.classList.remove("is-including");
  }
  var cloakTimer = setTimeout(reveal, CLOAK_TIMEOUT_MS);

  function inject(placeholder, html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = html;
    Array.prototype.slice.call(tpl.content.children).forEach(function (el) {
      if (el.hasAttribute("data-include-portal")) {
        el.removeAttribute("data-include-portal");
        document.body.appendChild(el);
      }
    });
    placeholder.replaceWith(tpl.content);
  }

  function run() {
    var placeholders = Array.prototype.slice.call(document.querySelectorAll("[data-include]"));
    return Promise.all(placeholders.map(function (el) {
      var name = el.getAttribute("data-include");
      return load(name)
        .then(function (html) { inject(el, html); })
        .catch(function (err) {
          el.remove();
          console.error("include.js: partial \"" + name + "\" yüklənmədi", err);
        });
    }));
  }

  // "interactive" = HTML tam parse olunub, amma modul/defer skriptləri HƏLƏ
  // işləməyib — placeholder-lər artıq DOM-dadır.
  var domParsed = new Promise(function (resolve) {
    if (document.readyState !== "loading") return resolve();
    document.addEventListener("readystatechange", function onState() {
      if (document.readyState === "loading") return;
      document.removeEventListener("readystatechange", onState);
      resolve();
    });
  });

  ICH.includesReady = domParsed.then(run).then(function () {
    clearTimeout(cloakTimer);
    reveal();
  });
})();
