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
  "hero.chip.tickets": { en: "Tickets & Pass", az: "Biletlər və Pass", ru: "Билеты и Pass" },
  "hero.downloadApp": { en: "Download App", az: "Tətbiqi yüklə", ru: "Скачать приложение" },
  "hero.getQuote": { en: "Get a Quote", az: "Qiymət sorğusu", ru: "Узнать цену" },
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
  "museums.getPass": { en: "Get Your Pass", az: "Pass əldə et", ru: "Получить Pass" },
  "museums.getDirections": { en: "Get Directions", az: "Yol tarifi", ru: "Маршрут" },
  "museums.prev": { en: "Previous", az: "Əvvəlki", ru: "Назад" },
  "museums.next": { en: "Next", az: "Növbəti", ru: "Далее" },
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
  "collections.title": { en: "Icherisheher Digital Collections", az: "İçərişəhər Rəqəmsal Kolleksiyaları", ru: "Цифровые коллекции Ичеришехер" },
  "collections.tab.photo": { en: "Photo Heritage", az: "Foto irs", ru: "Фотонаследие" },
  "collections.tab.artworks": { en: "Artworks & Graphic Works", az: "Rəsm və qrafika əsərləri", ru: "Картины и графика" },
  "collections.explore": { en: "Explore Collection", az: "Kolleksiyaya bax", ru: "Смотреть коллекцию" },
  "aria.collectionTabs": { en: "Collection filters", az: "Kolleksiya filtrləri", ru: "Фильтры коллекций" },
  "routes.tab.firstTime": { en: "First time", az: "İlk dəfə", ru: "Впервые" },
  "routes.tab.group": { en: "Group Tours", az: "Qrup turları", ru: "Групповые туры" },
  "routes.tab.private": { en: "Private Tours", az: "Fərdi turlar", ru: "Индивидуальные туры" },
  "routes.tab.qala": { en: "Qala Tours", az: "Qala turları", ru: "Туры Гала" },
  "routes.type.restaurant": { en: "Restaurant", az: "Restoran", ru: "Ресторан" },
  "routes.type.museums": { en: "Museums", az: "Muzeylər", ru: "Музеи" },
  "routes.type.walk": { en: "Walk", az: "Gəzinti", ru: "Прогулка" },
  "routes.mode.private": { en: "Private", az: "Fərdi", ru: "Индивидуально" },
  "routes.mode.group": { en: "Group", az: "Qrup", ru: "Группа" },
  "routes.bookNow": { en: "Book Now", az: "İndi sifariş et", ru: "Забронировать" },
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
  "nearby.chip.mobility": { en: "Mobility", az: "Nəqliyyat", ru: "Транспорт" },
  "nearby.chip.utilities": { en: "Utilities", az: "Kommunal xidmətlər", ru: "Услуги" },
  "nearby.chip.artGallery": { en: "Art gallery", az: "İncəsənət qalereyası", ru: "Галерея" },
  "nearby.chip.tourAgency": { en: "Tour agency", az: "Tur agentliyi", ru: "Турагентство" },
  "nearby.chip.tic": { en: "TIC", az: "TİM", ru: "ТИЦ" },
  "aria.expandMap": { en: "Expand map", az: "Xəritəni böyüt", ru: "Развернуть карту" },
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
  "appar.time.title": { en: "AI Audio Guide", az: "AI Audio bələdçi", ru: "AI аудиогид" },
  "appar.time.text": {
    en: "Travel back to 12th-century Baku through augmented reality at 10 historical points across the Old City.",
    az: "Artırılmış reallıq vasitəsilə Köhnə Şəhərdəki 10 tarixi nöqtədən XII əsr Bakısına səyahət edin.",
    ru: "Перенеситесь в Баку XII века с помощью дополненной реальности в 10 исторических точках Старого города.",
  },
  "appar.time.explore": { en: "Museum Audio Guide", az: "Muzey audio bələdçisi", ru: "Аудиогид по музеям" },
  "appar.time.getPass": { en: "Icherisheher Audio Guide", az: "İçərişəhər audio bələdçisi", ru: "Аудиогид по Ичеришехер" },

  "social.followers": { en: "followers", az: "izləyici", ru: "подписчиков" },
  "social.follow": { en: "Follow", az: "İzlə", ru: "Подписаться" },
  "social.photoAria": { en: "View this post on Instagram", az: "Bu paylaşıma Instagram-da bax", ru: "Смотреть публикацию в Instagram" },

  "fh.explore": { en: "Explore", az: "Kəşf et", ru: "Исследовать" },
  "fh.visit": { en: "Visit", az: "Ziyarət", ru: "Посещение" },
  "fh.tickets": { en: "Tickets & Pass", az: "Biletlər və Pass", ru: "Билеты и Pass" },
  "fh.about": { en: "About & Media", az: "Haqqımızda və media", ru: "О нас и медиа" },
  "fh.legal": { en: "Legal", az: "Hüquqi məlumat", ru: "Правовая информация" },
  "fl.topThings": { en: "Top Things to Do", az: "Ən yaxşı fəaliyyətlər", ru: "Чем заняться" },
  "fl.interactiveMap": { en: "Interactive Map", az: "İnteraktiv xəritə", ru: "Интерактивная карта" },
  "fl.topSights": { en: "Top Sights", az: "Əsas görməli yerlər", ru: "Главные достопримечательности" },
  "fl.culturalLife": { en: "Cultural Life & Events", az: "Mədəni həyat və tədbirlər", ru: "Культурная жизнь и события" },
  "fl.deals": { en: "Deals & Offers", az: "Təkliflər və endirimlər", ru: "Акции и предложения" },
  "fl.architecture": { en: "Architecture", az: "Memarlıq", ru: "Архитектура" },
  "fl.stories": { en: "Stories from Icherisheher", az: "İçərişəhərdən hekayələr", ru: "Истории Ичеришехер" },
  "fl.planVisit": { en: "Plan Your Visit", az: "Ziyarətinizi planlayın", ru: "Спланируйте визит" },
  "fl.museums": { en: "Museums", az: "Muzeylər", ru: "Музеи" },
  "fl.tours": { en: "Tours", az: "Turlar", ru: "Туры" },
  "fl.eatDrink": { en: "Eat & Drink", az: "Yemək və içki", ru: "Еда и напитки" },
  "fl.sleepStay": { en: "Sleep & Stay", az: "Qonaqlama", ru: "Проживание" },
  "fl.icherishehrPass": { en: "Icherisheher Pass", az: "İçərişəhər Pass", ru: "Pass Ичеришехер" },
  "fl.qalaReserve": { en: "Qala Reserve", az: "Qala qoruğu", ru: "Заповедник Гала" },
  "fl.buyTickets": { en: "Buy Tickets", az: "Bilet al", ru: "Купить билеты" },
  "fl.bookTour": { en: "Book a Tour", az: "Tur sifariş et", ru: "Заказать тур" },
  "fl.groupB2b": { en: "Group & B2B", az: "Qrup və B2B", ru: "Группы и B2B" },
  "fl.aboutIch": { en: "About İçərişəhər", az: "İçərişəhər haqqında", ru: "Об Ичеришехер" },
  "fl.pressHub": { en: "Press & Media Hub", az: "Mətbuat və media mərkəzi", ru: "Пресс-центр" },
  "fl.museumPhotos": { en: "Museum Photo Collection", az: "Muzey foto kolleksiyası", ru: "Фотоколлекция музеев" },
  "fl.heritageLibrary": { en: "Visual Heritage Library", az: "Vizual irs kitabxanası", ru: "Библиотека визуального наследия" },
  "fl.pressPacks": { en: "Press Image Packs", az: "Mətbuat üçün şəkil paketləri", ru: "Пакеты изображений для прессы" },
  "fl.privacy": { en: "Privacy", az: "Məxfilik", ru: "Конфиденциальность" },
  "fl.terms": { en: "Terms", az: "Şərtlər", ru: "Условия" },
  "fl.cookies": { en: "Cookies", az: "Kukilər", ru: "Cookies" },
  "fl.mapsGuides": { en: "Maps & Guides", az: "Xəritələr və bələdçilər", ru: "Карты и путеводители" },
  "fl.visitorInfo": { en: "Visitor Information", az: "Ziyarətçi məlumatı", ru: "Информация для гостей" },
  "fl.accessibility": { en: "Accessibility", az: "Əlçatanlıq", ru: "Доступность" },
  "fl.govWebsite": { en: "Official Government Website", az: "Rəsmi dövlət veb saytı", ru: "Официальный сайт государства" },
  "footer.followUs": { en: "Follow us", az: "Bizi izləyin", ru: "Подписывайтесь" },
  "footer.tiktok": { en: "Tiktok", az: "Tiktok", ru: "Tiktok" },
  "footer.youtube": { en: "Youtube", az: "Youtube", ru: "Youtube" },
  "footer.facebook": { en: "Facebook", az: "Facebook", ru: "Facebook" },
  "tag.eatDrink": { en: "Eat & Drink", az: "Yemək və içki", ru: "Еда и напитки" },
  "tag.museums": { en: "Museums", az: "Muzeylər", ru: "Музеи" },
  "tag.stay": { en: "Stay", az: "Qonaqlama", ru: "Проживание" },
  "tag.qala": { en: "Qala Reserve", az: "Qala qoruğu", ru: "Заповедник Гала" },
  "tag.monuments": { en: "Monuments & Landmarks", az: "Abidələr və görməli yerlər", ru: "Памятники и достопримечательности" },
  "tag.events": { en: "Events", az: "Tədbirlər", ru: "События" },
  "tag.toursRoutes": { en: "Tours & Routes", az: "Turlar və marşrutlar", ru: "Туры и маршруты" },
  "tag.hiddenGems": { en: "Hidden gems", az: "Gizli incilər", ru: "Скрытые жемчужины" },
  "tag.localMasters": { en: "Local Masters", az: "Yerli ustalar", ru: "Местные мастера" },
  "tag.bukharart": { en: "BukharArt", az: "BukharArt", ru: "BukharArt" },
  "tag.visitorServices": { en: "Visitor Services", az: "Ziyarətçi xidmətləri", ru: "Услуги для гостей" },
  "tag.centreArts": { en: "Icherisheher Centre for Traditional Arts", az: "İçərişəhər Ənənəvi İncəsənət Mərkəzi", ru: "Центр традиционного искусства Ичеришехер" },
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
