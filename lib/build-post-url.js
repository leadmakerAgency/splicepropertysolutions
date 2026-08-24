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
  if (postData.permalink) {
    const path = postData.permalink.startsWith("/")
      ? postData.permalink
      : `/${postData.permalink}`;
    return path.endsWith("/") ? path : `${path}/`;
  }

  const raw = postData.slug || postData.title || "";
  const slug = normalizeSlug(raw);
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
