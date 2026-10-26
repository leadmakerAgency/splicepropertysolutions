const { shouldHideInProduction } = require("../../lib/post-visibility");
const { normalizeMediaUrl } = require("../../lib/media-url");
const { buildPostPath } = require("../../lib/build-post-url");

module.exports = {
  eleventyComputed: {
    featured_image(data) {
      return normalizeMediaUrl(data.featured_image);
    },
    permalink(data) {
      if (shouldHideInProduction({ date: data.date, draft: data.draft })) {
        return false;
      }
      const path = buildPostPath({
        slug: data.slug,
        title: data.title,
        permalink: data.permalink,
      });
      return path ?? false;
    },
    eleventyExcludeFromCollections(data) {
      return shouldHideInProduction({ date: data.date, draft: data.draft });
    },
  },
};
