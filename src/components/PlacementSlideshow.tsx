import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PlacementRecord } from '../types/placement';
import { IndividualPlacementBanner } from './banners/IndividualPlacementBanner';
import { GroupPlacementBanner } from './banners/GroupPlacementBanner';
import { downloadBannerAsImage } from '../utils/downloadBanner';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  X,
  Sparkles,
  Clock,
  ChevronUp,
  ChevronDown,
  Sliders,
  Download,
} from 'lucide-react';

interface PlacementSlideshowProps {
  placements: PlacementRecord[];
  initialIndex?: number;
  onClose: () => void;
  onSelectPlacement?: (placement: PlacementRecord) => void;
}

export const PlacementSlideshow: React.FC<PlacementSlideshowProps> = ({
  placements,
  initialIndex = 0,
  onClose,
  onSelectPlacement,
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 && initialIndex < placements.length ? initialIndex : 0
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState<number>(5); // in seconds
  const [progress, setProgress] = useState<number>(0);
  const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false);
  const [enableConfetti, setEnableConfetti] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animationKey, setAnimationKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideBannerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const currentPlacement = placements[currentIndex] || placements[0];

  const handleDownloadCurrentBanner = async () => {
    if (!slideBannerRef.current || isDownloading || !currentPlacement) return;
    setIsDownloading(true);
    try {
      await downloadBannerAsImage(slideBannerRef.current, currentPlacement);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  // Fire celebratory confetti on slide change if enabled
  const triggerConfetti = useCallback(() => {
    if (!enableConfetti) return;
    try {
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.85, x: 0.5 },
        colors: ['#8B1E3F', '#E5A93C', '#004B87', '#FFFFFF', '#D97706'],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }
  }, [enableConfetti]);

  const goToSlide = useCallback(
    (newIndex: number, navDirection: 'next' | 'prev' = 'next') => {
      if (placements.length === 0) return;
      let targetIndex = newIndex;
      if (targetIndex >= placements.length) targetIndex = 0;
      if (targetIndex < 0) targetIndex = placements.length - 1;

      setDirection(navDirection);
      setCurrentIndex(targetIndex);
      setProgress(0);
      setAnimationKey((prev) => prev + 1);
      triggerConfetti();

      if (onSelectPlacement && placements[targetIndex]) {
        onSelectPlacement(placements[targetIndex]);
      }
    },
    [placements, onSelectPlacement, triggerConfetti]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1, 'next');
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1, 'prev');
  }, [currentIndex, goToSlide]);

  // Slideshow Timer & Progress Bar
  useEffect(() => {
    if (!isPlaying || placements.length <= 1) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    const stepMs = 50;
    const totalSteps = (duration * 1000) / stepMs;
    let stepCount = 0;

    progressIntervalRef.current = window.setInterval(() => {
      stepCount++;
      const currentProgress = (stepCount / totalSteps) * 100;
      setProgress(Math.min(currentProgress, 100));

      if (stepCount >= totalSteps) {
        nextSlide();
        stepCount = 0;
      }
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, currentIndex, nextSlide, placements.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!currentPlacement) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Top Ambient Glow Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-radial from-[#8B1E3F]/30 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Floating Reveal Trigger when Top Bar is Collapsed */}
      {isTopBarCollapsed && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-slate-900/90 border border-slate-700/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105">
          <button
            type="button"
            onClick={() => setIsTopBarCollapsed(false)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            title="Expand Top Bar"
          >
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Show Bar</span>
          </button>

          <span className="text-slate-600">|</span>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white text-white" />
            )}
          </button>

          <span className="text-slate-600">|</span>

          <button
            type="button"
            onClick={handleDownloadCurrentBanner}
            disabled={isDownloading}
            className="text-slate-300 hover:text-[#E5A93C] cursor-pointer"
            title="Download Current Banner"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <span className="text-slate-600">|</span>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-rose-300 cursor-pointer"
            title="Exit Slideshow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. COLLAPSIBLE TOP CONTROL BAR */}
      <div
        className={`relative z-30 transition-all duration-300 ease-in-out ${
          isTopBarCollapsed
            ? '-translate-y-full opacity-0 pointer-events-none max-h-0 overflow-hidden'
            : 'translate-y-0 opacity-100 max-h-24'
        }`}
      >
        <header className="px-4 sm:px-6 py-3 bg-slate-900/85 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3">
          {/* Left: Mode Title & Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#8B1E3F]/30 border border-[#8B1E3F]/50 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Slideshow</span>
            </div>

            <div className="text-xs font-medium text-slate-400 hidden sm:block">
              <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
              <span className="text-slate-300 font-semibold">{placements.length}</span>
            </div>
          </div>

          {/* Center: Playback, Speed & Download Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-sm ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#8B1E3F] text-white hover:bg-[#a3244a] border border-[#8B1E3F]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-amber-300" />
                  <span className="hidden xs:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden xs:inline">Play</span>
                </>
              )}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <select
                value={duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  setProgress(0);
                }}
                className="bg-transparent border-none text-xs text-white font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value={3} className="bg-slate-900 text-white">3s</option>
                <option value={5} className="bg-slate-900 text-white">5s</option>
                <option value={8} className="bg-slate-900 text-white">8s</option>
                <option value={12} className="bg-slate-900 text-white">12s</option>
              </select>
            </div>

            {/* Download Button in Slideshow */}
            <button
              type="button"
              onClick={handleDownloadCurrentBanner}
              disabled={isDownloading}
              title="Download Current Banner (PNG)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
            >
              {isDownloading ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span className="hidden md:inline">Download</span>
            </button>

            {/* Confetti Celebration Toggle */}
            <button
              type="button"
              onClick={() => {
                setEnableConfetti((prev) => !prev);
                if (!enableConfetti) triggerConfetti();
              }}
              title={enableConfetti ? 'Confetti: On' : 'Confetti: Off'}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                enableConfetti
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Confetti</span>
            </button>
          </div>

          {/* Right: Collapse Top Bar, Fullscreen & Close */}
          <div className="flex items-center gap-2">
            {/* Collapse Top Bar Button */}
            <button
              type="button"
              onClick={() => setIsTopBarCollapsed(true)}
              title="Collapse Top Bar for Full Screen View"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="hidden lg:inline">Collapse</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Exit Slideshow (Esc)"
              className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </header>

        {/* Top Progress Bar */}
        <div className="w-full bg-slate-800/80 h-1 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8B1E3F] via-amber-400 to-rose-400 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 2. MAIN PRESENTATION VIEWPORT (Pure slide-fade transition, clean full screen view) */}
      <main className="relative flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Floating Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          title="Previous Banner"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-[#8B1E3F] text-white border border-slate-700/80 hover:border-[#8B1E3F] backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 group"
        >
          <ChevronLeft className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
        </button>

        {/* Floating Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          title="Next Banner"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-[#8B1E3F] text-white border border-slate-700/80 hover:border-[#8B1E3F] backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 group"
        >
          <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
        </button>

        {/* Animated Banner Container with Slide Motion and Pop Animation */}
        <div
          ref={slideBannerRef}
          key={animationKey}
          className={`w-full max-w-5xl mx-auto flex items-center justify-center ${
            direction === 'next' ? 'animate-slide-pop-next' : 'animate-slide-pop-prev'
          }`}
        >
          {currentPlacement.type === 'group' ? (
            <GroupPlacementBanner
              placement={currentPlacement}
              className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
            />
          ) : (
            <IndividualPlacementBanner
              placement={currentPlacement}
              className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
            />
          )}
        </div>
      </main>
    </div>
  );
};
