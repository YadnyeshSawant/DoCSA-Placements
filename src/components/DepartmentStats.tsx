import React, { useState } from 'react';
import marqueePartnersData from '../data/marqueePartners.json';

interface MarqueePartner {
  companyName: string;
  name: string;
  logoLink: string;
  logo: string;
}

const HIRING_PARTNERS: MarqueePartner[] = Array.isArray(marqueePartnersData)
  ? (marqueePartnersData as MarqueePartner[])
  : ((marqueePartnersData as { partners?: MarqueePartner[] }).partners || []);

const STATS_DATA = {
  highestPackage:
    (marqueePartnersData as Record<string, any>)['Highest Package'] ||
    (marqueePartnersData as Record<string, any>)['highestPackage'] ||
    '₹28.5 LPA',
  averageCTC:
    (marqueePartnersData as Record<string, any>)['Average CTC'] ||
    (marqueePartnersData as Record<string, any>)['averageCTC'] ||
    '₹8.4 LPA',
  placementsAndInternships:
    (marqueePartnersData as Record<string, any>)['Placements & Internships'] ||
    (marqueePartnersData as Record<string, any>)['placementsAndInternships'] ||
    '340+',
  corporateRecruiters:
    (marqueePartnersData as Record<string, any>)['Corporate Recruiters'] ||
    (marqueePartnersData as Record<string, any>)['corporateRecruiters'] ||
    '85+',
};

const PartnerLogoItem: React.FC<{ partner: MarqueePartner }> = ({ partner }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      title={partner.companyName}
      className="flex items-center justify-center px-4 py-2 h-11 min-w-[85px] rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#8B1E3F]/40 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-default select-none"
    >
      {!hasError && partner.logoLink ? (
        <img
          src={partner.logoLink}
          alt={partner.companyName}
          className="h-6 max-w-[100px] object-contain transition-transform duration-200 hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-slate-800 text-xs font-semibold whitespace-nowrap">
          {partner.companyName}
        </span>
      )}
    </div>
  );
};

export const DepartmentStats: React.FC = () => {
  return (
    <section className="bg-white border-y border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Quantitative Rigor Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-slate-100 last:border-r-0">
            <span className="block text-3xl sm:text-4xl font-black text-[#8B1E3F] tracking-tight tabular-nums">
              {STATS_DATA.highestPackage}
            </span>
            <span className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Highest Package
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Super Dream Offers (Microsoft, AWS)
            </span>
          </div>

          <div className="p-4 border-r border-slate-100 last:border-r-0">
            <span className="block text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {STATS_DATA.averageCTC}
            </span>
            <span className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Average CTC
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Across MCA, BCA & M.Sc Programs
            </span>
          </div>

          <div className="p-4 border-r border-slate-100 last:border-r-0">
            <span className="block text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {STATS_DATA.placementsAndInternships}
            </span>
            <span className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Placements & Internships
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              DoCSA Academic Cohort
            </span>
          </div>

          <div className="p-4">
            <span className="block text-3xl sm:text-4xl font-black text-[#004B87] tracking-tight tabular-nums">
              {STATS_DATA.corporateRecruiters}
            </span>
            <span className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Corporate Recruiters
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Fortune 500 & Global Tech Giants
            </span>
          </div>
        </div>

        {/* Recruiter Logos Banner Strip - Carousel Effect */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#8B1E3F] animate-pulse"></span>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
              Key Hiring Partners:
            </span>
          </div>

          {/* Carousel Viewport with Fade Edges */}
          <div className="relative w-full overflow-hidden">
            {/* Left & Right gradient fades for smooth carousel appearance */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Seamless Infinite Carousel Track - Logos Only */}
            <div className="animate-marquee flex items-center gap-6 py-1">
              {[...HIRING_PARTNERS, ...HIRING_PARTNERS].map((partner, index) => (
                <div
                  key={`${partner.companyName}-${index}`}
                  className="flex items-center gap-6 shrink-0"
                >
                  <PartnerLogoItem partner={partner} />
                  <span className="text-slate-300 select-none">·</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
