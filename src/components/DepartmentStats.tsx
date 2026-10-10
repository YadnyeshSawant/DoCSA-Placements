import React, { useState, useEffect } from 'react';
import { MarqueePartnersSchema, MarqueePartnerItem } from './PartnerCompaniesJsonEditor';
import { getInitialPartnersSchema } from '../data/partnersStore';

const PartnerLogoItem: React.FC<{ partner: MarqueePartnerItem }> = ({ partner }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      title={partner.companyName}
      className="flex items-center justify-center px-4 py-2 h-11 min-w-[85px] rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#8B1E3F]/40 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-default select-none"
    >
      {!hasError && (partner.logoLink || partner.logo) ? (
        <img
          src={partner.logoLink || partner.logo}
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

interface DepartmentStatsProps {
  schema?: MarqueePartnersSchema;
}

export const DepartmentStats: React.FC<DepartmentStatsProps> = ({ schema: controlledSchema }) => {
  const [localSchema, setLocalSchema] = useState<MarqueePartnersSchema>(
    controlledSchema || getInitialPartnersSchema()
  );

  useEffect(() => {
    if (controlledSchema) {
      setLocalSchema(controlledSchema);
    }
  }, [controlledSchema]);

  // Listen to live updates from the editor
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setLocalSchema(e.detail);
      } else {
        setLocalSchema(getInitialPartnersSchema());
      }
    };
    window.addEventListener('mitwpu_partners_updated', handleUpdate);
    return () => window.removeEventListener('mitwpu_partners_updated', handleUpdate);
  }, []);

  const highestPackageVal =
    localSchema.stats?.highestPackage?.value ||
    localSchema['Highest Package'] ||
    localSchema.highestPackage ||
    '₹28.5 LPA';
  const highestPackageSub =
    localSchema.stats?.highestPackage?.subtext || 'Super Dream Offers';

  const averageCtcVal =
    localSchema.stats?.averageCTC?.value ||
    localSchema['Average CTC'] ||
    localSchema.averageCTC ||
    '₹8.4 LPA';
  const averageCtcSub =
    localSchema.stats?.averageCTC?.subtext || 'Across All Programs';

  const placementsCountVal =
    localSchema.stats?.placementsAndInternships?.value ||
    localSchema['Placements & Internships'] ||
    localSchema.placementsAndInternships ||
    '340+';
  const placementsCountSub =
    localSchema.stats?.placementsAndInternships?.subtext || 'DoCSA Academic Cohort';

  const recruitersCountVal =
    localSchema.stats?.corporateRecruiters?.value ||
    localSchema['Corporate Recruiters'] ||
    localSchema.corporateRecruiters ||
    '85+';
  const recruitersCountSub =
    localSchema.stats?.corporateRecruiters?.subtext || 'Fortune 500 & Global Giants';

  const partners =
    Array.isArray(localSchema.partners) && localSchema.partners.length > 0
      ? localSchema.partners
      : [];

  return (
    <section className="bg-white border-y border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Quantitative Rigor Stats Row in 2x2 grid on mobile/tablet and 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100 lg:bg-transparent lg:border-0 lg:border-r lg:border-slate-100">
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-[#8B1E3F] tracking-tight tabular-nums">
              {highestPackageVal}
            </span>
            <span className="block text-[11px] sm:text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Highest Package
            </span>
            <span className="block text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {highestPackageSub}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100 lg:bg-transparent lg:border-0 lg:border-r lg:border-slate-100">
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {averageCtcVal}
            </span>
            <span className="block text-[11px] sm:text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Average CTC
            </span>
            <span className="block text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {averageCtcSub}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100 lg:bg-transparent lg:border-0 lg:border-r lg:border-slate-100">
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {placementsCountVal}
            </span>
            <span className="block text-[11px] sm:text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Placements &amp; Internships
            </span>
            <span className="block text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {placementsCountSub}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100 lg:bg-transparent lg:border-0">
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-[#004B87] tracking-tight tabular-nums">
              {recruitersCountVal}
            </span>
            <span className="block text-[11px] sm:text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
              Corporate Recruiters
            </span>
            <span className="block text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {recruitersCountSub}
            </span>
          </div>
        </div>

        {/* Recruiter Logos Banner Strip - Carousel Effect */}
        {partners.length > 0 && (
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
                {[...partners, ...partners].map((partner, index) => (
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
        )}
      </div>
    </section>
  );
};
