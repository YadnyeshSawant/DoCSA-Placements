import React from 'react';
import { PlacementRecord } from '../../types/placement';
import { MitWpuLogo } from '../MitWpuLogo';
import { CompanyLogo } from '../CompanyLogo';
import { GeometricPattern } from '../GeometricPattern';

interface IndividualPlacementBannerProps {
  placement: PlacementRecord;
  className?: string;
  id?: string;
}

export const IndividualPlacementBanner: React.FC<IndividualPlacementBannerProps> = ({
  placement,
  className = '',
  id = 'individual-banner-export',
}) => {
  const student = placement.students[0];

  return (
    <div
      id={id}
      className={`relative w-full max-w-[840px] mx-auto bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col justify-between font-display ${className}`}
    >
      {/* Top Header */}
      <div className="pt-4 pb-1 px-4 sm:px-8 md:px-10 flex flex-col md:flex-row items-center md:items-start justify-between relative z-20 text-center md:text-left gap-2 md:gap-0">
        {/* On mobile/tablet: MIT Logo is on top */}
        <div className="shrink-0 order-1 md:order-2">
          <MitWpuLogo variant="blue" size="xl" className="w-40 sm:w-48 md:w-60" />
        </div>

        {/* On mobile/tablet: Department and School line is below MIT logo */}
        <div className="max-w-md pt-0.5 order-2 md:order-1">
          <p className="text-[#8B1E3F] font-bold text-xs sm:text-sm md:text-base tracking-wide uppercase">
            {placement.department}
          </p>
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
            {placement.school} · Batch {placement.batchYear}
          </p>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="px-4 sm:px-8 md:px-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-20 mt-1 mb-2">
        {/* Left Column: Typography & Placed At Card (Given 7 cols so text never overlaps on desktop) */}
        <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-3 relative z-30">
          {/* Headlines matching Image 2 */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-extrabold italic text-slate-800 tracking-tight leading-tight">
              Heartiest
            </h2>
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-black italic text-[#8B1E3F] tracking-tighter leading-tight mt-0.5">
              CONGRATULATIONS
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
              on your successful placement!
            </p>
          </div>

          {/* Student Name & Program */}
          <div className="pt-0.5 border-b-2 md:border-b-0 md:border-l-4 border-[#8B1E3F] pb-1.5 md:pb-0 md:pl-3.5">
            <h3 className="text-xl sm:text-2xl md:text-[24px] font-black text-[#8B1E3F] tracking-tight">
              {student?.name || 'Selected Student'}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
              {student?.program || 'Department of Computer Science and Applications'}
            </p>
            {placement.role && (
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Role: {placement.role}
              </p>
            )}
          </div>

          {/* "PLACED AT" Box matching standard template */}
          <div className="pt-0.5">
            <div className="inline-block border-2 border-[#8B1E3F]/40 bg-white rounded-2xl p-4 shadow-lg max-w-[280px] w-full">
              <span className="block text-xs font-bold text-[#8B1E3F] tracking-wider uppercase mb-2 text-center">
                {placement.placementType === 'Internship cum Placement' || placement.placementType?.includes('Intern')
                  ? 'INTERNSHIP CUM PLACEMENT AT'
                  : 'PLACED AT'}
              </span>

              <div className="flex flex-col items-center justify-center py-1 min-h-[64px]">
                <CompanyLogo
                  type={placement.companyLogoType}
                  companyName={placement.company}
                  customUrl={placement.customLogoUrl}
                  size="lg"
                  className="mb-1"
                />
              </div>

              {placement.package && (
                <div className="mt-2.5 pt-1.5 border-t border-slate-100 text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Offered CTC</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
                    {placement.package}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Hero Student Portrait with concentric Golden & Maroon Arcs */}
        <div className="md:col-span-5 flex items-end justify-center relative h-[300px] sm:h-[350px] md:h-[380px] z-20 mt-2 md:mt-0">
          {/* Dual-Tone Halo Arcs matching Image 2 - scaled proportionally */}
          {/* Outer Golden / Amber Arc */}
          <div className="absolute right-0 bottom-2 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border-[16px] sm:border-[20px] md:border-[24px] border-[#E5A93C] opacity-90 -z-10 translate-x-3 pointer-events-none" />

          {/* Inner Maroon Accent Arc */}
          <div className="absolute right-2 bottom-0 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full border-[12px] sm:border-[15px] md:border-[18px] border-[#8B1E3F] opacity-90 -z-10 pointer-events-none" />

          {/* Student Cutout/Portrait Photo - Compact sleek height */}
          <div className="relative z-10 w-full max-w-[240px] sm:max-w-[270px] md:max-w-[290px] h-[300px] sm:h-[330px] md:h-[360px] flex items-end justify-center">
            {student?.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-full h-full object-cover object-top drop-shadow-2xl rounded-t-3xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 rounded-t-3xl flex items-center justify-center text-slate-400">
                No Photo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Section: Maroon Background with Geometric Arcs (matching Image 2) */}
      <div className="relative bg-[#8B1E3F] text-white overflow-hidden z-10 pt-4 pb-3 px-4 sm:px-8">
        {/* Geometric circles & lines inside footer */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <GeometricPattern variant="maroon" className="w-full h-full" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            <p className="text-xs font-semibold text-rose-100">
              Department of Computer Science and Applications (DoCSA)
            </p>
            <p className="text-[11px] text-rose-200/80">
              MIT World Peace University, Kothrud, Pune - 411038
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Placement Season {placement.batchYear}
            </span>
            <span className="text-[10px] text-white/80">
              {placement.location ? `Location: ${placement.location}` : 'MIT-WPU Campus Drive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
