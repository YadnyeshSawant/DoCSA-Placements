import rawDefaultPartnersData from './marqueePartners.json';
import { MarqueePartnerItem, MarqueePartnersSchema } from '../components/PartnerCompaniesJsonEditor';

export const PARTNERS_STORAGE_KEY = 'mitwpu_marquee_partners_custom';
export const PLACEMENTS_STORAGE_KEY = 'mitwpu_placements_custom_data';

export function getInitialPartnersSchema(): MarqueePartnersSchema {
  try {
    const saved = localStorage.getItem(PARTNERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse cached marquee partners schema', err);
  }

  // Fallback to default json file
  const raw = rawDefaultPartnersData as any;
  return {
    'Highest Package': raw['Highest Package'] || raw.highestPackage || '₹28.5 LPA',
    'Average CTC': raw['Average CTC'] || raw.averageCTC || '₹8.4 LPA',
    'Placements & Internships': raw['Placements & Internships'] || raw.placementsAndInternships || '340+',
    'Corporate Recruiters': raw['Corporate Recruiters'] || raw.corporateRecruiters || '85+',
    highestPackage: raw.highestPackage || raw['Highest Package'] || '₹28.5 LPA',
    averageCTC: raw.averageCTC || raw['Average CTC'] || '₹8.4 LPA',
    placementsAndInternships: raw.placementsAndInternships || raw['Placements & Internships'] || '340+',
    corporateRecruiters: raw.corporateRecruiters || raw['Corporate Recruiters'] || '85+',
    stats: raw.stats || {
      highestPackage: {
        value: '₹28.5 LPA',
        label: 'Highest Package',
        subtext: 'Super Dream Offers (Microsoft, AWS)',
      },
      averageCTC: {
        value: '₹8.4 LPA',
        label: 'Average CTC',
        subtext: 'Across MCA, BCA & M.Sc Programs',
      },
      placementsAndInternships: {
        value: '340+',
        label: 'Placements & Internships',
        subtext: 'DoCSA Academic Cohort',
      },
      corporateRecruiters: {
        value: '85+',
        label: 'Corporate Recruiters',
        subtext: 'Fortune 500 & Global Tech Giants',
      },
    },
    partners: Array.isArray(raw.partners) ? raw.partners : Array.isArray(raw) ? raw : [],
  };
}

export function savePartnersSchema(schema: MarqueePartnersSchema): void {
  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(schema));
    window.dispatchEvent(new CustomEvent('mitwpu_partners_updated', { detail: schema }));
  } catch (err) {
    console.error('Failed to save partners schema to localStorage', err);
  }
}
