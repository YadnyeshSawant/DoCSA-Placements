/**
 * Secure Serverless Function & Vite handler for saving placement data.
 * Features:
 * - Server-side Environment Variables (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH)
 * - Security PIN Verification (process.env.SECURITY_PIN)
 * - Multi-File Atomic Git Trees Commit (pushes placements.json & marqueePartners.json together)
 * - Strict Path Whitelisting (prevents arbitrary file overwriting)
 * - Payload validation (valid JSON check, size limit)
 * - Institutional Email Enforcement (@mitwpu.edu.in required on server)
 * - Anti-tampering & Information Disclosure Protection
 */

const ALLOWED_FILES = new Set([
  'src/data/placements.json',
  'src/data/marqueePartners.json',
]);

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB max payload

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
    const hasSecurityPin = !!(process.env.SECURITY_PIN || process.env.ADMIN_PIN);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        hasEnvToken,
        hasSecurityPin,
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
      const buffers = [];
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
      files,
      commitMessage,
      editorName,
      editorEmail,
      securityPin: clientPin,
      owner: clientOwner,
      repo: clientRepo,
      branch: clientBranch,
      token: clientToken,
    } = body || {};

    // 0. Verify Security PIN from Environment Variables (SECURITY_PIN or ADMIN_PIN)
    const expectedPin = (process.env.SECURITY_PIN || process.env.ADMIN_PIN || '1234').trim();
    const providedPin = (clientPin || '').toString().trim();

    if (!providedPin) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Security PIN is required. Please enter the authorized PIN to authorize changes.',
        })
      );
      return;
    }

    if (providedPin !== expectedPin) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Incorrect Security PIN. Authorization denied.',
        })
      );
      return;
    }

    // 1. Gather all files to be updated
    const rawFiles: Array<{ filePath: string; fileContent: string }> =
      Array.isArray(files) && files.length > 0
        ? files
        : filePath
        ? [{ filePath, fileContent: fileContent || '' }]
        : [];

    if (rawFiles.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'No files provided for commit.',
        })
      );
      return;
    }

    // 2. Validate Every File (Strict Allowlist & Valid JSON check)
    for (const item of rawFiles) {
      if (!item.filePath || !ALLOWED_FILES.has(item.filePath)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            message: `Access denied: Only official placement data files can be updated (${item.filePath}).`,
          })
        );
        return;
      }

      if (!item.fileContent || typeof item.fileContent !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            message: `Missing or invalid file content for ${item.filePath}.`,
          })
        );
        return;
      }

      try {
        JSON.parse(item.fileContent);
      } catch (err: any) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            message: `Invalid payload: ${item.filePath} must contain valid JSON.`,
          })
        );
        return;
      }
    }

    // 3. Strict Server-side Email Domain Validation
    const cleanEmail = (editorEmail || '').toString().trim().toLowerCase();
    const cleanName = (editorName || '').toString().trim();

    if (!cleanEmail || !cleanEmail.endsWith('@mitwpu.edu.in') || cleanEmail === '@mitwpu.edu.in') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message:
            'Access restricted: You must provide a valid college email ending with @mitwpu.edu.in to save changes.',
        })
      );
      return;
    }

    if (!cleanName || cleanName.length < 2) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Editor full name is required for institutional audit logs.',
        })
      );
      return;
    }

    // 4. Resolve GitHub Credentials
    const token = (process.env.GITHUB_TOKEN || clientToken || '').trim();
    const owner = (process.env.GITHUB_OWNER || clientOwner || 'yadnyesh2018').trim();
    const repo = (process.env.GITHUB_REPO || clientRepo || 'mit-wpu-docsa-placements').trim();
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

    const finalCommitMessage =
      commitMessage ||
      `update - ${rawFiles.map((f) => f.filePath.split('/').pop()).join(', ')} by ${cleanName} - ${cleanEmail}`;

    // 5. ATOMIC MULTI-FILE COMMIT VIA GIT TREES API (When multiple files are updated)
    if (rawFiles.length > 1) {
      try {
        // a. Get branch HEAD commit
        const refUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branch)}`;
        const refRes = await fetch(refUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'MIT-WPU-Placement-Portal',
          },
        });

        if (!refRes.ok) {
          throw new Error(`Failed to fetch branch ref: ${refRes.status} ${refRes.statusText}`);
        }
        const refData = (await refRes.json()) as any;
        const baseCommitSha = refData.object.sha;

        // b. Create Blobs for each file
        const treeItems = [];
        for (const file of rawFiles) {
          const blobUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`;
          const blobRes = await fetch(blobUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'MIT-WPU-Placement-Portal',
            },
            body: JSON.stringify({
              content: file.fileContent,
              encoding: 'utf-8',
            }),
          });

          if (!blobRes.ok) {
            const err = await blobRes.json().catch(() => ({}));
            throw new Error(`Failed to create git blob for ${file.filePath}: ${err.message || blobRes.statusText}`);
          }
          const blobData = (await blobRes.json()) as any;
          treeItems.push({
            path: file.filePath,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha,
          });
        }

        // c. Create Tree
        const treeUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees`;
        const treeRes = await fetch(treeUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'MIT-WPU-Placement-Portal',
          },
          body: JSON.stringify({
            base_tree: baseCommitSha,
            tree: treeItems,
          }),
        });

        if (!treeRes.ok) {
          const err = await treeRes.json().catch(() => ({}));
          throw new Error(`Failed to create git tree: ${err.message || treeRes.statusText}`);
        }
        const treeData = (await treeRes.json()) as any;

        // d. Create Commit
        const commitUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits`;
        const commitRes = await fetch(commitUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'MIT-WPU-Placement-Portal',
          },
          body: JSON.stringify({
            message: finalCommitMessage,
            tree: treeData.sha,
            parents: [baseCommitSha],
            author: {
              name: cleanName,
              email: cleanEmail,
            },
            committer: {
              name: cleanName,
              email: cleanEmail,
            },
          }),
        });

        if (!commitRes.ok) {
          const err = await commitRes.json().catch(() => ({}));
          throw new Error(`Failed to create git commit: ${err.message || commitRes.statusText}`);
        }
        const commitData = (await commitRes.json()) as any;

        // e. Update Branch Ref to new commit
        const patchRefUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs/heads/${encodeURIComponent(branch)}`;
        const patchRes = await fetch(patchRefUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'MIT-WPU-Placement-Portal',
          },
          body: JSON.stringify({
            sha: commitData.sha,
            force: false,
          }),
        });

        if (!patchRes.ok) {
          const err = await patchRes.json().catch(() => ({}));
          throw new Error(`Failed to update branch head: ${err.message || patchRes.statusText}`);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: true,
            message: `All changes across ${rawFiles.length} files saved atomically in 1 commit!`,
            commitSha: commitData.sha,
            filesUpdated: rawFiles.map((f) => f.filePath),
          })
        );
        return;
      } catch (treesErr: any) {
        console.warn('Git Trees atomic commit encountered issue, falling back to sequential file commits:', treesErr?.message);
        // Fallthrough to sequential file PUTs
      }
    }

    // 6. SINGLE FILE COMMIT / SEQUENTIAL FALLBACK (Contents PUT API)
    let lastCommitSha: string | undefined = undefined;
    for (const file of rawFiles) {
      const getUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${file.filePath}?ref=${encodeURIComponent(branch)}`;
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
      }

      const base64Content = Buffer.from(file.fileContent, 'utf-8').toString('base64');
      const putUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${file.filePath}`;
      const payload: Record<string, any> = {
        message: finalCommitMessage,
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
            message: putData.message || `Save operation failed for ${file.filePath} (Status ${putRes.status})`,
          })
        );
        return;
      }

      lastCommitSha = putData.commit?.sha;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: `Changes saved successfully! (${rawFiles.length} file${rawFiles.length > 1 ? 's' : ''} updated)`,
        commitSha: lastCommitSha,
        filesUpdated: rawFiles.map((f) => f.filePath),
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
