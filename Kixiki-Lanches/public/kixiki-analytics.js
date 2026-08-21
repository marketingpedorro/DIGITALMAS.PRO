(() => {
  "use strict";

  const ENDPOINT = "/api/kixiki-events";
  const ATTRIBUTION_KEY = "kixiki-c001-attribution-v1";
  const EVENTS = Object.freeze({
    pageView: "page_view",
    whatsappClick: "whatsapp_click",
    giftView: "gift_view",
    giftCtaClick: "gift_cta_click",
  });

  const cleanToken = (value) => {
    const token = String(value || "").trim().slice(0, 80);
    return token && /^[a-zA-Z0-9._-]+$/.test(token) ? token : null;
  };

  const cleanReferrer = (value) => {
    if (!value) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      return `${url.origin}${url.pathname}`.slice(0, 240);
    } catch {
      return null;
    }
  };

  const readAttribution = () => {
    let stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}");
    } catch {}

    const params = new URLSearchParams(location.search);
    const current = {
      utm_source: cleanToken(params.get("utm_source")) || cleanToken(stored.utm_source),
      utm_medium: cleanToken(params.get("utm_medium")) || cleanToken(stored.utm_medium),
      utm_campaign: cleanToken(params.get("utm_campaign")) || cleanToken(stored.utm_campaign),
      referrer: cleanReferrer(stored.referrer) || cleanReferrer(document.referrer),
    };
    try {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current));
    } catch {}
    return current;
  };

  const attribution = readAttribution();

  const send = (event) => {
    const body = JSON.stringify({
      event,
      path: location.pathname,
      ...attribution,
    });
    try {
      if (
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }))
      ) {
        return;
      }
    } catch {}
    fetch(ENDPOINT, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  };

  const observeGift = () => {
    const gift = document.querySelector('[data-kx-track-view="gift_view"]');
    if (!gift) return;
    let sent = false;
    const record = () => {
      if (sent) return;
      sent = true;
      send(EVENTS.giftView);
    };
    if (!("IntersectionObserver" in window)) {
      record();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        record();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(gift);
  };

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      send(EVENTS.pageView);
      observeGift();
      document.addEventListener("click", (event) => {
        const link = event.target instanceof Element ? event.target.closest("a") : null;
        if (!link) return;
        if (link.dataset.kxTrack === EVENTS.giftCtaClick) {
          send(EVENTS.giftCtaClick);
        } else if (link.matches('a[href*="wa.me/"]') || link.dataset.kxTrack === EVENTS.whatsappClick) {
          send(EVENTS.whatsappClick);
        }
      });
    },
    { once: true },
  );
})();
