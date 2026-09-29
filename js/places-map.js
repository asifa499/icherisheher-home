// Nearby xəritəsi — Google Maps JavaScript API qatı.
// places.js bura yalnız `loadGoogleMap(...)` ilə müraciət edir; nəticə ya
// nəzarətçi obyektidir ({ show }), ya da null (açar yoxdur / script yüklənmədi
// → çağıran tərəf açarsız iframe-i bərpa edir).
import { MAPS_API_KEY, MAPS_TIMEOUT_MS, MAP_STYLE } from "./map-config.js";

// Kateqoriya → ikon (24×24 stroke ikonlar, rəng CSS-dən currentColor ilə gəlir).
const ICONS = {
  museum: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  institutional: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  restaurant: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  hotel: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  park: '<path d="M12 22v-7"/><path d="M12 15a6 6 0 1 0-6-6 6 6 0 0 0 6 6Z"/>',
  landmark: '<path d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"/>',
};

function loadMapsScript(onLateFailure) {
  return new Promise((resolve, reject) => {
    let settled = false;
    window.gm_authFailure = () => {
      if (settled) onLateFailure(); else reject(new Error("Maps auth failure"));
    };
    window.__ichMapsReady = async () => {
      try {
        const [core, maps] = await Promise.all([
          google.maps.importLibrary("core"),
          google.maps.importLibrary("maps"),
        ]);
        settled = true;
        resolve({ core, maps });
      } catch (err) { reject(err); }
    };
    const lang = document.documentElement.lang || "en";
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(MAPS_API_KEY)
      + "&v=weekly&loading=async&language=" + encodeURIComponent(lang) + "&callback=__ichMapsReady";
    script.onerror = () => reject(new Error("Maps script failed to load"));
    document.head.append(script);
  });
}

function pinMarkup(cat) {
  return `<span class="nearby-pin__bubble"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[cat]}</svg></span>`;
}

// Öz marker sinfimiz (AdvancedMarker mapId tələb edir, mapId isə `styles`
// massivi ilə uyğun gəlmir) — OverlayView üzərində HTML pin.
function defineMarkerClass(core, maps) {
  return class PlaceMarker extends maps.OverlayView {
    constructor(place, cat, onClick) {
      super();
      this.position = new core.LatLng(place.lat, place.lng);
      this.el = document.createElement("button");
      this.el.type = "button";
      this.el.className = "nearby-pin";
      this.el.dataset.cat = cat;
      this.el.setAttribute("aria-label", place.__label || place.slug);
      this.el.innerHTML = pinMarkup(cat);
      this.el.addEventListener("click", () => onClick(place));
    }
    onAdd() {
      this.getPanes().overlayMouseTarget.append(this.el);
      maps.OverlayView.preventMapHitsAndGesturesFrom(this.el);
    }
    draw() {
      const pt = this.getProjection()?.fromLatLngToDivPixel(this.position);
      if (!pt) return;
      this.el.style.left = `${pt.x}px`;
      this.el.style.top = `${pt.y}px`;
    }
    onRemove() { this.el.remove(); }
  };
}

/**
 * @param {HTMLElement} mapEl   .nearby__map konteyneri
 * @param {object} opts { center:{lat,lng}, zoom, places:[{place,cat}], onPick(place), getInsets():{x,y}, onFallback() }
 * @returns {Promise<null | {show(place, category)}>}
 */
export async function loadGoogleMap(mapEl, opts) {
  if (!MAPS_API_KEY) return null;

  let libs;
  try {
    libs = await Promise.race([
      loadMapsScript(() => opts.onFallback()),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Maps timeout")), MAPS_TIMEOUT_MS)),
    ]);
  } catch (err) {
    console.error("Google Maps unavailable, using keyless iframe:", err);
    return null;
  }

  const { core, maps } = libs;
  const host = document.createElement("div");
  host.className = "nearby__gmap";
  mapEl.append(host);

  const map = new maps.Map(host, {
    center: opts.center,
    zoom: opts.zoom,
    styles: MAP_STYLE,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: "cooperative",
    backgroundColor: "transparent",
  });

  // Billing/referrer xətaları gm_authFailure-i həmişə çağırmır — Google öz
  // xəta panelini (.gm-err-container) xəritənin içinə çəkir; onu görən kimi
  // fallback-a keç (istifadəçi "For development purposes only" xəritəsi görməsin).
  const errWatch = new MutationObserver(() => {
    if (host.querySelector(".gm-err-container, .dismissButton")) { errWatch.disconnect(); opts.onFallback(); }
  });
  errWatch.observe(host, { childList: true, subtree: true });

  const Marker = defineMarkerClass(core, maps);
  const markers = opts.places.map(({ place, cat }) => {
    const marker = new Marker(place, cat, opts.onPick);
    marker.slug = place.slug;
    marker.cat = cat;
    marker.setMap(map);
    return marker;
  });

  const destroy = () => { errWatch.disconnect(); markers.forEach((m) => m.setMap(null)); host.remove(); };

  function panToPlace(place) {
    const target = new core.LatLng(place.lat, place.lng);
    const proj = map.getProjection();
    const { x, y } = opts.getInsets();
    if (!proj || (!x && !y)) { map.panTo(target); return; }
    // Kartın/başlığın örtdüyü hissəni çıx: məkan QALAN boş sahənin mərkəzinə düşsün.
    const scale = 2 ** map.getZoom();
    const pt = proj.fromLatLngToPoint(target);
    map.panTo(proj.fromPointToLatLng(new core.Point(pt.x - x / scale, pt.y - y / scale)));
  }

  return {
    destroy,
    // category "" → hamısı görünür; place null → yalnız filtr (və ya ilkin görünüş).
    show(place, category) {
      markers.forEach((m) => {
        m.el.classList.toggle("is-hidden", Boolean(category) && m.cat !== category);
        m.el.classList.toggle("is-active", Boolean(place) && m.slug === place.slug);
      });
      if (place) {
        if (map.getZoom() !== opts.zoom) map.setZoom(opts.zoom);
        panToPlace(place);
      } else if (!category) {
        map.setZoom(opts.zoom);
        map.panTo(opts.center);
      }
    },
  };
}
