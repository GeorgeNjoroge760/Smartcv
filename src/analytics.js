// Analytics — Plausible only, no backend.
let _loaded = false;

export function initAnalytics() {
  if (_loaded) return;
  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = 'smartcv-generator.vercel.app';
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
  _loaded = true;
}

export function trackEvent(event, properties = {}) {
  if (window.plausible) {
    window.plausible(event, { props: properties });
  }
}

export function trackFeatureUse(feature) { trackEvent('feature_used', { feature }); }
export function trackExport(format) { trackEvent('export', { format }); }
