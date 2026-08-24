const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { buildPostUrl } = require("../lib/build-post-url");

const SITE_URL =
  process.env.SITE_URL || "https://www.splicepropertysolutions.co.uk";
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;
const POSTS_FILE =
  process.env.POSTS_FILE ||
  path.join(process.cwd(), ".github", "blog-posts-to-notify.json");

const writeOutput = (name, value) => {
  if (GITHUB_OUTPUT) {
    fs.appendFileSync(GITHUB_OUTPUT, `${name}=${value}\n`);
  }
};

const getNewPostFiles = () => {
  try {
    const output = execSync(
      "git diff --name-only --diff-filter=A HEAD~1 HEAD -- content/posts/",
      { encoding: "utf8" }
    ).trim();

    if (!output) return [];

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter((file) => file.endsWith(".md"));
  } catch {
    return [];
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toISOString().slice(0, 10);
};

const detectNewPublishedPosts = () => {
  const newFiles = getNewPostFiles();
  const posts = [];

  for (const file of newFiles) {
    const absolutePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(absolutePath)) continue;

    const raw = fs.readFileSync(absolutePath, "utf8");
    const { data } = matter(raw);

    const url = buildPostUrl(
      {
        date: data.date,
        draft: data.draft,
        slug: data.slug,
        title: data.title,
        permalink: data.permalink,
      },
      SITE_URL,
      new Date()
    );

    if (!url) continue;

    posts.push({
      url,
      title: data.title || "",
      slug: data.slug || "",
      date: formatDate(data.date),
      file,
    });
  }

  return posts;
};

const main = () => {
  const posts = detectNewPublishedPosts();
  const postsJson = JSON.stringify(posts, null, 2);

  fs.mkdirSync(path.dirname(POSTS_FILE), { recursive: true });
  fs.writeFileSync(POSTS_FILE, postsJson, "utf8");

  writeOutput("has_posts", posts.length > 0 ? "true" : "false");
  writeOutput("posts_file", POSTS_FILE);

  if (posts.length === 0) {
    console.log("No new published blog posts detected.");
    return;
  }

  console.log(`Detected ${posts.length} new published post(s):`);
  for (const post of posts) {
    console.log(`- ${post.url}`);
  }
};

main();
