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
| 8 | City Pass (Core/Explore/Premium) | 1523:4878 | ⬜ |
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
- **Nümunə:** `data/museums.json` + `js/museums.js` (Etap 3), `data/routes.json` + `js/routes.js` (Etap 4), `data/events.json` + `js/events.js` (Etap 5), `data/news.json` + `js/news.js` (Etap 6), `data/places.json` + `js/places.js` (Etap 7). Yeni data-driven bölmə əlavə edəndə bu nümunəni təkrarla: JSON faylında yuxarıdakı trilingual sxemi saxla, `API_URL`-i `icherisheher-api`-nin uyğun endpoint-inə yönləndir, `FALLBACK_URL`-i local JSON-a saxla.

### Xəritə (Etap 7)

- "See What's Nearby" bölməsindəki xəritə açar tələb etməyən Google Maps embed
  iframe-idir (`https://www.google.com/maps?q=<lat>,<lng>&z=<zoom>&output=embed`),
  `index.html`-də statik yazılıb (mərkəz/zoom orada, `js/places.js`-də deyil).
- Başlanğıc görünüş ("All"): yalnız xəritə — məkan kartı bağlıdır, "All"
  çipində "×" yoxdur (təmizlənəcək filtr olmadığı üçün). Kart ancaq konkret
  kateqoriya çipinə basılanda açılır; kartdakı və ya çipdəki "×" onu bağlayıb
  "All"-a qaytarır.
- Foto yuvası: API-nin `image`/`images` sahəsi 404 versə (backend hələ
  `"source": "placeholder"` üçün real fayl yükləməyib) bütün foto bloku
  silinir — boş boz yuva qalmır (`js/places.js`, `wirePhotoFallback`).
  `maiden-tower` və `shirvanshahs-palace` üçün Museums bölməsindən (Etap 3)
  real foto var, `REAL_PHOTO_OVERRIDES` bunları API-nin sınıq path-i əvəzinə
  göstərir. Digər slug-lar üçün real foto Asifdən gözlənilir.
- Xəritə sabitdir: JS iframe-ə toxunmur. Səbəb — iframe-i JS ilə əvəz etmək
  (və ya `src`-ni dəyişmək) həm brauzer tarixçəsini çirkləndirir, həm də
  kross-origin iframe-in yenidən kompozisiyası zamanı xəritə blokun
  kənarlarından daşırdı. Məkana yaxınlaşma lazım olsa, açarlı Maps JS API ilə.
- Kross-origin iframe ana elementin `overflow:hidden` + `border-radius`
  kəsiminə etibarlı tabe olmur. Ona görə künclər `.nearby-section::after`
  qatındakı `box-shadow` maskası ilə örtülür (bax: css/nearby.css).
- Figma-dakı xəritə əl ilə çəkilmiş 3D illüstrasiyadır — canlı xəritə ilə birəbir
  eyni görünmür. Kart, çiplər və başlıq isə piksel-dəqiq Figma-dandır.

## Design tokens xülasəsi (tam siyahı: css/tokens.css)

- **Rənglər:** brand `#886D46` · orange `#FD6310` · black `#222222` · gray `#818181` · light-gray `#E5E5E5` · page-bg `#F5F4F2` · footer-bg `#E1E1E0`
- **Şrift:** Vela Sans — body 16/24 Regular · h2 36/44 Medium · hero 48/56 · small 14/20 · caption 12/16
- **Radius:** pill 1000 · xl 48 · lg 32 · md 24 · sm 12 · xs 8
- **Layout:** kanvas 1440 · blok 1392 · məzmun 1136 · kənar 24 (mobil 16)
