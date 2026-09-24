// Etap 7 — See What's Nearby
// Data-driven xəritə bloku: museums.js / routes.js / events.js / news.js ilə
// eyni nümunə — əvvəl öz backend-imiz (icherisheher-api, Railway), alınmasa
// local data/places.json fallback-ı.
const API_URL = "https://icherisheher-api-production.up.railway.app/api/places";
const FALLBACK_URL = "data/places.json";
const LANG = "en"; // hazırkı dil: EN. Gələcəkdə i18n seçicisindən oxunacaq.

// Xəritə İçərişəhərin ümumi görünüşü (HTML-dəki ilkin <iframe src>-lə eyni) —
// "All" seçiləndə və ya heç bir hash-place tapılmayanda bura qayıdılır.
const DEFAULT_MAP = { lat: 40.3665, lng: 49.8352, zoom: 16 };

function mapEmbedSrc(lat, lng, zoom) {
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=${LANG}&output=embed`;
}

// Xəritəni yeni mərkəzə köçürür. `iframe.src`-i birbaşa dəyişmək (və ya
// elementi əvəz etmək) əvəzinə `contentWindow.location.replace(...)`
// işlədilir: bu, kross-origin iframe üçün icazəlidir (yalnız naviqasiyadır,
// oxuma deyil) və — `location.replace` semantikasına uyğun olaraq — parent
// pəncərənin brauzer tarixçəsinə YENİ sətir əlavə etmir (adi `src=` təyini
// və ya elementi yenidən yaratmaq əlavə edərdi). Künc kəsimi məsələsi
// (bax: css/nearby.css, `.nearby-section::after`) elementin özündən asılı
// olmayan ayrıca CSS maskasıdır, ona görə naviqasiyadan təsirlənmir.
function navigateMap(lat, lng, zoom) {
  const iframe = document.querySelector(".nearby__map iframe");
  if (!iframe || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
  const src = mapEmbedSrc(lat, lng, zoom);
  try {
    iframe.contentWindow.location.replace(src);
  } catch (err) {
    // Kross-origin girişi gözlənilməz səbəbdən bloklanarsa (məs. sandbox
    // atributu dəyişərsə), adi src təyini fallback-dır.
    iframe.src = src;
  }
}

function resetMap() {
  navigateMap(DEFAULT_MAP.lat, DEFAULT_MAP.lng, DEFAULT_MAP.zoom);
}

// URL hash-i cari məkanın slug-una uyğunlaşdırır. `location.hash = …`
// əvəzinə `history.replaceState` işlədilir ki, hər çip/kart klikində
// "geri" düyməsi üçün ayrıca tarixçə sətri yaranmasın — filtr vəziyyəti
// sadəcə cari sətirdə əvəzlənir.
function setHash(slug) {
  const { pathname, search } = location;
  const next = slug ? `${pathname}${search}#${slug}` : `${pathname}${search}`;
  history.replaceState(history.state, "", next);
}

function currentHashSlug() {
  return decodeURIComponent(location.hash.replace(/^#/, ""));
}

function pickText(field) {
  if (!field) return "";
  return field[LANG] || field.en || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

// Backend hələ "source": "placeholder" olan məkanlar üçün fayl adı
// qaytarır ki, repo-da real şəkil kimi mövcud deyil (məs.
// assets/img/place-miniature-book-museum.jpg — 404). Bu iki slug üçün
// artıq Museums bölməsindən (Etap 3) real foto var, ona görə API-nin
// path-i sınıq olsa belə həmin faylları burada da işlədirik.
// Digər slug-larda hələ real foto yoxdur (Asifdən export gözlənilir) —
// belə olanda --c-surface fonlu boş yuva qalır (CLAUDE.md, qayda 4),
// kart tamamilə fotosuz görünmür.
const REAL_PHOTO_OVERRIDES = {
  "maiden-tower": ["assets/img/museum-maiden-tower.jpg"],
  "shirvanshahs-palace": ["assets/img/museum-shirvanshahs.jpg"],
};

function resolvePhotos(place) {
  const override = REAL_PHOTO_OVERRIDES[place.slug];
  if (override) return override;
  return (Array.isArray(place.images) && place.images.length
    ? place.images
    : [place.image]).filter(Boolean).slice(0, 2);
}

function photosMarkup(place, alt) {
  const images = resolvePhotos(place);
  if (!images.length) return "";

  const tiles = images.map((src) => `
    <div class="nearby__photo">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" width="228" height="136">
    </div>
  `).join("");

  return `<div class="nearby__photos"${images.length === 1 ? ' data-single' : ""}>${tiles}</div>`;
}

// Şəkil linki cavabda olsa da fayl serverdə tapılmaya bilər (backend hələ
// "source":"placeholder" olan məkanlar üçün real fayl yükləməyib — 404).
// Belə halda boş boz yuva qalmasın deyə foto tam silinir: əvvəlcə sınan
// tile, sonra (heç bir foto qalmayıbsa) bütün foto bloku. Tək foto qalarsa
// cərgə "data-single" ilə tam eninə keçir.
function wirePhotoFallback(cardEl) {
  const wrap = cardEl.querySelector(".nearby__photos");
  if (!wrap) return;
  wrap.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.closest(".nearby__photo")?.remove();
      if (!wrap.isConnected) return;
      if (!wrap.children.length) {
        wrap.remove();
      } else if (wrap.children.length === 1) {
        wrap.setAttribute("data-single", "");
      }
    }, { once: true });
  });
}

// Figma kartında ikinci sütun "Ticket price"dır, amma API sxemində hələ belə
// sahə yoxdur — ticket_price gələnə qədər həmin yuvada `status` göstərilir.
function secondFact(place) {
  if (place.ticket_price) {
    return { label: "Ticket price", value: pickText(place.ticket_price) || place.ticket_price };
  }
  const status = String(place.status || "").toLowerCase();
  return {
    label: "Status",
    value: status === "open" ? "Open" : status === "closed" ? "Closed" : "—",
  };
}

function cardMarkup(place) {
  const name = pickText(place.name);
  const fact = secondFact(place);

  return `
    <div class="nearby__card-head">
      <div class="nearby__card-top">
        <h3 class="nearby__name">${escapeHtml(name)}</h3>
        <button class="nearby__close" type="button" data-places-close aria-label="Close">
          <img src="assets/img/nearby-icon-close.svg" alt="" width="20" height="20">
        </button>
      </div>
      <p class="nearby__desc">${escapeHtml(pickText(place.description))}</p>
    </div>

    <div class="nearby__meta">
      <div class="nearby__meta-item">
        <span class="nearby__meta-label">Open hours</span>
        <span class="nearby__meta-value">${escapeHtml(place.open_hours || "—")}</span>
      </div>
      <div class="nearby__meta-item">
        <span class="nearby__meta-label">${escapeHtml(fact.label)}</span>
        <span class="nearby__meta-value">${escapeHtml(fact.value)}</span>
      </div>
    </div>

    ${photosMarkup(place, name)}

    <div class="nearby__actions">
      <button class="nearby__btn nearby__btn--ghost" type="button">
        <img src="assets/img/nearby-icon-audio.svg" alt="" width="20" height="20">Audio guide
      </button>
      <a class="nearby__btn nearby__btn--solid" href="#${escapeHtml(place.slug || "")}">More details</a>
    </div>
  `;
}

function closeCard(cardEl) {
  cardEl.hidden = true;
  cardEl.innerHTML = "";
  cardEl.removeAttribute("data-state");
}

function renderCard(cardEl, place) {
  cardEl.hidden = false;
  if (!place) {
    cardEl.innerHTML = "<p>No places in this category yet.</p>";
    cardEl.setAttribute("data-state", "empty");
    return;
  }
  cardEl.innerHTML = cardMarkup(place);
  cardEl.removeAttribute("data-state");
  wirePhotoFallback(cardEl);
}

function renderError(cardEl) {
  cardEl.hidden = false;
  cardEl.innerHTML = "<p>Places could not be loaded right now.</p>";
  cardEl.setAttribute("data-state", "error");
}

function placesOfCategory(items, category) {
  const list = category
    ? items.filter((item) => item.category === category)
    : items.slice();
  return list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

// Çiplər HTML-də statikdir (data gəlməsə də görünməlidirlər); burada yalnız
// seçim vəziyyəti, kartın, xəritənin və URL hash-inin sinxronu idarə olunur.
function initChips(chipsEl, cardEl, items) {
  const chips = [...chipsEl.querySelectorAll("[data-places-category]")];
  const bySlug = new Map(items.map((item) => [item.slug, item]));

  function chipForCategory(category) {
    return chips.find((el) => el.dataset.placesCategory === category) || chips[0];
  }

  function activateChip(chip) {
    chips.forEach((el) => {
      const active = el === chip;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  // Çip + kart + xəritə + hash — dörd görünüş də bu tək funksiyadan keçir,
  // ona görə heç vaxt sinxrondan çıxa bilmirlər.
  function showPlace(chip, place) {
    activateChip(chip);
    if (!place) {
      closeCard(cardEl);
      resetMap();
      setHash("");
      return;
    }
    renderCard(cardEl, place);
    navigateMap(place.lat, place.lng, DEFAULT_MAP.zoom);
    setHash(place.slug);
  }

  // İstifadəçi klikləri: çip öz kateqoriyasının ilk (sort_order) məkanını seçir.
  function selectCategory(chip) {
    const category = chip.dataset.placesCategory || "";
    // "All" — filtr yoxdur, ona görə kart da göstərilmir: sadəcə xəritə.
    const place = category ? placesOfCategory(items, category)[0] || null : null;
    showPlace(chip, place);
  }

  chipsEl.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-places-category]");
    if (!chip) return;
    // Aktiv çipdəki "×" seçimi "All"-a qaytarır (Figma: 1523:5684).
    if (chip.classList.contains("is-active") && event.target.closest("[data-places-clear]")) {
      selectCategory(chips[0]);
      return;
    }
    selectCategory(chip);
  });

  // Kartdakı "×" kartı bağlayır və seçimi başlanğıc "All" vəziyyətinə qaytarır.
  cardEl.addEventListener("click", (event) => {
    if (event.target.closest("[data-places-close]")) selectCategory(chips[0]);
  });

  // Runtime hash dəyişikliyi (məs. "More details" linki, əl ilə URL
  // redaktəsi, brauzerin geri/irəli düymələri) eyni sinxronla nəticələnsin.
  window.addEventListener("hashchange", () => {
    const place = bySlug.get(currentHashSlug());
    if (place) showPlace(chipForCategory(place.category), place);
  });

  // Başlanğıc: hash-də tanınan bir məkan slug-u varsa, onu və onun
  // kateqoriya çipini aktivləşdir (xəritə də ora köçür); olmasa "All"
  // ilə başla — bu halda xəritəyə toxunulmur (ilkin statik görünüş qalır).
  const initialPlace = bySlug.get(currentHashSlug());
  if (initialPlace) {
    activateChip(chipForCategory(initialPlace.category));
    renderCard(cardEl, initialPlace);
    navigateMap(initialPlace.lat, initialPlace.lng, DEFAULT_MAP.zoom);
  } else {
    activateChip(chips.find((el) => el.classList.contains("is-active")) || chips[0]);
  }
}

async function fetchPlaces(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// API cavabı bare array və ya wrapper object ola bilər
// (məs. { count, data: [...] }) — digər modullarla eyni davranış.
function unwrapPlaceList(json) {
  const list = Array.isArray(json) ? json : (json && (json.data || json.places || json.items)) || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Places payload is empty or in an unrecognized shape");
  }
  return list;
}

async function initPlaces() {
  const cardEl = document.querySelector("[data-places-card]");
  const chipsEl = document.querySelector("[data-places-chips]");
  if (!cardEl || !chipsEl) return;

  let items;
  try {
    items = unwrapPlaceList(await fetchPlaces(API_URL, { cache: "no-store" }));
  } catch (apiErr) {
    console.error("Places API fetch failed, falling back to local JSON:", apiErr);
    try {
      items = unwrapPlaceList(await fetchPlaces(FALLBACK_URL));
    } catch (fallbackErr) {
      console.error("Places fallback fetch failed:", fallbackErr);
      renderError(cardEl);
      return;
    }
  }

  initChips(chipsEl, cardEl, items);
}

document.addEventListener("DOMContentLoaded", initPlaces);
