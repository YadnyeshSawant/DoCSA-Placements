import React, { useState, useEffect } from 'react';
import logoMitImg from '../assets/logoMIT.jpg';
import { GeometricPattern } from './GeometricPattern';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
}) => {
  const [progress, setProgress] = useState(15);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Smooth progress progression
    const t1 = setTimeout(() => setProgress(42), 350);
    const t2 = setTimeout(() => setProgress(74), 850);
    const t3 = setTimeout(() => setProgress(92), 1400);
    const t4 = setTimeout(() => {
      setProgress(100);
      setIsReady(true);
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleLaunch = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 280);
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#FAF8F5] via-white to-slate-50 text-slate-900 transition-all duration-500 ease-out select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#004B87]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B1E3F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Architectural Geometric Motif */}
      <div className="w-full relative z-10 pt-2 opacity-35">
        <GeometricPattern variant="light" className="w-full h-10" />
      </div>

      {/* Center Hero & Presentation Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-3xl mx-auto w-full my-auto">
        {/* Emblem Presentation with Concentric Orbital Halo Rings */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Subtle Outer Orbital Ring */}
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 md:w-84 md:h-84 rounded-full border border-dashed border-[#E5A93C]/40 animate-[spin_20s_linear_infinite] pointer-events-none" />

          {/* Inner Accent Ring */}
          <div className="absolute w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full border border-[#8B1E3F]/20 pointer-events-none" />

          {/* Logo Card */}
          <div className="relative bg-white p-5 sm:p-6 md:p-7 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10">
            <img
              src={logoMitImg}
              alt="MIT World Peace University"
              className="w-60 sm:w-72 md:w-84 h-auto object-contain"
            />
          </div>
        </div>

        {/* Academic Hierarchy */}
        <div className="space-y-2 mb-8 w-full">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-slate-500">
            School of Computer Science & Engineering
          </p>

          <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-[#1E5C9E] tracking-tight whitespace-nowrap leading-tight">
            Department of Computer Science & Applications
          </h1>

          <p className="font-serif-cormorant italic text-sm sm:text-base md:text-lg text-slate-600 font-semibold">
            Campus Placement Portal · Celebrating Career Milestones
          </p>
        </div>

        {/* Clean, Refined Minimalist Progress Bar */}
        <div className="w-full max-w-xs space-y-2.5 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">
              {isReady ? 'Ready to enter' : 'Loading placement portal...'}
            </span>
            <span className="font-mono font-bold text-[#1E5C9E] tabular-nums">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-[#1E5C9E] via-[#004B87] to-[#E5A93C] transition-all duration-400 ease-out rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Action Button to Launch Website */}
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={handleLaunch}
            className={`w-full group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg active:scale-95 ${
              isReady
                ? 'bg-[#1E5C9E] hover:bg-[#17487c] text-white ring-4 ring-[#1E5C9E]/20 shadow-[#1E5C9E]/25'
                : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-[#1E5C9E] border border-slate-200/90 hover:border-[#1E5C9E]/40'
            }`}
          >
            <span>{isReady ? 'Enter Placement Portal' : 'Launch Website'}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <span className="text-[11px] text-slate-400 font-medium">
            {isReady ? 'Click to enter the portal' : 'Click anytime to launch immediately'}
          </span>
        </div>
      </div>

      {/* Institutional Footer Strip */}
      <footer className="relative z-10 w-full pb-6 px-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-slate-600">
          <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#E5A93C]" />
          <p className="font-serif text-xs sm:text-sm font-bold tracking-widest text-[#1E5C9E]">
            ॥ विश्वशान्तिर्ध्रुवं ध्रुवा ॥
          </p>
          <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#E5A93C]" />
        </div>

        <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>MIT World Peace University</span>
          <span aria-hidden="true">·</span>
          <span>Pune, Maharashtra</span>
          <span aria-hidden="true">·</span>
          <span>Estd. 1983</span>
          <span aria-hidden="true">·</span>
          <span>NAAC Accredited</span>
        </div>
      </footer>
    </div>
  );
};
