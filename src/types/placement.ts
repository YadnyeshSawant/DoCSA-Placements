export interface Student {
  id: string;
  name: string;
  program: string;
  rollNo?: string;
  photoUrl: string;
  avatarSeed?: string;
  role?: string;
  quote?: string;
  email?: string;
  linkedin?: string;
}

export type PlacementType = 'Internship cum Placement' | 'Full-time Placement' | 'Super Dream Offer' | 'Intern + PPO';

export interface PlacementRecord {
  id: string;
  type: 'group' | 'individual';
  students: Student[];
  company: string;
  companyTagline?: string;
  companyLogoType: 'ey' | 'deutsche-bank' | 'barclays' | 'deloitte' | 'microsoft' | 'tcs' | 'persistent' | 'amazon' | 'celebal' | 'virtusa' | 'custom';
  customLogoUrl?: string;
  role: string;
  placementType: PlacementType;
  congratulationsSubtitle?: string; // e.g. "On your successful placement!" or "On your successful internship!" or "On your successful internship & placement!"
  package?: string; // e.g. "14.5 LPA" or "₹65,000 / mo"
  batchYear: string; // e.g. "2024-25"
  department: string; // "Department of Computer Science and Applications (DoCSA)"
  school: string; // "School of Computer Science & Engineering"
  location?: string;
  placedDate: string;
  description?: string;
}

export type ProgramFilter =
  | 'all'
  | 'MCA'
  | 'MSC CS'
  | 'MSC DSBDA'
  | 'MSC BT'
  | 'BSC CS'
  | 'BSC DSBDA';
export type TypeFilter = 'all' | 'group' | 'individual';
