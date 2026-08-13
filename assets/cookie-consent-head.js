/**
 * Splice Property Solutions — head loader (runs synchronously in <head>).
 * - Google Fonts: loaded only with functional cookie consent.
 * - Google Analytics (G-680ZRPQYLW): gtag.js loads on every page; Consent Mode v2
 *   controls whether analytics data is collected until the visitor accepts analytics cookies.
 */
(function () {
  var STORAGE_KEY = "sps_cookie_consent";
  var GA_ID = "G-680ZRPQYLW";
  var FONT_URL =
    "https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@300;400;500;600&display=swap";
  var analyticsInitialized = false;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function hasAnalyticsConsent() {
    var consent = readConsent();
    return !!(consent && consent.analytics);
  }

  function initGoogleAnalytics() {
    if (analyticsInitialized) return;
    analyticsInitialized = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: hasAnalyticsConsent() ? "granted" : "denied",
      wait_for_update: 500,
    });

    gtag("js", new Date());
    gtag("config", GA_ID);

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(script);
  }

  function setAnalyticsConsent(granted) {
    if (!analyticsInitialized) {
      initGoogleAnalytics();
    }
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  }

  function loadFonts() {
    var pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    document.head.appendChild(pre1);

    var pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    document.head.appendChild(pre2);

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);

    document.documentElement.classList.remove("fonts-fallback");
  }

  var consent = readConsent();
  if (consent && consent.functional) {
    loadFonts();
  } else {
    document.documentElement.classList.add("fonts-fallback");
  }

  initGoogleAnalytics();

  window.SPSConsent = {
    STORAGE_KEY: STORAGE_KEY,
    FONT_URL: FONT_URL,
    GA_ID: GA_ID,
    loadFonts: loadFonts,
    initGoogleAnalytics: initGoogleAnalytics,
    setAnalyticsConsent: setAnalyticsConsent,
    readConsent: readConsent,
    applyConsent: function (prefs) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      localStorage.setItem(STORAGE_KEY + "_date", new Date().toISOString());
      if (prefs.functional) {
        loadFonts();
      } else {
        document.documentElement.classList.add("fonts-fallback");
        document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(function (el) {
          el.remove();
        });
      }
      setAnalyticsConsent(!!prefs.analytics);
    },
  };
})();
