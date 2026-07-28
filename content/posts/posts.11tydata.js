const { shouldHideInProduction } = require("../../lib/post-visibility");

module.exports = {
  eleventyComputed: {
    permalink(data) {
      if (shouldHideInProduction({ date: data.date, draft: data.draft })) {
        return false;
      }
      const raw = data.slug || data.title || "";
      const slug = raw
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return `/blog/${slug}/`;
    },
    eleventyExcludeFromCollections(data) {
      return shouldHideInProduction({ date: data.date, draft: data.draft });
    },
  },
};
