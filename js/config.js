const API_URL = "https://icherisheher-api-production.up.railway.app/api/config";
const TIMEOUT_MS = 2000;
const HIDDEN_CLASS = "section-hidden";

// API flag key ({ "sections": { <flag>: bool } }) -> <section>/<footer> id.
// Most keys match the section id 1:1; two don't, following the API's own
// resource naming: "events" is the "season" section (Etap 5, same resource
// as js/events.js), and "appar" (no hyphen) is the "app-ar" section (Etap 9).
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
  appar: "app-ar",
  social: "social",
  footer: "footer",
};

function applyConfig(config) {
  const sections = config && config.sections;
  if (!sections || typeof sections !== "object") return;
  Object.entries(SECTION_ID_BY_FLAG).forEach(([flagKey, sectionId]) => {
    if (sections[flagKey] !== false) return;
    const section = document.getElementById(sectionId);
    if (section) section.classList.add(HIDDEN_CLASS);
  });
}

async function loadConfig() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    if (!res.ok) return;
    const config = await res.json();
    applyConfig(config);
  } catch {
    // fetch failed, aborted (timeout) or response wasn't JSON — fail-open, do nothing.
  } finally {
    clearTimeout(timeoutId);
  }
}

loadConfig();
