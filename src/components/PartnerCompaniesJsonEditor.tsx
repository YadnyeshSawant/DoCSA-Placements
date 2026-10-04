import React, { useState, useEffect } from 'react';
import rawDefaultPartnersData from '../data/marqueePartners.json';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  FileJson,
  Sliders,
  Sparkles,
  Search,
  ArrowLeft,
  AlertCircle,
  Building2,
  ExternalLink,
  GripVertical,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Briefcase,
  Layers,
} from 'lucide-react';

export interface MarqueePartnerItem {
  id?: string;
  companyName: string;
  name?: string;
  logoLink: string;
  logo?: string;
}

export interface MarqueeStatItem {
  value: string;
  label: string;
  subtext: string;
}

export interface MarqueePartnersSchema {
  'Highest Package'?: string;
  'Average CTC'?: string;
  'Placements & Internships'?: string;
  'Corporate Recruiters'?: string;
  highestPackage?: string;
  averageCTC?: string;
  placementsAndInternships?: string;
  corporateRecruiters?: string;
  stats?: {
    highestPackage?: MarqueeStatItem;
    averageCTC?: MarqueeStatItem;
    placementsAndInternships?: MarqueeStatItem;
    corporateRecruiters?: MarqueeStatItem;
  };
  partners: MarqueePartnerItem[];
}

interface PartnerCompaniesJsonEditorProps {
  onBackToApp: () => void;
  onNavigateToPlacementsEditor?: () => void;
  partnersList?: MarqueePartnerItem[];
  setPartnersList?: React.Dispatch<React.SetStateAction<MarqueePartnerItem[]>>;
}

export const PartnerCompaniesJsonEditor: React.FC<PartnerCompaniesJsonEditorProps> = ({
  onBackToApp,
  onNavigateToPlacementsEditor,
  partnersList: controlledPartnersList,
  setPartnersList: setControlledPartnersList,
}) => {
  // Mode: 'form' (Visual Editor) or 'raw' (JSON Code Editor)
  const [editorTab, setEditorTab] = useState<'form' | 'raw'>('form');

  // Stats State
  const [highestPackageVal, setHighestPackageVal] = useState<string>(
    (rawDefaultPartnersData as any).stats?.highestPackage?.value ||
      (rawDefaultPartnersData as any)['Highest Package'] ||
      '₹28.5 LPA'
  );
  const [highestPackageSub, setHighestPackageSub] = useState<string>(
    (rawDefaultPartnersData as any).stats?.highestPackage?.subtext ||
      'Super Dream Offers (Microsoft, AWS)'
  );

  const [averageCtcVal, setAverageCtcVal] = useState<string>(
    (rawDefaultPartnersData as any).stats?.averageCTC?.value ||
      (rawDefaultPartnersData as any)['Average CTC'] ||
      '₹8.4 LPA'
  );
  const [averageCtcSub, setAverageCtcSub] = useState<string>(
    (rawDefaultPartnersData as any).stats?.averageCTC?.subtext ||
      'Across MCA, BCA & M.Sc Programs'
  );

  const [placementsCountVal, setPlacementsCountVal] = useState<string>(
    (rawDefaultPartnersData as any).stats?.placementsAndInternships?.value ||
      (rawDefaultPartnersData as any)['Placements & Internships'] ||
      '340+'
  );
  const [placementsCountSub, setPlacementsCountSub] = useState<string>(
    (rawDefaultPartnersData as any).stats?.placementsAndInternships?.subtext ||
      'DoCSA Academic Cohort'
  );

  const [recruitersCountVal, setRecruitersCountVal] = useState<string>(
    (rawDefaultPartnersData as any).stats?.corporateRecruiters?.value ||
      (rawDefaultPartnersData as any)['Corporate Recruiters'] ||
      '85+'
  );
  const [recruitersCountSub, setRecruitersCountSub] = useState<string>(
    (rawDefaultPartnersData as any).stats?.corporateRecruiters?.subtext ||
      'Fortune 500 & Global Tech Giants'
  );

  // Internal Partners List State (used if not provided as prop)
  const [internalPartnersList, setInternalPartnersList] = useState<MarqueePartnerItem[]>(() => {
    const raw = Array.isArray(rawDefaultPartnersData)
      ? (rawDefaultPartnersData as MarqueePartnerItem[])
      : ((rawDefaultPartnersData as any).partners || []);
    return raw.map((p: any, idx: number) => ({
      id: p.id || `partner-item-${idx}-${idx}`,
      companyName: p.companyName || '',
      name: p.name || p.companyName || '',
      logoLink: p.logoLink || '',
      logo: p.logo || p.logoLink || '',
    }));
  });

  const partnersList = controlledPartnersList || internalPartnersList;
  const setPartnersList = setControlledPartnersList || setInternalPartnersList;

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Raw JSON state
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Construct structured schema object
  const buildCurrentSchemaObject = (): MarqueePartnersSchema => {
    return {
      'Highest Package': highestPackageVal,
      'Average CTC': averageCtcVal,
      'Placements & Internships': placementsCountVal,
      'Corporate Recruiters': recruitersCountVal,
      highestPackage: highestPackageVal,
      averageCTC: averageCtcVal,
      placementsAndInternships: placementsCountVal,
      corporateRecruiters: recruitersCountVal,
      stats: {
        highestPackage: {
          value: highestPackageVal,
          label: 'Highest Package',
          subtext: highestPackageSub,
        },
        averageCTC: {
          value: averageCtcVal,
          label: 'Average CTC',
          subtext: averageCtcSub,
        },
        placementsAndInternships: {
          value: placementsCountVal,
          label: 'Placements & Internships',
          subtext: placementsCountSub,
        },
        corporateRecruiters: {
          value: recruitersCountVal,
          label: 'Corporate Recruiters',
          subtext: recruitersCountSub,
        },
      },
      partners: partnersList.map((p) => ({
        companyName: p.companyName,
        name: p.name || p.companyName,
        logoLink: p.logoLink || '',
        logo: p.logo || p.logoLink || '',
      })),
    };
  };

  // Keep Raw JSON in sync with visual editor
  useEffect(() => {
    if (editorTab === 'form') {
      const obj = buildCurrentSchemaObject();
      setRawJsonText(JSON.stringify(obj, null, 2));
      setJsonError(null);
    }
  }, [
    highestPackageVal,
    highestPackageSub,
    averageCtcVal,
    averageCtcSub,
    placementsCountVal,
    placementsCountSub,
    recruitersCountVal,
    recruitersCountSub,
    partnersList,
    editorTab,
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reordering handlers
  const handleReorder = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= partnersList.length) return;
    const updated = [...partnersList];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setPartnersList(updated);
    triggerToast(`Moved "${moved.companyName}" to position ${toIdx + 1}`);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    handleReorder(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Partner item update
  const handleUpdatePartner = (index: number, field: keyof MarqueePartnerItem, value: string) => {
    setPartnersList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        ...(field === 'logoLink' ? { logo: value } : {}),
        ...(field === 'companyName' ? { name: value } : {}),
      };
      return updated;
    });
  };

  // Add Partner
  const handleAddPartner = () => {
    const newPartner: MarqueePartnerItem = {
      id: `partner-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      companyName: 'New Partner Company',
      name: 'New Partner Company',
      logoLink: 'https://',
      logo: 'https://',
    };
    setPartnersList((prev) => [newPartner, ...prev]);
    triggerToast('Added new partner company record!');
  };

  // Delete Partner
  const handleDeletePartner = (index: number) => {
    const target = partnersList[index];
    const companyName = target?.companyName || 'Company';
    if (partnersList.length <= 1) {
      triggerToast('You must have at least one partner company.');
      return;
    }
    setPartnersList((prev) => prev.filter((_, i) => i !== index));
    triggerToast(`🗑️ Removed ${companyName} from partner companies.`);
  };

  // Download marqueePartners.json
  const handleDownloadJson = () => {
    let finalObj = buildCurrentSchemaObject();

    if (editorTab === 'raw') {
      try {
        const parsed = JSON.parse(rawJsonText);
        finalObj = parsed;
      } catch (err: any) {
        setJsonError(`Cannot download: ${err.message}`);
        return;
      }
    }

    const jsonString = JSON.stringify(finalObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'marqueePartners.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    triggerToast('📥 marqueePartners.json downloaded successfully to your computer!');
  };

  // Import JSON from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.stats) {
          if (parsed.stats.highestPackage?.value) setHighestPackageVal(parsed.stats.highestPackage.value);
          if (parsed.stats.highestPackage?.subtext) setHighestPackageSub(parsed.stats.highestPackage.subtext);
          if (parsed.stats.averageCTC?.value) setAverageCtcVal(parsed.stats.averageCTC.value);
          if (parsed.stats.averageCTC?.subtext) setAverageCtcSub(parsed.stats.averageCTC.subtext);
          if (parsed.stats.placementsAndInternships?.value) setPlacementsCountVal(parsed.stats.placementsAndInternships.value);
          if (parsed.stats.placementsAndInternships?.subtext) setPlacementsCountSub(parsed.stats.placementsAndInternships.subtext);
          if (parsed.stats.corporateRecruiters?.value) setRecruitersCountVal(parsed.stats.corporateRecruiters.value);
          if (parsed.stats.corporateRecruiters?.subtext) setRecruitersCountSub(parsed.stats.corporateRecruiters.subtext);
        }

        const rawList = Array.isArray(parsed.partners)
          ? parsed.partners
          : Array.isArray(parsed)
          ? parsed
          : [];

        if (rawList.length > 0) {
          setPartnersList(
            rawList.map((p: any, i: number) => ({
              id: p.id || `partner-import-${i}-${Date.now()}`,
              companyName: p.companyName || '',
              name: p.name || p.companyName || '',
              logoLink: p.logoLink || '',
              logo: p.logo || p.logoLink || '',
            }))
          );
        }

        triggerToast(`Successfully loaded ${file.name} into editor!`);
      } catch (err: any) {
        alert(`Error reading JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (
      !window.confirm(
        'Reset partner companies and stats to the default template? Any unsaved edits will be cleared.'
      )
    ) {
      return;
    }

    const defaultData = rawDefaultPartnersData as any;
    setHighestPackageVal(defaultData.stats?.highestPackage?.value || '₹28.5 LPA');
    setHighestPackageSub(defaultData.stats?.highestPackage?.subtext || 'Super Dream Offers (Microsoft, AWS)');
    setAverageCtcVal(defaultData.stats?.averageCTC?.value || '₹8.4 LPA');
    setAverageCtcSub(defaultData.stats?.averageCTC?.subtext || 'Across MCA, BCA & M.Sc Programs');
    setPlacementsCountVal(defaultData.stats?.placementsAndInternships?.value || '340+');
    setPlacementsCountSub(defaultData.stats?.placementsAndInternships?.subtext || 'DoCSA Academic Cohort');
    setRecruitersCountVal(defaultData.stats?.corporateRecruiters?.value || '85+');
    setRecruitersCountSub(defaultData.stats?.corporateRecruiters?.subtext || 'Fortune 500 & Global Tech Giants');

    const rawList = Array.isArray(defaultData)
      ? defaultData
      : (defaultData.partners || []);

    setPartnersList(
      rawList.map((p: any, idx: number) => ({
        id: `partner-item-${idx}`,
        companyName: p.companyName || '',
        name: p.name || p.companyName || '',
        logoLink: p.logoLink || '',
        logo: p.logo || p.logoLink || '',
      }))
    );
    triggerToast('Editor reset to default partner companies template.');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Filtered partners for search
  const filteredPartners = partnersList.filter((p) =>
    p.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#8B1E3F] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-rose-300/30 text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP ACTION BAR */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Banners</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#8B1E3F]" />
              <span>Partner Companies & Stats JSON Editor</span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Edit recruiter logos and placement key metrics, then download{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-[#8B1E3F] font-mono">
                marqueePartners.json
              </code>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Switch to Placements JSON Editor */}
          {onNavigateToPlacementsEditor && (
            <button
              type="button"
              onClick={onNavigateToPlacementsEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#8B1E3F] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Go to Placements JSON Editor"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Edit Placements JSON</span>
            </button>
          )}

          {/* Mode Switcher: Form vs Raw Code */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setEditorTab('form')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                editorTab === 'form'
                  ? 'bg-white text-[#8B1E3F] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Form Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('raw')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                editorTab === 'raw'
                  ? 'bg-white text-[#8B1E3F] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>
          </div>

          {/* Import JSON Button */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetToDefault}
            title="Reset editor back to default partners template"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* DOWNLOAD BUTTON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-[#8B1E3F] hover:bg-[#721833] rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download marqueePartners.json</span>
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      {editorTab === 'raw' ? (
        /* ================= RAW JSON CODE EDITOR ================= */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Direct JSON Code Editing Mode</p>
              <p className="text-amber-700 mt-0.5">
                Edit the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">marqueePartners.json</code> code below. Click "Download marqueePartners.json" to save your updated file.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 font-mono">
                src/data/marqueePartners.json
              </span>
              {jsonError ? (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Invalid JSON Syntax: {jsonError}
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Valid JSON Syntax
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={rawJsonText}
            onChange={(e) => {
              setRawJsonText(e.target.value);
              try {
                JSON.parse(e.target.value);
                setJsonError(null);
              } catch (err: any) {
                setJsonError(err.message);
              }
            }}
            rows={24}
            className="w-full flex-1 font-mono text-xs sm:text-sm bg-slate-900 text-emerald-400 p-4 rounded-xl shadow-inner border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] leading-relaxed resize-y"
            placeholder="Paste or write marqueePartners.json code here..."
            spellCheck={false}
          />
        </div>
      ) : (
        /* ================= VISUAL FORM EDITOR ================= */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* SECTION 1: KEY PLACEMENT METRICS & STATS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8B1E3F]" />
                <span>1. Department Recruitment Statistics</span>
              </h2>
              <span className="text-xs text-slate-500">
                Shown prominently in top stats counter & footer cards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Highest Package */}
              <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 flex flex-col gap-2">
                <span className="font-bold text-[#8B1E3F] uppercase tracking-wider text-[10px]">
                  Highest Package
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Value *</label>
                  <input
                    type="text"
                    value={highestPackageVal}
                    onChange={(e) => setHighestPackageVal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. ₹28.5 LPA"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtext</label>
                  <input
                    type="text"
                    value={highestPackageSub}
                    onChange={(e) => setHighestPackageSub(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[11px] focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. Super Dream Offers"
                  />
                </div>
              </div>

              {/* Average CTC */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Average CTC
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Value *</label>
                  <input
                    type="text"
                    value={averageCtcVal}
                    onChange={(e) => setAverageCtcVal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. ₹8.4 LPA"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtext</label>
                  <input
                    type="text"
                    value={averageCtcSub}
                    onChange={(e) => setAverageCtcSub(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[11px] focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. Across MCA, BCA & M.Sc Programs"
                  />
                </div>
              </div>

              {/* Placements & Internships */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Placements & Internships
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Value *</label>
                  <input
                    type="text"
                    value={placementsCountVal}
                    onChange={(e) => setPlacementsCountVal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. 340+"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtext</label>
                  <input
                    type="text"
                    value={placementsCountSub}
                    onChange={(e) => setPlacementsCountSub(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[11px] focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. DoCSA Academic Cohort"
                  />
                </div>
              </div>

              {/* Corporate Recruiters */}
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col gap-2">
                <span className="font-bold text-[#004B87] uppercase tracking-wider text-[10px]">
                  Corporate Recruiters
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Value *</label>
                  <input
                    type="text"
                    value={recruitersCountVal}
                    onChange={(e) => setRecruitersCountVal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. 85+"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtext</label>
                  <input
                    type="text"
                    value={recruitersCountSub}
                    onChange={(e) => setRecruitersCountSub(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[11px] focus:outline-none focus:border-[#8B1E3F]"
                    placeholder="e.g. Fortune 500 & Global Tech Giants"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: HIRING PARTNER LOGOS LIST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#8B1E3F]" />
                  <span>2. Key Hiring Partners List ({partnersList.length} Companies)</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Drag cards by the grip handle or use up/down arrows to rearrange logo sequence in the marquee
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search companies..."
                    className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F] w-48"
                  />
                </div>

                {/* Add Partner Button */}
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#8B1E3F] hover:bg-[#721833] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Company</span>
                </button>
              </div>
            </div>

            {/* List of Partner Company Cards */}
            <div className="flex flex-col gap-3">
              {filteredPartners.map((partner, idx) => {
                const originalIndex = partnersList.indexOf(partner);
                const isDragging = draggedIndex === originalIndex;
                const isDragOver = dragOverIndex === originalIndex;

                return (
                  <div
                    key={partner.id || `partner-row-${originalIndex}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalIndex)}
                    onDragOver={(e) => handleDragOver(e, originalIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, originalIndex)}
                    onDragEnd={handleDragEnd}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDragging
                        ? 'opacity-40 border-dashed border-[#8B1E3F] bg-rose-50/40'
                        : isDragOver
                        ? 'border-[#8B1E3F] ring-2 ring-[#8B1E3F]/30 bg-rose-50/70 shadow-md scale-[1.01]'
                        : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Drag Grip Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#8B1E3F] hover:bg-rose-50 rounded transition-colors shrink-0"
                        title="Drag to rearrange company"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Number Badge */}
                      <span className="w-5 h-5 bg-[#8B1E3F] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                        {originalIndex + 1}
                      </span>

                      {/* Logo Preview Pill */}
                      <div className="w-24 h-11 px-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                        {partner.logoLink ? (
                          <img
                            src={partner.logoLink}
                            alt={partner.companyName}
                            className="max-h-7 max-w-[80px] object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // If image fails, show text abbreviation
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">No Logo</span>
                        )}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full text-xs">
                      {/* Company Name */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={partner.companyName}
                          onChange={(e) =>
                            handleUpdatePartner(originalIndex, 'companyName', e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-[#8B1E3F]"
                          placeholder="e.g. Microsoft"
                        />
                      </div>

                      {/* Logo URL */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Logo Image URL / SVG Link *
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={partner.logoLink || ''}
                            onChange={(e) =>
                              handleUpdatePartner(originalIndex, 'logoLink', e.target.value)
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] focus:outline-none focus:border-[#8B1E3F]"
                            placeholder="https://... or /logo.png"
                          />
                          {partner.logoLink && (
                            <a
                              href={partner.logoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-[#8B1E3F] hover:bg-white rounded-md border border-slate-200 transition-colors shrink-0"
                              title="Open logo image in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={originalIndex === 0}
                        onClick={() => handleReorder(originalIndex, originalIndex - 1)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Move company up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={originalIndex === partnersList.length - 1}
                        onClick={() => handleReorder(originalIndex, originalIndex + 1)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Move company down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeletePartner(originalIndex)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer ml-1"
                        title="Delete company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredPartners.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No partner companies match "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: LIVE PREVIEW OF STATS & MARQUEE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B1E3F]" />
              <span>3. Live Carousel & Stats Preview</span>
            </h2>

            {/* Simulated Live Marquee Strip */}
            <div className="border border-slate-200 rounded-xl overflow-hidden p-4 bg-white shadow-inner">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center pb-4 border-b border-slate-100">
                <div className="p-2">
                  <span className="block text-2xl sm:text-3xl font-black text-[#8B1E3F] tracking-tight">
                    {highestPackageVal}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-700 uppercase mt-0.5">
                    Highest Package
                  </span>
                  <span className="block text-[9px] text-slate-500 mt-0.5">{highestPackageSub}</span>
                </div>

                <div className="p-2">
                  <span className="block text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {averageCtcVal}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-700 uppercase mt-0.5">
                    Average CTC
                  </span>
                  <span className="block text-[9px] text-slate-500 mt-0.5">{averageCtcSub}</span>
                </div>

                <div className="p-2">
                  <span className="block text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {placementsCountVal}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-700 uppercase mt-0.5">
                    Placements & Internships
                  </span>
                  <span className="block text-[9px] text-slate-500 mt-0.5">{placementsCountSub}</span>
                </div>

                <div className="p-2">
                  <span className="block text-2xl sm:text-3xl font-black text-[#004B87] tracking-tight">
                    {recruitersCountVal}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-700 uppercase mt-0.5">
                    Corporate Recruiters
                  </span>
                  <span className="block text-[9px] text-slate-500 mt-0.5">{recruitersCountSub}</span>
                </div>
              </div>

              {/* Scrolling partner logos row */}
              <div className="mt-4 flex items-center gap-3 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="animate-marquee flex items-center gap-4 py-2">
                  {[...partnersList, ...partnersList].map((p, i) => (
                    <div
                      key={`preview-${p.id || p.companyName}-${i}`}
                      className="flex items-center gap-4 shrink-0"
                    >
                      <div className="flex items-center justify-center px-4 py-1.5 h-10 min-w-[80px] rounded-lg bg-white border border-slate-200 shadow-2xs">
                        {p.logoLink ? (
                          <img
                            src={p.logoLink}
                            alt={p.companyName}
                            className="h-5 max-w-[85px] object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-slate-800 text-xs font-semibold">
                            {p.companyName}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-300">·</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
