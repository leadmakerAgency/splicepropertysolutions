const fs = require("fs");
const path = require("path");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 3000, 5000];

const postWithRetry = async (webhookUrl, payload) => {
  let lastError;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(
        `Webhook returned ${response.status} ${response.statusText}`
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
};

const main = async () => {
  const webhookUrl = process.env.LEADMAKER_BLOG_WEBHOOK_URL;
  const postsFile =
    process.env.POSTS_FILE ||
    path.join(process.cwd(), ".github", "blog-posts-to-notify.json");
  const commitSha = process.env.COMMIT_SHA || "";

  if (!webhookUrl) {
    throw new Error("LEADMAKER_BLOG_WEBHOOK_URL is not set.");
  }

  if (!fs.existsSync(postsFile)) {
    console.log("No posts file found.");
    return;
  }

  const posts = JSON.parse(fs.readFileSync(postsFile, "utf8"));
  if (!Array.isArray(posts) || posts.length === 0) {
    console.log("No posts to notify.");
    return;
  }

  for (const post of posts) {
    const payload = {
      event: "blog.post.published",
      url: post.url,
      title: post.title,
      slug: post.slug,
      date: post.date,
      source: "splicepropertysolutions",
      commit_sha: commitSha,
    };

    console.log(`Sending webhook for: ${post.url}`);
    await postWithRetry(webhookUrl, payload);
    console.log(`Webhook sent for: ${post.url}`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
