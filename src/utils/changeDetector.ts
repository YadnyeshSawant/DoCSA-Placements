import basePlacementsJson from '../data/placements.json';
import basePartnersJson from '../data/marqueePartners.json';
import { PlacementRecord } from '../types/placement';
import { MarqueePartnersSchema } from '../components/PartnerCompaniesJsonEditor';

export interface FileToCommit {
  filePath: string;
  fileContent: string;
  label: string;
  isChanged: boolean;
  changeSummary: string[];
}

export interface DetailedChangeAnalysis {
  hasAnyChanges: boolean;
  filesToCommit: FileToCommit[];
  defaultCommitTitle: string;
  detailedCommitBody: string;
  fullCommitMessage: string;
  highlights: {
    individualAdded: string[];
    individualUpdated: string[];
    groupAdded: string[];
    groupUpdated: string[];
    partnersAdded: string[];
    partnersUpdated: string[];
    statsUpdated: string[];
  };
}

/**
 * Formats structured placements.json object matching the canonical file style
 */
export function formatCanonicalPlacementsJson(records: PlacementRecord[]): string {
  const individualPlacements = records.filter((p) => p.type === 'individual');
  const groupPlacements = records.filter((p) => p.type === 'group');

  const structured = {
    _SECTION_NOTE_1: '====================================================================',
    _SECTION_NOTE_2: '               INDIVIDUAL PLACEMENT SPOTLIGHTS                     ',
    _SECTION_NOTE_3: '====================================================================',
    individualPlacements: individualPlacements.map((p, idx) => ({
      _comment: `${idx + 1}. INDIVIDUAL: ${p.company} - ${p.students[0]?.name || 'Student'}`,
      ...p,
    })),
    _SECTION_NOTE_4: '====================================================================',
    _SECTION_NOTE_5: '                 GROUP PLACEMENT SPOTLIGHTS                         ',
    _SECTION_NOTE_6: '====================================================================',
    groupPlacements: groupPlacements.map((p, idx) => ({
      _comment: `${idx + 1}. GROUP: ${p.company} (${p.students.length} Students)`,
      ...p,
    })),
  };

  return JSON.stringify(structured, null, 2);
}

/**
 * Formats canonical marqueePartners.json object
 */
export function formatCanonicalPartnersJson(schema: MarqueePartnersSchema): string {
  const highestPackageVal = schema['Highest Package'] || schema.highestPackage || '₹28.5 LPA';
  const averageCtcVal = schema['Average CTC'] || schema.averageCTC || '₹8.4 LPA';
  const placementsCountVal = schema['Placements & Internships'] || schema.placementsAndInternships || '340+';
  const recruitersCountVal = schema['Corporate Recruiters'] || schema.corporateRecruiters || '85+';

  const structured = {
    'Highest Package': highestPackageVal,
    'Average CTC': averageCtcVal,
    'Placements & Internships': placementsCountVal,
    'Corporate Recruiters': recruitersCountVal,
    highestPackage: highestPackageVal,
    averageCTC: averageCtcVal,
    placementsAndInternships: placementsCountVal,
    corporateRecruiters: recruitersCountVal,
    stats: {
      highestPackage: {
        value: schema.stats?.highestPackage?.value || highestPackageVal,
        label: 'Highest Package',
        subtext: schema.stats?.highestPackage?.subtext || 'Super Dream Offers (Microsoft, AWS)',
      },
      averageCTC: {
        value: schema.stats?.averageCTC?.value || averageCtcVal,
        label: 'Average CTC',
        subtext: schema.stats?.averageCTC?.subtext || 'Across MCA, BCA & M.Sc Programs',
      },
      placementsAndInternships: {
        value: schema.stats?.placementsAndInternships?.value || placementsCountVal,
        label: 'Placements & Internships',
        subtext: schema.stats?.placementsAndInternships?.subtext || 'DoCSA Academic Cohort',
      },
      corporateRecruiters: {
        value: schema.stats?.corporateRecruiters?.value || recruitersCountVal,
        label: 'Corporate Recruiters',
        subtext: schema.stats?.corporateRecruiters?.subtext || 'Fortune 500 & Global Tech Giants',
      },
    },
    partners: (schema.partners || []).map((p) => ({
      companyName: p.companyName,
      name: p.name || p.companyName,
      logoLink: p.logoLink || '',
      logo: p.logo || p.logoLink || '',
    })),
  };

  return JSON.stringify(structured, null, 2);
}

/**
 * Performs deep semantic diff across current placements and marquee partners
 * against the base repository files to detect all additions, edits, and stats modifications.
 */
export function detectAllChanges(
  currentPlacements: PlacementRecord[],
  currentPartners: MarqueePartnersSchema
): DetailedChangeAnalysis {
  const currentPlacementsJson = formatCanonicalPlacementsJson(currentPlacements);
  const currentPartnersJson = formatCanonicalPartnersJson(currentPartners);

  const basePlacementsRaw = basePlacementsJson as any;
  const basePartnersRaw = basePartnersJson as any;

  const baseIndividual: any[] = basePlacementsRaw.individualPlacements || [];
  const baseGroup: any[] = basePlacementsRaw.groupPlacements || [];
  const basePartnersList: any[] = Array.isArray(basePartnersRaw.partners)
    ? basePartnersRaw.partners
    : Array.isArray(basePartnersRaw)
    ? basePartnersRaw
    : [];

  const currentIndividual = currentPlacements.filter((p) => p.type === 'individual');
  const currentGroup = currentPlacements.filter((p) => p.type === 'group');
  const currentPartnersList = currentPartners.partners || [];

  const individualAdded: string[] = [];
  const individualUpdated: string[] = [];
  const groupAdded: string[] = [];
  const groupUpdated: string[] = [];
  const partnersAdded: string[] = [];
  const partnersUpdated: string[] = [];
  const statsUpdated: string[] = [];

  // 1. Analyze Individual Placements
  const baseIndividualMap = new Map<string, any>();
  baseIndividual.forEach((p) => {
    if (p.id) baseIndividualMap.set(p.id, p);
    const sName = p.students?.[0]?.name?.trim()?.toLowerCase();
    if (sName) baseIndividualMap.set(`name:${sName}`, p);
  });

  currentIndividual.forEach((cur) => {
    const s = cur.students[0];
    const sName = s?.name || 'Student';
    const sRoll = s?.rollNo ? ` (${s.rollNo})` : '';
    const match =
      baseIndividualMap.get(cur.id) ||
      (s?.name ? baseIndividualMap.get(`name:${s.name.trim().toLowerCase()}`) : null);

    if (!match) {
      individualAdded.push(`${sName}${sRoll} at ${cur.company} - ${cur.package || cur.role}`);
    } else {
      // Check if anything meaningful changed
      const matchS = match.students?.[0];
      const changed =
        match.company !== cur.company ||
        match.role !== cur.role ||
        match.package !== cur.package ||
        match.placementType !== cur.placementType ||
        matchS?.name !== s?.name ||
        matchS?.rollNo !== s?.rollNo ||
        matchS?.photoUrl !== s?.photoUrl ||
        match.customLogoUrl !== cur.customLogoUrl;

      if (changed) {
        individualUpdated.push(`${sName} at ${cur.company} (${cur.package || cur.role})`);
      }
    }
  });

  // 2. Analyze Group Placements
  const baseGroupMap = new Map<string, any>();
  baseGroup.forEach((g) => {
    if (g.id) baseGroupMap.set(g.id, g);
    if (g.company) baseGroupMap.set(`comp:${g.company.trim().toLowerCase()}`, g);
  });

  currentGroup.forEach((cur) => {
    const match =
      baseGroupMap.get(cur.id) ||
      (cur.company ? baseGroupMap.get(`comp:${cur.company.trim().toLowerCase()}`) : null);

    const studentNames = cur.students.map((s) => s.name?.split(' ')?.[0] || 'Student').join(', ');
    const label = `${cur.company} (${cur.students.length} students: ${studentNames} - ${cur.package || 'Cohort'})`;

    if (!match) {
      groupAdded.push(label);
    } else {
      const matchNames = (match.students || []).map((s: any) => s.name).join(',');
      const curNames = cur.students.map((s) => s.name).join(',');
      const changed =
        match.company !== cur.company ||
        match.package !== cur.package ||
        matchNames !== curNames ||
        match.students.length !== cur.students.length ||
        match.customLogoUrl !== cur.customLogoUrl;

      if (changed) {
        groupUpdated.push(`${cur.company} (${cur.students.length} students - ${cur.package || 'Cohort'})`);
      }
    }
  });

  // 3. Analyze Partner Companies
  const basePartnersSet = new Set(
    basePartnersList.map((p: any) => (p.companyName || p.name || '').trim().toLowerCase())
  );
  currentPartnersList.forEach((cur) => {
    const key = (cur.companyName || cur.name || '').trim().toLowerCase();
    if (key && !basePartnersSet.has(key)) {
      partnersAdded.push(cur.companyName || cur.name || 'Company');
    }
  });

  // 4. Analyze Statistics
  const baseHighest = basePartnersRaw['Highest Package'] || basePartnersRaw.highestPackage || '₹28.5 LPA';
  const curHighest = currentPartners['Highest Package'] || currentPartners.highestPackage;
  if (curHighest && curHighest !== baseHighest) {
    statsUpdated.push(`Highest Package: ${baseHighest} → ${curHighest}`);
  }

  const baseAvg = basePartnersRaw['Average CTC'] || basePartnersRaw.averageCTC || '₹8.4 LPA';
  const curAvg = currentPartners['Average CTC'] || currentPartners.averageCTC;
  if (curAvg && curAvg !== baseAvg) {
    statsUpdated.push(`Average CTC: ${baseAvg} → ${curAvg}`);
  }

  const basePlacements = basePartnersRaw['Placements & Internships'] || basePartnersRaw.placementsAndInternships || '340+';
  const curPlacements = currentPartners['Placements & Internships'] || currentPartners.placementsAndInternships;
  if (curPlacements && curPlacements !== basePlacements) {
    statsUpdated.push(`Placements Count: ${basePlacements} → ${curPlacements}`);
  }

  const baseRecruiters = basePartnersRaw['Corporate Recruiters'] || basePartnersRaw.corporateRecruiters || '85+';
  const curRecruiters = currentPartners['Corporate Recruiters'] || currentPartners.corporateRecruiters;
  if (curRecruiters && curRecruiters !== baseRecruiters) {
    statsUpdated.push(`Recruiters Count: ${baseRecruiters} → ${curRecruiters}`);
  }

  // Determine file changes
  const isPlacementsChanged =
    individualAdded.length > 0 ||
    individualUpdated.length > 0 ||
    groupAdded.length > 0 ||
    groupUpdated.length > 0 ||
    currentIndividual.length !== baseIndividual.length ||
    currentGroup.length !== baseGroup.length;

  const isPartnersChanged =
    partnersAdded.length > 0 ||
    partnersUpdated.length > 0 ||
    statsUpdated.length > 0 ||
    currentPartnersList.length !== basePartnersList.length;

  const placementsSummary = [
    ...individualAdded.map((s) => `+ Added individual: ${s}`),
    ...individualUpdated.map((s) => `• Updated individual: ${s}`),
    ...groupAdded.map((s) => `+ Added group: ${s}`),
    ...groupUpdated.map((s) => `• Updated group: ${s}`),
  ];

  const partnersSummary = [
    ...partnersAdded.map((p) => `+ Added partner company: ${p}`),
    ...statsUpdated.map((st) => `• Updated stats: ${st}`),
  ];

  const filesToCommit: FileToCommit[] = [
    {
      filePath: 'src/data/placements.json',
      fileContent: currentPlacementsJson,
      label: 'Student Placements (Individual & Group)',
      isChanged: isPlacementsChanged,
      changeSummary: placementsSummary,
    },
    {
      filePath: 'src/data/marqueePartners.json',
      fileContent: currentPartnersJson,
      label: 'Hiring Partners & Recruitment Statistics',
      isChanged: isPartnersChanged,
      changeSummary: partnersSummary,
    },
  ];

  // Construct short, readable title
  const titleParts: string[] = [];
  if (individualAdded.length > 0) {
    titleParts.push(
      individualAdded.length === 1
        ? `add ${individualAdded[0].split(' at ')[0]}`
        : `add ${individualAdded.length} individuals`
    );
  }
  if (groupAdded.length > 0) {
    titleParts.push(
      groupAdded.length === 1
        ? `add ${groupAdded[0].split(' (')[0]} group`
        : `add ${groupAdded.length} groups`
    );
  }
  if (individualUpdated.length > 0) {
    titleParts.push(`update ${individualUpdated.length} individual`);
  }
  if (groupUpdated.length > 0) {
    titleParts.push(`update ${groupUpdated.length} group`);
  }
  if (partnersAdded.length > 0) {
    titleParts.push(`add ${partnersAdded.join(', ')}`);
  }
  if (statsUpdated.length > 0) {
    titleParts.push('update stats');
  }

  const defaultCommitTitle =
    titleParts.length > 0
      ? `update - ${titleParts.join(', ')}`
      : 'update - placements & hiring partners';

  // Construct comprehensive detailed body
  const bodySections: string[] = [];

  if (individualAdded.length > 0 || individualUpdated.length > 0) {
    const lines: string[] = ['Individual Placements:'];
    individualAdded.forEach((item) => lines.push(`  + [NEW] ${item}`));
    individualUpdated.forEach((item) => lines.push(`  • [UPDATED] ${item}`));
    bodySections.push(lines.join('\n'));
  }

  if (groupAdded.length > 0 || groupUpdated.length > 0) {
    const lines: string[] = ['Group Cohorts:'];
    groupAdded.forEach((item) => lines.push(`  + [NEW] ${item}`));
    groupUpdated.forEach((item) => lines.push(`  • [UPDATED] ${item}`));
    bodySections.push(lines.join('\n'));
  }

  if (partnersAdded.length > 0) {
    bodySections.push(`Corporate Hiring Partners:\n  + Added: ${partnersAdded.join(', ')}`);
  }

  if (statsUpdated.length > 0) {
    const lines: string[] = ['Recruitment Statistics:'];
    statsUpdated.forEach((st) => lines.push(`  • ${st}`));
    bodySections.push(lines.join('\n'));
  }

  const detailedCommitBody =
    bodySections.length > 0 ? bodySections.join('\n\n') : 'Routine placement data and partner updates';

  const fullCommitMessage = `${defaultCommitTitle}\n\n${detailedCommitBody}`;

  return {
    hasAnyChanges: isPlacementsChanged || isPartnersChanged,
    filesToCommit,
    defaultCommitTitle,
    detailedCommitBody,
    fullCommitMessage,
    highlights: {
      individualAdded,
      individualUpdated,
      groupAdded,
      groupUpdated,
      partnersAdded,
      partnersUpdated,
      statsUpdated,
    },
  };
}
