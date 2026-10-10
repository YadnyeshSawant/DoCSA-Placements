/**
 * Vercel Serverless Function & Vite handler for GitHub commits using server-side Environment Variables:
 * - GITHUB_TOKEN
 * - GITHUB_OWNER
 * - GITHUB_REPO
 * - GITHUB_BRANCH (defaults to 'main')
 */

export async function handleGitHubCommit(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // GET: Returns environment variable status (without exposing secrets)
  if (req.method === 'GET') {
    const hasEnvToken = !!process.env.GITHUB_TOKEN;
    const defaultOwner = process.env.GITHUB_OWNER || '';
    const defaultRepo = process.env.GITHUB_REPO || '';
    const defaultBranch = process.env.GITHUB_BRANCH || 'main';

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        hasEnvToken,
        defaultOwner,
        defaultRepo,
        defaultBranch,
      })
    );
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    } else if (!body) {
      // In Vite connect middleware or raw streams
      const buffers: any[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const rawText = Buffer.concat(buffers).toString('utf-8');
      body = rawText ? JSON.parse(rawText) : {};
    }

    const {
      filePath,
      fileContent,
      commitMessage,
      editorName,
      editorEmail,
      owner: clientOwner,
      repo: clientRepo,
      branch: clientBranch,
      token: clientToken,
    } = body || {};

    // Prioritize server-side Environment Variables
    const token = (process.env.GITHUB_TOKEN || clientToken || '').trim();
    const owner = (process.env.GITHUB_OWNER || clientOwner || '').trim();
    const repo = (process.env.GITHUB_REPO || clientRepo || '').trim();
    const branch = (process.env.GITHUB_BRANCH || clientBranch || 'main').trim();

    if (!token) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message:
            'GitHub Token not found. Please set the GITHUB_TOKEN environment variable in your Vercel settings or .env file.',
        })
      );
      return;
    }

    if (!owner || !repo) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message:
            'Repository details missing. Please set GITHUB_OWNER and GITHUB_REPO environment variables, or enter them in the modal.',
        })
      );
      return;
    }

    if (!filePath || !fileContent) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Missing filePath or fileContent.',
        })
      );
      return;
    }

    // 1. Fetch current file SHA if file exists in the repo
    const getUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
    let currentSha: string | undefined = undefined;

    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'MIT-WPU-Placement-Portal',
      },
    });

    if (getRes.ok) {
      const getData = (await getRes.json()) as any;
      currentSha = getData.sha;
    } else if (getRes.status === 401) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Unauthorized (401). Your GITHUB_TOKEN is invalid or has expired.',
        })
      );
      return;
    } else if (getRes.status !== 404) {
      const errData = (await getRes.json().catch(() => ({}))) as any;
      res.statusCode = getRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: `Failed to inspect repository: ${errData.message || getRes.statusText}`,
        })
      );
      return;
    }

    // 2. Encode UTF-8 content to base64
    const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');

    // 3. Commit file via PUT request
    const putUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}`;
    const payload: Record<string, any> = {
      message: commitMessage || 'update - student prn - name',
      content: base64Content,
      branch,
    };
    if (editorName && editorEmail) {
      payload.author = {
        name: editorName,
        email: editorEmail,
      };
      payload.committer = {
        name: editorName,
        email: editorEmail,
      };
    }
    if (currentSha) {
      payload.sha = currentSha;
    }

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'MIT-WPU-Placement-Portal',
      },
      body: JSON.stringify(payload),
    });

    const putData = (await putRes.json().catch(() => ({}))) as any;

    if (!putRes.ok) {
      res.statusCode = putRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: putData.message || `Commit failed with status ${putRes.status}`,
        })
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: `Successfully committed ${filePath} to branch "${branch}"!`,
        commitUrl:
          putData.commit?.html_url ||
          `https://github.com/${owner}/${repo}/commit/${putData.commit?.sha}`,
        commitSha: putData.commit?.sha,
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: `Server commit error: ${err?.message || 'unknown'}`,
      })
    );
  }
}

// Default export for Vercel Serverless Function
export default handleGitHubCommit;
