const { shouldHideInProduction } = require("./lib/post-visibility");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("blog.css");
  eleventyConfig.addPassthroughCopy({ "content/media": "media" });
  eleventyConfig.addPassthroughCopy("admin/");

  const existingPages = [
    "index.html", "moving.html", "investing.html", "retiring.html",
    "concierge.html", "events.html", "tiffany.html", "enquire.html",
    "thank-you.html",
  ];
  for (const page of existingPages) {
    eleventyConfig.addPassthroughCopy(page);
  }

  eleventyConfig.addFilter("rangeFromOne", (end) => {
    const n = Math.max(1, Math.floor(Number(end)));
    return Array.from({ length: n }, (_, i) => i + 1);
  });

  eleventyConfig.addFilter("blogPageCount", (postCount, pageSize) => {
    const count = Number(postCount);
    const size = Number(pageSize) || 15;
    return Math.max(1, Math.ceil(count / size));
  });

  eleventyConfig.addFilter("atomDate", (value) => {
    if (!value) return new Date(0).toISOString();
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return new Date(0).toISOString();
    return date.toISOString();
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("postDate", (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      year: "numeric",
      month: "long",
    });
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 min read";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 230));
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter("relatedPosts", (posts, currentUrl, currentTags, limit) => {
    limit = limit || 3;
    const tags = (currentTags || []).map((t) => t.toLowerCase());
    const candidates = posts.filter((p) => p.url !== currentUrl);
    if (tags.length === 0) return candidates.slice(0, limit);
    const scored = candidates.map((p) => {
      const pTags = (p.data.tags || []).map((t) => t.toLowerCase());
      const overlap = tags.filter((t) => pTags.includes(t)).length;
      return { post: p, score: overlap };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.post);
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/posts/*.md")
      .filter((post) =>
        !shouldHideInProduction({
          date: post.date,
          draft: post.data?.draft,
        })
      )
      .sort((a, b) => b.date - a.date)
  );

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    htmlTemplateEngine: false,
    markdownTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
  };
};
