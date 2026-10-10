/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_PLACEMENTS } from './data/initialPlacements';
import { PlacementRecord, ProgramFilter, TypeFilter } from './types/placement';
import { PlacementCard } from './components/PlacementCard';
import { IndividualPlacementBanner } from './components/banners/IndividualPlacementBanner';
import { GroupPlacementBanner } from './components/banners/GroupPlacementBanner';
import { DepartmentStats } from './components/DepartmentStats';
import { MitWpuLogo } from './components/MitWpuLogo';
import { LoadingScreen } from './components/LoadingScreen';
import { PlacementJsonEditor } from './components/PlacementJsonEditor';
import { PlacementSlideshow } from './components/PlacementSlideshow';
import { downloadBannerAsImage } from './utils/downloadBanner';
import logoMitImg from './assets/logoMIT.jpg';

import {
  Search,
  Users,
  User,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileJson,
  Play,
  Download,
} from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [placements] = useState<PlacementRecord[]>(INITIAL_PLACEMENTS);

  // Clear any previous local storage override so the site strictly uses the real placements.json file
  useEffect(() => {
    try {
      localStorage.removeItem('mitwpu_placements_custom_data');
    } catch (e) {}
  }, []);

  // Default to Tanvi Ballal's placement or first record
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementRecord>(
    INITIAL_PLACEMENTS.find((p) => p.students?.[0]?.name?.toLowerCase().includes('tanvi')) ||
      INITIAL_PLACEMENTS[1] ||
      INITIAL_PLACEMENTS[0] ||
      ({
        id: 'default',
        type: 'individual',
        students: [],
        company: '',
        companyLogoType: 'custom',
        role: '',
        placementType: 'Full-time Placement',
        batchYear: '2025-27',
        department: '',
        school: '',
        placedDate: '',
      } as unknown as PlacementRecord)
  );
  // viewMode: 'grid' shows all students first; 'banner' shows the selected banner; 'slideshow' shows animated slideshow; 'editor' shows unified JSON Form & Data Editor
  const [viewMode, setViewMode] = useState<'grid' | 'banner' | 'slideshow' | 'editor'>('grid');
  const [isDownloadingBanner, setIsDownloadingBanner] = useState(false);
  const bannerContainerRef = useRef<HTMLDivElement>(null);

  // Filters state
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');

  // Sync with browser URL (Query Param & Hash) so Back / Forward buttons work seamlessly
  useEffect(() => {
    const syncFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hash);

      const isEditorMode =
        searchParams.get('mode') === 'editor' ||
        searchParams.get('mode') === 'partners-editor' ||
        searchParams.get('tab') === 'editor' ||
        searchParams.get('tab') === 'partners' ||
        hashParams.get('mode') === 'editor' ||
        hash === 'editor' ||
        window.location.pathname.endsWith('/editor');

      if (isEditorMode) {
        setViewMode('editor');
        document.title = 'Edit Placements & Partners JSON | MIT-WPU DoCSA';
        return;
      }

      const isSlideshowMode =
        searchParams.get('mode') === 'slideshow' ||
        searchParams.get('tab') === 'slideshow' ||
        hashParams.get('mode') === 'slideshow' ||
        hash === 'slideshow';

      if (isSlideshowMode) {
        setViewMode('slideshow');
        document.title = 'Slideshow Showcase | MIT-WPU DoCSA Placements';
        return;
      }

      const bannerId =
        searchParams.get('banner') ||
        searchParams.get('id') ||
        hashParams.get('banner') ||
        hashParams.get('id');

      if (bannerId) {
        const matched = placements.find((p) => p.id === bannerId);
        if (matched) {
          setSelectedPlacement(matched);
          setViewMode('banner');
          const studentName = matched.students[0]?.name;
          document.title = studentName
            ? `${studentName} - ${matched.company} | MIT-WPU Placement`
            : `${matched.company} Placement | MIT-WPU DoCSA`;
          return;
        }
      }

      // If no banner or editor in URL, default to grid
      setViewMode('grid');
      document.title = 'MIT-WPU DoCSA Placements | Celebrating Career Milestones';
    };

    // Initial check on load
    syncFromUrl();

    // Listen for browser Back and Forward button events
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [placements]);

  // Filtered Placements
  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      // Type filter (group vs individual)
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;

      // Program filter
      if (programFilter !== 'all') {
        const target = programFilter.toLowerCase();
        const matchesProgram = p.students.some((s) => {
          const prog = s.program.toLowerCase();
          if (prog.includes(target)) return true;
          if (target === 'mca') return prog.includes('mca');
          if (target === 'msc cs') return prog.includes('msc cs') || prog.includes('m.sc. computer') || prog.includes('msc computer');
          if (target === 'msc dsbda') return prog.includes('dsbda') || prog.includes('data science & big data') || prog.includes('data science and big data');
          if (target === 'msc bt') return prog.includes('blockchain') || prog.includes('bt');
          if (target === 'bsc cs') return prog.includes('bsc cs') || prog.includes('b.sc. computer') || prog.includes('bsc computer');
          if (target === 'bsc dsbda') return prog.includes('bsc dsbda') || (prog.includes('bsc') && prog.includes('data science'));
          return false;
        });
        if (!matchesProgram) return false;
      }

      // Batch filter
      if (batchFilter !== 'all' && p.batchYear !== batchFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCompany = p.company.toLowerCase().includes(q);
        const matchesRole = p.role.toLowerCase().includes(q);
        const matchesStudent = p.students.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesCompany && !matchesRole && !matchesStudent) return false;
      }

      return true;
    });
  }, [placements, typeFilter, programFilter, batchFilter, searchQuery]);

  const handleOpenBanner = (placement: PlacementRecord, pushHistory = true) => {
    setSelectedPlacement(placement);
    setViewMode('banner');

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('banner', placement.id);
      window.history.pushState(
        { bannerId: placement.id, view: 'banner' },
        '',
        url.toString()
      );
    }

    const studentName = placement.students[0]?.name;
    document.title = studentName
      ? `${studentName} - ${placement.company} | MIT-WPU Placement`
      : `${placement.company} Placement | MIT-WPU DoCSA`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = (pushHistory = true) => {
    setViewMode('grid');

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete('banner');
      url.searchParams.delete('id');
      url.searchParams.delete('mode');
      url.searchParams.delete('tab');
      const newUrl = url.pathname + (url.search ? url.search : '');
      window.history.pushState({ view: 'grid' }, '', newUrl);
    }

    document.title = 'MIT-WPU DoCSA Placements | Celebrating Career Milestones';
  };

  const handleOpenEditor = (pushHistory = true) => {
    setViewMode('editor');

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'editor');
      url.searchParams.delete('banner');
      url.searchParams.delete('id');
      window.history.pushState({ view: 'editor' }, '', url.toString());
    }

    document.title = 'Edit Placements & Partners JSON | MIT-WPU DoCSA';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSlideshow = (pushHistory = true) => {
    setViewMode('slideshow');

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'slideshow');
      url.searchParams.delete('banner');
      url.searchParams.delete('id');
      window.history.pushState({ view: 'slideshow' }, '', url.toString());
    }

    document.title = 'Slideshow Showcase | MIT-WPU DoCSA Placements';
  };

  const currentIndex = useMemo(() => {
    return placements.findIndex((p) => p.id === selectedPlacement.id);
  }, [placements, selectedPlacement]);

  const handleNavigateBanner = (direction: 'prev' | 'next') => {
    if (placements.length === 0) return;
    const idx = currentIndex >= 0 ? currentIndex : 0;
    let newIndex = direction === 'next' ? idx + 1 : idx - 1;
    if (newIndex >= placements.length) newIndex = 0;
    if (newIndex < 0) newIndex = placements.length - 1;

    handleOpenBanner(placements[newIndex]);
  };

  const handleDownloadBanner = async () => {
    if (!bannerContainerRef.current || isDownloadingBanner) return;
    setIsDownloadingBanner(true);
    try {
      await downloadBannerAsImage(bannerContainerRef.current, selectedPlacement);
    } catch (err) {
      console.error('Failed to download banner image:', err);
    } finally {
      setIsDownloadingBanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-[#8B1E3F] selection:text-white">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div
            onClick={() => handleBackToGrid()}
            className="tracking-tight text-[#1E5C9E] whitespace-nowrap flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity h-8"
          >
            <img
              src={logoMitImg}
              alt="MIT-WPU"
              className="h-8 w-auto object-contain shrink-0 rounded-xs"
            />
            <span className="hidden sm:inline text-xl sm:text-2xl font-extrabold tracking-tight leading-8 h-8 flex items-center">
              MIT-WPU DoCSA Placements
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleOpenBanner(selectedPlacement)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'banner'
                  ? 'bg-[#8B1E3F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Banner View</span>
            </button>

            <button
              type="button"
              onClick={() => handleBackToGrid()}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#8B1E3F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Placements</span>
              <span>({placements.length})</span>
            </button>

            {/* Slide Show Mode Button beside All Placements */}
            <button
              type="button"
              onClick={() => handleOpenSlideshow()}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'slideshow'
                  ? 'bg-[#8B1E3F] text-white shadow-xs'
                  : 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-[#8B1E3F] hover:from-amber-500/20 hover:to-rose-500/20 border border-[#8B1E3F]/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#8B1E3F] group-hover:scale-110" />
              <span>Slide Show</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: UNIFIED JSON FORM & CODE EDITOR */}
      {viewMode === 'editor' ? (
        <PlacementJsonEditor
          placements={placements}
          onBackToApp={() => handleBackToGrid()}
        />
      ) : viewMode === 'slideshow' ? (
        /* VIEW 2: ANIMATED SLIDE SHOW MODE */
        <PlacementSlideshow
          placements={placements}
          initialIndex={currentIndex >= 0 ? currentIndex : 0}
          onClose={() => handleBackToGrid()}
          onSelectPlacement={(p) => setSelectedPlacement(p)}
        />
      ) : viewMode === 'banner' ? (
        /* VIEW 2: CLEAN BANNER VIEW */
        <div className="flex-1 bg-slate-100/60 pt-4 pb-8 flex flex-col items-center">
          {/* Top Banner Action Bar with Primary Download (PNG) Button */}
          <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 mb-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600">
                Official DoCSA Placement Banner
              </span>
            </div>

            {/* Primary Download (PNG) Button Shifted Above */}
            <button
              type="button"
              onClick={handleDownloadBanner}
              disabled={isDownloadingBanner}
              className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isDownloadingBanner ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Banner (PNG)</span>
                </>
              )}
            </button>
          </div>

          <div
            ref={bannerContainerRef}
            className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 pb-2 flex justify-center overflow-x-auto"
          >
            {selectedPlacement.type === 'group' ? (
              <GroupPlacementBanner placement={selectedPlacement} />
            ) : (
              <IndividualPlacementBanner placement={selectedPlacement} />
            )}
          </div>

          {/* Controls Below the Banner to Navigate Between Banners */}
          <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 pt-4 pb-6 flex items-center justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => handleNavigateBanner('prev')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#8B1E3F]/40 shadow-xs hover:shadow-sm text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#8B1E3F] transition-all cursor-pointer group"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#8B1E3F] transition-colors" />
              <span className="hidden xs:inline sm:inline">Previous</span>
              <span className="hidden sm:inline">Banner</span>
            </button>

            {/* Counter */}
            <div className="text-xs sm:text-sm font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-slate-900 font-bold">{currentIndex + 1}</span> of {placements.length}
            </div>

            <button
              type="button"
              onClick={() => handleNavigateBanner('next')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-white shadow-xs hover:shadow-sm text-xs sm:text-sm font-semibold transition-all cursor-pointer group"
            >
              <span className="hidden xs:inline sm:inline">Next</span>
              <span className="hidden sm:inline">Banner</span>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      ) : (
        /* VIEW 2: ALL PLACEMENTS DIRECTORY / GRID */
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 pt-6 sm:pt-8 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* 1. On mobile/tablet: MIT Logo First (order-1 lg:order-2) */}
                <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col items-center justify-center p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-center">
                  <MitWpuLogo variant="blue" size="2xl" className="mb-3 max-w-[220px] sm:max-w-xs" />
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    MIT World Peace University
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kothrud, Pune · DoCSA Placement Cell
                  </p>
                </div>

                {/* 2. On mobile/tablet: School & DoCSA line, then Congratulations (order-2 lg:order-1) */}
                <div className="order-2 lg:order-1 lg:col-span-8 space-y-3 text-center lg:text-left">
                  {/* School of line then Department line */}
                  <h2 className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-base sm:text-lg lg:text-xl font-bold text-[#8B1E3F] tracking-tight text-center lg:text-left">
                    <span>School of Computer Science & Engineering</span>
                    <span className="text-[#8B1E3F]/60 select-none" aria-hidden="true">·</span>
                    <span>Department of Computer Science and Applications</span>
                  </h2>

                  {/* Congratulations Headlines */}
                  <p className="font-serif-cormorant italic text-2xl sm:text-3xl lg:text-3xl font-black text-[#8B1E3F]">
                    Heartiest Congratulations
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Celebrating A <span className="text-[#8B1E3F]">Career Milestone</span> for Our Students
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                    on being selected for prestigious Corporate Internships cum Full-Time Placements
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Stats */}
          <div id="stats">
            <DepartmentStats />
          </div>

          {/* Directory Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        typeFilter === 'all'
                          ? 'bg-[#8B1E3F] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Types ({placements.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeFilter('individual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        typeFilter === 'individual'
                          ? 'bg-[#8B1E3F] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Individual Spotlights
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeFilter('group')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        typeFilter === 'group'
                          ? 'bg-[#8B1E3F] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Group Cohort
                    </button>
                  </div>

                  {/* Program Filter Dropdown (Shifted beside Group Cohort) */}
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={programFilter}
                      onChange={(e) => setProgramFilter(e.target.value as ProgramFilter)}
                      aria-label="Filter by program"
                      className="w-full sm:w-auto pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs focus:outline-hidden focus:border-[#8B1E3F] cursor-pointer appearance-none transition-colors"
                    >
                      <option value="all">All Academic Programs</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="MSC CS">MSC CS (MSC Computer Science)</option>
                      <option value="MSC DSBDA">MSC DSBDA (MSC Data Science & Big Data)</option>
                      <option value="MSC BT">MSC BT (MSC Blockchain Technology)</option>
                      <option value="BSC CS">BSC CS (BSC Computer Science (Honours))</option>
                      <option value="BSC DSBDA">BSC DSBDA (BSC Data Science & Big Data (Honours))</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Right controls: Search Bar */}
                <div className="relative w-full sm:w-64 md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or role..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#8B1E3F] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            {filteredPlacements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlacements.map((placement) => (
                  <PlacementCard
                    key={placement.id}
                    placement={placement}
                    onOpenBanner={handleOpenBanner}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">No placements found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No records match your filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all');
                    setProgramFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {/* Website Footer */}
      <footer className="bg-slate-950 text-slate-400 py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg shrink-0 shadow-xs">
              <img
                src={logoMitImg}
                alt="MIT-WPU Logo"
                className="h-8 w-auto object-contain rounded-xs"
              />
            </div>
            <div>
              <p className="text-slate-200 font-semibold text-xs">
                © {new Date().getFullYear()} MIT World Peace University
              </p>
              <p className="text-[11px] text-slate-400">
                Department of Computer Science & Applications (DoCSA).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <button
              type="button"
              onClick={() => handleOpenEditor()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <FileJson className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Edit Data / JSON</span>
            </button>
            <span>·</span>
            <span>UGC Recognized</span>
            <span>·</span>
            <a
              href="https://mitwpu.edu.in"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-[#1E5C9E] transition-colors"
            >
              mitwpu.edu.in
            </a>
          </div>
        </div>
      </footer>

      {/* Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen minDuration={3500} onComplete={() => setIsLoading(false)} />
      )}
    </div>
  );
}
