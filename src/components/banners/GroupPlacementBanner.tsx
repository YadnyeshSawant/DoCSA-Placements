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
      <div className="pt-4 pb-1 px-4 sm:px-8 md:px-10 flex flex-col md:flex-row items-center md:items-start justify-between relative z-10 text-center md:text-left gap-2 md:gap-0">
        {/* On mobile/tablet: MIT Logo is on top */}
        <div className="shrink-0 order-1 md:order-2">
          <MitWpuLogo variant="blue" size="xl" className="w-40 sm:w-48 md:w-60" />
        </div>

        {/* On mobile/tablet: Department & School line is below MIT Logo */}
        <div className="max-w-md pt-0.5 order-2 md:order-1">
          <p className="text-[#1E5C9E] font-bold text-xs sm:text-sm md:text-base tracking-wide uppercase">
            {placement.department}
          </p>
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
            {placement.school} · Batch {placement.batchYear}
          </p>
        </div>
      </div>

      {/* Main Announcement Titles */}
      <div className="px-4 sm:px-10 text-center mt-1.5 z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold italic text-slate-800 tracking-tight leading-tight">
          Heartiest
        </h2>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black italic text-[#1E5C9E] tracking-tighter leading-tight mt-0.5">
          CONGRATULATIONS
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-1">
          {placement.congratulationsSubtitle ||
            (placement.placementType === 'Internship cum Placement' ||
            placement.placementType?.includes('Intern +') ||
            placement.placementType?.includes('and Placement') ||
            placement.placementType?.includes('& Placement')
              ? 'On your successful internship & placement!'
              : placement.placementType?.toLowerCase().includes('intern')
              ? 'On your successful internship!'
              : 'On your successful placement!')}
        </p>
      </div>

      {/* Responsive Section Ordering: On mobile/tablet Company Details is order-1, Photos are order-2; on desktop (md:) Photos are md:order-1, Company Details are md:order-2 */}
      <div className="flex flex-col z-10">
        {/* Placement Partner Company Pill Card (Company Details) */}
        <div className="px-4 sm:px-10 my-3 flex justify-center order-1 md:order-2">
          <div className="border-2 border-[#8B1E3F]/40 bg-white rounded-2xl px-4 sm:px-6 md:px-10 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 max-w-xl w-full text-center sm:text-right">
            <div>
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

            <div className="hidden sm:block h-12 w-px bg-slate-200" />

            <div className="flex items-center justify-center min-h-[50px] sm:min-h-[64px]">
              <CompanyLogo
                type={placement.companyLogoType}
                companyName={placement.company}
                customUrl={placement.customLogoUrl}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Students Display Row - Photos */}
        <div className="px-4 sm:px-6 md:px-10 my-3 order-2 md:order-1">
          {students.length > 4 ? (
            /* Multi-row layout for >4 students: 3 on top row, 2 (or remainder) centered on bottom row */
            <div className="flex flex-col gap-4 sm:gap-5 items-center">
              {/* Row 1: 3 Students Up */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-6 justify-center items-start max-w-2xl mx-auto w-full">
                {students.slice(0, 3).map((student) => (
                  <div key={student.id} className="flex flex-col items-center text-center group">
                    <div className="w-24 sm:w-36 md:w-40 h-36 sm:h-48 md:h-52 shrink-0 rounded-t-[36px] rounded-b-xl bg-gradient-to-b from-[#8B1E3F] via-[#781432] to-[#5C0D24] p-1.5 shadow-md flex items-end justify-center overflow-hidden relative">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover object-top rounded-t-[32px] shrink-0 block transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="mt-2 text-xs sm:text-base md:text-lg font-bold text-[#8B1E3F] tracking-tight line-clamp-1">
                      {student.name}
                    </h3>
                    <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-600 font-medium leading-tight max-w-[160px] mt-0.5">
                      {student.program}
                    </p>
                    {student.role && (
                      <span className="text-[8px] sm:text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                        {student.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Row 2: 2 Students Below (Centered) */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 items-start max-w-xl mx-auto w-full">
                {students.slice(3).map((student) => (
                  <div key={student.id} className="w-24 sm:w-36 md:w-40 flex flex-col items-center text-center group">
                    <div className="w-24 sm:w-36 md:w-40 h-36 sm:h-48 md:h-52 shrink-0 rounded-t-[36px] rounded-b-xl bg-gradient-to-b from-[#8B1E3F] via-[#781432] to-[#5C0D24] p-1.5 shadow-md flex items-end justify-center overflow-hidden relative">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover object-top rounded-t-[32px] shrink-0 block transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="mt-2 text-xs sm:text-base md:text-lg font-bold text-[#8B1E3F] tracking-tight line-clamp-1">
                      {student.name}
                    </h3>
                    <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-600 font-medium leading-tight max-w-[160px] mt-0.5">
                      {student.program}
                    </p>
                    {student.role && (
                      <span className="text-[8px] sm:text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
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
              className={`grid gap-3 sm:gap-4 md:gap-5 justify-center items-start ${
                students.length <= 2
                  ? 'grid-cols-2 max-w-lg mx-auto'
                  : students.length === 3
                  ? 'grid-cols-3 max-w-2xl mx-auto'
                  : 'grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto'
              }`}
            >
              {students.map((student) => (
                <div key={student.id} className="flex flex-col items-center text-center group">
                  <div className="w-28 sm:w-40 md:w-44 h-40 sm:h-56 md:h-60 shrink-0 rounded-t-[44px] rounded-b-xl bg-gradient-to-b from-[#8B1E3F] via-[#781432] to-[#5C0D24] p-1.5 shadow-md flex items-end justify-center overflow-hidden relative">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover object-top rounded-t-[40px] shrink-0 block transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="mt-2 sm:mt-3 text-xs sm:text-base md:text-lg font-bold text-[#8B1E3F] tracking-tight line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-600 font-medium leading-tight max-w-[170px] mt-0.5">
                    {student.program}
                  </p>
                  {student.role && (
                    <span className="text-[8px] sm:text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                      {student.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Section: Blue Background with Geometric Arcs */}
      <div className="relative bg-[#1E5C9E] text-white overflow-hidden z-10 pt-4 pb-3 px-4 sm:px-8">
        {/* Geometric circles & lines inside footer */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <GeometricPattern variant="maroon" className="w-full h-full" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            <p className="text-xs font-semibold text-blue-100">
              Department of Computer Science and Applications (DoCSA)
            </p>
            <p className="text-[11px] text-blue-200/80">
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
