// Dil seçici (Figma 1641:11027/12311) — hazırda yalnız UI/vizual seçim.
// Real i18n tərcüməsi hələ bağlanmayıb (bax CLAUDE.md, API inteqrasiyası).

function wireLangSwitcher(wrap) {
  const trigger = wrap.querySelector("[data-lang-trigger]");
  const menu = wrap.querySelector("[data-lang-menu]");
  const currentFlag = wrap.querySelector("[data-lang-current-flag]");
  const currentCode = wrap.querySelector("[data-lang-current-code]");
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
      menu.querySelectorAll("[data-lang-code]").forEach((el) => {
        el.classList.remove("is-active");
        el.setAttribute("aria-selected", "false");
      });
      option.classList.add("is-active");
      option.setAttribute("aria-selected", "true");
      if (currentFlag) currentFlag.textContent = option.dataset.langFlag;
      if (currentCode) currentCode.textContent = option.dataset.langCode;
      close();
    });
  });
}

document.querySelectorAll("[data-lang]").forEach(wireLangSwitcher);
