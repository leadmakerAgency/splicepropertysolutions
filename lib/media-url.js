/**
 * Normalize CMS media paths for the static site.
 * Sveltia/Decap sometimes writes /content/media/... while Eleventy serves files at /media/...
 */
function normalizeMediaUrl(url) {
  if (!url || typeof url !== "string") return url;

  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const withoutContentPrefix = trimmed
    .replace(/^\/content\/media\//, "/media/")
    .replace(/^content\/media\//, "/media/");

  if (withoutContentPrefix.startsWith("media/")) {
    return `/${withoutContentPrefix}`;
  }

  return withoutContentPrefix;
}

module.exports = { normalizeMediaUrl };
