(function () {
  var DEFAULT_PREFS = {
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  };

  function getPrefs() {
    if (window.SPSConsent && window.SPSConsent.readConsent) {
      return window.SPSConsent.readConsent();
    }
    return null;
  }

  function savePrefs(prefs) {
    if (window.SPSConsent && window.SPSConsent.applyConsent) {
      window.SPSConsent.applyConsent(prefs);
    }
  }

  function buildBanner() {
    if (document.getElementById("sps-cookie-banner")) return;

    var banner = document.createElement("div");
    banner.id = "sps-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "sps-cookie-title");
    banner.setAttribute("aria-describedby", "sps-cookie-desc");
    banner.innerHTML =
      '<div class="sps-cookie-inner">' +
      '<h2 id="sps-cookie-title">We use cookies</h2>' +
      '<p id="sps-cookie-desc">We use essential cookies to remember your choices. With your permission, we also load fonts from Google and use Google Analytics to understand how visitors use the site. <a href="/cookie-policy.html">Cookie Policy</a> · <a href="/privacy-policy.html">Privacy</a></p>' +
      '<div class="sps-cookie-actions sps-cookie-actions--primary">' +
      '<button type="button" class="sps-cookie-btn sps-cookie-btn-accept" data-action="accept-all">Accept all</button>' +
      '<button type="button" class="sps-cookie-btn sps-cookie-btn-reject" data-action="reject-all">Reject</button>' +
      '</div>' +
      '<div class="sps-cookie-actions">' +
      '<button type="button" class="sps-cookie-btn sps-cookie-btn-settings" data-action="toggle-prefs">Manage preferences</button>' +
      "</div>" +
      '<div id="sps-cookie-preferences" hidden>' +
      '<div class="sps-cookie-category">' +
      '<div class="sps-cookie-toggle-wrap"><button type="button" class="sps-cookie-toggle" data-key="essential" aria-checked="true" aria-label="Strictly necessary cookies" disabled></button></div>' +
      '<div><h3>Strictly necessary</h3><p>Required to store your cookie preferences. Always active.</p></div>' +
      "</div>" +
      '<div class="sps-cookie-category">' +
      '<div class="sps-cookie-toggle-wrap"><button type="button" class="sps-cookie-toggle" data-key="functional" aria-checked="false" aria-label="Functional cookies"></button></div>' +
      '<div><h3>Functional</h3><p>Loads web fonts from Google (fonts.googleapis.com). Google may receive your IP address.</p></div>' +
      "</div>" +
      '<div class="sps-cookie-category">' +
      '<div class="sps-cookie-toggle-wrap"><button type="button" class="sps-cookie-toggle" data-key="analytics" aria-checked="false" aria-label="Analytics cookies"></button></div>' +
      '<div><h3>Analytics</h3><p>Loads Google Analytics to help us understand how visitors use the site. Google may receive your IP address and usage data.</p></div>' +
      "</div>" +
      '<div class="sps-cookie-category">' +
      '<div class="sps-cookie-toggle-wrap"><button type="button" class="sps-cookie-toggle" data-key="marketing" aria-checked="false" aria-label="Marketing cookies"></button></div>' +
      '<div><h3>Marketing</h3><p>Used for advertising and remarketing. Not currently in use, but you can set your preference now.</p></div>' +
      "</div>" +
      '<div class="sps-cookie-actions" style="margin-top:14px">' +
      '<button type="button" class="sps-cookie-btn sps-cookie-btn-accept" data-action="save-prefs">Save preferences</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    document.body.appendChild(banner);

    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;

      var action = btn.getAttribute("data-action");
      if (action === "accept-all") {
        finish({ essential: true, functional: true, analytics: true, marketing: true });
      } else if (action === "reject-all") {
        finish({ essential: true, functional: false, analytics: false, marketing: false });
      } else if (action === "toggle-prefs") {
        var panel = document.getElementById("sps-cookie-preferences");
        panel.hidden = !panel.hidden;
        banner.classList.toggle("sps-cookie-banner--expanded", !panel.hidden);
      } else if (action === "save-prefs") {
        finish(readToggles());
      }
    });

    banner.addEventListener("click", function (e) {
      var toggle = e.target.closest(".sps-cookie-toggle:not([disabled])");
      if (!toggle) return;
      var checked = toggle.getAttribute("aria-checked") === "true";
      toggle.setAttribute("aria-checked", checked ? "false" : "true");
    });
  }

  function readToggles() {
    var prefs = Object.assign({}, DEFAULT_PREFS);
    document.querySelectorAll("#sps-cookie-preferences .sps-cookie-toggle").forEach(function (toggle) {
      var key = toggle.getAttribute("data-key");
      if (key) prefs[key] = toggle.getAttribute("aria-checked") === "true";
    });
    prefs.essential = true;
    return prefs;
  }

  function setToggles(prefs) {
    document.querySelectorAll("#sps-cookie-preferences .sps-cookie-toggle").forEach(function (toggle) {
      var key = toggle.getAttribute("data-key");
      if (key && prefs[key] !== undefined) {
        toggle.setAttribute("aria-checked", prefs[key] ? "true" : "false");
      }
    });
  }

  function hideBanner() {
    var banner = document.getElementById("sps-cookie-banner");
    if (banner) banner.hidden = true;
  }

  function finish(prefs) {
    savePrefs(prefs);
    hideBanner();
    if (prefs.functional && !document.querySelector('link[href*="fonts.googleapis.com"]')) {
      window.location.reload();
    }
  }

  function openBanner() {
    buildBanner();
    var existing = getPrefs() || DEFAULT_PREFS;
    setToggles(existing);
    var banner = document.getElementById("sps-cookie-banner");
    banner.hidden = false;
    var panel = document.getElementById("sps-cookie-preferences");
    if (panel) {
      panel.hidden = false;
      banner.classList.add("sps-cookie-banner--expanded");
    }
    banner.querySelector("[data-action=accept-all]").focus();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-sps-open-cookie-settings]")) {
      e.preventDefault();
      openBanner();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    buildBanner();
    if (!getPrefs()) {
      document.getElementById("sps-cookie-banner").hidden = false;
    } else {
      hideBanner();
    }
  });
})();
