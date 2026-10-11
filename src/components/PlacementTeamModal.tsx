import React, { useState } from 'react';
import {
  X,
  Users,
  ChevronDown,
  Mail,
  Info,
  Building2,
  GraduationCap,
  Award,
  Camera,
  Link,
  Check,
} from 'lucide-react';
import placementTeamData from '../data/placementTeam.json';
import { normalizeImageUrl } from '../utils/googleDriveUrl';

interface PlacementTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  post: string;
  email: string;
  image?: string | null;
}

const getInitials = (name: string) => {
  if (!name) return 'PR';
  const cleanName = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s+/, '').trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const TeamMemberCard: React.FC<{
  member: TeamMember;
  accentColor: string;
  hoverBorder: string;
  customPhotoUrl?: string;
  onSavePhotoUrl: (id: string, url: string) => void;
}> = ({ member, accentColor, hoverBorder, customPhotoUrl, onSavePhotoUrl }) => {
  const [imgError, setImgError] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const rawImage = customPhotoUrl !== undefined ? customPhotoUrl : member.image;
  const normalizedUrl = normalizeImageUrl(rawImage);
  const [inputUrl, setInputUrl] = useState(rawImage || '');
  const initials = getInitials(member.name);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePhotoUrl(member.id, inputUrl);
    setImgError(false);
    setIsEditingPhoto(false);
  };

  return (
    <div
      className={`p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative ${hoverBorder}`}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Avatar Portrait with Rotated Accent Background */}
        <div className="relative pt-1">
          <div
            className={`absolute inset-0 ${accentColor} rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-90`}
          />
          {normalizedUrl && !imgError ? (
            <img
              src={normalizedUrl}
              alt={member.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-20 h-20 rounded-2xl object-cover relative z-10 border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center relative z-10 border-2 border-white shadow-md">
              {initials}
            </div>
          )}

          {/* Edit Photo Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setInputUrl(rawImage || '');
              setIsEditingPhoto(!isEditingPhoto);
            }}
            title="Update Photo / Drive Link"
            className="absolute -bottom-1 -right-1 z-20 p-1.5 bg-slate-900 hover:bg-[#8B1E3F] text-white rounded-lg shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
          >
            <Camera className="w-3.5 h-3.5 text-[#E5A93C]" />
          </button>
        </div>

        <div className="space-y-0.5">
          <h4 className="font-extrabold text-slate-900 text-base leading-tight">
            {member.name}
          </h4>
          <p className="text-[#8B1E3F] font-bold text-[10px] uppercase tracking-widest">
            {member.post}
          </p>
        </div>
      </div>

      {/* Inline Photo Editor Popover */}
      {isEditingPhoto && (
        <form
          onSubmit={handleSave}
          className="mt-3 p-2.5 bg-white rounded-xl border border-rose-200 shadow-lg space-y-2 z-30 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
            <Link className="w-3 h-3 text-[#8B1E3F]" />
            <span>Photo / Google Drive Link</span>
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste image URL or Drive link..."
            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#8B1E3F]"
          />
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingPhoto(false)}
              className="px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-[#8B1E3F] hover:bg-rose-900 rounded-md cursor-pointer shadow-2xs"
            >
              <Check className="w-3 h-3 text-[#E5A93C]" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      <div className="pt-3 mt-4 w-full border-t border-slate-200/80 flex items-center justify-center">
        <a
          href={`mailto:${member.email}`}
          className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-[#8B1E3F] transition-colors"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-semibold truncate max-w-[170px]">
            {member.email}
          </span>
        </a>
      </div>
    </div>
  );
};

export const PlacementTeamModal: React.FC<PlacementTeamModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Accordion open state: section index (0: CIAP, 1: Department, 2: SPRs).
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });

  // Local storage persisted custom photo URLs
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('docsa_team_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  if (!isOpen) return null;

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSavePhotoUrl = (memberId: string, url: string) => {
    const updated = { ...customPhotos, [memberId]: url };
    setCustomPhotos(updated);
    try {
      localStorage.setItem('docsa_team_photos', JSON.stringify(updated));
    } catch {
      // ignore quota error
    }
  };

  // Hierarchy Data Tiers mapping to JSON data
  const hierarchyData = [
    {
      id: 0,
      title: 'CIAP Members',
      subtitle: 'Centre for Industry-Academia Partnerships - University Level',
      icon: <Building2 className="w-7 h-7 text-white" />,
      iconBg: 'bg-[#8B1E3F] text-white',
      accentColor: 'bg-[#8B1E3F]',
      hoverBorder: 'hover:border-[#8B1E3F]/40 hover:shadow-rose-50',
      members: (placementTeamData.ciap || []) as TeamMember[],
    },
    {
      id: 1,
      title: 'Department Members',
      subtitle: 'Department of Computer Science & Applications (DoCSA)',
      icon: <Award className="w-7 h-7 text-[#8B1E3F]" />,
      iconBg: 'bg-amber-50 text-[#8B1E3F]',
      accentColor: 'bg-[#8B1E3F]',
      hoverBorder: 'hover:border-[#8B1E3F]/40 hover:shadow-rose-50',
      members: (placementTeamData.department || []) as TeamMember[],
    },
    {
      id: 2,
      title: 'Student Placement Representatives',
      subtitle: 'Student Placement Representatives (SPRs) - DoCSA',
      icon: <Users className="w-7 h-7 text-white" />,
      iconBg: 'bg-[#8B1E3F] text-white',
      accentColor: 'bg-[#E5A93C]',
      hoverBorder: 'hover:border-amber-200 hover:shadow-amber-50',
      members: (placementTeamData.sprs || []) as TeamMember[],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="bg-[#8B1E3F] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/10 shadow-2xs">
              <Users className="w-5 h-5 text-[#E5A93C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">DoCSA Placement Team</h2>
                <span className="bg-[#E5A93C] text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                  Official Structure
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Faculty Coordinators & Student Placement Representatives (SPRs)
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

        {/* Modal Main Body Container with Ambient Background Glows */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Ambient Lighting Accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full" />
          </div>

          <div className="flex-1 p-6 sm:p-8 scrollbar-thin overflow-y-auto overflow-x-hidden relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Hierarchy Heading Section */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
                  Placement Cell{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1E3F] via-[#a8284e] to-[#E5A93C]">
                    Hierarchy
                  </span>
                </h2>
                <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                  Department of Computer Science & Applications (DoCSA) · MIT World Peace University Pune
                </p>
              </div>

              {/* Accordion List */}
              <div className="space-y-5">
                {hierarchyData.map((section) => {
                  const isOpen = !!openSections[section.id];
                  return (
                    <div
                      key={section.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      {/* Accordion Header Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-6 sm:p-7 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${section.iconBg}`}
                          >
                            {section.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                                {section.title}
                              </h3>
                              <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-extrabold shrink-0">
                                {section.members.length} {section.members.length === 1 ? 'Member' : 'Members'}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {section.subtitle}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isOpen
                              ? 'bg-[#8B1E3F] text-white rotate-180 shadow-2xs'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </button>

                      {/* Accordion Content Body */}
                      {isOpen && (
                        <div className="p-6 sm:p-8 pt-0 border-t border-slate-100 animate-in fade-in duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                            {section.members.map((member) => (
                              <TeamMemberCard
                                key={member.id}
                                member={member}
                                accentColor={section.accentColor}
                                hoverBorder={section.hoverBorder}
                                customPhotoUrl={customPhotos[member.id]}
                                onSavePhotoUrl={handleSavePhotoUrl}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Records Managed Badge Footer Note */}
              <div className="text-center pt-6 pb-2">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-widest shadow-2xs">
                  <Info className="w-4 h-4 text-[#8B1E3F]" />
                  <span>Data managed by Student Placement Representatives (SPRs) of DoCSA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Status Bar */}
          <footer className="h-12 border-t border-slate-200 px-6 sm:px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white shrink-0">
            <p>© {new Date().getFullYear()} DoCSA Placement Records • MIT-WPU Pune</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-slate-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Data Verified
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

