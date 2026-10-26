// Bölmə feature toggle-ları (bax CLAUDE.md). Səhifədən asılı deyil: səhifədə
// olmayan bölmənin flag-ı sadəcə heç nə etmir. "social"/"footer" partials/footer.html-
// dədir, ona görə flag-lar partial-lar inject olunandan sonra tətbiq edilir.
import { includesReady } from "./base-url.js";

const API_URL = "https://icherisheher-api-production.up.railway.app/api/config";
const TIMEOUT_MS = 2000;
const HIDDEN_CLASS = "section-hidden";

// API flag key ({ "sections": { <flag>: bool } }) -> <section>/<footer> id.
// Most keys match the section id 1:1; two don't, following the API's own
// resource naming: "events" is the "season" section (Etap 5, same resource
// as js/events.js), and "appar" (no hyphen) is the "app-ar" section (Etap 9).
// A value may be an array of ids: "inspire" hides the hero's "Inspire me" aside
// together with the divider next to it.
// FAIL-OPEN: missing/unreachable config, timeout or a missing flag all leave
// the section visible — only an explicit `false` hides it.
const SECTION_ID_BY_FLAG = {
  hero: "hero",
  intro: "intro",
  museums: "museums",
  routes: "routes",
  events: "season",
  resources: "resources",
  nearby: "nearby",
  citypass: "citypass",
  collections: "collections",
  inspire: ["inspire", "inspire-divider"],
  appar: "app-ar",
  social: "social",
  footer: "footer",
};

function applyConfig(config) {
  const sections = config && config.sections;
  if (!sections || typeof sections !== "object") return;
  Object.entries(SECTION_ID_BY_FLAG).forEach(([flagKey, target]) => {
    if (sections[flagKey] !== false) return;
    [].concat(target).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add(HIDDEN_CLASS);
    });
  });
}

async function loadConfig() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    if (!res.ok) return;
    const config = await res.json();
    await includesReady;
    applyConfig(config);
  } catch {
    // fetch failed, aborted (timeout) or response wasn't JSON — fail-open, do nothing.
  } finally {
    clearTimeout(timeoutId);
  }
}

loadConfig();
