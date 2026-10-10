import React, { useState, useEffect } from 'react';
import {
  GitHubConfig,
  getGitHubConfig,
  saveGitHubConfig,
  commitFileToGitHub,
  CommitResult,
  fetchServerEnvStatus,
  ServerEnvStatus,
} from '../utils/githubCommit';
import {
  GitCommit,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
  Zap,
  User,
  Mail,
  Sparkles,
  Info,
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string; // e.g. "placements.json" or "marqueePartners.json"
  filePath: string; // e.g. "src/data/placements.json"
  fileContent: string;
  defaultCommitMessage?: string;
  onCommitSuccess?: (result: CommitResult) => void;
}

const EDITOR_STORAGE_KEY = 'mitwpu_editor_profile';

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  fileName,
  filePath,
  fileContent,
  defaultCommitMessage,
  onCommitSuccess,
}) => {
  // Saved editor profile
  const [editorName, setEditorName] = useState(() => {
    try {
      const saved = localStorage.getItem(EDITOR_STORAGE_KEY);
      if (saved) return JSON.parse(saved).name || '';
    } catch (e) {}
    return '';
  });

  const [editorEmail, setEditorEmail] = useState(() => {
    try {
      const saved = localStorage.getItem(EDITOR_STORAGE_KEY);
      if (saved) return JSON.parse(saved).email || '';
    } catch (e) {}
    return '';
  });

  const [emailTouched, setEmailTouched] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>(getGitHubConfig());
  const [envStatus, setEnvStatus] = useState<ServerEnvStatus | null>(null);

  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getGitHubConfig());
      setCommitResult(null);
      setErrorMessage(null);

      // Check environment variables status in background
      fetchServerEnvStatus().then((status) => {
        setEnvStatus(status);
        if (status.defaultOwner && !config.owner) {
          const updated = { ...config, owner: status.defaultOwner };
          setConfig(updated);
          saveGitHubConfig(updated);
        }
        if (status.defaultRepo && !config.repo) {
          const updated = { ...config, repo: status.defaultRepo };
          setConfig(updated);
          saveGitHubConfig(updated);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Base action (e.g. "new - 1272250199 - Rahul Sharma" or "update - 1272250158 - Tanveer Singh")
  const baseMessage = defaultCommitMessage || `update - placements - ${fileName}`;

  // Validate college email ending with @mitwpu.edu.in
  const isEmailValid =
    editorEmail.trim().length > 0 &&
    editorEmail.trim().toLowerCase().endsWith('@mitwpu.edu.in') &&
    editorEmail.trim().toLowerCase() !== '@mitwpu.edu.in';

  const isNameValid = editorName.trim().length >= 2;
  const canSubmit = isNameValid && isEmailValid && !isCommitting;

  // Formatted commit message: "{update or new - prn - name} by {editor name} - {college email}"
  const formattedCommitMessage = `${baseMessage} by ${
    editorName.trim() || '[Editor Name]'
  } - ${editorEmail.trim().toLowerCase() || '[College Email]'}`;

  const handleSaveProfile = () => {
    try {
      localStorage.setItem(
        EDITOR_STORAGE_KEY,
        JSON.stringify({
          name: editorName.trim(),
          email: editorEmail.trim().toLowerCase(),
        })
      );
    } catch (e) {}
  };

  const handleCommit = async () => {
    if (!isNameValid) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please enter a valid college email ending with @mitwpu.edu.in.');
      return;
    }

    handleSaveProfile();
    setIsCommitting(true);
    setCommitResult(null);
    setErrorMessage(null);

    const fullMessage = `${baseMessage} by ${editorName.trim()} - ${editorEmail
      .trim()
      .toLowerCase()}`;

    try {
      const res = await commitFileToGitHub({
        config,
        filePath,
        fileContent,
        commitMessage: fullMessage,
        editorName: editorName.trim(),
        editorEmail: editorEmail.trim().toLowerCase(),
      });

      setCommitResult(res);
      if (res.success && onCommitSuccess) {
        onCommitSuccess(res);
      } else if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save changes.');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#8B1E3F] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300 border border-white/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Save & Publish Changes
              </h2>
              <p className="text-xs text-rose-100">
                Author verification for official MIT-WPU records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Instructions Notice */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-amber-900">
                Instructions
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Please note that it may take a few 30–45 seconds to update and reflect the live changes on the website after saving.
              </p>
            </div>
          </div>

          {/* Editor Credentials Form */}
          <div className="space-y-3.5 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span>Editor Details</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Saved for future edits
              </span>
            </div>

            {/* Editor Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Editor / Faculty Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  placeholder="e.g. Yadnyesh Sawant or Dr. John Doe"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#8B1E3F] text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* College Email */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>College Email ID *</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-[#1E5C9E]">
                  @mitwpu.edu.in
                </span>
              </div>
              <input
                type="email"
                value={editorEmail}
                onChange={(e) => {
                  setEditorEmail(e.target.value);
                  setEmailTouched(true);
                }}
                onBlur={() => setEmailTouched(true)}
                placeholder="e.g. yourname@mitwpu.edu.in"
                className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-hidden text-xs font-medium text-slate-900 ${
                  emailTouched && !isEmailValid
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                    : isEmailValid
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-slate-200 focus:border-[#8B1E3F]'
                }`}
              />

              {/* Email validation helper */}
              {emailTouched && !isEmailValid ? (
                <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Email must end with <strong>@mitwpu.edu.in</strong></span>
                </p>
              ) : isEmailValid ? (
                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Valid MIT-WPU institutional email</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">
                  Must be an official MIT-WPU email ending with @mitwpu.edu.in
                </p>
              )}
            </div>
          </div>

          {/* Live Commit Message Preview */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                <GitCommit className="w-3.5 h-3.5" />
                <span>Generated Commit Message</span>
              </span>
              <span className="text-[10px] text-slate-400">Recorded in GitHub</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all leading-relaxed select-all">
              {formattedCommitMessage}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {commitResult?.success && (
            <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Changes saved successfully to GitHub!</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                {commitResult.commitUrl && (
                  <a
                    href={commitResult.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <span>View Commit on GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <span className="text-[11px] text-emerald-700 font-medium">
                  ⚡ Vercel deploying now...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            {canSubmit ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to publish
              </span>
            ) : (
              <span>Fill name &amp; college email to proceed</span>
            )}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isCommitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCommit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8B1E3F] hover:bg-[#721833] shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Saving &amp; Deploying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
