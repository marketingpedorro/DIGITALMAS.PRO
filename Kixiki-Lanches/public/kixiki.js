/* eslint-disable */
"use strict";

(() => {
  // 1. Sticky Header Bar
  (function initStickyHeader() {
    const bar = document.getElementById("sticky-header-bar");
    if (!bar) return;

    let ticking = false;
    let lastState = null;

    function update() {
      const isScrolled = window.scrollY > 120;
      if (isScrolled !== lastState) {
        bar.classList.toggle("visible", isScrolled);
        lastState = isScrolled;
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  // 2. Day / Night Theme Controller
  (function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("kx-theme-toggle");
    const themeColorMeta = document.getElementById("kx-theme-color");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storageKey = "kixiki-theme";

    if (!toggle) return;

    function getStoredTheme() {
      try {
        const value = localStorage.getItem(storageKey);
        return value === "day" || value === "night" ? value : null;
      } catch (err) {
        return null;
      }
    }

    function applyTheme(targetTheme, persist) {
      const theme = targetTheme === "night" ? "night" : "day";
      const isNight = theme === "night";

      root.setAttribute("data-kx-theme", theme);
      toggle.setAttribute("aria-checked", String(isNight));
      toggle.setAttribute(
        "title",
        isNight ? "Mudar para o modo DIA" : "Mudar para o modo NOITE"
      );

      if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isNight ? "#001e10" : "#fff8e7");
      }

      if (persist) {
        try {
          localStorage.setItem(storageKey, theme);
        } catch (err) {}
      }
    }

    applyTheme(root.getAttribute("data-kx-theme") || "day", false);

    toggle.addEventListener("click", function () {
      const current = root.getAttribute("data-kx-theme");
      applyTheme(current === "night" ? "day" : "night", true);
    });

    mediaQuery.addEventListener("change", function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? "night" : "day", false);
      }
    });
  })();

  // 3. Section Reveal Animation (IntersectionObserver with safe mobile threshold)
  (function initSectionReveal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll("main > section"));

    sections.forEach((sec, idx) => {
      sec.setAttribute("data-kx-reveal", "");
      sec.style.setProperty("--kx-delay", `${Math.min(idx, 3) * 45}ms`);
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach((sec) => sec.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px 50px 0px", threshold: 0.01 }
    );

    sections.forEach((sec) => observer.observe(sec));
  })();

  // 4. Card Reveal Animation
  (function initCardReveal() {
    const body = document.body;
    if (!body || !body.classList.contains("kx-option-b")) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(document.querySelectorAll(".kx-food-card"));

    cards.forEach((card, idx) => {
      card.setAttribute("data-kx-card-reveal", "");
      card.style.setProperty("--kx-card-delay", `${(idx % 3) * 70}ms`);
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-card-visible"));
      return;
    }

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-card-visible");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px 50px 0px", threshold: 0.01 }
    );

    cards.forEach((card) => cardObserver.observe(card));
  })();
})();
