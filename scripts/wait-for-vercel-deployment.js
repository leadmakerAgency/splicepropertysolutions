// Polls GitHub's Deployments API directly for the Vercel-created deployment
// tied to a commit, instead of depending on a third-party Action. This
// avoids relying on an external action's version tags (which may not exist
// or may change without notice) and keeps the polling logic auditable here.
//
// Vercel's GitHub integration automatically publishes Deployment + Deployment
// Status objects for every push, so no Vercel API token is needed — only the
// default GITHUB_TOKEN with `deployments: read` permission.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TIMEOUT_MS = Number(process.env.DEPLOY_WAIT_TIMEOUT_MS || 600000);
const POLL_INTERVAL_MS = Number(process.env.DEPLOY_WAIT_POLL_INTERVAL_MS || 10000);
const ENVIRONMENT = process.env.DEPLOY_ENVIRONMENT || "Production";

const TERMINAL_OK_STATES = new Set(["success", "inactive"]);
const TERMINAL_FAIL_STATES = new Set(["failure", "error"]);

const githubApi = async (path, token) => {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(
      `GitHub API request to ${path} failed: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

const findDeployment = async ({ owner, repo, sha, token }) => {
  const deployments = await githubApi(
    `/repos/${owner}/${repo}/deployments?sha=${sha}&per_page=100`,
    token
  );
  return deployments.find(
    (deployment) =>
      (deployment.environment || "").toLowerCase() === ENVIRONMENT.toLowerCase()
  );
};

const getLatestStatus = async ({ owner, repo, deploymentId, token }) => {
  const statuses = await githubApi(
    `/repos/${owner}/${repo}/deployments/${deploymentId}/statuses?per_page=1`,
    token
  );
  return statuses[0] || null;
};

const main = async () => {
  const token = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPOSITORY;
  const sha = process.env.COMMIT_SHA || process.env.GITHUB_SHA;

  if (!repoFull) {
    throw new Error("GITHUB_REPOSITORY is not set.");
  }
  if (!sha) {
    throw new Error("COMMIT_SHA / GITHUB_SHA is not set.");
  }

  const [owner, repo] = repoFull.split("/");
  const start = Date.now();
  let deployment = null;

  console.log(
    `Waiting for a "${ENVIRONMENT}" deployment for commit ${sha} in ${owner}/${repo}...`
  );

  while (Date.now() - start < TIMEOUT_MS) {
    if (!deployment) {
      deployment = await findDeployment({ owner, repo, sha, token });
      if (!deployment) {
        console.log("No matching deployment found yet, retrying...");
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      console.log(
        `Found deployment ${deployment.id} (environment: ${deployment.environment}).`
      );
    }

    const status = await getLatestStatus({
      owner,
      repo,
      deploymentId: deployment.id,
      token,
    });

    if (!status) {
      console.log("Deployment has no status yet, retrying...");
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (TERMINAL_OK_STATES.has(status.state)) {
      console.log(`Deployment reached terminal state "${status.state}". Continuing.`);
      return;
    }

    if (TERMINAL_FAIL_STATES.has(status.state)) {
      throw new Error(
        `Deployment failed with state "${status.state}": ${
          status.description || "no description provided"
        }`
      );
    }

    console.log(`Deployment status: "${status.state}", waiting...`);
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Timed out after ${TIMEOUT_MS}ms waiting for the "${ENVIRONMENT}" deployment to complete.`
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
