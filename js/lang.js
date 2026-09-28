// Dil seçici (Figma 1641:11027/12311) — indi js/i18n.js-ə bağlıdır.
// Səhifədə iki nüsxə var (hero nav + burger menyu paneli); ikisi də eyni
// `getLang()`/`setLang()` mənbəyini paylaşdığı üçün biri ilə dəyişəndə
// digəri də sinxron qalır.
import { getLang, setLang, onLangChange } from "./i18n.js";

const FLAGS = { en: "🇬🇧", az: "🇦🇿", ru: "🇷🇺" };
const CODES = { en: "EN", az: "AZ", ru: "RU" };

function syncWrap(wrap, lang) {
  const currentFlag = wrap.querySelector("[data-lang-current-flag]");
  const currentCode = wrap.querySelector("[data-lang-current-code]");
  if (currentFlag) currentFlag.textContent = FLAGS[lang];
  if (currentCode) currentCode.textContent = CODES[lang];
  wrap.querySelectorAll("[data-lang-code]").forEach((option) => {
    const active = option.dataset.langCode.toLowerCase() === lang;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function syncAllWraps(lang) {
  document.querySelectorAll("[data-lang]").forEach((wrap) => syncWrap(wrap, lang));
}

function wireLangSwitcher(wrap) {
  const trigger = wrap.querySelector("[data-lang-trigger]");
  const menu = wrap.querySelector("[data-lang-menu]");
  if (!trigger || !menu) return;

  function open() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("click", onOutsideClick);
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", onOutsideClick);
    document.removeEventListener("keydown", onKeydown);
  }

  function onOutsideClick(event) {
    if (!wrap.contains(event.target)) close();
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      close();
      trigger.focus();
    }
  }

  trigger.addEventListener("click", () => {
    if (menu.hidden) open();
    else close();
  });

  menu.querySelectorAll("[data-lang-code]").forEach((option) => {
    option.addEventListener("click", () => {
      setLang(option.dataset.langCode.toLowerCase());
      close();
    });
  });
}

document.querySelectorAll("[data-lang]").forEach(wireLangSwitcher);
syncAllWraps(getLang());
onLangChange(syncAllWraps);
