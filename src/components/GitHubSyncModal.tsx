import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  User,
  Mail,
  Sparkles,
  Info,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

import { PlacementRecord } from '../types/placement';
import { MarqueePartnersSchema } from './PartnerCompaniesJsonEditor';
import { detectAllChanges } from '../utils/changeDetector';
import { getInitialPartnersSchema } from '../data/partnersStore';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  placements?: PlacementRecord[];
  partnersSchema?: MarqueePartnersSchema;
  fileName?: string;
  filePath?: string;
  fileContent?: string;
  defaultCommitMessage?: string;
  onCommitSuccess?: (result: CommitResult) => void;
}

const EDITOR_STORAGE_KEY = 'mitwpu_editor_profile';

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  placements,
  partnersSchema,
  fileName = 'placements.json',
  filePath = 'src/data/placements.json',
  fileContent = '',
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

  // Security PIN states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Semantic change analysis across all placement & partner records
  const changeAnalysis = useMemo(() => {
    if (placements || partnersSchema) {
      return detectAllChanges(
        placements || [],
        partnersSchema || getInitialPartnersSchema()
      );
    }
    return null;
  }, [placements, partnersSchema, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setConfig(getGitHubConfig());
      setCommitResult(null);
      setErrorMessage(null);
      setIsPinModalOpen(false);
      setSecurityPin('');
      setPinError(null);

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

  // Base action
  const baseMessage = defaultCommitMessage || `update - placements & hiring partners`;

  // Validate college email ending with @mitwpu.edu.in
  const isEmailValid =
    editorEmail.trim().length > 0 &&
    editorEmail.trim().toLowerCase().endsWith('@mitwpu.edu.in') &&
    editorEmail.trim().toLowerCase() !== '@mitwpu.edu.in';

  const isNameValid = editorName.trim().length >= 2;
  const canSubmit = isNameValid && isEmailValid && !isCommitting;

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

  const handleRequestPin = () => {
    if (!isNameValid) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please enter a valid college email ending with @mitwpu.edu.in.');
      return;
    }

    handleSaveProfile();
    setErrorMessage(null);
    setPinError(null);
    setSecurityPin('');
    setIsPinModalOpen(true);
  };

  const handleCommitWithPin = async () => {
    if (!securityPin.trim()) {
      setPinError('Please enter the Security PIN.');
      return;
    }

    setIsCommitting(true);
    setPinError(null);
    setErrorMessage(null);

    const activeFiles = changeAnalysis?.filesToCommit.filter((f: any) => f.isChanged) || [];
    const filesToSave =
      activeFiles.length > 0
        ? activeFiles.map((f: any) => ({ filePath: f.filePath, fileContent: f.fileContent }))
        : changeAnalysis?.filesToCommit.map((f: any) => ({
            filePath: f.filePath,
            fileContent: f.fileContent,
          })) || [{ filePath: filePath || 'src/data/placements.json', fileContent: fileContent || '' }];

    const commitTitle = changeAnalysis?.defaultCommitTitle || baseMessage;
    const commitBody = changeAnalysis?.detailedCommitBody || '';
    const fullMessage = `${commitTitle}\n\n${commitBody}\n\nby ${editorName.trim()} - ${editorEmail
      .trim()
      .toLowerCase()}`;

    try {
      const res = await commitFileToGitHub({
        config,
        files: filesToSave,
        commitMessage: fullMessage,
        editorName: editorName.trim(),
        editorEmail: editorEmail.trim().toLowerCase(),
        securityPin: securityPin.trim(),
      });

      if (res.success) {
        setIsPinModalOpen(false);
        setCommitResult(res);
        if (onCommitSuccess) {
          onCommitSuccess(res);
        }
      } else {
        setPinError(res.message || 'Incorrect Security PIN.');
      }
    } catch (err: any) {
      setPinError(err.message || 'Failed to authorize and save changes.');
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
              <ShieldCheck className="w-5 h-5" />
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

          {/* Live Commit Message & Multi-File Audit Summary */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Detected Changes (Saving All Files Together)</span>
              </span>
              {changeAnalysis && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {changeAnalysis.filesToCommit.filter((f: any) => f.isChanged).length || 1} File(s)
                </span>
              )}
            </div>

            {/* Changed Highlights List */}
            {changeAnalysis && (
              <div className="space-y-1 text-[11px] text-slate-300">
                {changeAnalysis.highlights.individualAdded.length > 0 && (
                  <p className="text-emerald-400 font-mono text-[10px]">
                    + Added {changeAnalysis.highlights.individualAdded.length} Individual Placement(s):{' '}
                    <span className="text-slate-300 font-sans">
                      {changeAnalysis.highlights.individualAdded.join(', ')}
                    </span>
                  </p>
                )}
                {changeAnalysis.highlights.individualUpdated.length > 0 && (
                  <p className="text-amber-400 font-mono text-[10px]">
                    • Updated {changeAnalysis.highlights.individualUpdated.length} Individual Placement(s):{' '}
                    <span className="text-slate-300 font-sans">
                      {changeAnalysis.highlights.individualUpdated.join(', ')}
                    </span>
                  </p>
                )}
                {changeAnalysis.highlights.groupAdded.length > 0 && (
                  <p className="text-emerald-400 font-mono text-[10px]">
                    + Added {changeAnalysis.highlights.groupAdded.length} Group Cohort(s):{' '}
                    <span className="text-slate-300 font-sans">
                      {changeAnalysis.highlights.groupAdded.join(', ')}
                    </span>
                  </p>
                )}
                {changeAnalysis.highlights.groupUpdated.length > 0 && (
                  <p className="text-amber-400 font-mono text-[10px]">
                    • Updated {changeAnalysis.highlights.groupUpdated.length} Group Cohort(s):{' '}
                    <span className="text-slate-300 font-sans">
                      {changeAnalysis.highlights.groupUpdated.join(', ')}
                    </span>
                  </p>
                )}
                {changeAnalysis.highlights.partnersAdded.length > 0 && (
                  <p className="text-emerald-400 font-mono text-[10px]">
                    + Added Partner(s):{' '}
                    <span className="text-slate-300 font-sans">
                      {changeAnalysis.highlights.partnersAdded.join(', ')}
                    </span>
                  </p>
                )}
                {changeAnalysis.highlights.statsUpdated.length > 0 && (
                  <p className="text-sky-300 font-mono text-[10px]">
                    • Updated Recruitment Stats:{' '}
                    <span className="text-slate-300 font-sans">
                      {changeAnalysis.highlights.statsUpdated.join(' · ')}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="font-mono text-[10px] text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all leading-relaxed select-all max-h-28 overflow-y-auto whitespace-pre-wrap">
              {changeAnalysis
                ? `${changeAnalysis.defaultCommitTitle}\n\n${changeAnalysis.detailedCommitBody}\n\nby ${
                    editorName.trim() || '[Name]'
                  } - ${editorEmail.trim().toLowerCase() || '[Email]'}`
                : formattedCommitMessage}
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
            <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Changes saved successfully!</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed pt-0.5">
                The portal data has been verified and updated. Live changes will reflect across the website in a few 30–45 seconds.
              </p>
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
              onClick={handleRequestPin}
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

      {/* SECURITY PIN VERIFICATION MODAL OVERLAY */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-[#8B1E3F] border border-rose-100">
                <Lock className="w-5 h-5 text-[#8B1E3F]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security PIN Verification</h3>
                <p className="text-[11px] text-slate-500">
                  Authorized PIN required to save changes
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Enter Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  autoFocus
                  value={securityPin}
                  onChange={(e) => {
                    setSecurityPin(e.target.value);
                    setPinError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && securityPin.trim() && !isCommitting) {
                      handleCommitWithPin();
                    }
                  }}
                  placeholder="Enter Security PIN..."
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#8B1E3F] focus:bg-white text-sm font-mono tracking-widest text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Stored in environment variables to protect official portal records
              </p>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{pinError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinError(null);
                }}
                disabled={isCommitting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCommitWithPin}
                disabled={!securityPin.trim() || isCommitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#8B1E3F] hover:bg-[#721833] rounded-xl shadow-xs disabled:opacity-40 cursor-pointer"
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Authorize &amp; Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
