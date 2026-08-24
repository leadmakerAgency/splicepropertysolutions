# Blog publish webhook — GitHub Actions setup

When a **new** blog post is published via CMS and deployed on Vercel, a workflow notifies Leadmaker with the live post URL.

## Required secret

Add this in GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|------|-------|
| `LEADMAKER_BLOG_WEBHOOK_URL` | `https://hooks.leadmaker.agency/webhook/35716357-7325-4da3-ac46-ab23dda1f61c` |

Without this secret, the workflow will fail on the notify step after a new post is detected.

## Webhook payload

Each new post sends a JSON POST:

```json
{
  "event": "blog.post.published",
  "url": "https://www.splicepropertysolutions.co.uk/blog/your-slug",
  "title": "Post title",
  "slug": "your-slug",
  "date": "2026-08-24",
  "source": "splicepropertysolutions",
  "commit_sha": "abc123"
}
```

In n8n, read the URL with `{{ $json.body.url }}`.
