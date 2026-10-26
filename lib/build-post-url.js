const { shouldHideInProduction, isPublishedPost } = require("./post-visibility");

const normalizeSlug = (raw) => {
  return raw
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const buildPostPath = (postData) => {
  // Always derive the path from a normalized slug rather than trusting a raw
  // `permalink` frontmatter override verbatim. Some upstream automation has
  // written unsanitized overrides (raw title text with spaces/punctuation)
  // straight into `permalink`, which produces invalid URLs and can collide
  // with other posts that happen to share the same raw text, crashing the
  // Eleventy build (DuplicatePermalinkOutputError). Normalizing here makes
  // the output deterministic, URL-safe, and consistent everywhere this path
  // is used (site build, sitemap/feed, and the publish webhook).
  const rawSource = postData.slug || postData.permalink || postData.title || "";
  const slug = normalizeSlug(rawSource);
  if (!slug) return null;

  return `/blog/${slug}/`;
};

const stripTrailingSlash = (path) => path.replace(/\/+$/, "");

const buildPostUrl = (postData, siteUrl, referenceDate = new Date()) => {
  if (!isPublishedPost(postData, referenceDate)) {
    return null;
  }

  const path = buildPostPath(postData);
  if (!path) return null;

  const base = siteUrl.replace(/\/+$/, "");
  const normalizedPath = stripTrailingSlash(path);
  return `${base}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
};

module.exports = {
  normalizeSlug,
  buildPostPath,
  buildPostUrl,
  stripTrailingSlash,
  isPublishedPost,
  shouldHideInProduction,
};
