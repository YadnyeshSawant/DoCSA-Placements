import React from 'react';
import { PlacementRecord } from '../../types/placement';
import { MitWpuLogo } from '../MitWpuLogo';
import { CompanyLogo } from '../CompanyLogo';
import { GeometricPattern } from '../GeometricPattern';

interface GroupPlacementBannerProps {
  placement: PlacementRecord;
  className?: string;
  id?: string;
}

export const GroupPlacementBanner: React.FC<GroupPlacementBannerProps> = ({
  placement,
  className = '',
  id = 'group-banner-export',
}) => {
  const students = placement.students;

  return (
    <div
      id={id}
      className={`relative w-full max-w-[880px] mx-auto bg-white text-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col justify-between font-display ${className}`}
    >
      {/* Top Header Row */}
      <div className="pt-4 pb-1 px-8 sm:px-10 flex items-start justify-between relative z-10">
        <div className="max-w-md pt-0.5">
          <p className="text-[#8B1E3F] font-bold text-sm md:text-base tracking-wide uppercase">
            {placement.department}
          </p>
          <p className="text-slate-500 text-xs font-medium">
            {placement.school} · Batch {placement.batchYear}
          </p>
        </div>
        <div className="shrink-0">
          <MitWpuLogo variant="blue" size="xl" className="w-44 sm:w-52 md:w-60" />
        </div>
      </div>

      {/* Main Announcement Titles */}
      <div className="px-10 text-center mt-1.5 z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold italic text-slate-800 tracking-tight leading-tight">
          Heartiest
        </h2>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black italic text-[#8B1E3F] tracking-tighter leading-tight mt-0.5">
          CONGRATULATIONS
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-1">
          on your successful placement!
        </p>
      </div>

      {/* Students Display Row - Maroon Arch Shape Backdrop */}
      <div className="px-4 sm:px-6 md:px-10 my-3 z-10">
        {students.length > 4 ? (
          /* Multi-row layout for >4 students: 3 on top row, 2 (or remainder) centered on bottom row */
          <div className="flex flex-col gap-4 sm:gap-5 items-center">
            {/* Row 1: 3 Students Up */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-6 justify-center items-start max-w-2xl mx-auto w-full">
              {students.slice(0, 3).map((student) => (
                <div key={student.id} className="flex flex-col items-center text-center group">
                  <div className="w-28 sm:w-36 md:w-40 h-40 sm:h-48 md:h-52 shrink-0 rounded-t-[36px] rounded-b-xl bg-gradient-to-b from-[#8B1E3F] via-[#781432] to-[#5C0D24] p-1.5 shadow-md flex items-end justify-center overflow-hidden relative">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover object-top rounded-t-[32px] shrink-0 block transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="mt-2 text-sm sm:text-base md:text-lg font-bold text-[#8B1E3F] tracking-tight line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-600 font-medium leading-tight max-w-[160px] mt-0.5">
                    {student.program}
                  </p>
                  {student.role && (
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                      {student.role}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Row 2: 2 Students Below (Centered) */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 items-start max-w-xl mx-auto w-full">
              {students.slice(3).map((student) => (
                <div key={student.id} className="w-28 sm:w-36 md:w-40 flex flex-col items-center text-center group">
                  <div className="w-28 sm:w-36 md:w-40 h-40 sm:h-48 md:h-52 shrink-0 rounded-t-[36px] rounded-b-xl bg-gradient-to-b from-[#8B1E3F] via-[#781432] to-[#5C0D24] p-1.5 shadow-md flex items-end justify-center overflow-hidden relative">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover object-top rounded-t-[32px] shrink-0 block transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="mt-2 text-sm sm:text-base md:text-lg font-bold text-[#8B1E3F] tracking-tight line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-600 font-medium leading-tight max-w-[160px] mt-0.5">
                    {student.program}
                  </p>
                  {student.role && (
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                      {student.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single row layout for <= 4 students */
          <div
            className={`grid gap-4 md:gap-5 justify-center items-start ${
              students.length <= 2
                ? 'grid-cols-2 max-w-lg mx-auto'
                : students.length === 3
                ? 'grid-cols-3 max-w-2xl mx-auto'
                : 'grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto'
            }`}
          >
            {students.map((student) => (
              <div key={student.id} className="flex flex-col items-center text-center group">
                <div className="w-36 sm:w-40 md:w-44 h-52 sm:h-56 md:h-60 shrink-0 rounded-t-[44px] rounded-b-xl bg-gradient-to-b from-[#8B1E3F] via-[#781432] to-[#5C0D24] p-1.5 shadow-md flex items-end justify-center overflow-hidden relative">
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover object-top rounded-t-[40px] shrink-0 block transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="mt-3 text-base md:text-lg font-bold text-[#8B1E3F] tracking-tight line-clamp-1">
                  {student.name}
                </h3>
                <p className="text-[11px] md:text-xs text-slate-600 font-medium leading-tight max-w-[170px] mt-0.5">
                  {student.program}
                </p>
                {student.role && (
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                    {student.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Placement Partner Pill Card (matching template with Individual Banner) */}
      <div className="px-10 z-10 my-3 flex justify-center">
        <div className="border-2 border-[#8B1E3F]/40 bg-white rounded-2xl px-6 md:px-10 py-3.5 shadow-lg flex items-center justify-center gap-6 md:gap-8 max-w-xl w-full">
          <div className="text-right">
            <span className="block text-[11px] md:text-xs font-bold text-[#8B1E3F] tracking-wider uppercase">
              {placement.placementType === 'Internship cum Placement' || placement.placementType?.includes('Intern')
                ? 'INTERNSHIP CUM PLACEMENT AT'
                : 'PLACED AT'}
            </span>
            {placement.package && (
              <span className="block text-xs sm:text-sm font-black text-emerald-700 mt-0.5">
                Offered CTC: {placement.package}
              </span>
            )}
          </div>

          <div className="h-12 w-px bg-slate-200" />

          <div className="flex items-center justify-center min-h-[64px]">
            <CompanyLogo
              type={placement.companyLogoType}
              companyName={placement.company}
              customUrl={placement.customLogoUrl}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Bottom Decorative Watermark Geometry Pattern (matching Image 1 footer pattern) */}
      <div className="relative w-full z-0 -mt-2">
        <GeometricPattern variant="light" className="w-full opacity-60" />
        <div className="py-2.5 px-8 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>MIT-WPU Pune · Training & Placement Cell</span>
          <span>DoCSA · Accelerating Tech Careers</span>
        </div>
      </div>
    </div>
  );
};
