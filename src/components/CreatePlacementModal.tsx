import React, { useState } from 'react';
import { PlacementRecord, Student, PlacementType } from '../types/placement';
import { CompanyLogoType } from './CompanyLogo';
import { generateStudentAvatar } from '../utils/studentPortraits';
import { GroupPlacementBanner } from './banners/GroupPlacementBanner';
import { IndividualPlacementBanner } from './banners/IndividualPlacementBanner';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles, Eye, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CreatePlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlacement: (record: PlacementRecord) => void;
}

export const CreatePlacementModal: React.FC<CreatePlacementModalProps> = ({
  isOpen,
  onClose,
  onAddPlacement,
}) => {
  const [placementType, setPlacementType] = useState<'individual' | 'group'>('individual');
  const [company, setCompany] = useState('Deutsche Bank');
  const [companyLogoType, setCompanyLogoType] = useState<CompanyLogoType>('deutsche-bank');
  const [role, setRole] = useState('Associate Software Engineer');
  const [offerType, setOfferType] = useState<PlacementType>('Full-time Placement');
  const [pkg, setPkg] = useState('16.5 LPA');
  const [batchYear, setBatchYear] = useState('2024-25');
  const [location, setLocation] = useState('Pune');
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Students list
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'new-1',
      name: 'Yadnyesh Patil',
      program: 'MCA (Master of Computer Applications)',
      rollNo: 'MITWPU23MCA021',
      photoUrl: generateStudentAvatar('yadnyesh-patil', 'male'),
      role: 'Software Engineer',
    },
  ]);

  if (!isOpen) return null;

  const handleTypeChange = (type: 'individual' | 'group') => {
    setPlacementType(type);
    if (type === 'individual') {
      setStudents([students[0] || {
        id: 'new-1',
        name: 'Yadnyesh Patil',
        program: 'MCA (Master of Computer Applications)',
        photoUrl: generateStudentAvatar('yadnyesh', 'male'),
        role: 'Software Engineer',
      }]);
    } else {
      if (students.length < 2) {
        setStudents([
          students[0],
          {
            id: 'new-2',
            name: 'Priya Sharma',
            program: 'BCA (Science)',
            photoUrl: generateStudentAvatar('priya', 'female'),
            role: 'Cloud Developer',
          },
          {
            id: 'new-3',
            name: 'Rohan Deshmukh',
            program: 'M.Sc. Data Science',
            photoUrl: generateStudentAvatar('rohan', 'male'),
            role: 'Data Analyst',
          },
          {
            id: 'new-4',
            name: 'Neha Kulkarni',
            program: 'MCA (Cloud & AI)',
            photoUrl: generateStudentAvatar('neha', 'female'),
            role: 'DevOps Engineer',
          },
        ]);
      }
    }
  };

  const handleUpdateStudent = (index: number, field: keyof Student, value: string) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const handleAddStudent = () => {
    if (students.length >= 4) return;
    const newIdx = students.length + 1;
    setStudents([
      ...students,
      {
        id: `student-${Date.now()}-${newIdx}`,
        name: `Student ${newIdx}`,
        program: 'MCA (Master of Computer Applications)',
        photoUrl: generateStudentAvatar(`student-${newIdx}`, newIdx % 2 === 0 ? 'female' : 'male'),
        role: 'Associate Analyst',
      },
    ]);
  };

  const handleRemoveStudent = (index: number) => {
    if (students.length <= 1) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleUpdateStudent(index, 'photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const previewRecord: PlacementRecord = {
    id: `custom-placement-${Date.now()}`,
    type: placementType,
    company,
    companyLogoType,
    role,
    placementType: offerType,
    package: pkg,
    batchYear,
    location,
    department: 'Department of Computer Science and Applications (DoCSA)',
    school: 'School of Computer Science & Engineering',
    placedDate: 'Current Placement Drive',
    students,
  };

  const handleSave = () => {
    onAddPlacement(previewRecord);
    onClose();
  };

  const handleDownloadPreview = async () => {
    const previewEl = document.querySelector('#preview-banner-container #group-banner-export, #preview-banner-container #individual-banner-export') as HTMLElement;
    if (previewEl) {
      const canvas = await html2canvas(previewEl, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' });
      const link = document.createElement('a');
      link.download = `DoCSA-${company}-Banner.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="banner-creator-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 id="banner-creator-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B1E3F]" />
              Generate DoCSA Placement Banner
            </h2>
            <p className="text-xs text-slate-500">
              Create an official MIT-WPU styled group or individual placement announcement poster.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Form / Preview Tabs on Mobile/Tablet */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Poster
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'form' ? (
            <div className="space-y-6">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Banner Layout Format
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('individual')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      placementType === 'individual'
                        ? 'border-[#8B1E3F] bg-rose-50/50 ring-1 ring-[#8B1E3F]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-900">Individual Spotlight</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      1 student · Golden/Maroon arcs · Large portrait
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('group')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      placementType === 'group'
                        ? 'border-[#8B1E3F] bg-rose-50/50 ring-1 ring-[#8B1E3F]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-sm font-bold text-slate-900">Group Placement</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      2 to 4 students · Crimson arch cards · Batch announcement
                    </span>
                  </button>
                </div>
              </div>

              {/* Company & Placement Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Logo Vector</label>
                  <select
                    value={companyLogoType}
                    onChange={(e) => setCompanyLogoType(e.target.value as CompanyLogoType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B1E3F]"
                  >
                    <option value="deutsche-bank">Deutsche Bank</option>
                    <option value="ey">Ernst & Young (EY)</option>
                    <option value="barclays">Barclays</option>
                    <option value="microsoft">Microsoft</option>
                    <option value="deloitte">Deloitte</option>
                    <option value="amazon">Amazon</option>
                    <option value="persistent">Persistent Systems</option>
                    <option value="tcs">TCS Digital</option>
                    <option value="custom">Generic Text Badge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Offer Type</label>
                  <select
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value as PlacementType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B1E3F]"
                  >
                    <option value="Internship cum Placement">Internship cum Placement</option>
                    <option value="Full-time Placement">Full-time Placement</option>
                    <option value="Super Dream Offer">Super Dream Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Package / CTC</label>
                  <input
                    type="text"
                    value={pkg}
                    onChange={(e) => setPkg(e.target.value)}
                    placeholder="e.g. 14.5 LPA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Batch</label>
                  <input
                    type="text"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>
              </div>

              {/* Students Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Placed Student Profiles ({students.length})
                  </h3>
                  {placementType === 'group' && students.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddStudent}
                      className="text-xs font-semibold text-[#8B1E3F] hover:text-[#5e1028] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Student
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {students.map((student, idx) => (
                    <div
                      key={student.id || idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative flex flex-col md:flex-row gap-4 items-start md:items-center"
                    >
                      {/* Photo preview + upload */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-14 h-16 rounded-t-lg rounded-b-xs bg-[#8B1E3F] p-0.5 overflow-hidden shadow-xs">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1E3F] bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-100">
                            <ImageIcon className="w-3 h-3" />
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Name & Program Fields */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                            Student Name
                          </label>
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => handleUpdateStudent(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                            Degree / Program
                          </label>
                          <select
                            value={student.program}
                            onChange={(e) => handleUpdateStudent(idx, 'program', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800"
                          >
                            <option value="MCA (Master of Computer Applications)">MCA (Master of Computer Applications)</option>
                            <option value="BCA (Science)">BCA (Science)</option>
                            <option value="M.Sc. Computer Science">M.Sc. Computer Science</option>
                            <option value="M.Sc. Data Science & Big Data">M.Sc. Data Science & Big Data</option>
                            <option value="B.Sc. Computer Science (Hons)">B.Sc. Computer Science (Hons)</option>
                            <option value="M.Sc. Cyber Security & Forensics">M.Sc. Cyber Security & Forensics</option>
                          </select>
                        </div>
                      </div>

                      {/* Delete student if group and > 1 */}
                      {placementType === 'group' && students.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live Poster Preview */
            <div id="preview-banner-container" className="flex flex-col items-center">
              <div className="w-full mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Exact rendering of the MIT-WPU DoCSA banner output:
                </span>
                <button
                  type="button"
                  onClick={handleDownloadPreview}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#8B1E3F] hover:bg-[#68142d] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </button>
              </div>

              <div className="w-full overflow-x-auto flex justify-center py-2 bg-slate-100 p-4 rounded-xl border border-slate-200">
                {placementType === 'group' ? (
                  <GroupPlacementBanner placement={previewRecord} />
                ) : (
                  <IndividualPlacementBanner placement={previewRecord} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'form' && (
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Preview Poster
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-[#8B1E3F] hover:bg-[#68142d] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Publish to DoCSA Wall
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
