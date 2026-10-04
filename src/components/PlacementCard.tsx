import React from 'react';
import { PlacementRecord } from '../types/placement';
import { CompanyLogo } from './CompanyLogo';
import { Users, User, ArrowUpRight, Award, MapPin } from 'lucide-react';

interface PlacementCardProps {
  placement: PlacementRecord;
  onOpenBanner: (placement: PlacementRecord) => void;
}

export const PlacementCard: React.FC<PlacementCardProps> = ({
  placement,
  onOpenBanner,
}) => {
  const isGroup = placement.type === 'group';

  return (
    <div
      onClick={() => onOpenBanner(placement)}
      className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#8B1E3F]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Banner Header Strip */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isGroup
                  ? 'bg-rose-50 text-[#8B1E3F] border border-rose-100'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {isGroup ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isGroup ? `Group (${placement.students.length})` : 'Individual Spotlight'}
            </span>

            {placement.package && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {placement.package}
              </span>
            )}
          </div>

          <div className="shrink-0 p-1 bg-slate-50 group-hover:bg-[#8B1E3F] group-hover:text-white rounded-lg transition-colors">
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </div>
        </div>

        {/* Company & Role */}
        <div className="mt-3 flex items-center justify-between">
          <CompanyLogo
            type={placement.companyLogoType}
            companyName={placement.company}
            customUrl={placement.customLogoUrl}
            size="sm"
          />
          <span className="text-[11px] text-slate-500 font-medium">
            Batch {placement.batchYear}
          </span>
        </div>

        <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-[#8B1E3F] transition-colors line-clamp-1">
          {placement.role}
        </h3>
      </div>

      {/* Visual Presentation Area: Arch Student Portraits */}
      <div className="px-5 py-3 bg-gradient-to-b from-slate-50/70 to-slate-100/50 border-y border-slate-100">
        {isGroup ? (
          // Group layout preview with miniature maroon arches
          <div>
            {placement.students.length > 4 ? (
              /* Multi-row layout for >4 students: 3 on top row, 2 below */
              <div className="flex flex-col gap-2 items-center py-0.5">
                {/* Row 1: 3 Students Up */}
                <div className="grid grid-cols-3 gap-2 items-end justify-center w-full max-w-[260px]">
                  {placement.students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex flex-col items-center text-center">
                      <div className="w-12 h-16 rounded-t-xl rounded-b-xs bg-gradient-to-b from-[#8B1E3F] to-[#5a0c22] p-0.5 shadow-xs overflow-hidden">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="w-full h-full object-cover object-top rounded-t-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="mt-1 text-[10px] font-bold text-slate-800 truncate w-full">
                        {student.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Row 2: 2 Students Below (Centered) */}
                <div className="flex justify-center gap-3 items-end w-full max-w-[200px]">
                  {placement.students.slice(3).map((student) => (
                    <div key={student.id} className="flex flex-col items-center text-center w-12">
                      <div className="w-12 h-16 rounded-t-xl rounded-b-xs bg-gradient-to-b from-[#8B1E3F] to-[#5a0c22] p-0.5 shadow-xs overflow-hidden">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="w-full h-full object-cover object-top rounded-t-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="mt-1 text-[10px] font-bold text-slate-800 truncate w-full">
                        {student.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Single row for <= 4 students */
              <div
                className={`grid gap-2 items-end justify-center ${
                  placement.students.length <= 2
                    ? 'grid-cols-2 max-w-[160px] mx-auto'
                    : placement.students.length === 3
                    ? 'grid-cols-3 max-w-[220px] mx-auto'
                    : 'grid-cols-4'
                }`}
              >
                {placement.students.map((student) => (
                  <div key={student.id} className="flex flex-col items-center text-center">
                    <div className="w-12 h-16 rounded-t-xl rounded-b-xs bg-gradient-to-b from-[#8B1E3F] to-[#5a0c22] p-0.5 shadow-xs overflow-hidden">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover object-top rounded-t-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-slate-800 truncate w-full">
                      {student.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-center text-[10px] text-slate-500 mt-2 font-medium">
              Selected at {placement.company} · {placement.students[0]?.program.split('(')[0]}
            </p>
          </div>
        ) : (
          // Individual layout preview with circular graphic backdrop
          <div className="flex items-center gap-3.5 py-1">
            <div className="relative w-16 h-16 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-[#E5A93C] translate-x-1" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#8B1E3F] to-[#5B0E23] overflow-hidden p-0.5">
                <img
                  src={placement.students[0]?.photoUrl}
                  alt={placement.students[0]?.name}
                  className="w-full h-full object-cover object-top rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#8B1E3F] truncate">
                {placement.students[0]?.name}
              </h4>
              <p className="text-xs text-slate-600 truncate">
                {placement.students[0]?.program}
              </p>
              {placement.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {placement.location}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata and Action Button */}
      <div className="p-4 pt-3 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#8B1E3F]" />
          <span className="truncate">{placement.placementType}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenBanner(placement);
          }}
          className="px-3 py-1.5 text-xs font-semibold text-[#8B1E3F] bg-rose-50 hover:bg-[#8B1E3F] hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          View Banner
        </button>
      </div>
    </div>
  );
};
