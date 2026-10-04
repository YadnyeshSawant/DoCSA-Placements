import React, { useState } from 'react';
import { PlacementRecord, Student } from '../types/placement';
import { CompanyLogo, CompanyLogoType } from './CompanyLogo';
import rawPlacementsJson from '../data/placements.json';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sliders,
  User,
  Users,
  Eye,
  X,
  Sparkles,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

interface PlacementDataEditorProps {
  placements: PlacementRecord[];
  onUpdatePlacements: (updated: PlacementRecord[]) => void;
  onPreviewBanner: (placement: PlacementRecord) => void;
  onClose: () => void;
}

const DEFAULT_COMPANY_LOGOS: { label: string; value: CompanyLogoType }[] = [
  { label: 'Celebal Technologies', value: 'celebal' },
  { label: 'Deutsche Bank', value: 'deutsche-bank' },
  { label: 'EY (Ernst & Young)', value: 'ey' },
  { label: 'Barclays', value: 'barclays' },
  { label: 'Deloitte', value: 'deloitte' },
  { label: 'Microsoft', value: 'microsoft' },
  { label: 'Amazon AWS', value: 'amazon' },
  { label: 'TCS Digital', value: 'tcs' },
  { label: 'Persistent Systems', value: 'persistent' },
  { label: 'Custom Logo URL', value: 'custom' },
];

const DEFAULT_PROGRAMS = [
  'MCA (Master of Computer Applications)',
  'BCA (Computer Applications)',
  'BCA (Science)',
  'M.Sc. Computer Science',
  'M.Sc. Data Science & Big Data',
  'B.Sc. Computer Science (Hons)',
];

export const PlacementDataEditor: React.FC<PlacementDataEditorProps> = ({
  placements,
  onUpdatePlacements,
  onPreviewBanner,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'group'>('all');
  const [editingPlacement, setEditingPlacement] = useState<PlacementRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [jsonText, setJsonText] = useState(() => formatPlacementsToJson(placements));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper to format structured placements into formatted JSON with section headers
  function formatPlacementsToJson(records: PlacementRecord[]): string {
    const individualPlacements = records.filter((p) => p.type === 'individual');
    const groupPlacements = records.filter((p) => p.type === 'group');

    const structured = {
      _SECTION_NOTE_1: '====================================================================',
      _SECTION_NOTE_2: '               INDIVIDUAL PLACEMENT SPOTLIGHTS                     ',
      _SECTION_NOTE_3: '====================================================================',
      individualPlacements,
      _SECTION_NOTE_4: '====================================================================',
      _SECTION_NOTE_5: '                 GROUP PLACEMENT SPOTLIGHTS                         ',
      _SECTION_NOTE_6: '====================================================================',
      groupPlacements,
    };

    return JSON.stringify(structured, null, 2);
  }

  // Trigger JSON download to client machine
  const handleDownloadJson = (recordsToSave = placements) => {
    const formatted = formatPlacementsToJson(recordsToSave);
    const blob = new Blob([formatted], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'placements.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('success', 'placements.json downloaded successfully! Replace src/data/placements.json to persist permanently.');
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  // Switch to JSON tab & sync content
  const handleOpenJsonTab = () => {
    setJsonText(formatPlacementsToJson(placements));
    setJsonError(null);
    setActiveTab('json');
  };

  // Parse and apply changes from raw JSON editor
  const handleApplyJsonEditor = () => {
    try {
      const parsed = JSON.parse(jsonText);
      let list: PlacementRecord[] = [];

      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const ind = Array.isArray(parsed.individualPlacements) ? parsed.individualPlacements : [];
        const grp = Array.isArray(parsed.groupPlacements) ? parsed.groupPlacements : [];
        list = [...ind, ...grp];
      }

      if (list.length === 0) {
        throw new Error('No valid placement records found in JSON.');
      }

      onUpdatePlacements(list);
      setJsonError(null);
      showNotification('success', `Applied ${list.length} placements from JSON successfully!`);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax. Please verify commas and braces.');
    }
  };

  // Upload external JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let list: PlacementRecord[] = [];

        if (Array.isArray(parsed)) {
          list = parsed;
        } else if (parsed && typeof parsed === 'object') {
          const ind = Array.isArray(parsed.individualPlacements) ? parsed.individualPlacements : [];
          const grp = Array.isArray(parsed.groupPlacements) ? parsed.groupPlacements : [];
          list = [...ind, ...grp];
        }

        if (list.length === 0) {
          throw new Error('Uploaded file does not contain any valid placement records.');
        }

        onUpdatePlacements(list);
        setJsonText(formatPlacementsToJson(list));
        showNotification('success', `Imported ${list.length} placements from ${file.name}!`);
      } catch (err: any) {
        showNotification('error', `Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Initialize a new placement template
  const handleCreateNew = (type: 'individual' | 'group' = 'individual') => {
    const newId = `placement-${Date.now()}`;
    const newRecord: PlacementRecord = {
      id: newId,
      type,
      company: 'Celebal Technologies',
      companyTagline: 'Enterprise AI & Cloud Innovation',
      companyLogoType: 'celebal',
      role: 'Data Engineer',
      placementType: 'Intern + PPO',
      package: '7 LPA',
      batchYear: '2025-27',
      department: 'Department of Computer Science and Applications (DoCSA)',
      school: 'School of Computer Science & Engineering',
      location: 'Pune / Jaipur',
      placedDate: 'October 2024',
      description: `Heartiest congratulations to the student(s) on securing coveted placement offers!`,
      students: [
        {
          id: `student-${Date.now()}-1`,
          name: 'Student Name',
          program: 'MCA (Master of Computer Applications)',
          rollNo: 'MITWPU25MCA999',
          photoUrl: '',
          role: 'Data Engineer',
          quote: 'Grateful to MIT-WPU DoCSA faculty for the mentorship.',
        },
      ],
    };

    setEditingPlacement(newRecord);
    setIsCreatingNew(true);
  };

  // Save the record being edited
  const handleSaveEditingPlacement = (record: PlacementRecord) => {
    let updatedList: PlacementRecord[];
    if (isCreatingNew) {
      updatedList = [record, ...placements];
    } else {
      updatedList = placements.map((p) => (p.id === record.id ? record : p));
    }

    onUpdatePlacements(updatedList);
    setEditingPlacement(null);
    setIsCreatingNew(false);
    showNotification('success', `Placement for ${record.company} (${record.students.map(s => s.name).join(', ')}) saved!`);
  };

  // Duplicate a placement record
  const handleDuplicate = (record: PlacementRecord) => {
    const duplicated: PlacementRecord = {
      ...record,
      id: `${record.id}-copy-${Date.now().toString().slice(-4)}`,
      students: record.students.map((s, idx) => ({
        ...s,
        id: `${s.id}-copy-${idx}`,
      })),
    };

    const updatedList = [duplicated, ...placements];
    onUpdatePlacements(updatedList);
    showNotification('success', `Duplicated placement for ${record.company}!`);
  };

  // Delete a placement record
  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete placement for "${name}"?`)) {
      return;
    }
    const updatedList = placements.filter((p) => p.id !== id);
    onUpdatePlacements(updatedList);
    showNotification('success', `Deleted placement.`);
  };

  // Reset to original JSON
  const handleResetToDefault = () => {
    if (!window.confirm('Reset all placements back to the original placements.json bundle?')) return;
    try {
      const parsed = rawPlacementsJson as any;
      const list = [
        ...(parsed.individualPlacements || []),
        ...(parsed.groupPlacements || []),
      ];
      onUpdatePlacements(list);
      setJsonText(formatPlacementsToJson(list));
      showNotification('success', 'Reset placements to initial dataset.');
    } catch {
      showNotification('error', 'Could not reload default dataset.');
    }
  };

  const filteredPlacements = placements.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8B1E3F] tracking-wider uppercase mb-1">
              <FileCode className="w-4 h-4" />
              <span>Data & JSON Manager</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Edit Placements & Download JSON
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Modify student details, add new company placements, or download the updated <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">placements.json</code> file.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleDownloadJson()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B1E3F] hover:bg-[#721833] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save & Download JSON</span>
            </button>

            <label className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Banners</span>
            </button>
          </div>
        </div>

        {/* Status / Notification banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Mode Switcher Tabs (Form Editor vs Raw JSON Editor) */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>Visual Form Editor</span>
            </button>

            <button
              type="button"
              onClick={handleOpenJsonTab}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>Raw JSON Code</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Total Placements: <strong className="text-slate-800">{placements.length}</strong></span>
            <span>·</span>
            <span>Individual: <strong className="text-slate-800">{placements.filter(p => p.type === 'individual').length}</strong></span>
            <span>·</span>
            <span>Group: <strong className="text-slate-800">{placements.filter(p => p.type === 'group').length}</strong></span>
          </div>
        </div>
      </div>

      {/* TAB 1: VISUAL FORM-BASED EDITOR */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {/* Filter Bar & Add New Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  filterType === 'all'
                    ? 'bg-[#8B1E3F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({placements.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('individual')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  filterType === 'individual'
                    ? 'bg-[#8B1E3F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Individual ({placements.filter(p => p.type === 'individual').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('group')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  filterType === 'group'
                    ? 'bg-[#8B1E3F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Group ({placements.filter(p => p.type === 'group').length})</span>
              </button>
            </div>

            {/* Add Placement Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCreateNew('individual')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B1E3F] hover:bg-[#721833] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Individual Placement</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateNew('group')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Add Group Placement</span>
              </button>
            </div>
          </div>

          {/* Placement Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlacements.map((placement, index) => (
              <div
                key={placement.id}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-[#8B1E3F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges & Company Logo */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          placement.type === 'group'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {placement.type === 'group' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {placement.type}
                      </span>

                      {placement.package && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {placement.package}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">#{index + 1}</span>
                  </div>

                  {/* Company & Role */}
                  <div className="flex items-center gap-3 py-1.5">
                    <CompanyLogo
                      type={placement.companyLogoType}
                      companyName={placement.company}
                      customUrl={placement.customLogoUrl}
                      size="sm"
                      className="max-h-8"
                    />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                    {placement.company}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium line-clamp-1">
                    {placement.role}
                  </p>

                  {/* Students List in Card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Placed Student(s) ({placement.students.length})
                    </span>
                    <div className="space-y-1.5">
                      {placement.students.map((student) => (
                        <div key={student.id} className="flex items-center gap-2 text-xs">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#8B1E3F] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-slate-800 line-clamp-1">{student.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal line-clamp-1">({student.program?.split(' ')[0] || 'MCA'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPreviewBanner(placement)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#8B1E3F] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlacement(placement);
                        setIsCreatingNew(false);
                      }}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Placement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(placement)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Record"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(placement.id, placement.company)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RAW JSON CODE EDITOR */}
      {activeTab === 'json' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Direct placements.json Editor</h2>
              <p className="text-xs text-slate-500">Edit JSON syntax directly. Click 'Apply Changes' to sync in-app or 'Save & Download JSON'.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyJsonEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply JSON Changes</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{jsonError}</span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setJsonError(null);
              }}
              rows={24}
              className="w-full font-mono text-xs sm:text-sm bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] leading-relaxed select-text"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* EDIT / CREATE PLACEMENT MODAL DIALOG */}
      {editingPlacement && (
        <PlacementEditModal
          placement={editingPlacement}
          isNew={isCreatingNew}
          onSave={handleSaveEditingPlacement}
          onCancel={() => {
            setEditingPlacement(null);
            setIsCreatingNew(false);
          }}
        />
      )}
    </div>
  );
};

interface PlacementEditModalProps {
  placement: PlacementRecord;
  isNew: boolean;
  onSave: (record: PlacementRecord) => void;
  onCancel: () => void;
}

const PlacementEditModal: React.FC<PlacementEditModalProps> = ({
  placement,
  isNew,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PlacementRecord>({ ...placement });

  const handleStudentChange = (index: number, field: keyof Student, value: string) => {
    const updatedStudents = [...formData.students];
    updatedStudents[index] = {
      ...updatedStudents[index],
      [field]: value,
    };
    setFormData({ ...formData, students: updatedStudents });
  };

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: `student-${Date.now()}-${formData.students.length + 1}`,
      name: 'New Student',
      program: 'MCA (Master of Computer Applications)',
      rollNo: `MITWPU25MCA${100 + formData.students.length}`,
      photoUrl: '',
      role: formData.role || 'Data Engineer',
    };
    setFormData({
      ...formData,
      students: [...formData.students, newStudent],
    });
  };

  const handleRemoveStudent = (index: number) => {
    if (formData.students.length <= 1) {
      alert('A placement record must have at least one student.');
      return;
    }
    const updated = formData.students.filter((_, idx) => idx !== index);
    setFormData({ ...formData, students: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim()) {
      alert('Please enter a company name.');
      return;
    }
    if (formData.students.some((s) => !s.name.trim())) {
      alert('Please ensure all students have names filled in.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider">
              {isNew ? 'New Placement Record' : 'Edit Placement Details'}
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {formData.company ? `${formData.company} Placement` : 'Placement Form'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Section 1: Placement Type & Company Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
              1. Placement Type & Company
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type (Individual vs Group) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Banner Layout Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'individual' | 'group' })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                >
                  <option value="individual">Individual Spotlight (1 Student)</option>
                  <option value="group">Group / Cohort Banner (Multi-Student)</option>
                </select>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Celebal Technologies, EY, Microsoft"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>

              {/* Company Logo Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Logo Preset
                </label>
                <select
                  value={formData.companyLogoType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyLogoType: e.target.value as CompanyLogoType,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                >
                  {DEFAULT_COMPANY_LOGOS.map((logo) => (
                    <option key={logo.value} value={logo.value}>
                      {logo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Logo URL (if custom) */}
              {formData.companyLogoType === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.customLogoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>
              )}

              {/* Company Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Tagline / Division
                </label>
                <input
                  type="text"
                  value={formData.companyTagline || ''}
                  onChange={(e) => setFormData({ ...formData, companyTagline: e.target.value })}
                  placeholder="e.g. Enterprise AI & Cloud Innovation"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role & Offer Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
              2. Job Role & Package Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Job Role */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Role / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Data Engineer, Associate Software Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>

              {/* Package CTC */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Package (CTC)
                </label>
                <input
                  type="text"
                  value={formData.package || ''}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  placeholder="e.g. 7 LPA, 19.6 LPA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>

              {/* Placement Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Type
                </label>
                <select
                  value={formData.placementType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placementType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                >
                  <option value="Intern + PPO">Intern + PPO</option>
                  <option value="Internship cum Placement">Internship cum Placement</option>
                  <option value="Full-time Placement">Full-time Placement</option>
                  <option value="Super Dream Offer">Super Dream Offer</option>
                </select>
              </div>

              {/* Batch Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch Year
                </label>
                <input
                  type="text"
                  value={formData.batchYear}
                  onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                  placeholder="e.g. 2025-27, 2024-25"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>

              {/* Placement Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Placed Date / Month
                </label>
                <input
                  type="text"
                  value={formData.placedDate}
                  onChange={(e) => setFormData({ ...formData, placedDate: e.target.value })}
                  placeholder="e.g. October 2024"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Student Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                3. Placed Student Details ({formData.students.length})
              </h3>

              <button
                type="button"
                onClick={handleAddStudent}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8B1E3F] hover:bg-[#721833] text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.students.map((student, idx) => (
                <div
                  key={student.id || idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8B1E3F]">
                      Student #{idx + 1}
                    </span>

                    {formData.students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Remove Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Student Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={student.name}
                        onChange={(e) => handleStudentChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Tanvi Ballal"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                      />
                    </div>

                    {/* Program Degree */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Program / Degree
                      </label>
                      <input
                        type="text"
                        value={student.program}
                        onChange={(e) => handleStudentChange(idx, 'program', e.target.value)}
                        placeholder="e.g. MCA (Master of Computer Applications)"
                        list="programs-list"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                      />
                      <datalist id="programs-list">
                        {DEFAULT_PROGRAMS.map((prog) => (
                          <option key={prog} value={prog} />
                        ))}
                      </datalist>
                    </div>

                    {/* Roll Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Roll Number / PRN
                      </label>
                      <input
                        type="text"
                        value={student.rollNo || ''}
                        onChange={(e) => handleStudentChange(idx, 'rollNo', e.target.value)}
                        placeholder="e.g. MITWPU25MCA102"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                      />
                    </div>

                    {/* Photo URL */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Student Photo URL (or leave empty for avatar)
                      </label>
                      <input
                        type="text"
                        value={student.photoUrl || ''}
                        onChange={(e) => handleStudentChange(idx, 'photoUrl', e.target.value)}
                        placeholder="e.g. /tanvi.png or image web link"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                      />
                    </div>

                    {/* Quote (for individual spotlight) */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Student Quote / Testimonial
                      </label>
                      <input
                        type="text"
                        value={student.quote || ''}
                        onChange={(e) => handleStudentChange(idx, 'quote', e.target.value)}
                        placeholder="e.g. Grateful to DoCSA faculty and the MIT-WPU Placement Cell for continuous guidance."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#8B1E3F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#8B1E3F] hover:bg-[#721833] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              Save Placement Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
