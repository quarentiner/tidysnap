let analyticsReady = false;

export function initAnalytics(gaMeasurementId) {
  if (!gaMeasurementId || analyticsReady) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
  document.head.append(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", gaMeasurementId, {
    anonymize_ip: true,
    send_page_view: true
  });

  analyticsReady = true;
}

export function trackEvent(name, params = {}) {
  if (!analyticsReady || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, scrubParams(params));
}

function scrubParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ))
  );
}
