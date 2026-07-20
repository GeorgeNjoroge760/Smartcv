let _analytics = null;

export function initAnalytics() {
  if (_analytics) return;

  // Plausible (lightweight)
  const plausibleScript = document.createElement('script');
  plausibleScript.defer = true;
  plausibleScript.dataset.domain = 'smartcv-generator.vercel.app';
  plausibleScript.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(plausibleScript);

  _analytics = true;
}

export function trackEvent(event, properties = {}) {
  // Send to our backend for server-side tracking
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});

  // Plausible custom events
  if (window.plausible) {
    window.plausible(event, { props: properties });
  }
}

export function trackPageView(page) {
  trackEvent('pageview', { page });
}

export function trackFeatureUse(feature) {
  trackEvent('feature_used', { feature });
}

export function trackExport(format) {
  trackEvent('export', { format });
}

export function trackUpgrade(source) {
  trackEvent('upgrade_prompt', { source });
}

export function trackSignup(method) {
  trackEvent('signup', { method });
}
