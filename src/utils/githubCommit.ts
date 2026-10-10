/**
 * Utility for GitHub REST API commits.
 * Supports:
 * 1. Server-side Environment Variables (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH) via /api/github-commit
 * 2. Vite Client-side Environment Variables (VITE_GITHUB_TOKEN, VITE_GITHUB_OWNER, VITE_GITHUB_REPO)
 * 3. Browser localStorage / manual input fallback
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface ServerEnvStatus {
  hasEnvToken: boolean;
  defaultOwner: string;
  defaultRepo: string;
  defaultBranch: string;
}

const STORAGE_KEY = 'mitwpu_github_sync_config';

/**
 * Check if the server / Vercel has GITHUB_TOKEN configured
 */
export async function fetchServerEnvStatus(): Promise<ServerEnvStatus> {
  try {
    const res = await fetch('/api/github-commit', { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // API not reachable or static-only build
  }

  // Fallback to client-side Vite env vars
  const viteToken = (import.meta as any).env?.VITE_GITHUB_TOKEN || '';
  const viteOwner = (import.meta as any).env?.VITE_GITHUB_OWNER || '';
  const viteRepo = (import.meta as any).env?.VITE_GITHUB_REPO || '';
  const viteBranch = (import.meta as any).env?.VITE_GITHUB_BRANCH || 'main';

  return {
    hasEnvToken: !!viteToken,
    defaultOwner: viteOwner,
    defaultRepo: viteRepo,
    defaultBranch: viteBranch,
  };
}

export function getGitHubConfig(): GitHubConfig {
  const viteToken = (import.meta as any).env?.VITE_GITHUB_TOKEN || '';
  const viteOwner = (import.meta as any).env?.VITE_GITHUB_OWNER || '';
  const viteRepo = (import.meta as any).env?.VITE_GITHUB_REPO || '';
  const viteBranch = (import.meta as any).env?.VITE_GITHUB_BRANCH || 'main';

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        token: parsed.token || viteToken || '',
        owner: parsed.owner || viteOwner || '',
        repo: parsed.repo || viteRepo || '',
        branch: parsed.branch || viteBranch || 'main',
      };
    }
  } catch (err) {
    console.error('Failed to read GitHub config from localStorage', err);
  }

  return {
    token: viteToken,
    owner: viteOwner,
    repo: viteRepo,
    branch: viteBranch,
  };
}

export function saveGitHubConfig(config: Partial<GitHubConfig>): GitHubConfig {
  const current = getGitHubConfig();
  const updated: GitHubConfig = {
    ...current,
    ...config,
    branch: config.branch?.trim() || current.branch || 'main',
    owner: config.owner?.trim() || current.owner,
    repo: config.repo?.trim() || current.repo,
    token: config.token?.trim() || current.token,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save GitHub config to localStorage', err);
  }
  return updated;
}

export interface CommitResult {
  success: boolean;
  message: string;
  commitUrl?: string;
  commitSha?: string;
}

/**
 * Safely encode a UTF-8 string into Base64 (supporting Unicode characters)
 */
function utf8ToBase64(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

/**
 * Verifies repository access
 */
export async function testGitHubConnection(config: GitHubConfig): Promise<{ success: boolean; message: string }> {
  // First try the backend /api/github-commit GET/test if token is in env
  const { token, owner, repo } = config;

  // If client token is missing, let's see if server has GITHUB_TOKEN
  if (!token) {
    const envStatus = await fetchServerEnvStatus();
    if (envStatus.hasEnvToken) {
      const targetOwner = owner || envStatus.defaultOwner;
      const targetRepo = repo || envStatus.defaultRepo;
      if (!targetOwner || !targetRepo) {
        return {
          success: true,
          message: 'Server GITHUB_TOKEN is active! Please specify the Repository Owner and Name.',
        };
      }
    } else {
      return {
        success: false,
        message: 'GitHub Token is required. Set GITHUB_TOKEN in your environment or enter it below.',
      };
    }
  }

  const effectiveToken = token || (import.meta as any).env?.VITE_GITHUB_TOKEN;
  if (!effectiveToken) {
    return {
      success: true,
      message: 'Server GITHUB_TOKEN environment variable is active and ready to commit.',
    };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return { success: false, message: 'Invalid or expired GitHub Token (401 Unauthorized).' };
    }
    if (res.status === 404) {
      return { success: false, message: `Repository "${owner}/${repo}" not found or token lacks access (404 Not Found).` };
    }
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      return { success: false, message: errorJson.message || `GitHub error (${res.status})` };
    }

    const data = await res.json();
    return {
      success: true,
      message: `Connected successfully to "${data.full_name}" (Default branch: ${data.default_branch})`,
    };
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message || 'Unable to connect to GitHub'}` };
  }
}

/**
 * Commits a file to GitHub, preferring the server-side /api/github-commit endpoint
 * which uses process.env.GITHUB_TOKEN securely on Vercel / dev server.
 */
export async function commitFileToGitHub(options: {
  config: GitHubConfig;
  filePath: string;
  fileContent: string;
  commitMessage?: string;
  editorName?: string;
  editorEmail?: string;
}): Promise<CommitResult> {
  const { config, filePath, fileContent, commitMessage, editorName, editorEmail } = options;

  // 1. Try serverless endpoint /api/github-commit (uses process.env.GITHUB_TOKEN)
  try {
    const res = await fetch('/api/github-commit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath,
        fileContent,
        commitMessage,
        editorName,
        editorEmail,
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        token: config.token,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }

    const errorJson = await res.json().catch(() => ({}));
    if (errorJson.message) {
      // If error was specific, return it
      if (res.status !== 404 && res.status !== 405) {
        return { success: false, message: errorJson.message };
      }
    }
  } catch (err) {
    // API endpoint might not be available in pure static export, proceed to client fallback
  }

  // 2. Client-side fallback if /api/github-commit is not active
  const { token, owner, repo, branch } = config;
  const effectiveToken = token || (import.meta as any).env?.VITE_GITHUB_TOKEN;
  const effectiveOwner = owner || (import.meta as any).env?.VITE_GITHUB_OWNER;
  const effectiveRepo = repo || (import.meta as any).env?.VITE_GITHUB_REPO;
  const effectiveBranch = (branch || (import.meta as any).env?.VITE_GITHUB_BRANCH || 'main').trim();

  if (!effectiveToken || !effectiveOwner || !effectiveRepo) {
    return {
      success: false,
      message: 'GitHub credentials missing. Please set GITHUB_TOKEN in your environment or enter your PAT in the modal.',
    };
  }

  const message = commitMessage || 'update - student prn - name';

  try {
    const getUrl = `https://api.github.com/repos/${encodeURIComponent(effectiveOwner)}/${encodeURIComponent(effectiveRepo)}/contents/${filePath}?ref=${encodeURIComponent(effectiveBranch)}`;
    let currentSha: string | undefined = undefined;

    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const getData = await getRes.json();
      currentSha = getData.sha;
    } else if (getRes.status === 401) {
      return { success: false, message: 'Unauthorized (401). Invalid or expired GitHub Token.' };
    }

    const base64Content = utf8ToBase64(fileContent);
    const putUrl = `https://api.github.com/repos/${encodeURIComponent(effectiveOwner)}/${encodeURIComponent(effectiveRepo)}/contents/${filePath}`;
    const payload: Record<string, any> = {
      message,
      content: base64Content,
      branch: effectiveBranch,
    };
    if (currentSha) {
      payload.sha = currentSha;
    }

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const putData = await putRes.json().catch(() => ({}));

    if (!putRes.ok) {
      return {
        success: false,
        message: putData.message || `Commit failed with status ${putRes.status}`,
      };
    }

    return {
      success: true,
      message: `Successfully committed ${filePath} to branch "${effectiveBranch}"!`,
      commitUrl: putData.commit?.html_url || `https://github.com/${effectiveOwner}/${effectiveRepo}/commit/${putData.commit?.sha}`,
      commitSha: putData.commit?.sha,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to commit to GitHub: ${err.message || 'Unknown network error'}`,
    };
  }
}
