import React, { useState, useEffect, useMemo } from 'react';
import { PlacementRecord, Student } from '../types/placement';
import { CompanyLogo, CompanyLogoType } from './CompanyLogo';
import { IndividualPlacementBanner } from './banners/IndividualPlacementBanner';
import { GroupPlacementBanner } from './banners/GroupPlacementBanner';
import { PartnerCompaniesJsonEditor, MarqueePartnerItem } from './PartnerCompaniesJsonEditor';
import { GitHubSyncModal } from './GitHubSyncModal';
import rawDefaultData from '../data/placements.json';
import rawDefaultPartnersData from '../data/marqueePartners.json';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Eye,
  FileJson,
  Sliders,
  Sparkles,
  Search,
  ArrowLeft,
  AlertCircle,
  Building2,
  Users,
  User,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  GripVertical,
  ChevronUp,
  ChevronDown,
  FolderGit2,
} from 'lucide-react';

interface PlacementJsonEditorProps {
  placements: PlacementRecord[];
  onBackToApp: () => void;
  onNavigateToPartnersEditor?: () => void;
}

const COMPANY_LOGO_OPTIONS: { label: string; value: CompanyLogoType }[] = [
  { label: 'Celebal Technologies', value: 'celebal' },
  { label: 'EY (Ernst & Young)', value: 'ey' },
  { label: 'Deutsche Bank', value: 'deutsche-bank' },
  { label: 'Barclays', value: 'barclays' },
  { label: 'Deloitte', value: 'deloitte' },
  { label: 'Microsoft', value: 'microsoft' },
  { label: 'Persistent Systems', value: 'persistent' },
  { label: 'TCS Digital', value: 'tcs' },
  { label: 'Amazon AWS', value: 'amazon' },
  { label: 'Virtusa', value: 'virtusa' },
  { label: 'Custom URL Logo', value: 'custom' },
];

export interface PartnerCompanyOption {
  name: string;
  logoUrl: string;
  presetType?: CompanyLogoType;
}

const mapPresetLogo = (name: string): CompanyLogoType => {
  const lower = name.toLowerCase();
  if (lower.includes('ey') || lower.includes('ernst')) return 'ey';
  if (lower.includes('deutsche')) return 'deutsche-bank';
  if (lower.includes('barclays')) return 'barclays';
  if (lower.includes('deloitte')) return 'deloitte';
  if (lower.includes('microsoft')) return 'microsoft';
  if (lower.includes('persistent')) return 'persistent';
  if (lower.includes('tcs') || lower.includes('tata consultancy')) return 'tcs';
  if (lower.includes('amazon') || lower.includes('aws')) return 'amazon';
  if (lower.includes('celebal')) return 'celebal';
  if (lower.includes('virtusa')) return 'virtusa';
  return 'custom';
};

const PLACEMENT_TYPES = [
  'Intern + PPO',
  'Internship cum Placement',
  'Full-time Placement',
  'Super Dream Offer',
  'Dream Offer',
];

export const CONGRATULATIONS_SUBTITLE_OPTIONS = [
  'On your successful placement!',
  'On your successful internship!',
  'On your successful internship & placement!',
  'On your successful corporate internship!',
  'On being selected for prestigious placement!',
];

export const PROGRAM_OPTIONS = [
  'MCA (Master of Computer Applications)',
  'MSC CS (MSC Computer Science)',
  'MSC DSBDA (MSC Data Science and Big Data Analytics)',
  'MSC BT (MSC Blockchain Technology)',
  'BSC CS (BSC Computer Science (Honours))',
  'BSC DSBDA ((BSC Data Science and Big Data Analytics (Honours)))',
];

export const PlacementJsonEditor: React.FC<PlacementJsonEditorProps> = ({
  placements,
  onBackToApp,
}) => {
  // Main Module: 'placements' (placements.json) or 'partners' (marqueePartners.json)
  const [activeDataModule, setActiveDataModule] = useState<'placements' | 'partners'>('placements');

  // Shared Partners List State across Placement and Partner JSON editors
  const [partnersList, setPartnersList] = useState<MarqueePartnerItem[]>(() => {
    const raw = Array.isArray(rawDefaultPartnersData)
      ? (rawDefaultPartnersData as MarqueePartnerItem[])
      : ((rawDefaultPartnersData as any).partners || []);
    return raw.map((p: any, idx: number) => ({
      id: p.id || `partner-item-${idx}`,
      companyName: p.companyName || '',
      name: p.name || p.companyName || '',
      logoLink: p.logoLink || '',
      logo: p.logo || p.logoLink || '',
    }));
  });

  // Dynamic available partner companies computed from active partnersList state
  const availablePartnerCompanies: PartnerCompanyOption[] = useMemo(() => {
    return partnersList.map((p) => {
      const name = p.companyName || p.name || '';
      const logoUrl = p.logoLink || p.logo || '';
      return {
        name,
        logoUrl,
        presetType: mapPresetLogo(name),
      };
    });
  }, [partnersList]);

  // Synchronize new company and logo into partnersList state
  const syncCompanyToPartners = (name: string, logoUrl?: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.toLowerCase() === 'new company') return;

    setPartnersList((prev) => {
      // Filter out any partial or accidental 1-character fragments
      const cleanPrev = prev.filter((p) => (p.companyName || '').trim().length >= 2);
      const idx = cleanPrev.findIndex(
        (p) => p.companyName.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (idx >= 0) {
        if (logoUrl !== undefined && logoUrl !== cleanPrev[idx].logoLink) {
          const updated = [...cleanPrev];
          updated[idx] = {
            ...updated[idx],
            companyName: trimmed,
            name: trimmed,
            logoLink: logoUrl,
            logo: logoUrl,
          };
          return updated;
        }
        return cleanPrev;
      } else {
        const newPartner: MarqueePartnerItem = {
          id: `partner-auto-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          companyName: trimmed,
          name: trimmed,
          logoLink: logoUrl || '',
          logo: logoUrl || '',
        };
        return [...cleanPrev, newPartner];
      }
    });
  };

  // Mode: 'form' (Visual Editor) or 'raw' (JSON Code Editor)
  const [editorTab, setEditorTab] = useState<'form' | 'raw'>('form');

  // Active section inside form: 'individual' vs 'group'
  const [activeCategory, setActiveCategory] = useState<'individual' | 'group'>('individual');

  // All local working placements state
  const [workingPlacements, setWorkingPlacements] = useState<PlacementRecord[]>(placements);

  // Selected placement ID for editing in the form
  const [selectedPlacementId, setSelectedPlacementId] = useState<string>(
    placements.find((p) => p.type === 'individual')?.id || placements[0]?.id || ''
  );

  // Search filter inside editor
  const [searchQuery, setSearchQuery] = useState('');

  // Raw JSON text state
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show live banner preview card
  const [showLivePreview, setShowLivePreview] = useState(true);

  // GitHub commit modal
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Baseline placement IDs originally loaded from the repository
  const baselinePlacementIds = useMemo(() => {
    return new Set(placements.map((p) => p.id));
  }, [placements]);

  // Track placement records newly added during this session
  const [newlyCreatedIds, setNewlyCreatedIds] = useState<Set<string>>(new Set());

  // Drag and drop state for students reordering
  const [draggedStudentIndex, setDraggedStudentIndex] = useState<number | null>(null);
  const [dragOverStudentIndex, setDragOverStudentIndex] = useState<number | null>(null);

  // Drag and drop state for placement records reordering
  const [draggedPlacementId, setDraggedPlacementId] = useState<string | null>(null);
  const [dragOverPlacementId, setDragOverPlacementId] = useState<string | null>(null);

  // Format the structured JSON object with comments and sections
  const formatStructuredJson = (records: PlacementRecord[]) => {
    const individualPlacements = records.filter((p) => p.type === 'individual');
    const groupPlacements = records.filter((p) => p.type === 'group');

    return {
      _SECTION_NOTE_1: '====================================================================',
      _SECTION_NOTE_2: '               INDIVIDUAL PLACEMENT SPOTLIGHTS                     ',
      _SECTION_NOTE_3: '====================================================================',
      individualPlacements: individualPlacements.map((p, idx) => ({
        _comment: `${idx + 1}. INDIVIDUAL: ${p.company} - ${p.students[0]?.name || 'Student'}`,
        ...p,
      })),
      _SECTION_NOTE_4: '====================================================================',
      _SECTION_NOTE_5: '                 GROUP PLACEMENT SPOTLIGHTS                         ',
      _SECTION_NOTE_6: '====================================================================',
      groupPlacements: groupPlacements.map((p, idx) => ({
        _comment: `${idx + 1}. GROUP: ${p.company} (${p.students.length} Students)`,
        ...p,
      })),
    };
  };

  // Sync rawJsonText when switching tabs or when workingPlacements change
  useEffect(() => {
    const structured = formatStructuredJson(workingPlacements);
    setRawJsonText(JSON.stringify(structured, null, 2));
    setJsonError(null);
  }, [workingPlacements]);

  // Active placement being edited
  const selectedPlacement = useMemo(() => {
    return workingPlacements.find((p) => p.id === selectedPlacementId) || workingPlacements[0];
  }, [workingPlacements, selectedPlacementId]);

  // Dynamic commit message matching: "new - prn - name" if newly added, otherwise "update - prn - name"
  const placementCommitMessage = useMemo(() => {
    if (!selectedPlacement) return 'update - student prn - name';

    const isNew =
      newlyCreatedIds.has(selectedPlacement.id) ||
      !baselinePlacementIds.has(selectedPlacement.id);
    const action = isNew ? 'new' : 'update';

    if (selectedPlacement.type === 'individual') {
      const student = selectedPlacement.students?.[0];
      const prn = student?.rollNo?.trim() || 'student prn';
      const name = student?.name?.trim() || 'name';
      return `${action} - ${prn} - ${name}`;
    } else {
      const students = selectedPlacement.students || [];
      const prns = students.map((s) => s.rollNo?.trim()).filter(Boolean).join(', ');
      const names = students.map((s) => s.name?.trim()).filter(Boolean).join(', ');
      if (prns && names) {
        return `${action} - ${prns} - ${names}`;
      }
      return `${action} - ${selectedPlacement.company} - ${students.length} students`;
    }
  }, [selectedPlacement, newlyCreatedIds, baselinePlacementIds]);

  // Filtered lists for the sidebar
  const individualList = useMemo(() => {
    return workingPlacements.filter((p) => {
      if (p.type !== 'individual') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.company.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.students.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [workingPlacements, searchQuery]);

  const groupList = useMemo(() => {
    return workingPlacements.filter((p) => {
      if (p.type !== 'group') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.company.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.students.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [workingPlacements, searchQuery]);

  // Show temporary toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. UPDATE FIELD ON ACTIVE PLACEMENT
  const handleUpdatePlacement = (field: keyof PlacementRecord, value: any) => {
    if (!selectedPlacement) return;
    setWorkingPlacements((prev) =>
      prev.map((p) => (p.id === selectedPlacement.id ? { ...p, [field]: value } : p))
    );
  };

  // 2. UPDATE STUDENT FIELD
  const handleUpdateStudent = (index: number, field: keyof Student, value: any) => {
    if (!selectedPlacement) return;
    const updatedStudents = [...selectedPlacement.students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    handleUpdatePlacement('students', updatedStudents);
  };

  // 3. ADD STUDENT TO ACTIVE PLACEMENT
  const handleAddStudent = () => {
    if (!selectedPlacement) return;
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: 'New Student Name',
      program: 'MCA (Master of Computer Applications)',
      rollNo: `MITWPU25MCA${Math.floor(100 + Math.random() * 900)}`,
      photoUrl: '',
      role: selectedPlacement.role || 'Software Engineer',
      quote: 'Proud to be placed through MIT-WPU DoCSA Campus Placements.',
    };
    handleUpdatePlacement('students', [...selectedPlacement.students, newStudent]);
  };

  // 4. REMOVE STUDENT
  const handleRemoveStudent = (index: number) => {
    if (!selectedPlacement || selectedPlacement.students.length <= 1) {
      triggerToast('A placement record must have at least one student.');
      return;
    }
    const studentName = selectedPlacement.students[index]?.name || `Student ${index + 1}`;
    const updatedStudents = selectedPlacement.students.filter((_, i) => i !== index);
    handleUpdatePlacement('students', updatedStudents);
    triggerToast(`Removed student: ${studentName}`);
  };

  // 4b. REORDER / MOVE STUDENT
  const handleReorderStudents = (fromIndex: number, toIndex: number) => {
    if (!selectedPlacement) return;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= selectedPlacement.students.length) return;
    const updated = [...selectedPlacement.students];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    handleUpdatePlacement('students', updated);
    triggerToast(`Moved "${moved.name || 'Student'}" to position ${toIndex + 1}`);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStudentIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStudentIndex !== index) {
      setDragOverStudentIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverStudentIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedStudentIndex === null || draggedStudentIndex === targetIndex) {
      setDraggedStudentIndex(null);
      setDragOverStudentIndex(null);
      return;
    }
    handleReorderStudents(draggedStudentIndex, targetIndex);
    setDraggedStudentIndex(null);
    setDragOverStudentIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedStudentIndex(null);
    setDragOverStudentIndex(null);
  };

  // 4c. REORDER / MOVE PLACEMENTS IN SIDEBAR
  const handleReorderPlacements = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const currentCategoryList = activeCategory === 'individual' ? individualList : groupList;
    const otherCategoryList = activeCategory === 'individual' ? groupList : individualList;

    const fromIndex = currentCategoryList.findIndex((p) => p.id === fromId);
    const toIndex = currentCategoryList.findIndex((p) => p.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reorderedCategoryList = [...currentCategoryList];
    const [moved] = reorderedCategoryList.splice(fromIndex, 1);
    reorderedCategoryList.splice(toIndex, 0, moved);

    const newFullList =
      activeCategory === 'individual'
        ? [...reorderedCategoryList, ...otherCategoryList]
        : [...otherCategoryList, ...reorderedCategoryList];

    setWorkingPlacements(newFullList);
    triggerToast(`Moved "${moved.company}" to position ${toIndex + 1}`);
  };

  const handlePlacementDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPlacementId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handlePlacementDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPlacementId !== id) {
      setDragOverPlacementId(id);
    }
  };

  const handlePlacementDragLeave = () => {
    setDragOverPlacementId(null);
  };

  const handlePlacementDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPlacementId || draggedPlacementId === targetId) {
      setDraggedPlacementId(null);
      setDragOverPlacementId(null);
      return;
    }
    handleReorderPlacements(draggedPlacementId, targetId);
    setDraggedPlacementId(null);
    setDragOverPlacementId(null);
  };

  const handlePlacementDragEnd = () => {
    setDraggedPlacementId(null);
    setDragOverPlacementId(null);
  };

  // 5. CREATE NEW PLACEMENT RECORD
  const handleCreateNewPlacement = (type: 'individual' | 'group') => {
    const newId = `placement-${type}-${Date.now()}`;
    setNewlyCreatedIds((prev) => new Set(prev).add(newId));
    const newRecord: PlacementRecord = {
      id: newId,
      type,
      company: 'New Corporate Partner',
      companyTagline: 'Technology & Innovation',
      companyLogoType: 'custom',
      role: 'Software Engineer',
      placementType: 'Intern + PPO',
      package: '7 LPA',
      batchYear: '2025-27',
      department: 'Department of Computer Science and Applications (DoCSA)',
      school: 'School of Computer Science & Engineering',
      location: 'Pune / Mumbai',
      placedDate: 'October 2024',
      description:
        type === 'individual'
          ? 'Heartiest congratulations to our student on securing placement!'
          : 'Heartiest congratulations to our cohort of students on securing placements!',
      students:
        type === 'individual'
          ? [
              {
                id: `student-${Date.now()}-1`,
                name: 'Student Name',
                program: 'MCA (Master of Computer Applications)',
                rollNo: 'MITWPU25MCA101',
                photoUrl: '',
                role: 'Software Engineer',
                quote: 'Grateful to MIT-WPU DoCSA for outstanding placement support.',
              },
            ]
          : [
              {
                id: `student-${Date.now()}-1`,
                name: 'Student 1',
                program: 'MCA (Master of Computer Applications)',
                rollNo: 'MITWPU25MCA101',
                photoUrl: '',
                role: 'Software Engineer',
              },
              {
                id: `student-${Date.now()}-2`,
                name: 'Student 2',
                program: 'MCA (Master of Computer Applications)',
                rollNo: 'MITWPU25MCA102',
                photoUrl: '',
                role: 'Software Engineer',
              },
            ],
    };

    setWorkingPlacements((prev) => [newRecord, ...prev]);
    setSelectedPlacementId(newId);
    setActiveCategory(type);
    triggerToast(`Created new ${type} placement record!`);
  };

  // 6. DUPLICATE PLACEMENT
  const handleDuplicatePlacement = (source: PlacementRecord) => {
    const duplicated: PlacementRecord = {
      ...source,
      id: `placement-${source.type}-${Date.now()}`,
      company: `${source.company} (Copy)`,
      students: source.students.map((s, idx) => ({
        ...s,
        id: `student-${Date.now()}-${idx}`,
      })),
    };
    setWorkingPlacements((prev) => [duplicated, ...prev]);
    setSelectedPlacementId(duplicated.id);
    triggerToast(`Duplicated ${source.company} placement!`);
  };

  // 7. DELETE PLACEMENT (Direct deletion without modal confirm for iframe compatibility)
  const handleDeletePlacement = (idToDelete: string) => {
    const target = workingPlacements.find((p) => p.id === idToDelete);
    const companyName = target?.company || 'Placement';
    const remaining = workingPlacements.filter((p) => p.id !== idToDelete);

    if (remaining.length === 0) {
      triggerToast('Cannot delete the last remaining placement record.');
      return;
    }

    setWorkingPlacements(remaining);

    // If deleting the currently selected one, select the next available
    if (selectedPlacementId === idToDelete) {
      const nextInCategory = remaining.find((p) => p.type === activeCategory);
      const nextSelected = nextInCategory || remaining[0];
      if (nextSelected) {
        setSelectedPlacementId(nextSelected.id);
        setActiveCategory(nextSelected.type);
      }
    }

    triggerToast(`🗑️ Deleted ${companyName} placement record.`);
  };

  // 8. PARSE & APPLY RAW JSON TEXT
  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      let list: PlacementRecord[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed.individualPlacements || parsed.groupPlacements) {
        list = [
          ...(parsed.individualPlacements || []),
          ...(parsed.groupPlacements || []),
        ];
      } else {
        throw new Error('JSON must contain "individualPlacements" / "groupPlacements" or be an array.');
      }

      setWorkingPlacements(list);
      setJsonError(null);
      if (list[0]) {
        setSelectedPlacementId(list[0].id);
        setActiveCategory(list[0].type);
      }
      triggerToast('Parsed and applied JSON successfully!');
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  // 9. DOWNLOAD JSON FILE (Downloads updated JSON without altering website)
  const handleSaveAndDownload = () => {
    let finalRecords = workingPlacements;

    // If currently in raw mode, ensure latest valid JSON text is parsed
    if (editorTab === 'raw') {
      try {
        const parsed = JSON.parse(rawJsonText);
        if (Array.isArray(parsed)) {
          finalRecords = parsed;
        } else {
          finalRecords = [
            ...(parsed.individualPlacements || []),
            ...(parsed.groupPlacements || []),
          ];
        }
        setWorkingPlacements(finalRecords);
        setJsonError(null);
      } catch (err: any) {
        setJsonError(`Cannot download: ${err.message}`);
        return;
      }
    }

    const structured = formatStructuredJson(finalRecords);
    const jsonString = JSON.stringify(structured, null, 2);

    // Download file to user's computer
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'placements.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    triggerToast('📥 placements.json downloaded successfully to your computer!');
  };

  // 10. IMPORT JSON FROM LOCAL FILE
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
        } else if (parsed.individualPlacements || parsed.groupPlacements) {
          list = [
            ...(parsed.individualPlacements || []),
            ...(parsed.groupPlacements || []),
          ];
        } else {
          throw new Error('Unsupported JSON structure. Expected individualPlacements and groupPlacements.');
        }

        setWorkingPlacements(list);
        if (list[0]) {
          setSelectedPlacementId(list[0].id);
          setActiveCategory(list[0].type);
        }
        triggerToast(`Successfully loaded ${list.length} placements from ${file.name} into editor!`);
      } catch (err: any) {
        alert(`Error reading JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  // 11. RESET TO DEFAULT JSON
  const handleResetToDefault = () => {
    if (
      !window.confirm(
        'Reset editor back to the default template? Any unsaved edits in this editor form will be cleared.'
      )
    ) {
      return;
    }

    const defaultList = [
      ...((rawDefaultData as any).individualPlacements || []),
      ...((rawDefaultData as any).groupPlacements || []),
    ];
    setWorkingPlacements(defaultList);
    if (defaultList[0]) {
      setSelectedPlacementId(defaultList[0].id);
      setActiveCategory(defaultList[0].type);
    }
    triggerToast('Editor reset to default placements.');
  };

  // 12. COPY JSON TO CLIPBOARD
  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  if (activeDataModule === 'partners') {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col font-sans">
        {/* MERGED TOP SUB-HEADER SWITCHER */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDataModule('placements')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>1. Student Placements (placements.json)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDataModule('partners')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-[#8B1E3F] text-white shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Hiring Partners & Key Stats (marqueePartners.json)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
            Manage recruiter logos carousel & recruitment statistics
          </span>
        </div>

        <PartnerCompaniesJsonEditor
          onBackToApp={onBackToApp}
          onNavigateToPlacementsEditor={() => setActiveDataModule('placements')}
          partnersList={partnersList}
          setPartnersList={setPartnersList}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#8B1E3F] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-rose-300/30 text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MERGED TOP SUB-HEADER SWITCHER */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveDataModule('placements')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-[#8B1E3F] text-white shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>1. Student Placements (placements.json)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDataModule('partners')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>2. Hiring Partners & Key Stats (marqueePartners.json)</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
          Manage individual & group student placement records
        </span>
      </div>

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
              <FileJson className="w-4 h-4 text-[#8B1E3F]" />
              <span>Placements JSON Form & Editor</span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Edit individual & group placements, then download the updated <code className="bg-slate-100 px-1 py-0.5 rounded text-[#8B1E3F] font-mono">placements.json</code> file.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
            title="Reset editor back to default placements template"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* DOWNLOAD BUTTON */}
          <button
            type="button"
            onClick={handleSaveAndDownload}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-[#8B1E3F] hover:bg-[#721833] rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download JSON</span>
          </button>

          {/* SAVE CHANGES BUTTON */}
          <button
            type="button"
            onClick={() => setIsGitHubModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-700"
            title="Directly commit updates to your GitHub repository and trigger auto-deploy on Vercel"
          >
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>SAVE CHANGES</span>
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
                You can directly edit the structured JSON code below. Individual placements are under <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">individualPlacements</code> and group placements are under <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">groupPlacements</code>. Click "Save & Download JSON" when done.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Status:</span>
              {jsonError ? (
                <span className="text-red-600 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {jsonError}
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Valid JSON
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotification ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleApplyRawJson}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#8B1E3F] bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Validate & Apply Form</span>
              </button>
            </div>
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
            placeholder="Paste or write placements.json code here..."
            spellCheck={false}
          />
        </div>
      ) : (
        /* ================= VISUAL FORM EDITOR ================= */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: PLACEMENT LIST (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            {/* Category Selector Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('individual');
                  const first = individualList[0] || workingPlacements.find((p) => p.type === 'individual');
                  if (first) setSelectedPlacementId(first.id);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCategory === 'individual'
                    ? 'bg-white text-[#8B1E3F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Individual ({individualList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('group');
                  const first = groupList[0] || workingPlacements.find((p) => p.type === 'group');
                  if (first) setSelectedPlacementId(first.id);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCategory === 'group'
                    ? 'bg-white text-[#8B1E3F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Group ({groupList.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search placements or students..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
              />
            </div>

            {/* Add New Placement Button */}
            <button
              type="button"
              onClick={() => handleCreateNewPlacement(activeCategory)}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[#8B1E3F] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {activeCategory === 'individual' ? 'Individual' : 'Group'} Placement</span>
            </button>

            {/* Scrollable list of placements */}
            <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
              {(activeCategory === 'individual' ? individualList : groupList).map((placement, pIdx, arr) => {
                const isSelected = placement.id === selectedPlacementId;
                const studentName = placement.students[0]?.name || 'Student';
                const count = placement.students.length;
                const isDragging = draggedPlacementId === placement.id;
                const isDragOver = dragOverPlacementId === placement.id;

                return (
                  <div
                    key={placement.id}
                    draggable
                    onDragStart={(e) => handlePlacementDragStart(e, placement.id)}
                    onDragOver={(e) => handlePlacementDragOver(e, placement.id)}
                    onDragLeave={handlePlacementDragLeave}
                    onDrop={(e) => handlePlacementDrop(e, placement.id)}
                    onDragEnd={handlePlacementDragEnd}
                    onClick={() => setSelectedPlacementId(placement.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isDragging
                        ? 'opacity-40 border-dashed border-[#8B1E3F] bg-rose-50/40'
                        : isDragOver
                        ? 'border-[#8B1E3F] ring-2 ring-[#8B1E3F]/30 bg-rose-50/80 shadow-md scale-[1.01]'
                        : isSelected
                        ? 'bg-rose-50/70 border-[#8B1E3F] shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-[#8B1E3F] hover:bg-rose-50 rounded transition-colors shrink-0"
                      title="Drag to rearrange placement position"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {pIdx + 1}. {placement.company}
                        </span>
                        {placement.package && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                            {placement.package}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-[#8B1E3F] truncate mt-0.5">
                        {placement.type === 'individual' ? studentName : `${count} Students Cohort`}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <span className="truncate">{placement.role}</span>
                        <span>·</span>
                        <span className="shrink-0">{placement.batchYear}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={pIdx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pIdx > 0) handleReorderPlacements(placement.id, arr[pIdx - 1].id);
                        }}
                        title="Move placement up"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-0 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={pIdx === arr.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pIdx < arr.length - 1) handleReorderPlacements(placement.id, arr[pIdx + 1].id);
                        }}
                        title="Move placement down"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-0 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlacement(placement.id);
                        }}
                        title={`Delete ${placement.company} placement`}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-[#8B1E3F] translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}

              {(activeCategory === 'individual' ? individualList : groupList).length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No {activeCategory} placements match your search.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT MAIN PANEL: FORM FIELDS FOR SELECTED PLACEMENT (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {selectedPlacement ? (
              <>
                {/* Form Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
                  {/* Card Header & Tools */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F] bg-rose-50 px-2 py-0.5 rounded">
                        {selectedPlacement.type === 'individual' ? 'Individual Placement' : 'Group Placement'}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">
                        Edit: {selectedPlacement.company}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDuplicatePlacement(selectedPlacement)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate this placement"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePlacement(selectedPlacement.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        title="Delete placement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* SECTION 1: COMPANY & OFFER DETAILS */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Company & Offer Specifications</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Company Name */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-semibold text-slate-700">Company Name *</label>
                          <span className="text-[10px] text-[#8B1E3F] font-bold">Partners JSON</span>
                        </div>

                        <div className="space-y-1.5">
                          {/* Dropdown populated from marqueePartners.json with New Company option */}
                          <select
                            value={
                              availablePartnerCompanies.some(
                                (p) => p.name.trim().toLowerCase() === selectedPlacement.company.trim().toLowerCase()
                              )
                                ? selectedPlacement.company
                                : '__new_company__'
                            }
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              if (selectedName === '__new_company__') {
                                setWorkingPlacements((prev) =>
                                  prev.map((item) =>
                                    item.id === selectedPlacementId
                                      ? {
                                          ...item,
                                          company: '',
                                          companyLogoType: 'custom',
                                          customLogoUrl: '',
                                        }
                                      : item
                                  )
                                );
                                triggerToast('New company selected. Enter the company name and logo below.');
                                return;
                              }
                              const partner = availablePartnerCompanies.find(
                                (p) => p.name.trim().toLowerCase() === selectedName.trim().toLowerCase()
                              );
                              if (partner) {
                                setWorkingPlacements((prev) =>
                                  prev.map((item) =>
                                    item.id === selectedPlacementId
                                      ? {
                                          ...item,
                                          company: partner.name,
                                          companyLogoType: partner.presetType || 'custom',
                                          customLogoUrl: partner.logoUrl,
                                        }
                                      : item
                                  )
                                );
                                triggerToast(`Selected ${partner.name}`);
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#8B1E3F] cursor-pointer text-xs"
                          >
                            <option value="__new_company__">New Company</option>
                            {availablePartnerCompanies.map((partner) => (
                              <option key={`partner-opt-${partner.name}`} value={partner.name}>
                                {partner.name}
                              </option>
                            ))}
                          </select>

                          {/* Text input for custom / edited company name */}
                          <input
                            type="text"
                            value={selectedPlacement.company}
                            onChange={(e) => {
                              handleUpdatePlacement('company', e.target.value);
                            }}
                            onBlur={() => {
                              if (selectedPlacement.company && selectedPlacement.company.trim().length >= 2) {
                                syncCompanyToPartners(selectedPlacement.company, selectedPlacement.customLogoUrl);
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F] font-semibold text-slate-900 text-xs"
                            placeholder="Type company name (e.g. Bentley Systems, Microsoft)"
                          />
                        </div>
                      </div>

                      {/* Company Logo Type */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-semibold text-slate-700">Company Logo *</label>
                          <span className="text-[10px] text-slate-500 font-medium">Logo Source</span>
                        </div>

                        <div className="space-y-1.5">
                          <select
                            value={
                              selectedPlacement.companyLogoType === 'custom' && selectedPlacement.customLogoUrl
                                ? `partner-url:${selectedPlacement.customLogoUrl}`
                                : 'custom'
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.startsWith('partner-url:')) {
                                const url = val.replace('partner-url:', '');
                                setWorkingPlacements((prev) =>
                                  prev.map((item) =>
                                    item.id === selectedPlacementId
                                      ? { ...item, companyLogoType: 'custom', customLogoUrl: url }
                                      : item
                                  )
                                );
                                if (selectedPlacement.company && selectedPlacement.company.trim().length >= 2) {
                                  syncCompanyToPartners(selectedPlacement.company, url);
                                }
                              } else {
                                handleUpdatePlacement('companyLogoType', 'custom');
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F] text-xs"
                          >
                            <option value="custom">Custom Logo URL</option>
                            {availablePartnerCompanies.filter((p) => p.logoUrl).map((partner) => (
                              <option key={`logo-partner-${partner.name}`} value={`partner-url:${partner.logoUrl}`}>
                                {partner.name} Logo
                              </option>
                            ))}
                          </select>

                          {/* Custom Logo URL text input */}
                          <input
                            type="text"
                            value={selectedPlacement.customLogoUrl || ''}
                            onChange={(e) => {
                              handleUpdatePlacement('customLogoUrl', e.target.value);
                            }}
                            onBlur={() => {
                              if (selectedPlacement.company && selectedPlacement.company.trim().length >= 2) {
                                syncCompanyToPartners(selectedPlacement.company, selectedPlacement.customLogoUrl);
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F] font-mono text-[11px]"
                            placeholder="Logo Image URL (https://... or /logo.webp)"
                          />
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Job Role / Title *</label>
                        <input
                          type="text"
                          value={selectedPlacement.role}
                          onChange={(e) => handleUpdatePlacement('role', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                          placeholder="e.g. Data Engineer"
                        />
                      </div>

                      {/* Package / Offered CTC */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Offered CTC / Package *</label>
                        <input
                          type="text"
                          value={selectedPlacement.package || ''}
                          onChange={(e) => handleUpdatePlacement('package', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                          placeholder="e.g. 7 LPA, 19.6 LPA"
                        />
                      </div>

                      {/* Placement Type */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Placement Type *</label>
                        <select
                          value={selectedPlacement.placementType}
                          onChange={(e) => handleUpdatePlacement('placementType', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                        >
                          {PLACEMENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Placed Month / Date (Shifted beside Placement Type) */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Placed Month / Date</label>
                        <input
                          type="text"
                          value={selectedPlacement.placedDate}
                          onChange={(e) => handleUpdatePlacement('placedDate', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                          placeholder="e.g. October 2024"
                        />
                      </div>

                      {/* Congratulations Subtitle / Message */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-semibold text-slate-700">
                            Congratulations Subtitle / Message *
                          </label>
                          <span className="text-[10px] text-[#1E5C9E] font-bold">Banner Subtitle</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={
                              CONGRATULATIONS_SUBTITLE_OPTIONS.includes(
                                selectedPlacement.congratulationsSubtitle || ''
                              )
                                ? selectedPlacement.congratulationsSubtitle || ''
                                : selectedPlacement.congratulationsSubtitle
                                ? '__custom__'
                                : ''
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '__custom__') {
                                // keep current value
                              } else {
                                handleUpdatePlacement('congratulationsSubtitle', val);
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F] text-xs font-medium"
                          >
                            <option value="">Auto (Based on Placement Type)</option>
                            {CONGRATULATIONS_SUBTITLE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                            <option value="__custom__">Custom Text...</option>
                          </select>

                          <input
                            type="text"
                            value={selectedPlacement.congratulationsSubtitle || ''}
                            onChange={(e) => handleUpdatePlacement('congratulationsSubtitle', e.target.value)}
                            placeholder="Type custom subtitle (e.g. On your successful internship!)"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F] text-xs font-semibold text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Batch Year */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Batch Year *</label>
                        <input
                          type="text"
                          value={selectedPlacement.batchYear}
                          onChange={(e) => handleUpdatePlacement('batchYear', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                          placeholder="e.g. 2025-27 or 2024-25"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={selectedPlacement.department}
                          onChange={(e) => handleUpdatePlacement('department', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                        />
                      </div>

                      {/* School */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">School</label>
                        <input
                          type="text"
                          value={selectedPlacement.school}
                          onChange={(e) => handleUpdatePlacement('school', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Job Location</label>
                        <input
                          type="text"
                          value={selectedPlacement.location || ''}
                          onChange={(e) => handleUpdatePlacement('location', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F]"
                          placeholder="e.g. Pune / Jaipur"
                        />
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Announcement Caption / Description</label>
                        <textarea
                          value={selectedPlacement.description || ''}
                          onChange={(e) => handleUpdatePlacement('description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8B1E3F] leading-relaxed"
                          placeholder="Heartiest congratulations to..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: STUDENTS DETAILS */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#8B1E3F]" />
                          <span>Students Cohort ({selectedPlacement.students.length})</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Drag cards by grip handle or use up/down arrows to rearrange placement sequence
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddStudent}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#8B1E3F] bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Student</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {selectedPlacement.students.map((student, idx) => {
                        const isDragging = draggedStudentIndex === idx;
                        const isDragOver = dragOverStudentIndex === idx;

                        return (
                          <div
                            key={student.id || idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            className={`p-4 rounded-xl border transition-all relative flex flex-col gap-3 ${
                              isDragging
                                ? 'opacity-40 border-dashed border-[#8B1E3F] bg-rose-50/40'
                                : isDragOver
                                ? 'border-[#8B1E3F] ring-2 ring-[#8B1E3F]/30 bg-rose-50/70 shadow-md scale-[1.01]'
                                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                              <div className="flex items-center gap-2">
                                {/* Drag Handle */}
                                <div
                                  className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#8B1E3F] hover:bg-rose-50 rounded transition-colors"
                                  title="Drag to rearrange student"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                <span className="w-5 h-5 bg-[#8B1E3F] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {idx + 1}
                                </span>

                                <span className="text-xs font-bold text-slate-800 truncate">
                                  Student {idx + 1}: {student.name || 'Untitled'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleReorderStudents(idx, idx - 1)}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                  title="Move student up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>

                                {/* Move Down */}
                                <button
                                  type="button"
                                  disabled={idx === selectedPlacement.students.length - 1}
                                  onClick={() => handleReorderStudents(idx, idx + 1)}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                  title="Move student down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                {selectedPlacement.students.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStudent(idx)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                                    title="Remove student"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              {/* Student Name */}
                              <div>
                                <label className="block font-semibold text-slate-600 mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  value={student.name}
                                  onChange={(e) => handleUpdateStudent(idx, 'name', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F]"
                                  placeholder="e.g. Siddharth Phadtare"
                                />
                              </div>

                              {/* Academic Program Dropdown */}
                              <div>
                                <label className="block font-semibold text-slate-600 mb-1">Academic Program *</label>
                                <select
                                  value={
                                    PROGRAM_OPTIONS.includes(student.program)
                                      ? student.program
                                      : PROGRAM_OPTIONS.find((p) =>
                                          student.program &&
                                          (p.toLowerCase().includes(student.program.toLowerCase()) ||
                                            student.program.toLowerCase().includes(p.split(' ')[0].toLowerCase()))
                                        ) || PROGRAM_OPTIONS[0]
                                  }
                                  onChange={(e) => handleUpdateStudent(idx, 'program', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F] text-xs font-medium cursor-pointer"
                                >
                                  {PROGRAM_OPTIONS.map((prog) => (
                                    <option key={prog} value={prog}>
                                      {prog}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Roll Number */}
                              <div>
                                <label className="block font-semibold text-slate-600 mb-1">Roll / PRN Number</label>
                                <input
                                  type="text"
                                  value={student.rollNo || ''}
                                  onChange={(e) => handleUpdateStudent(idx, 'rollNo', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F]"
                                  placeholder="e.g. MITWPU25MCA101"
                                />
                              </div>

                              {/* Photo URL */}
                              <div>
                                <label className="block font-semibold text-slate-600 mb-1">
                                  Photo URL / Path (or leave empty for avatar)
                                </label>
                                <input
                                  type="text"
                                  value={student.photoUrl || ''}
                                  onChange={(e) => handleUpdateStudent(idx, 'photoUrl', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F]"
                                  placeholder="https://... or /photo.png"
                                />
                              </div>

                              {/* Student Role */}
                              <div>
                                <label className="block font-semibold text-slate-600 mb-1">Designation / Role</label>
                                <input
                                  type="text"
                                  value={student.role || ''}
                                  onChange={(e) => handleUpdateStudent(idx, 'role', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F]"
                                  placeholder="e.g. Data Engineer"
                                />
                              </div>

                              {/* Student Quote (for individual banners) */}
                              <div>
                                <label className="block font-semibold text-slate-600 mb-1">Student Quote</label>
                                <input
                                  type="text"
                                  value={student.quote || ''}
                                  onChange={(e) => handleUpdateStudent(idx, 'quote', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B1E3F]"
                                  placeholder="e.g. Grateful to DoCSA faculty..."
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: LIVE BANNER PREVIEW ACCORDION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>Live Banner Preview</span>
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowLivePreview(!showLivePreview)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      {showLivePreview ? 'Collapse Preview' : 'Expand Preview'}
                    </button>
                  </div>

                  {showLivePreview && (
                    <div className="p-3 bg-slate-100 rounded-xl flex justify-center overflow-x-auto">
                      <div className="w-full max-w-[780px] transform origin-top transition-transform scale-95 sm:scale-100">
                        {selectedPlacement.type === 'group' ? (
                          <GroupPlacementBanner placement={selectedPlacement} />
                        ) : (
                          <IndividualPlacementBanner placement={selectedPlacement} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                Please select or create a placement record to begin editing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* GitHub Direct Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        fileName="placements.json"
        filePath="src/data/placements.json"
        fileContent={JSON.stringify(formatStructuredJson(workingPlacements), null, 2)}
        defaultCommitMessage={placementCommitMessage}
        onCommitSuccess={(res) => {
          if (selectedPlacement?.id) {
            setNewlyCreatedIds((prev) => {
              const next = new Set(prev);
              next.delete(selectedPlacement.id);
              return next;
            });
            baselinePlacementIds.add(selectedPlacement.id);
          }
          triggerToast('🚀 Successfully saved! Live website will update in a few 30–45 seconds.');
        }}
      />
    </div>
  );
};
