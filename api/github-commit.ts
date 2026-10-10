/**
 * Secure Serverless Function & Vite handler for saving placement data.
 * Features:
 * - Server-side Environment Variables (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH)
 * - Strict Path Whitelisting (prevents arbitrary file overwriting)
 * - Payload validation (valid JSON check, size limit)
 * - Institutional Email Enforcement (@mitwpu.edu.in required on server)
 * - Anti-tampering & Information Disclosure Protection
 */

const ALLOWED_FILES = new Set([
  'src/data/placements.json',
  'src/data/marqueePartners.json',
]);

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB max payload

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

  // GET: Returns environment variable status (without exposing private repo names)
  if (req.method === 'GET') {
    const hasEnvToken = !!process.env.GITHUB_TOKEN;

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        hasEnvToken,
      })
    );
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
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
      let totalLength = 0;

      for await (const chunk of req) {
        totalLength += chunk.length;
        if (totalLength > MAX_PAYLOAD_BYTES) {
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: 'Payload exceeds size limit.' }));
          return;
        }
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

    // 1. Strict Path Whitelist (Prevent Path Traversal / Arbitrary File Overwrites)
    if (!filePath || !ALLOWED_FILES.has(filePath)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Access denied: Only official placement data files can be updated.',
        })
      );
      return;
    }

    // 2. Validate JSON Structure
    if (!fileContent || typeof fileContent !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Missing or invalid file content.',
        })
      );
      return;
    }

    try {
      JSON.parse(fileContent);
    } catch (err: any) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Invalid payload: fileContent must be valid JSON.',
        })
      );
      return;
    }

    // 3. Enforce MIT-WPU Institutional Identity on Server
    const cleanEmail = (editorEmail || '').trim().toLowerCase();
    const cleanName = (editorName || '').trim();

    if (!cleanEmail.endsWith('@mitwpu.edu.in') || cleanEmail === '@mitwpu.edu.in') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Unauthorized: Changes must be submitted with an official @mitwpu.edu.in email address.',
        })
      );
      return;
    }

    if (cleanName.length < 2) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Invalid author name: Please provide your full faculty or editor name.',
        })
      );
      return;
    }

    // 4. Resolve Server-side Environment Variables
    const token = (process.env.GITHUB_TOKEN || clientToken || '').trim();
    const owner = (process.env.GITHUB_OWNER || clientOwner || '').trim();
    const repo = (process.env.GITHUB_REPO || clientRepo || '').trim();
    const branch = (process.env.GITHUB_BRANCH || clientBranch || 'main').trim();

    if (!token) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message:
            'Server authentication not configured. Please ensure GITHUB_TOKEN is set in your Vercel Project Settings.',
        })
      );
      return;
    }

    if (!owner || !repo) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message:
            'Repository configuration missing. Please ensure GITHUB_OWNER and GITHUB_REPO are set.',
        })
      );
      return;
    }

    // 5. Fetch current file SHA if file exists in the repo
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
          message: 'Server authorization expired. Please update GITHUB_TOKEN.',
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
          message: `Unable to verify existing file: ${errData.message || getRes.statusText}`,
        })
      );
      return;
    }

    // 6. Encode UTF-8 content to base64
    const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');

    // 7. Commit file via PUT request
    const putUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}`;
    const payload: Record<string, any> = {
      message: commitMessage || `update - ${filePath.split('/').pop()} by ${cleanName} - ${cleanEmail}`,
      content: base64Content,
      branch,
      author: {
        name: cleanName,
        email: cleanEmail,
      },
      committer: {
        name: cleanName,
        email: cleanEmail,
      },
    };
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
          message: putData.message || `Save operation failed (Status ${putRes.status})`,
        })
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: 'Changes saved successfully!',
        commitSha: putData.commit?.sha,
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: `Internal server error: ${err?.message || 'unknown'}`,
      })
    );
  }
}

// Default export for Vercel Serverless Function
export default handleGitHubCommit;
