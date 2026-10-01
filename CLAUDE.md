# CLAUDE.md — İçərişəhər Home Page

## Layihə nədir

İçərişəhər (Old City of Baku, UNESCO World Heritage Site) veb platformasının **Home səhifəsinin** Figma dizaynından piksel-dəqiq HTML/CSS replikasiyası. Bu repo developer komandasına veriləcək frontend etalonudur — dizayna sadiqlik əsas prioritetdir.

- **Canlı sayt:** https://asifa499.github.io/icherisheher-home/ (GitHub Pages, main branch, root)
- **Repo:** asifa499/icherisheher-home
- **Sahib:** Asif Aliyev (Product Owner, Futurelab)

## Figma mənbəyi

> **2026-09-30 — YENİ FAYL (yeganə dizayn mənbəyi):** dizayn komandası layihəni yeni Figma
> faylına köçürüb. Köhnə fayl `tJ0lCzuMMZdMygPz8nwZEs` ("Icherisheher-Web") **OBSOLETDİR** —
> ondan artıq oxunmur.

- **Fayl:** `1Dt91grTLV8DqpAPEmusE2` ("Icherisheher-Web-New"); səhifələr: `1615:2714` ("✅ home page"), `3003:608` ("ui kit")
- **Home web (1440px):** node `1615:2715` (link: `…/Icherisheher-Web-New?node-id=1615-2714` səhifənin özünə, frame-ə yox, işarə edir; web frame `1615:2715`)
- **Home mobile (393px):** node `3047:12604` (2026-10-01-dən; köhnə `1627:2200`/`1627:1058` silinib). Yeni frame köhnənin surətidir — bütün daxili node ID-lər yenidir (`3047:*`, düymələr `3065:*`), ona görə müqayisə mətn məzmununa görə aparılır.
- Burger menyu: web `1627:4777`, mobil `3047:13848` (bağlı) / `3047:14878` (accordion açıq); köhnə mobil `1638:7180`.
- Axtarış overlay-i: web `1641:10403` (panel `1641:10612`), mobil `3047:14211` (panel `3047:14392`).
  ✅ **2026-10-01 tətbiq edilib:** burger menyu ilə **eyni overlay** (`#nav-menu`, `partials/header.html`),
  `data-mode="menu|search"` (`js/nav-menu.js`). Hero nav-dakı axtarış düyməsi overlay-i axtarış
  rejimində açır, paneldəki axtarış düyməsi menyudan axtarışa keçir. Axtarış rejimində dil/WhatsApp/
  axtarış düymələri (`.nav-menu__menu-only`), sitemap/accordion/ayırıcı gizlənir; web-də foto kart +
  "Inspire me" sırası qalır, mobildə yoxdur. Forma hələ heç yerə göndərmir (nəticə səhifəsi/API yoxdur),
  "Popular searches" linkləri `#`. Panel daxilindəki mətn nav linkləri Figma-dan silinib, saytdan da.
  Mobil accordion açıq halı indi Figma-dadır (16/24 tünd siyahı, aralıq 16px, altında ayırıcı).
- Yeni fayl köhnənin surəti kimi köçürülüb: bütün `1615:xxxx`/`1627:xxxx` ID-lər eyni qalıb; yeni olanlar yalnız wrapper-lər (`3020:*`, `3008/3009:*`) və "ui kit" səhifəsidir.
- Hər `<section>`-ın `data-figma` atributunda öz node ID-si yazılıb. Bu atributları **heç vaxt silmə**.
- Figma-dan oxumaq üçün Figma MCP connector istifadə olunur. Dəyər tərəddüdü olanda screenshot-a yox, node-un faktiki property-lərinə əsaslan.
- **Bilinən MCP məhdudiyyəti:** bu fayl üçün `get_metadata` və (default) `get_design_context` böyük frame-lərdə (~9000px hündürlük) boş və ya kəsik (JSON parse xətası) cavab qaytarır. İşləyən yol: `get_design_context` `forceCode: true` + `excludeScreenshot: true` ilə tam kod dump-ı almaq (nəticə fayla yazılır), sonra `data-node-id` / `top-[…px]` / mətn məzmununa görə bölmələri əl ilə uyğunlaşdırmaq — screenshot yalnız vizual təsdiq üçün əlavə istifadə olunur.

## Struktur

```
index.html          — Home: bütün bölmələr bir səhifədə
page-template.html  — boş daxili səhifə şablonu (bax "Yeni səhifə necə yaradılır")
partials/           — header.html (nav + dil seçici + burger menyu), footer.html (sosial feed + footer)
js/include.js       — partial-ları ilk paint-dən əvvəl inject edir (klassik skript, <head>-də)
js/base-url.js      — BASE_URL, siteUrl(), includesReady, onReady() — paylaşılan yol köməkçiləri
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
| 1 | Header + Hero (axtarış paneli, çiplər) | 1615:2716, 1615:3171 | ✅ |
| 2 | UNESCO intro + foto kollaj | 1615:3596 | ✅ |
| 3 | Museums of Icherisheher & Gala | 1615:3450 | ✅ |
| 4 | Ready-made routes | 1615:3089 | ✅ |
| 5 | This season in the Old City | 1615:3017 | ✅ |
| 6 | Resources (tabs + kartlar) | 1615:3675 | ✅ |
| 7 | See What's Nearby (xəritə) | 1615:3617 | ✅ |
| 8 | City Pass (Core/Explorer/Premium) | 1615:2894 | ✅ |
| 9 | App promo + AR Time Machine | 3020:2169 (wrapper; əvvəl 1615:3200), 1615:3372, 1615:3371, 1615:3353 | ✅ |
| 10 | Sosial feed | 1615:3328, 1615:3344 (wrapper `3020:2170` → `3020:2172`) | ✅ |
| 11 | Footer + panoram foto | 1615:3201, 1615:3389, 1615:3439 (wrapper `3020:2172`) | ✅ |

Etap tamamlananda bu cədvəldə statusu ✅ et və commit-ə daxil et.

**2026-09-25 node ID yenilənməsi:** Figma faylı eyni qalıb (`tJ0lCzuMMZdMygPz8nwZEs`), amma
home_page yeni frame-ə köçürülüb (bax "Figma mənbəyi") və bütün bölmə node ID-ləri dəyişib.
Yuxarıdakı cədvəl və `index.html`-dəki `data-figma` atributları yeni ID-lərlə (yalnız web
`1615:xxxx` seriyası) yenilənib; status ✅ saxlanılıb, çünki mövcud markup/CSS hələ dəqiqliyini
itirməyib (yalnız bəzi token dəyərləri dəyişib — bax `css/tokens.css`). Aşağıdakı iki bənd
istisnadır:

- **Yeni, uyğunsuz bölmə:** "Archives to keep with you" (arxiv rəsm/foto satışı, tab-lar +
  kart grid-i) — Figma-da CityPass ilə App promo arasında peyda olub (node `1615:3864`).
  Yuxarıdakı 11 etapın heç birinə uyğun gəlmir, sayta əlavə edilməyib. Əlavə etmək qərarı və
  yeri Asifdən gözlənilir.
- **Struktur fərqləri:**
  - ✅ **Tətbiq edilib (2026-09-25):** Hero naviqasiyasına WhatsApp düyməsi əlavə olundu
    (lang + WhatsApp + search + menu = 4 düymə) — `assets/img/hero-icon-whatsapp.svg`
    (node 1615:2879/2881, Figma-dan çəkilib), link hələ `#`-ə işarə edir, nömrə
    Asifdən gözlənilir. "Inspire me please!" düyməsi (`.btn-inspire`, `css/hero.css`)
    yeni Figma-ya uyğun yenidən quruldu: tam dolğun `--c-flame`(#FB6310)→`--c-gold`
    (#EE25A3) gradient fon (265.43deg, node 1615:3196) + 1px `--c-flame` sərhəd + ağ
    mətn/ikon (`hero-icon-sparkle.svg` fill-i də ağa dəyişdi). Yeni `--c-flame` tokeni
    əlavə olundu (bax `css/tokens.css`) — `--c-orange` (#FD6310) ilə demək olar eyni,
    amma node property-si fərqli xam dəyər qaytardığı üçün ayrıca saxlanılıb.
  - Sosial feed (`1615:3328`/`1615:3344`) indi vizual olaraq Footer-in fon panelinin
    (`1615:3201`, üzü `#E1E1E0`) içinə düşür — əvvəlki ayrı ağ fon yoxdur, ikisi bir davamlı
    boz blokdadır. (Hələ rebuild edilməyib.)
  - ✅ **Tətbiq edilib (2026-09-27):** Burger menyu (hero nav-dakı "Menu" düyməsi) davranışı
    quruldu — Figma web `1627:4777` ("menu" frame) + mobil `1638:7180`. Klikləndə tam-ekran
    overlay açılır: tünd scrim (`--c-scrim-a/b`, rgba(43,43,43,.72→.56)) + hero kartının üstündə
    ağ, `backdrop-blur(--blur-panel:50px)` panel (`.nav-menu__panel`, radius `--r-panel:32px` —
    bu, `--r-lg`-dən fərqli olaraq 768px-də kiçilmir, çünki Figma-da hər iki ölçüdə də sabit 32px
    qalır). Panel daxilində: loqo + (yalnız web) plain-text nav linkləri + hərəkətlər sırası
    (dil/whatsapp/axtarış/bağla — bağlama düyməsi ayrı "X" ikonu, hamburger-in özü deyil, çünki
    fərqli DOM mövqeyindədir), altında 5 sütunlu sitemap (yalnız web, `.nav-menu__sitemap`) və ya
    5 accordion sətri (yalnız mobil, `.nav-menu__accordion` — Figma-da accordion-un "açıq" halı
    verilməyib, ona görə klikləndə eyni sitemap sütununun siyahısını göstərir — bu qərar Figma-da
    təsdiqlənməyib, sadəcə məntiqli defolt davranışdır), ayırıcı xətt, və (yalnız web) 4 foto
    kart + "Inspire me please!" CTA sırası (mobil-də bu sıra yoxdur, tək CTA sətri qalır).
    ✅ **Foto kartlar (2026-09-27):** Figma node 1642:13754/13760/13765/13771-dən çəkilib —
    `hero-menu-tile-{popular-stays,happening-today,best-restaurants,hidden-gems}.jpg`
    (museums-card konvensiyasına uyğun: `<img>` + `.nav-menu__tile-scrim` qradient overlay,
    ağ mətn). "Hidden gems" node-unda Figma-da iki qat var (fon: illüstrasiya xəritə, ön plan:
    əsl foto, 20% qara tint) — sadəlik üçün yalnız ön plan foto (aslan üzlü divar freski)
    istifadə olundu, arxa fon xəritə təkrarı ötürüldü. Kartların linkləri hələ `#`-ə işarə edir
    (hədəf səhifələr Asifdən gözlənilir). Yeni assets: `hero-logo-dark.svg`,
    `hero-icon-{search,lang,whatsapp,chevron-down}-dark.svg`, `hero-icon-close.svg` (hamısı
    Figma-nın faktiki node ikonlarından, ağ→tünd (#222) rəng fərqi ilə) — panel ağ fon
    üzərində olduğu üçün hero-nun ağ ikonları görünməz qalırdı. JS: `js/nav-menu.js` (aç/bağla,
    Escape, scrim klik, accordion toggle — `js/lang.js` konvensiyasını təqib edir).

## Yeni Figma faylı — yenidən xəritələmə (2026-09-30)

Fayl `1Dt91grTLV8DqpAPEmusE2`. Çəkmə yolu: `get_design_context` `forceCode:true` +
`excludeScreenshot:true` (web ~188K simvol, mobil ~148K — nəticə fayla yazılır; `get_metadata`
hər iki home frame-də yenə JSON parse xətası verir).

**Node ID-lər:** 11 etapın hamısı yeni fayldakı faktiki layer-lərlə ad/məzmun/`top` üzrə
uyğunlaşdırıldı — web və mobil üçün heç bir ID dəyişmədi, yeganə istisna: app promo panel fonu
`1615:3200` yeni faylda yoxdur, yerinə wrapper `3020:2169` (top 6862, 1392×668) var; `index.html`
və cədvəl bunu əks etdirir. Footer/sosial wrapper-ləri: `3020:2172` (top 7627) → `3020:2170` (sosial)
+ `1615:3201/3389/3439` (footer). Uyğunlaşdırıla bilməyən bölmə yoxdur.
Yeni (etap cədvəlinə aid olmayan): `3020:1344` (hero "menu web" nav komponenti), `3008/3009:*`
(nearby xəritə kartının daxili qrupları).

**Dizayn tokenləri (yalnız `css/tokens.css`, dəyərlər):** köhnə → yeni
- `--c-text-dark` `#221D17` → `#211C16` (citypass, app promo)
- `--c-text-muted` `#AFAFAF` → `#ABABAB` (intro)
- `--c-chip-peach` `#FFEEE5` → `#FEEEEB` (brand/light)
- `--c-date-day-bg` `#F6DBCC` → `#FBCBC4` (brand/medium)
- `--c-audio-peach` `#F7DCCD` → `#FEEEEB` (brand/light)
- `--t-h2-lh` `44px` → `40px` (title4/medium 36/40)

Yeni fayl rəng/tipoqrafiyanı paint/text style əvəzinə **dəyişənlərlə** verir (`brand/base #F3503A`,
`brand/light #FEEEEB`, `brand/medium #FBCBC4`, `content/primary #1E1F21`, `content/secondary #414145`,
`content/tertiary #717178`, `surface/primary #FAFAF5`, `surface/quaternary #E6E8EB`, `other/dark #222222`;
mətn: title3 48/56, title4 36/40, title5 32/40, header 24/32, subheader 20/24, body 16/24, caption 14/20,
hamısı letterSpacing −3%). Bunlardan `#F3503A`, `#FAFAF5`, `#717178`, `#414145`, `#FBCBC4`, `#222222`
mövcud tokenlərlə eynidir; letter-spacing −0.03em CSS-də artıq var.

**Təsdiqlənməmiş / Asifin qərarı lazım olanlar (token dəyişdirilmədi):**
- `content/primary` `#1E1F21` (22 istifadə, o cümlədən intro mətni 1615:3601) üçün token yoxdur;
  `--c-text-dark` indi `#211C16`-dır, intro isə `#1E1F21` istəyir → `--c-content-primary` tokeni
  əlavə edib `intro.css`-i ona bağlamaq (bölmə səviyyəli, ayrıca tapşırıq).
- `#E0E0E0` (Archives şəkil fonu), `#545557` (app promo mətni), `#E6E8EB` (`surface/quaternary`) yeni
  dəyərlərdir, tokeni yoxdur — müvafiq bölmə rebuild olunanda əlavə olunacaq.
- `--c-brand #886D46`, `--c-surface #EAEAEA` (yalnız mobildə 4 istifadə), `--c-gold`/`--c-flame`
  (gradient — dəyişməyib) — web home-da `#886D46` heç yoxdur; saxlanıldı.
- Mobil frame və menyu frame-ləri (1627:4777 / 1638:7180) hələ köhnə dəyərləri saxlayır
  (`#FFEEE5` ×5 mobildə, `#221D17`, `#AFAFAF`) — web ilə uyğunsuz; dizayn komandası yeniləyənə qədər web etalondur.
- `--t-h4` 24/28 vs Figma `header/*` 24/32 (web-də 6 istifadə 24/32, mobildə 24/28) — qeyri-müəyyən, toxunulmadı.

**Quruluş fərqləri (yenidən qurulmayıb — Asifin baxışı üçün):**
- **Archives to keep with you** (`1615:3864`, CityPass–App arası) — hələ əlavə edilməyib (əvvəlki qeyd qüvvədədir).
- **Nearby çipləri:** Figma 11 çip göstərir (All, Museum, Shop, Institutional building, Restaurant, Hotel, Park,
  **Mobility, Utilities, Art gallery, Tour agency, TIC**); saytda 7. Dörd-beş yeni kateqoriya üçün
  `CATEGORY_BY_DB`/`PLACE_CATEGORY_OVERRIDES` qərarı lazımdır.
- **Sosial feed + footer** bir davamlı boz blokdadır (`3020:2172` wrapper) — əvvəlki qeyd qüvvədədir.
- Bölmə ardıcıllığı (hero → intro → museums → routes → season → resources → nearby → citypass →
  [archives] → app → AR → social/footer) saytla üst-üstə düşür. Mətnlər (hero, intro, museums, routes,
  season, citypass, app, AR, footer, resources) saytın mətnləri/datası ilə üst-üstə düşür.
- Burger menyu frame-i (1627:4777) hero paneli/çiplərini köhnə rənglə göstərir (yuxarıya bax) — struktur dəyişməyib.

## Dizayn yenilənməsi — ui kit düymələri (2026-10-01)

Eyni fayl/node (`1615:2715`). 2026-09-30 dump-ı ilə node-node diff edildi (bax: `get_design_context`
forceCode). Əsas dəyişiklik: **bütün düymələr "ui kit" `button` komponentinin instance-ına keçib**
(`3034:*`, `3039:*`, `3062:*`) — tokens.css-də `--btn-pad-md/sm`, `--btn-gap`, `--c-btn-neutral` ilə
ifadə olunub (ölçü: md 46px = 12/16 + 16/20 semibold; sm 38px = 8/16 + 14/20 semibold; 1px sərhəd).

**Tətbiq edilib:**
- Hero: nav mətn linkləri (Explore / Things to do / … `1615:2845`) silindi (burger menyuda qalır);
  explore paneli başlıqları 20 → 18px; çiplər + "Inspire me" → sm.
- Bütün bölmələrin düymələri → md/sm (intro, museums, routes, season, resources, nearby, citypass,
  app/AR, social). Neutral fon `#E5E5E5` → `rgba(0,0,0,.04)`; aktiv/outline haşiyə 2px → 1px.
- App promo: App store/Google play brand/base → neutral (tünd mətn); QR plitəsi `#F3503A` 104px →
  `rgba(0,0,0,.08)` 96px, QR özü tünd. AR: "Explore" ağ → primary; "Get your pass" → neutral.
  Sosial "Follow" brand/base → ai gradient.
- Tipoqrafiya: 16px gövdə mətnlərinin əksəriyyəti 24 → 20 sətirarası (body/medium 16/20); City Pass adı
  22/28 → 24/32; tarix nişanı 28/36 → 24/32; nearby kart başlığı Host Grotesk → Vela Medium 24/32.
- Token dəyərləri: `--c-label` #717178 → #818181, `--c-value`/`--c-place-body` → #545557
  (content/secondary), `--c-place-title` → #1E1F21, `--c-cta-peach` #FEE2D2 → #FEEEEB, `--t-date`,
  `--t-price-lh`; yeni: `--t-header`, `--c-content-secondary`, düymə tokenləri.
- İkonlar (eyni fayl adları, yeni Hugeicons outline versiyası, 20×20): bilet
  (`museum-icon-ticket-btn`, `hero-chip-city-pass`, `route-icon-pass`), `hero-chip-audioguide`,
  `nearby-icon-audio`, `appar-icon-appstore/googleplay`, `appar-qr`.

**Tətbiq edilməyib (Asifin qərarı / dizayn komandası):**
- ~~"spoon" ikonu~~ — səhv diaqnoz idi: MCP kod dump-ı instance-larda **icon swap override-ını
  itirir** (əsas komponentin "spoon" vektorunu qaytarır). Düzgün ikon üçün instance node-un
  ÖZÜNÜ çək (məs. `get_design_context` `I3065:18098;3034:44962` → `flag-01`). Bu yolla
  `hero-chip-tour` (flag-01), `hero-chip-digimap` (maps-search), `hero-icon-sparkle` (ai-magic,
  Figma-da şaquli çevrilmiş) yeniləndi.
- Nearby: köhnə tünd "Google maps" nişanı (`1615:3623`) yerində qalıb, üstünə ikinci, neutral
  "Google maps" düyməsi (`3065:17176`) qoyulub — hansının qalacağı bəlli deyil, sayt dəyişmədi.
- "Archives to keep with you" (`3051:16017`) yenidən dizayn olunub (karusel + ←/→ düymələri) —
  saytda hələ yoxdur (əvvəlki qeyd qüvvədədir).
- Burger menyu frame-i (`1627:4777`) yenilənməyib (köhnə 16/24 çiplər) — paylaşılan `.btn-inspire`
  web home-a uyğun yeniləndi, menyunun qalanı toxunulmadı.
- **Mobil (`3047:12604`):** dizayn komandası yalnız **hero explore panelini** yeniləyib — çiplər və
  "Inspire me" mobildə **md** ölçüdədir (46px, 16/20; web-də sm), başlıqlar 20/24 qalır, panel 334px
  enində + radius 32px. Mobil frame-in qalan bölmələri hələ köhnə düymə stilindədir (`#E5E5E5` fon,
  10/20 paddinq) — saytda onlar web-in yeni ui kit stilini izləyir (dizayn yeniləyəndə yoxlanmalı).

## Etap iş axını

1. Asif "Etap N" deyir.
2. Figma-dan həmin node-un tam kontekstini çək (layout, ölçülər, rənglər, mətnlər) — həm web, həm mobile variantını.
3. Markup + CSS yaz (`css/<section>.css`), placeholder-i əvəz et.
4. Şəkil lazımdırsa: Asifdən dəqiq siyahı ilə istə (hansı layer, hansı format). Fayllar `assets/img/`-ə bölmə-prefiksli adla düşür; gələnə qədər `--c-surface` fonlu placeholder div işlət.
5. Commit + push → Asif canlı linki Figma ilə tutuşdurur → düzəlişlər → təsdiq → cədvəldə status yenilə → növbəti etap.
6. **Hər tapşırıq push ilə bitir.** Commit(-lər) atılması tapşırığı bitirmir — hər commit-dən (və ya bir neçə ardıcıl commit-dən) sonra həmişə `origin main`-ə push et və uğurunu yoxla (məs. `git log origin/main` nəticədə gözlənilən commit-ləri göstərməlidir). Yalnız push təsdiqləndikdən sonra iş bitmiş kimi bildirilir.

## Dizayn dəyişikliyi iş axını

Figma mənbəyi dəyişəndə (yeni fayl/link, rəng-tipoqrafiya yenilənməsi, node köçürülməsi və s.)
iki fərqli səviyyə var, qarışdırılmamalıdır:

- **Token səviyyəli dəyişiklik** — rəng/ölçü/radius *dəyəri* dəyişib, amma layout, element sayı
  və yerləşməsi eynidir: YALNIZ `css/tokens.css` yenilənir. Heç bir `<section>`-ın markup-ı və
  ya öz CSS faylı (`css/<bölmə>.css`) toxunulmur. Yeni dəyər Figma-dan (paint/text style və ya
  faktiki node property-si — bax "Bilinən MCP məhdudiyyəti" yuxarıda) təsdiqlənmədən token
  yazılmır; naməlum/qərarsız hallar dəyişdirilmədən qeyd (comment) kimi saxlanılır.
- **Bölmə səviyyəli dəyişiklik** — layout, elementlərin sayı/yerləşməsi, yeni və ya silinmiş
  element: həmin bölmənin Figma node-u yenidən çəkilir və YALNIZ o bölmənin öz CSS faylı
  (+ lazım gələrsə markup-ı) düzəlişlənir. Digər bölmələrə toxunulmur. Belə bir dəyişiklik
  aşkarlananda (məs. yeni bölmə, yeni element) dərhal rebuild edilmir — CLAUDE.md-də qeyd
  olunur və Asifin qərarı gözlənilir (bax yuxarıdakı etap cədvəlinin qeydləri).
- Heç vaxt rəng/ölçü/radius-u CSS-də hardcode yazma — hamısı `tokens.css`-dəki dəyişənlərdən
  keçir (bax Qayda 2).
- Figma root node ID-ləri dəyişəndə (fayl köçürülüb və ya yeni frame yaradılıb) `## Figma
  mənbəyi` bölməsi və etap cədvəlinin node ID-ləri yenilənir, `index.html` və `partials/*.html`-dəki bütün
  `data-figma` atributları uyğunlaşdırılır.

## API inteqrasiyası

Etap 3-dən başlayaraq bölmələr **data-driven**-dir: məzmun HTML-ə hardcode yazılmır, `data/<section>.json`-dan vanilla JS modulu (`js/<section>.js`) ilə render olunur.

- **Backend:** öz API-mizi qururuq — repo `icherisheher-api`, Node.js/Express + PostgreSQL, Railway-də host olunur: `icherisheher-api-production.up.railway.app`.
- **Ödənişlər** kənar sistemdə qalır (client-in mövcud ödəniş provayderi) — frontend yalnız `ticket_url`-a yönləndirir, ödəniş axınını özü idarə etmir.
- **Trilingual sxem:** mətn sahələri (`name`, `short_description`, `address` və s.) `{ "az": "...", "en": "...", "ru": "..." }` formatındadır. ✅ **2026-09-28 UI dil seçicisi bağlandı:** hər `js/<section>.js`-dəki `LANG` sabiti indi `let`-dir və `js/i18n.js`-in `getLang()`/`onLangChange()`-i ilə idarə olunur (bax aşağıdakı yeni bölmə).
- **Fallback tələbdir:** `API_URL` `icherisheher-api`-yə (Railway) işarə edir; sorğu uğursuz olarsa (server yatıb, CORS və s.) modul avtomatik olaraq öz `data/<section>.json`-unu (mock/local) çəkir. Hər ikisi də alınmasa səhifə boş qalmır, `data-state="error"` ilə boş vəziyyət göstərilir.
- **Nümunə:** `data/museums.json` + `js/museums.js` (Etap 3), `data/routes.json` + `js/routes.js` (Etap 4), `data/events.json` + `js/events.js` (Etap 5), `data/news.json` + `js/news.js` (Etap 6), `data/places.json` + `js/places.js` (Etap 7), `data/passes.json` + `js/passes.js` (Etap 8). Yeni data-driven bölmə əlavə edəndə bu nümunəni təkrarla: JSON faylında yuxarıdakı trilingual sxemi saxla, `API_URL`-i `icherisheher-api`-nin uyğun endpoint-inə yönləndir, `FALLBACK_URL`-i local JSON-a saxla.

### Trilingual UI (AZ/EN/RU) — `js/i18n.js`

✅ **2026-09-28 tətbiq edilib.** Statik mətn (nav, hero, başlıqlar, düymələr,
footer sütunları, alt/aria-label-lar) `js/i18n.js`-dəki `DICT` obyektində
`{ az, en, ru }` şəklində saxlanılır; `index.html`-dəki elementlər
`data-i18n="<key>"` (innerHTML) və ya `data-i18n-alt` / `data-i18n-aria-label` /
`data-i18n-placeholder` (uyğun atribut) ilə işarələnir. İkon+mətn kombinasiyaları
(çiplər, `.btn-inspire` və s.) mətni ayrıca `<span data-i18n="…">`-də saxlayır ki,
`innerHTML` təyini ikonu silməsin.

- **Dil seçici:** hero nav-dakı və burger menyu panelindəki iki `[data-lang]`
  nüsxəsi `js/lang.js` tərəfindən idarə olunur — hər ikisi `js/i18n.js`-in
  `getLang()`/`setLang()`-inə bağlıdır, ona görə biri ilə dəyişəndə digəri də
  avtomatik sinxronlaşır (`onLangChange` callback-i ilə). RU seçimi flag 🇷🇺
  ilə hər iki dropdown-a əlavə olunub.
- **Seçim yadda saxlanılır:** `localStorage["ich-lang"]`, defolt `en`. Hər dəyişiklikdə
  `<html lang>` də yenilənir.
- **Data-driven bölmələr** (museums/routes/events/news/places/passes):
  `js/<section>.js`-dəki `LANG` sabiti indi `let`-dir, modul `js/i18n.js`-dən
  `getLang()` ilə başlanğıc dəyəri oxuyur və `onLangChange()` ilə abunə olub
  ARTIQ ÇƏKİLMİŞ data-nı (API-yə təkrar sorğu getmədən) yeni dildə yenidən
  render edir; aktiv seçim vəziyyəti (aktiv çip/tab/kart) qorunur. JS
  şablonlarındakı sabit düymə/etiket mətnləri (məs. "Get a ticket", "Open hours")
  həmin modulda `t("<key>")` ilə `js/i18n.js`-in lüğətindən çəkilir.
- **Şrift:** Vela Sans-ın hər üç faylı (Regular/Medium/SemiBold) Azərbaycan
  xüsusi hərflərini (ə, ş, ç, ö, ü, ğ, ı) və kiril əlifbasını tam əhatə edir
  (fontTools `getBestCmap()` ilə yoxlanılıb, 2026-09-28) — fallback lazım deyil.
- **YOXLA (Asifin nəzərdən keçirməsi lazımdır):** `js/i18n.js`-dəki
  `footer.address` (küçə adının rəsmi RU transliterasiyası) və
  `footer.copyright` (EN mətni orijinal "Icharishahar" yazılışını olduğu kimi
  saxlayır) açarları — DICT-də "// YOXLA:" şərhi ilə işarələnib.

### Xəritə (Etap 7)

> **2026-09-29 — Google Maps JS API:** xəritə indi Google Maps JavaScript API ilə
> qurulur (`js/places-map.js`; açar, timeout və Snazzy "Ultra Light with Labels" stil
> massivi `js/map-config.js`-də — açar referrer-məhdudiyyətlidir, repo-da qala bilər).
> Markerlər `places` datasından, kateqoriyaya görə ikonlu pin-lərdir (`.nearby-pin`,
> `css/nearby.css`; ölçülər `--pin-size*` tokenləri). Çip markerləri süzür, kart/hash/marker
> klikı `panTo` ilə (kart örtdüyü sahə nəzərə alınır) hamar köçür, aktiv marker vurğulanır.
> **Fallback:** açar yoxdursa, script 3 s-də yüklənməzsə, `gm_authFailure` və ya Google-un xəta
> paneli (`BillingNotEnabledMapError` və s.) çıxarsa aşağıda təsvir olunan açarsız iframe bərpa
> olunur. Google Cloud layihəsində Billing + Maps JavaScript API aktiv olmalıdır.
> Aşağıdakı iframe/`navigateMap` təsviri artıq YALNIZ fallback rejiminə aiddir.

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

### Bölmə feature toggle-ları (`js/config.js`)

Səhifə yüklənəndə `js/config.js` `GET /api/config`-i (`icherisheher-api`,
Railway) çağırır. Cavab formatı `{ "sections": { "<flag>": true|false, ... } }`-dur.
`false` olan hər flag `SECTION_ID_BY_FLAG` map-i (`js/config.js`) vasitəsilə
uyğun `<section>` (və ya `<footer>`) `id`-sinə köçürülür və o element
`.section-hidden` sinfi (`display:none`, `css/base.css`) ilə gizlədilir —
DOM-dan silinmir. Əksər flag açarları bölmə `id`-si ilə eynidir, iki istisna
API-nin öz resurs adlandırmasını izləyir:

| Flag açarı (API) | Bölmə `id` | Bölmə |
|---|---|---|
| `hero` | `hero` | Header + Hero |
| `intro` | `intro` | UNESCO intro + foto kollaj |
| `museums` | `museums` | Museums of Icherisheher & Gala |
| `routes` | `routes` | Ready-made routes |
| `events` | `season` | This season in the Old City (Etap 5 resursu `js/events.js` ilə eyni adı daşıyır) |
| `resources` | `resources` | Resources (tabs + kartlar) |
| `nearby` | `nearby` | See What's Nearby (xəritə) |
| `citypass` | `citypass` | City Pass |
| `appar` | `app-ar` | App promo + AR Time Machine (defisiz) |
| `social` | `social` | Sosial feed |
| `footer` | `footer` | Footer + panoram foto |

**FAIL-OPEN qaydası:** sorğu uğursuz olarsa, 2 saniyədən çox çəkərsə
(`AbortController` ilə timeout), cavab JSON deyilsə, `sections` obyekti
yoxdursa, ya da hər hansı flag obyektdə yoxdursa — o bölmə (və ya bütün
bölmələr) görünən qalır. Bölmə yalnız uyğun flag **açıq şəkildə `false`**
olanda gizlədilir. `config.js` `index.html`-də digər bölmə skriptlərindən
(`js/museums.js` və s.) ƏVVƏL yüklənir.

## Səhifə arxitekturası (2026-09-28)

Build addımı yoxdur. Çox-səhifəli sayt üçün üç paylaşılan hissə:

- **Partial-lar:** `partials/header.html` (hero nav + dil seçici + burger menyu) və
  `partials/footer.html` (sosial feed `#social` + footer `#footer`). Səhifədə
  `<div data-include="header"></div>` / `<div data-include="footer"></div>` yazılır;
  `js/include.js` placeholder-i partial-ın məzmunu ilə **əvəz edir** (wrapper qalmır →
  DOM əvvəlki inline markup ilə eynidir). Header/footer markup-ını YALNIZ partial-da
  dəyiş — `index.html`-də artıq nüsxəsi yoxdur.
  - `include.js` `<head>`-də, CSS-dən sonra, `defer`/`async` OLMADAN yüklənir: partial
    sorğuları parse-dan əvvəl başlayır, `<html class="is-including">` isə body-ni
    inject bitənə qədər `visibility:hidden` saxlayır (layout flash yoxdur; şəbəkə
    ilişsə 3 s sonra hər halda göstərilir).
  - Partial-da `data-include-portal` olan top-level element placeholder yerinə
    `<body>`-nin sonuna köçürülür — burger menyu (`#nav-menu`) belədir, çünki
    `.hero`-nun `isolation:isolate` konteksti içində `z-index` sonrakı bölmələrin
    altında qalardı.
  - `window.ICH.includesReady` (Promise) inject bitəndə həll olunur. Partial DOM-una
    toxunan modullar (`i18n.js`, `nav-menu.js`, `config.js`; `lang.js` və bölmə
    skriptləri `i18n.js`-i import etdikləri üçün avtomatik) onu top-level `await` ilə
    gözləyir. Bu səbəbdən modullarda `DOMContentLoaded` əvəzinə `onReady(fn)`
    (`js/base-url.js`) işlədilir — TLA-dan sonra DCL artıq keçmiş ola bilər.
- **URL/yol strategiyası (GitHub Pages project site):** sayt `/icherisheher-home/`
  alt-qovluğunda, lokal serverdə isə `/`-dadır. `BASE_URL` hardcode edilmir — skriptin
  öz URL-indən hesablanır (`js/` qovluğunun valideyni): `js/base-url.js`-də
  `new URL("../", import.meta.url).pathname`, `js/include.js`-də eyni qayda
  `document.currentScript.src`-dən (`window.ICH.BASE_URL`). Nəticə həmişə kök-nisbi
  yoldur (`/icherisheher-home/` və ya `/`), domen/alt-qovluq dəyişəndə heç nə
  redaktə olunmur.
  - **Partial-lar:** bütün yollar `{{BASE}}assets/...` şəklindədir (`include.js` əvəz edir).
  - **JS:** hər lokal yol `siteUrl("data/x.json")` / `siteUrl("assets/img/…")`-dən
    keçir (API-dən gələn nisbi `image` sahələri də). Mütləq URL-lər (`https:`, `/…`,
    `#…`) toxunulmur. `picture()` (`js/picture.js`) hər iki formanı tanıyır.
  - **Şəkil yolları (data/API):** render modulları `image`/`images` sahələrini və
    `IMG` ikon prefiksini `imageUrl()`-dən (`js/base-url.js`) keçirir: `http(s)://`
    ilə başlayan dəyər olduğu kimi qalır, qalan hər şey (`assets/…`, `./…`, `/…`)
    `BASE_URL`-ə bağlanır, boş/null → `""`.
  - **CSS:** `url("../assets/…")` CSS faylının özünə nisbidir — hər dərinlikdə işləyir.
  - **Statik HTML (`<head>` link-ləri, səhifənin öz `<img>`-ləri):** build olmadığı
    üçün sənəd-nisbi yazılır — kökdəki səhifədə `./`, bir səviyyə dərində `../`
    (bax aşağıdakı addımlar). `<base href>` işlədilmir, çünki `href="#"` linklərini və
    places.js-in hash sinxronunu sındırır (`404.html` istisnadır — orada heç bir hash
    linki yoxdur).
  - Loqo linki (`.hero__logo`, `.nav-menu__logo`) `{{BASE}}`-ə, yəni Home-a gedir.
- **Paylaşılan vs bölmə skriptləri:** `include.js` (head), `i18n.js`, `config.js`,
  `lang.js`, `nav-menu.js` HƏR səhifədə yüklənir və səhifədən asılı deyil (olmayan
  elementi sadəcə ötürür). Bölmə skriptləri (`museums.js`, `routes.js`, `events.js`,
  `news.js`, `places.js`, `passes.js`) yalnız həmin bölmə olan səhifədə qoşulur.
  - `config.js`: səhifədə olmayan bölmənin flag-ı heç nə etmir; `social`/`footer`
    flag-ları partial-dakı elementlərə tətbiq olunur (inject-dən sonra).
  - `i18n.js`: səhifəyə xas açarlar `window.ICH.pageDict`-də verilir (modul
    skriptlərindən əvvəl klassik inline `<script>`-də); ümumi açarların üstünə yazmır.
- **Keş qeydi:** GitHub Pages HTML/JS-ə `max-age=600` qoyur — deploy-dan sonra ~10 dəq
  ərzində köhnə/yeni fayl qarışığı mümkündür (məs. köhnə `config.js` + yeni `index.html`).
  Lokal yoxlamada da brauzer köhnə JS-i keşdən verə bilər — hard reload et.

## Yeni səhifə necə yaradılır

1. **Qovluq + fayl:** `page-template.html`-i `<slug>/index.html` kimi kopyala
   (URL `/<slug>/` olur, məs. `museums/index.html` → `/icherisheher-home/museums/`).
2. **Yolları dərinliyə uyğunlaşdır:** şablonda HƏR statik yol `./` ilə başlayır —
   kopyada hamısını `../` ilə əvəz et (iki səviyyə dərində `../../`):
   ```bash
   sed -i '' 's#="\./#="../#g' museums/index.html
   ```
   Partial-lar, data JSON-ları və JS-in render etdiyi şəkillər BASE_URL ilə avtomatik
   həll olunur — onlara toxunma.
3. **`PAGE:` işarələrini doldur:** `<title>`, `description`, `canonical` + `og:url`
   (mütləq URL, sonunda `/`), `noindex` meta-nı sil.
4. **Mətnlər:** `window.ICH.pageDict`-ə səhifənin açarlarını `{ en, az, ru }` ilə yaz
   (`page.<slug>.*` prefiksi ilə), elementlərdə `data-i18n="…"` işlət. Nav/footer
   açarları artıq `js/i18n.js`-dədir.
5. **Bölmələr:** placeholder `<section class="section is-placeholder">`-i real
   bölmələrlə əvəz et; hər `<section>`-a `id` + `data-figma` ver, stili
   `css/<bölmə>.css`-də (tokens-dən kənar dəyər yox — Qayda 2). Home bölməsini təkrar
   işlədirsənsə, onun CSS-ini `<head>`-ə, JS-ini (`<script type="module">`) paylaşılan
   skriptlərdən SONRA əlavə et. Feature flag lazımdırsa `js/config.js`-in
   `SECTION_ID_BY_FLAG`-ına və CLAUDE.md-dəki cədvələ əlavə et.
6. **Yeni JS modulu** yazırsansa: lokal yolları `siteUrl()`-dən keçir, `DOMContentLoaded`
   əvəzinə `onReady()` işlət (hər ikisi `js/base-url.js`), header/footer DOM-una
   toxunursa əvvəlcə `await includesReady`.
7. **Linklər:** header/footer-dəki müvafiq `href="#"`-i `partials/*.html`-də
   `href="{{BASE}}<slug>/"` ilə əvəz et (bütün səhifələrdə birdən yenilənir).
8. **Yoxla:** lokal serverdə (`.claude/launch.json` → `static`) `/<slug>/` aç — Network-də
   404 olmamalı, dil dəyişəndə səhifə mətnləri də dəyişməli, burger menyu açılmalıdır.
   Sonra commit + push, canlı linkdə `/icherisheher-home/<slug>/` yoxla.

## Performans və SEO (2026-09-28)

- **Şəkillər:** `assets/img`-dəki hər `.jpg`/`.png`-in yanında eyni adlı `.webp` var
  (`scripts/build-images.mjs`, `npm i --no-save sharp && node scripts/build-images.mjs`).
  Orijinal JPG/PNG toxunulmaz fallback kimi qalır. Yeni raster şəkil əlavə edəndə skripti
  yenidən işlət. İstifadə qaydası:
  - Statik `<img>` → `<picture><source srcset="….webp" type="image/webp"><img src="….jpg" …></picture>`.
    `picture { display: contents }` (base.css) sayəsində layout birbaşa `<img>`-ə tətbiq olunur.
  - JS-lə render olunan kartlar → `js/picture.js`-in `picture(src, imgHtml)` helper-i (yalnız
    lokal `assets/img/*.jpg|png` yollarını bükür). `.webp` tapılmasa, helper `<source>`-u silib
    JPG-yə qayıdır.
  - CSS fonları (hero, AR Time Machine) → `image-set(… type("image/webp"), … type("image/jpeg"))`.
  - Hero fonu (LCP) `<head>`-də `rel="preload"` ilə yüklənir; aşağıdakı bütün şəkillər
    `loading="lazy"` + `width`/`height` atributları ilə.
- **Meta:** description, canonical, Open Graph + Twitter (`assets/img/og-image.jpg`, 1200×630,
  build skripti ilə hero fotosundan), favicon dəsti (loqodakı öküz başı emblemi, `--c-brand`
  fonda; `favicon.ico`, `favicon-*.png`, `apple-touch-icon.png`, `android-chrome-*.png`,
  `site.webmanifest` — hamısı kökdə). Domen dəyişəndə `index.html`-dəki mütləq
  `og:url`/`og:image`/`canonical` URL-lərini yenilə.
- **404.html:** GitHub Pages üçün; `<base href="/icherisheher-home/">` ilə işləyir (başqa
  hosta/alt-qovluğa köçəndə base-i dəyiş). Üslub: `css/404.css`.

## Design tokens xülasəsi (tam siyahı: css/tokens.css)

- **Rənglər:** brand `#886D46` · orange `#FD6310` · black `#222222` · gray `#818181` · light-gray `#E5E5E5` · page-bg `#F5F4F2` · footer-bg `#E1E1E0`
- **Şrift:** Vela Sans — body 16/24 Regular · h2 36/44 Medium · hero 48/56 · small 14/20 · caption 12/16
- **Radius:** pill 1000 · xl 48 · lg 32 · md 24 · sm 12 · xs 8
- **Layout:** kanvas 1440 · blok 1392 · məzmun 1136 · kənar 24 (mobil 16)
