// Trilingual UI (AZ/EN/RU) — bax CLAUDE.md.
// Statik mətnlər üçün tək həqiqət mənbəyi: DICT. Elementlər `data-i18n="<key>"`
// (innerHTML) və ya `data-i18n-alt` / `data-i18n-aria-label` / `data-i18n-placeholder`
// (müvafiq atribut) ilə işarələnir. Data-driven bölmələr (museums.js və s.)
// JSON-un öz trilingual sahələrini `getLang()`-la oxuyur, JS şablonlarındakı
// sabit düymə mətnləri üçün isə bu modulun `t()` funksiyasından istifadə edir.
// Səhifədən asılı deyil: hər səhifədə yüklənir. Səhifəyə xas açarlar
// `window.ICH.pageDict`-də (eyni { key: { en, az, ru } } formatı) verilir —
// modul skriptlərindən ƏVVƏL, klassik inline <script>-də (bax page-template.html).
import { includesReady } from "./base-url.js";

export const STORAGE_KEY = "ich-lang";
export const DEFAULT_LANG = "en";
export const SUPPORTED_LANGS = ["en", "az", "ru"];

// Naməlum/qərarsız tərcümələr üçün "// YOXLA:" şərhi qoyulub (Asifin
// nəzərdən keçirməsi üçün) — dəyər özü yenə də yazılıb ki, boş qalmasın.
const DICT = {
  "aria.search": { en: "Search", az: "Axtarış", ru: "Поиск" },
  "aria.menu": { en: "Menu", az: "Menyu", ru: "Меню" },
  "aria.closeMenu": { en: "Close menu", az: "Menyunu bağla", ru: "Закрыть меню" },
  "aria.close": { en: "Close", az: "Bağla", ru: "Закрыть" },
  "aria.whatsapp": { en: "WhatsApp", az: "WhatsApp", ru: "WhatsApp" },
  "aria.mapOfIcherisheher": { en: "Map of Icherisheher", az: "İçərişəhərin xəritəsi", ru: "Карта Ичеришехер" },
  "aria.primary": { en: "Primary", az: "Əsas naviqasiya", ru: "Основная навигация" },
  "aria.routeFilters": { en: "Route filters", az: "Marşrut filtrləri", ru: "Фильтры маршрутов" },
  "aria.placeCategories": { en: "Place categories", az: "Məkan kateqoriyaları", ru: "Категории мест" },

  "brand.logoAlt": {
    en: "Icherisheher — Administration of State Historical-Architectural Reserve",
    az: "İçərişəhər — Dövlət Tarix-Memarlıq Qoruğunun İdarəsi",
    ru: "Ичеришехер — Управление Государственного историко-архитектурного заповедника",
  },

  "nav.explore": { en: "Explore", az: "Kəşf et", ru: "Исследовать" },
  "nav.thingsToDo": { en: "Things to do", az: "Nə etməli", ru: "Чем заняться" },
  "nav.eatSleep": { en: "Eat and sleep", az: "Yemək və qalmaq", ru: "Еда и проживание" },
  "nav.whatsOn": { en: "What's on", az: "Nə baş verir", ru: "Афиша" },
  "nav.visitorInfo": { en: "Visitor Information", az: "Ziyarətçi məlumatı", ru: "Информация для посетителей" },

  "hero.title": { en: "Discover Icherisheher", az: "İçərişəhəri kəşf et", ru: "Откройте для себя Ичеришехер" },
  "hero.exploreHeading": {
    en: "What would you<br>like to explore?",
    az: "Nəyi kəşf etmək<br>istərdiniz?",
    ru: "Что бы вы хотели<br>исследовать?",
  },
  "hero.chip.tour": { en: "Get your tour", az: "Tur sifariş et", ru: "Закажите тур" },
  "hero.chip.citypass": { en: "City Pass", az: "City Pass", ru: "City Pass" },
  "hero.chip.digimap": { en: "Digi map", az: "Rəqəmsal xəritə", ru: "Цифровая карта" },
  "hero.chip.audioguide": { en: "AI Audio guide", az: "AI Audio bələdçi", ru: "AI аудиогид" },
  "hero.chip.more": { en: "+4", az: "+4", ru: "+4" },
  "hero.asideText": {
    en: "You have no idea what<br>to do in Icherisheher?",
    az: "İçərişəhərdə nə edəcəyinizi<br>bilmirsiniz?",
    ru: "Не знаете, чем заняться<br>в Ичеришехер?",
  },
  "hero.inspire": { en: "Inspire me please!", az: "Məni ruhlandırın!", ru: "Вдохновите меня!" },

  "search.label": { en: "Search", az: "Axtarış", ru: "Поиск" },
  "search.placeholder": { en: "Maiden Tower, kebab, hamam…", az: "Qız qalası, kabab, hamam…", ru: "Девичья башня, кебаб, хамам…" },
  "search.submit": { en: "Search", az: "Axtar", ru: "Найти" },
  "search.popular": { en: "Popular searches", az: "Populyar axtarışlar", ru: "Популярные запросы" },
  "search.popular.maidenTickets": { en: "Tickets to Maiden tower", az: "Qız qalasına biletlər", ru: "Билеты в Девичью башню" },
  "search.popular.whereToStay": { en: "Where to stay in Icherisheher", az: "İçərişəhərdə harada qalmaq olar", ru: "Где остановиться в Ичеришехер" },
  "search.popular.audioguides": { en: "Audioguides", az: "Audio bələdçilər", ru: "Аудиогиды" },
  "aria.closeSearch": { en: "Close search", az: "Axtarışı bağla", ru: "Закрыть поиск" },
  "menu.tile.popularStays": { en: "Popular stays", az: "Populyar qalma yerləri", ru: "Популярное жильё" },
  "menu.tile.happeningToday": { en: "Happening today", az: "Bu gün baş verir", ru: "Сегодня в городе" },
  "menu.tile.bestRestaurants": { en: "Best restaurants", az: "Ən yaxşı restoranlar", ru: "Лучшие рестораны" },
  "menu.tile.hiddenGems": { en: "Hidden gems", az: "Gizli incilər", ru: "Скрытые жемчужины" },
  "menu.ctaText": {
    en: "Still no idea what<br>to do in Icheriseher?",
    az: "Hələ də İçərişəhərdə<br>nə edəcəyinizi bilmirsiniz?",
    ru: "Всё ещё не знаете, чем<br>заняться в Ичеришехер?",
  },

  "col.aboutIcherisheher": { en: "About Icherisheher", az: "İçərişəhər haqqında", ru: "О Ичеришехер" },
  "col.history": { en: "History", az: "Tarix", ru: "История" },
  "col.topSights": { en: "Top Sights", az: "Əsas görməli yerlər", ru: "Главные достопримечательности" },
  "col.cultureHeritage": { en: "Culture & Heritage", az: "Mədəniyyət və irs", ru: "Культура и наследие" },
  "col.museumsGalleries": { en: "Museums & Galleries", az: "Muzeylər və qalereyalar", ru: "Музеи и галереи" },
  "col.architecture": { en: "Architecture", az: "Memarlıq", ru: "Архитектура" },
  "col.storiesLegends": { en: "Stories & Legends", az: "Əfsanələr və hekayələr", ru: "Истории и легенды" },

  "col.tours": { en: "Tours", az: "Turlar", ru: "Туры" },
  "col.experiences": { en: "Experiences", az: "Təcrübələr", ru: "Впечатления" },
  "col.shopping": { en: "Shopping", az: "Alış-veriş", ru: "Шоппинг" },
  "col.artsCrafts": { en: "Arts & Crafts", az: "Sənət və sənətkarlıq", ru: "Искусство и ремёсла" },
  "col.photographySpots": { en: "Photography Spots", az: "Fotoçəkiliş yerləri", ru: "Места для фото" },
  "col.familyActivities": { en: "Family Activities", az: "Ailəvi fəaliyyətlər", ru: "Семейный отдых" },
  "col.exploreNearby": { en: "Explore Nearby", az: "Ətrafı kəşf et", ru: "Рядом с вами" },

  "col.restaurants": { en: "Restaurants", az: "Restoranlar", ru: "Рестораны" },
  "col.cafes": { en: "Cafés", az: "Kafelər", ru: "Кафе" },
  "col.traditionalCuisine": { en: "Traditional Cuisine", az: "Milli mətbəx", ru: "Национальная кухня" },
  "col.rooftopsTerraces": { en: "Rooftops & Terraces", az: "Damlar və terraslar", ru: "Крыши и террасы" },
  "col.hotels": { en: "Hotels", az: "Otellər", ru: "Отели" },
  "col.boutiqueStays": { en: "Boutique Stays", az: "Butik qonaqevlər", ru: "Бутик-отели" },

  "col.eventsCalendar": { en: "Events Calendar", az: "Tədbirlər təqvimi", ru: "Календарь событий" },
  "col.exhibitions": { en: "Exhibitions", az: "Sərgilər", ru: "Выставки" },
  "col.festivals": { en: "Festivals", az: "Festivallar", ru: "Фестивали" },
  "col.concerts": { en: "Concerts", az: "Konsertlər", ru: "Концерты" },
  "col.workshops": { en: "Workshops", az: "Ustad dərsləri", ru: "Мастер-классы" },
  "col.thisWeek": { en: "This Week", az: "Bu həftə", ru: "На этой неделе" },

  "col.gettingHere": { en: "Getting Here", az: "Necə gəlmək olar", ru: "Как добраться" },
  "col.gettingAround": { en: "Getting Around", az: "Ərazidə hərəkət", ru: "Передвижение по территории" },
  "col.ticketsPrices": { en: "Tickets & Prices", az: "Biletlər və qiymətlər", ru: "Билеты и цены" },
  "col.accessibility": { en: "Accessibility", az: "Əlçatanlıq", ru: "Доступность" },
  "col.mapsGuides": { en: "Maps & Guides", az: "Xəritələr və bələdçilər", ru: "Карты и гиды" },
  "col.faq": { en: "FAQ", az: "Tez-tez verilən suallar", ru: "Часто задаваемые вопросы" },

  "intro.eyebrow": { en: "Where History Still Lives", az: "Tarixin hələ də yaşadığı yer", ru: "Место, где история продолжает жить" },
  "intro.lead": {
    en: "Icherisheher is Baku’s historic heart, surrounded by ancient walls and listed as a UNESCO World Heritage Site since 2000.",
    az: "İçərişəhər Bakının tarixi qəlbidir — qədim divarlarla əhatələnib və 2000-ci ildən UNESCO-nun Ümumdünya İrs Siyahısına daxildir.",
    ru: "Ичеришехер — историческое сердце Баку, окружённое древними стенами и включённое в список Всемирного наследия ЮНЕСКО с 2000 года.",
  },
  "intro.leadMuted": {
    en: "Home to landmarks like the Maiden Tower and Shirvanshah’s Palace, the Old City remains a living neighborhood with more than 3,000 residents.",
    az: "Qız Qalası və Şirvanşahlar Sarayı kimi abidələrə ev sahibliyi edən Köhnə Şəhər, 3000-dən çox sakini ilə hələ də yaşayan bir məhəllə olaraq qalır.",
    ru: "Здесь расположены такие памятники, как Девичья башня и Дворец Ширваншахов — Старый город остаётся живым районом, где проживает более 3000 жителей.",
  },
  "intro.exploreNow": { en: "Explore now", az: "İndi kəşf et", ru: "Исследовать сейчас" },
  "intro.photoAlt.statue": { en: "Historic monument in the Old City", az: "Köhnə Şəhərdə tarixi abidə", ru: "Исторический памятник в Старом городе" },
  "intro.photoAlt.tower": { en: "Maiden Tower at golden hour", az: "Qürub çağında Qız Qalası", ru: "Девичья башня в час заката" },
  "intro.photoAlt.instruments": { en: "Traditional Azerbaijani musical instruments on display", az: "Nümayiş olunan ənənəvi Azərbaycan musiqi alətləri", ru: "Выставка традиционных азербайджанских музыкальных инструментов" },
  "intro.photoAlt.dress": { en: "Traditional Azerbaijani dress on a mannequin", az: "Manikendə geyindirilmiş ənənəvi Azərbaycan geyimi", ru: "Традиционный азербайджанский костюм на манекене" },
  "intro.photoAlt.carpets": { en: "Carpets displayed in an Old City courtyard", az: "Köhnə Şəhər həyətində nümayiş olunan xalçalar", ru: "Ковры, представленные во дворе Старого города" },
  "intro.photoAlt.tourists": { en: "Visitors exploring the Old City", az: "Köhnə Şəhəri kəşf edən turistlər", ru: "Туристы, исследующие Старый город" },

  "museums.title": { en: "Museums of Icherisheher & Gala", az: "İçərişəhər və Qalanın muzeyləri", ru: "Музеи Ичеришехер и Гала" },
  "museums.viewAll": { en: "View all museums", az: "Bütün muzeylərə bax", ru: "Смотреть все музеи" },
  "museums.getTicket": { en: "Get a ticket", az: "Bilet al", ru: "Купить билет" },

  "routes.title": {
    en: 'Ready-made routes,<br class="routes__br"> made for the time you have.',
    az: 'Vaxtınıza uyğun<br class="routes__br"> hazır marşrutlar.',
    ru: 'Готовые маршруты<br class="routes__br"> под ваше время.',
  },
  "routes.lead": {
    en: "Pick how you travel and follow a mapped route through the Old City - every stop links to tickets, hours and directions.",
    az: "Necə səyahət edəcəyinizi seçin və Köhnə Şəhər boyunca xəritələnmiş marşrutu izləyin — hər dayanacaq biletlərə, iş saatlarına və istiqamətlərə bağlanır.",
    ru: "Выберите способ передвижения и следуйте размеченному маршруту по Старому городу — на каждой остановке есть ссылки на билеты, часы работы и маршрут.",
  },
  "routes.allTours": { en: "All tours", az: "Bütün turlar", ru: "Все туры" },
  "routes.getPass": { en: "Get a Pass", az: "Pas əldə et", ru: "Получить пропуск" },

  "season.title": { en: "This season in the Old City", az: "Bu mövsüm Köhnə Şəhərdə", ru: "В этом сезоне в Старом городе" },
  "season.calendar": { en: "Full events calendar", az: "Tam tədbirlər təqvimi", ru: "Полный календарь событий" },

  "resources.title": { en: "Resources", az: "Resurslar", ru: "Ресурсы" },
  "resources.tab.stories": { en: "The Stories", az: "Hekayələr", ru: "Истории" },
  "resources.tab.news": { en: "News", az: "Xəbərlər", ru: "Новости" },
  "resources.tab.announcements": { en: "Announcements", az: "Elanlar", ru: "Объявления" },

  "nearby.title": { en: "See What's Nearby", az: "Ətrafda nə var, bax", ru: "Что рядом" },
  "nearby.chip.all": { en: "All", az: "Hamısı", ru: "Все" },
  "nearby.chip.museum": { en: "Museum", az: "Muzey", ru: "Музей" },
  "nearby.chip.shop": { en: "Shop", az: "Mağaza", ru: "Магазин" },
  "nearby.chip.institutional": { en: "Institutional building", az: "İnzibati bina", ru: "Административное здание" },
  "nearby.chip.restaurant": { en: "Restaurant", az: "Restoran", ru: "Ресторан" },
  "nearby.chip.hotel": { en: "Hotel", az: "Otel", ru: "Отель" },
  "nearby.chip.park": { en: "Park", az: "Park", ru: "Парк" },
  "nearby.credit": { en: "Google maps", az: "Google Xəritələr", ru: "Google Карты" },
  "nearby.openHours": { en: "Open hours", az: "İş saatları", ru: "Часы работы" },
  "nearby.ticketPrice": { en: "Ticket price", az: "Bilet qiyməti", ru: "Цена билета" },
  "nearby.status": { en: "Status", az: "Status", ru: "Статус" },
  "nearby.open": { en: "Open", az: "Açıqdır", ru: "Открыто" },
  "nearby.closed": { en: "Closed", az: "Bağlıdır", ru: "Закрыто" },
  "nearby.audioGuide": { en: "Audio guide", az: "Audio bələdçi", ru: "Аудиогид" },
  "nearby.moreDetails": { en: "More details", az: "Ətraflı", ru: "Подробнее" },
  "nearby.empty": { en: "No places in this category yet.", az: "Bu kateqoriyada hələ məkan yoxdur.", ru: "В этой категории пока нет мест." },
  "nearby.error": { en: "Places could not be loaded right now.", az: "Məkanlar hazırda yüklənə bilmədi.", ru: "Не удалось загрузить места." },

  "citypass.title": { en: "One QR. The whole Old City.", az: "Bir QR. Bütün Köhnə Şəhər.", ru: "Один QR. Весь Старый город." },
  "citypass.buy": { en: "Buy", az: "Al", ru: "Купить" },

  "appar.title": { en: "Take Icherisheher with you", az: "İçərişəhəri özünlə apar", ru: "Возьмите Ичеришехер с собой" },
  "appar.text": {
    en: "Your personal Old City guide in your pocket - works offline, includes audio guides in 6 languages, AR Time Machine at 10+ historical points, and exclusive in-app deals.",
    az: "Cibinizdəki şəxsi Köhnə Şəhər bələdçiniz — internetsiz işləyir, 6 dildə audio bələdçilər, 10+ tarixi nöqtədə AR Zaman Maşını və tətbiqə xas eksklüziv təkliflər daxildir.",
    ru: "Ваш персональный гид по Старому городу в кармане — работает офлайн, включает аудиогиды на 6 языках, AR-машину времени в 10+ исторических точках и эксклюзивные предложения в приложении.",
  },
  "appar.appstore": { en: "App store", az: "App Store", ru: "App Store" },
  "appar.googleplay": { en: "Google play", az: "Google Play", ru: "Google Play" },
  "appar.phoneAlt": { en: "Icherisheher app running on a phone", az: "Telefonda işləyən İçərişəhər tətbiqi", ru: "Приложение Ичеришехер на телефоне" },
  "appar.time.title": {
    en: "AR Time Machine<br><span>at the Maiden Tower.</span>",
    az: "AR Zaman Maşını<br><span>Qız Qalasında.</span>",
    ru: "AR-машина времени<br><span>у Девичьей башни.</span>",
  },
  "appar.time.text": {
    en: "Travel back to 12th-century Baku through augmented reality at 10 historical points across the Old City.",
    az: "Artırılmış reallıq vasitəsilə Köhnə Şəhərdəki 10 tarixi nöqtədən XII əsr Bakısına səyahət edin.",
    ru: "Перенеситесь в Баку XII века с помощью дополненной реальности в 10 исторических точках Старого города.",
  },
  "appar.time.explore": { en: "Explore", az: "Kəşf et", ru: "Исследовать" },
  "appar.time.getPass": { en: "Get your pass", az: "Pasınızı əldə edin", ru: "Получите пропуск" },

  "social.followers": { en: "followers", az: "izləyici", ru: "подписчиков" },
  "social.follow": { en: "Follow", az: "İzlə", ru: "Подписаться" },
  "social.photoAria": { en: "View this post on Instagram", az: "Bu paylaşıma Instagram-da bax", ru: "Смотреть публикацию в Instagram" },

  "footer.contact": { en: "Contact", az: "Əlaqə", ru: "Контакты" },
  "footer.infoOffices": { en: "Information offices", az: "Məlumat ofisləri", ru: "Информационные офисы" },
  // YOXLA: küçə adının rəsmi transliterasiyası Asif tərəfindən təsdiqlənməyib.
  "footer.address": { en: "Gazi Mahammad Street, 1095", az: "Qazı Məhəmməd küçəsi, 1095", ru: "Улица Гази Мамедова, 1095" },
  "footer.hours": { en: "08:00-18:00", az: "08:00-18:00", ru: "08:00-18:00" },
  // YOXLA: EN mətni orijinal markup-dakı "Icharishahar" yazılışını (mövcud səhv/fərqli
  // transliterasiya ola bilər) olduğu kimi saxlayır — dəyişdirilməyib.
  "footer.copyright": { en: "© 2026 Icharishahar", az: "© 2026 İçərişəhər", ru: "© 2026 Ичеришехер" },
};

// Səhifəyə xas açarlar ümumi açarların (nav.*, footer.* və s.) üstünə yazmır.
const PAGE_DICT = (window.ICH && window.ICH.pageDict) || {};
Object.entries(PAGE_DICT).forEach(([key, value]) => {
  if (DICT[key]) console.warn(`i18n: page key "${key}" already exists — skipped`);
  else DICT[key] = value;
});

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch {
    // localStorage əlçatan deyil (məs. gizli rejim) — defolt dilə keç.
  }
  return DEFAULT_LANG;
}

let currentLang = readStoredLang();
const listeners = [];

export function getLang() {
  return currentLang;
}

export function t(key) {
  const entry = DICT[key];
  if (!entry) {
    console.warn(`i18n: missing key "${key}"`);
    return key;
  }
  return entry[currentLang] || entry.en || key;
}

const ATTR_MAP = [
  ["data-i18n-alt", "alt"],
  ["data-i18n-aria-label", "aria-label"],
  ["data-i18n-placeholder", "placeholder"],
];

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n"));
  });
  ATTR_MAP.forEach(([dataAttr, attr]) => {
    root.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
      el.setAttribute(attr, t(el.getAttribute(dataAttr)));
    });
  });
  document.documentElement.lang = currentLang;
}

export function onLangChange(callback) {
  listeners.push(callback);
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage əlçatan deyil — dil yenə də bu sessiya üçün tətbiq olunur, sadəcə yadda saxlanmır.
  }
  applyTranslations();
  listeners.forEach((cb) => cb(currentLang));
}

// Başlıq/footer partial-ları (js/include.js) DOM-a düşəndən sonra tətbiq et —
// əks halda onların data-i18n elementləri tərcüməsiz qalar.
await includesReady;
applyTranslations();
