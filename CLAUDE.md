# CLAUDE.md — İçərişəhər Home Page

## Layihə nədir

İçərişəhər (Old City of Baku, UNESCO World Heritage Site) veb platformasının **Home səhifəsinin** Figma dizaynından piksel-dəqiq HTML/CSS replikasiyası. Bu repo developer komandasına veriləcək frontend etalonudur — dizayna sadiqlik əsas prioritetdir.

- **Canlı sayt:** https://asifa499.github.io/icherisheher-home/ (GitHub Pages, main branch, root)
- **Repo:** asifa499/icherisheher-home
- **Sahib:** Asif Aliyev (Product Owner, Futurelab)

## Figma mənbəyi

- **Fayl:** `tJ0lCzuMMZdMygPz8nwZEs` ("Icherisheher-Web")
- **Home web (1440px):** node `1523:4706`
- **Home mobile (393px):** node `1523:5735`
- Hər `<section>`-ın `data-figma` atributunda öz node ID-si yazılıb. Bu atributları **heç vaxt silmə**.
- Figma-dan oxumaq üçün Figma MCP connector istifadə olunur. Dəyər tərəddüdü olanda screenshot-a yox, node-un faktiki property-lərinə əsaslan.

## Struktur

```
index.html          — bütün bölmələr bir səhifədə
css/tokens.css      — design tokens (YEGANƏ həqiqət mənbəyi)
css/base.css        — reset, @font-face, konteynerlər, breakpoint
css/<section>.css   — hər etapın öz CSS faylı (etap başlayanda yaradılır)
assets/fonts/       — Vela Sans woff2 (Regular/Medium/SemiBold)
assets/img/         — şəkillər, bölmə-prefiksli adlar: hero-bg.jpg, museum-01.jpg
```

## Qaydalar

1. **Framework yoxdur.** Təmiz HTML + CSS; JS yalnız zəruri interaktivlik üçün (tab, slider) — vanilla, minimal.
2. **Tokens toxunulmazdır.** Rəng/ölçü/radius yalnız `tokens.css`-dəki dəyişənlərlə işlənir. Yeni dəyər lazımdırsa, əvvəl Figma-dan təsdiqlə, sonra token kimi əlavə et. Hardcode rəng/ölçü yazma.
3. **Responsive:** tək breakpoint `768px` (base.css-də). Web etalon 1440px, mobile etalon 393px; aralıq enlər axıcı yığılır.
4. **Bölmə hazır olanda** `.is-placeholder` sinfi və placeholder məzmunu silinir, real markup həmin `<section>`-ın içinə yazılır.
5. **Şriftlər:** Vela Sans self-hosted. Fayllar hələ yoxdursa, fallback stack işləyir — @font-face bloklarını silmə.
6. **Dil:** səhifə məzmunu dizayndakı kimi (EN); kod şərhləri və commit mesajları sərbəst. Asif ilə ünsiyyət Azərbaycan dilindədir.
7. **Commit formatı:** `Etap N: <bölmə> — <qısa dəyişiklik>` (məs. `Etap 1: hero — naviqasiya və axtarış paneli`).
8. **Hər etapın sonunda push et** ki, canlı linkdə müqayisə mümkün olsun.

## Etap planı və status

| # | Bölmə | Figma node | Status |
|---|-------|-----------|--------|
| 0 | Tokens + skelet | — | ✅ Hazır |
| 1 | Header + Hero (axtarış paneli, çiplər) | 1523:4707 | ✅ |
| 2 | UNESCO intro + foto kollaj | 1523:5620 | ✅ |
| 3 | Museums of Icherisheher & Gala | 1523:5419 | ✅ |
| 4 | Ready-made routes | 1523:5063 | ✅ |
| 5 | This season in the Old City | 1523:4992 | ✅ |
| 6 | Resources (tabs + kartlar) | 1523:8262 | ✅ |
| 7 | See What's Nearby (xəritə) | 1523:8263 | ✅ |
| 8 | City Pass (Core/Explore/Premium) | 1523:4878 | ✅ |
| 9 | App promo + AR Time Machine | 1523:5169, 1523:5341, 1523:5340, 1523:5322 | ⬜ |
| 10 | Sosial feed | 1523:5297, 1523:5313 | ⬜ |
| 11 | Footer + panoram foto | 1523:5170, 1523:5358, 1523:5408 | ⬜ |

Etap tamamlananda bu cədvəldə statusu ✅ et və commit-ə daxil et.

## Etap iş axını

1. Asif "Etap N" deyir.
2. Figma-dan həmin node-un tam kontekstini çək (layout, ölçülər, rənglər, mətnlər) — həm web, həm mobile variantını.
3. Markup + CSS yaz (`css/<section>.css`), placeholder-i əvəz et.
4. Şəkil lazımdırsa: Asifdən dəqiq siyahı ilə istə (hansı layer, hansı format). Fayllar `assets/img/`-ə bölmə-prefiksli adla düşür; gələnə qədər `--c-surface` fonlu placeholder div işlət.
5. Commit + push → Asif canlı linki Figma ilə tutuşdurur → düzəlişlər → təsdiq → cədvəldə status yenilə → növbəti etap.

## API inteqrasiyası

Etap 3-dən başlayaraq bölmələr **data-driven**-dir: məzmun HTML-ə hardcode yazılmır, `data/<section>.json`-dan vanilla JS modulu (`js/<section>.js`) ilə render olunur.

- **Backend:** öz API-mizi qururuq — repo `icherisheher-api`, Node.js/Express + PostgreSQL, Railway-də host olunur: `icherisheher-api-production.up.railway.app`.
- **Ödənişlər** kənar sistemdə qalır (client-in mövcud ödəniş provayderi) — frontend yalnız `ticket_url`-a yönləndirir, ödəniş axınını özü idarə etmir.
- **Trilingual sxem:** mətn sahələri (`name`, `short_description`, `address` və s.) `{ "az": "...", "en": "...", "ru": "..." }` formatındadır. Hazırkı dil sabit `en`-dir (`js/<section>.js` daxilində `LANG` sabiti); real i18n seçicisi gələcək bir etapda əlavə olunacaq.
- **Fallback tələbdir:** `API_URL` `icherisheher-api`-yə (Railway) işarə edir; sorğu uğursuz olarsa (server yatıb, CORS və s.) modul avtomatik olaraq öz `data/<section>.json`-unu (mock/local) çəkir. Hər ikisi də alınmasa səhifə boş qalmır, `data-state="error"` ilə boş vəziyyət göstərilir.
- **Nümunə:** `data/museums.json` + `js/museums.js` (Etap 3), `data/routes.json` + `js/routes.js` (Etap 4), `data/events.json` + `js/events.js` (Etap 5), `data/news.json` + `js/news.js` (Etap 6), `data/places.json` + `js/places.js` (Etap 7), `data/passes.json` + `js/passes.js` (Etap 8). Yeni data-driven bölmə əlavə edəndə bu nümunəni təkrarla: JSON faylında yuxarıdakı trilingual sxemi saxla, `API_URL`-i `icherisheher-api`-nin uyğun endpoint-inə yönləndir, `FALLBACK_URL`-i local JSON-a saxla.

### Xəritə (Etap 7)

- "See What's Nearby" bölməsindəki xəritə açar tələb etməyən Google Maps embed
  iframe-idir (`https://www.google.com/maps?q=<lat>,<lng>&z=<zoom>&output=embed`).
  Başlanğıc mərkəz/zoom `index.html`-dəki iframe URL-indədir (`DEFAULT_MAP`
  `js/places.js`-də eyni dəyərləri saxlayır).
- **Çip ↔ data kateqoriya xəritəsi (`js/places.js`, `CATEGORY_BY_DB` /
  `PLACE_CATEGORY_OVERRIDES` / `uiCategoryOf(place)`):** Figma-nın çip
  etiketləri backend-in xam `category` sahəsi ilə 1-ə-1 uyğun gəlmir —
  ən problemlisi "landmark"dır, backend HƏR tarixi obyekti (qüllə, saray,
  məscid, qapı, seyrgah) eyni etiketlə qaytarır. Ona görə xəritələmə iki
  qatlıdır: birbaşa uyğun gələn xam kateqoriyalar (`museum`, `shop`, `hotel`,
  `cafe`→`restaurant`) `CATEGORY_BY_DB`-də, "landmark" kimi qarışıq
  kateqoriyalar isə HƏR məkan üçün əl ilə (təsvirinə görə) `PLACE_CATEGORY_OVERRIDES`-də
  təsnif olunur:
  - `shirvanshahs-palace`, `muhammad-mosque` → **Institutional building**
    (saray kompleksi / məscid — əsl bina, dini/dövlət institutu).
  - `multani-caravanserai` → **Restaurant** (öz təsvirində "today a
    restaurant" yazılıb, xam kateqoriyası "landmark" olsa da).
  - `maiden-tower`, `double-gates`, `hajinski-house-viewpoint` → **heç bir
    çipə uyğun gəlmir** (qüllə/qapı/seyrgah — açıq struktur, bina deyil).
    Bunlar yalnız "All"-da (və birbaşa hash linki ilə, məs. `#maiden-tower`)
    görünür — çip klikləməklə əlçatan deyillər, bu qəsdən belədir.
  - Yeni məkan/kateqoriya gələndə: xam kateqoriya birmənalı bir çipə uyğun
    gəlirsə `CATEGORY_BY_DB`-ə əlavə et; gəlmirsə slug üzrə
    `PLACE_CATEGORY_OVERRIDES`-ə əl ilə əlavə et.
- **Çip ↔ kart ↔ xəritə ↔ URL hash sinxronu:** dördü də `js/places.js`-dəki
  tək `showPlace(chip, place)` funksiyasından keçir (kateqoriyanı çipin özündən
  oxuyur), ona görə heç vaxt sinxrondan çıxa bilmirlər:
  - Kateqoriya çipinə basılanda o çipə (`uiCategoryOf`) uyğun məkanların ilki
    (`sort_order`) kartda açılır, xəritə onun `lat`/`lng`-inə köçür, URL hash
    məkanın slug-una yenilənir (`#boutique-hotel-in-the-walls` kimi).
  - Çipə uyğun HEÇ BİR məkan yoxdursa (məs. Park) kart AÇIQ qalır və xoş boş
    vəziyyət mesajı göstərir ("No places in this category yet.") — "All"
    seçiləndə isə (filtr ümumiyyətlə yoxdur) kart tamamilə bağlanır. Bu iki
    fərqli hal eyni görünməsin deyə ayrı sentinel dəyərlərlə izlənilir.
  - Səhifə hash ilə açılsa (məs. paylaşılan link) və hash tanınan bir məkan
    slug-una uyğun gəlsə, o məkan açılır; məkan hər hansı çipə uyğun gəlirsə
    həmin çip, gəlmirsə (yuxarıdakı "heç bir çipə uyğun gəlməyən" siyahı)
    "All" aktivləşir. Tanınmayan/boş hash-də "All" ilə başlanır və xəritəyə
    toxunulmur (ilkin statik görünüş qalır, lazımsız reload olmasın).
  - Runtime-da hash başqa yolla dəyişsə (brauzerin geri/irəli düymələri,
    "More details" linki, əl ilə URL redaktəsi) `hashchange` dinləyicisi
    eyni sinxronu təkrarlayır.
  - "All" çipinə (və ya kartın "×"-inə) qayıdanda kart bağlanır, xəritə
    `DEFAULT_MAP`-ə qayıdır, hash təmizlənir.
- Xəritəni köçürmək üçün `iframe.src`-i dəyişmək və ya elementi yenidən
  yaratmaq əvəzinə `iframe.contentWindow.location.replace(...)` işlədilir
  (`navigateMap`, `js/places.js`): kross-origin frame üçün naviqasiya icazəlidir
  (yalnız oxuma bloklanır), və `location.replace` semantikası parent-in brauzer
  tarixçəsinə YENİ sətir əlavə etmir (adi `src=` təyini əlavə edərdi — buna görə
  URL hash-i də `history.replaceState` ilə yazılır, `location.hash = …` yox).
- Google Maps embed-i naviqasiya EDƏNDƏ öz daxili mini-tətbiqini tam yenidən
  yükləyir (bir neçə `GetViewportInfo` / `gen_204?csp_test` / vector-tile
  sorğusu DevTools Network-də görünür) — bu, keyless `output=embed` yanaşmasının
  qaçılmaz xərcidir. Ona görə `showPlace` eyni məkan artıq göstərilirsə (məs.
  hash ilə açılıb, sonra həmin məkanın kateqoriya çipinə də basılıb) heç nə
  etmir — `currentSlug` ilə müqayisə edib təkrar reload-un qarşısını alır.
- Kross-origin iframe ana elementin `overflow:hidden` + `border-radius`
  kəsiminə etibarlı tabe olmur. Ona görə künclər `.nearby-section::after`
  qatındakı `box-shadow` maskası ilə örtülür (bax: css/nearby.css) — bu, iframe
  naviqasiya edəndə də etibarlıdır, çünki elementin özündən asılı deyil.
- Foto yuvası: API-nin `image`/`images` sahəsi 404 versə (backend hələ
  `"source": "placeholder"` üçün real fayl yükləməyib) bütün foto bloku
  silinir — boş boz yuva qalmır (`js/places.js`, `wirePhotoFallback`).
  `maiden-tower` və `shirvanshahs-palace` üçün Museums bölməsindən (Etap 3)
  real foto var, `REAL_PHOTO_OVERRIDES` bunları API-nin sınıq path-i əvəzinə
  göstərir. Digər slug-lar üçün real foto Asifdən gözlənilir.
- Figma-dakı xəritə əl ilə çəkilmiş 3D illüstrasiyadır — canlı xəritə ilə birəbir
  eyni görünmür. Kart, çiplər və başlıq isə piksel-dəqiq Figma-dandır.

## Design tokens xülasəsi (tam siyahı: css/tokens.css)

- **Rənglər:** brand `#886D46` · orange `#FD6310` · black `#222222` · gray `#818181` · light-gray `#E5E5E5` · page-bg `#F5F4F2` · footer-bg `#E1E1E0`
- **Şrift:** Vela Sans — body 16/24 Regular · h2 36/44 Medium · hero 48/56 · small 14/20 · caption 12/16
- **Radius:** pill 1000 · xl 48 · lg 32 · md 24 · sm 12 · xs 8
- **Layout:** kanvas 1440 · blok 1392 · məzmun 1136 · kənar 24 (mobil 16)
