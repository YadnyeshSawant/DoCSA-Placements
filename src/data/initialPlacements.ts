import rawPlacementsData from './placements.json';
import { PlacementRecord } from '../types/placement';
import { generateStudentAvatar } from '../utils/studentPortraits';
import { normalizeImageUrl } from '../utils/googleDriveUrl';

/**
 * All placement records are sourced directly from `./placements.json`.
 * - 'individualPlacements': Single-student spotlight banners
 * - 'groupPlacements': Multi-student cohort placement banners
 *
 * Future placement records can simply be added to either section in `src/data/placements.json`.
 */
const rawList: any[] = Array.isArray(rawPlacementsData)
  ? rawPlacementsData
  : [
      ...((rawPlacementsData as any).individualPlacements || []),
      ...((rawPlacementsData as any).groupPlacements || []),
    ];

export const INITIAL_PLACEMENTS: PlacementRecord[] = rawList.map((placement) => ({
  ...placement,
  customLogoUrl: normalizeImageUrl(placement.customLogoUrl),
  students: (placement.students || []).map((student: any) => ({
    ...student,
    photoUrl:
      student.photoUrl && typeof student.photoUrl === 'string' && student.photoUrl.trim() !== ''
        ? normalizeImageUrl(student.photoUrl)
        : generateStudentAvatar(student.id || student.name || 'student', student.gender || 'male'),
  })),
}));

export default INITIAL_PLACEMENTS;
