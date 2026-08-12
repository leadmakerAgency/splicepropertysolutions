/**
 * Splice Property Solutions — consent-gated resource loader (runs synchronously in <head>).
 * Loads Google Fonts only when the visitor has accepted functional cookies.
 */
(function () {
  var STORAGE_KEY = "sps_cookie_consent";
  var FONT_URL =
    "https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@300;400;500;600&display=swap";

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
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

  window.SPSConsent = {
    STORAGE_KEY: STORAGE_KEY,
    FONT_URL: FONT_URL,
    loadFonts: loadFonts,
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
    },
  };
})();
