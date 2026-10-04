/**
 * Pre-curated high-fidelity stylized portraits and student photos for MIT-WPU DoCSA students.
 * Includes diverse Indian university student representations in formal blazers and ties.
 */

export interface PredefinedPortrait {
  id: string;
  name: string;
  gender: 'female' | 'male';
  svgDataUri: string;
}

// High-resolution realistic photography portrait for Tanvi Ballal
export const TANVI_DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';

// Generate crisp avatars in formal university placement attire
export function generateStudentAvatar(seed: string, gender: 'male' | 'female' = 'male'): string {
  if (seed.toLowerCase().includes('tanvi')) {
    return TANVI_DEFAULT_PHOTO;
  }
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Color variations for blazers and ties
  const suitColors = ['#1E293B', '#0F172A', '#111827', '#1E1B4B', '#27272A'];
  const tieColors = ['#8B1E3F', '#004B87', '#1E3A8A', '#047857', '#B91C1C'];
  const skinTones = ['#F5D0A9', '#DEAA88', '#C68642', '#8D5524', '#E0AC69', '#FFDBAC'];
  const hairColors = ['#1A1A1A', '#2D2A26', '#171717', '#33271F'];

  const suitColor = suitColors[hash % suitColors.length];
  const tieColor = tieColors[(hash + 2) % tieColors.length];
  const skinTone = skinTones[(hash + 3) % skinTones.length];
  const hairColor = hairColors[(hash + 1) % hairColors.length];
  const hasGlasses = (hash % 3 === 0);

  const maleSvg = `
    <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B1E3F"/>
          <stop offset="100%" stop-color="#5B0E23"/>
        </linearGradient>
      </defs>
      <!-- Background Shape -->
      <rect width="240" height="280" fill="url(#bgGrad)"/>
      
      <!-- Shoulders & Suit Jacket -->
      <path d="M20 280 C20 215 50 185 120 185 C190 185 220 215 220 280 Z" fill="${suitColor}"/>
      
      <!-- Formal Shirt -->
      <polygon points="120,185 85,225 155,225" fill="#FFFFFF"/>
      <polygon points="100,185 120,235 140,185" fill="#F8FAFC"/>
      
      <!-- MIT-WPU Red Lanyard ribbon -->
      <path d="M96 185 L112 280 M144 185 L128 280" stroke="#8B1E3F" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="110" y="240" width="20" height="30" rx="3" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <circle cx="120" cy="245" r="2" fill="#004B87"/>
      <line x1="113" y1="250" x2="127" y2="250" stroke="#8B1E3F" stroke-width="1.5"/>
      <line x1="114" y1="254" x2="126" y2="254" stroke="#94A3B8" stroke-width="1"/>
      
      <!-- Tie -->
      <polygon points="113,188 127,188 131,230 120,245 109,230" fill="${tieColor}"/>
      
      <!-- Suit Lapels -->
      <polygon points="50,280 85,200 120,240 100,280" fill="${suitColor}"/>
      <polygon points="190,280 155,200 120,240 140,280" fill="${suitColor}"/>
      
      <!-- Neck -->
      <rect x="104" y="145" width="32" height="42" rx="4" fill="${skinTone}"/>
      
      <!-- Head / Face -->
      <ellipse cx="120" cy="130" rx="42" ry="52" fill="${skinTone}"/>
      
      <!-- Hair -->
      <path d="M78 120 C76 80 100 65 120 65 C145 65 165 80 162 120 C155 90 145 80 120 80 C95 80 85 95 78 120 Z" fill="${hairColor}"/>
      <!-- Hair volume -->
      <path d="M78 115 C75 95 88 68 120 68 C152 68 165 95 162 115 C158 85 135 74 120 74 C100 74 85 85 78 115 Z" fill="${hairColor}"/>
      
      <!-- Eyebrows -->
      <path d="M92 112 Q102 108 110 112" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M130 112 Q138 108 148 112" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" fill="none"/>
      
      <!-- Eyes -->
      <circle cx="102" cy="122" r="4.5" fill="#1E293B"/>
      <circle cx="138" cy="122" r="4.5" fill="#1E293B"/>
      <circle cx="104" cy="120" r="1.5" fill="#FFFFFF"/>
      <circle cx="140" cy="120" r="1.5" fill="#FFFFFF"/>
      
      <!-- Glasses if applicable -->
      ${
        hasGlasses
          ? `
        <rect x="90" y="112" width="24" height="20" rx="4" fill="none" stroke="#0F172A" stroke-width="2.5"/>
        <rect x="126" y="112" width="24" height="20" rx="4" fill="none" stroke="#0F172A" stroke-width="2.5"/>
        <line x1="114" y1="120" x2="126" y2="120" stroke="#0F172A" stroke-width="2.5"/>
        <line x1="90" y1="118" x2="80" y2="122" stroke="#0F172A" stroke-width="2"/>
        <line x1="150" y1="118" x2="160" y2="122" stroke="#0F172A" stroke-width="2"/>
      `
          : ''
      }
      
      <!-- Nose -->
      <path d="M120 122 L117 138 L123 138" stroke="#A76D42" stroke-width="2" stroke-linecap="round" fill="none"/>
      
      <!-- Confident Smile -->
      <path d="M107 152 Q120 162 133 152" stroke="#8D3B3B" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      
      <!-- Trim Beard / Grooming -->
      <path d="M102 155 Q120 178 138 155" stroke="${hairColor}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 3" fill="none" opacity="0.4"/>
    </svg>
  `;

  const femaleSvg = `
    <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradF" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B1E3F"/>
          <stop offset="100%" stop-color="#5B0E23"/>
        </linearGradient>
      </defs>
      <!-- Background Shape -->
      <rect width="240" height="280" fill="url(#bgGradF)"/>
      
      <!-- Long Hair Behind -->
      <path d="M60 110 C50 160 55 240 65 280 L175 280 C185 240 190 160 180 110 Z" fill="${hairColor}"/>
      
      <!-- Shoulders & Formal Blazer -->
      <path d="M25 280 C25 220 55 190 120 190 C185 190 215 220 215 280 Z" fill="${suitColor}"/>
      
      <!-- Inner White Top / Blouse -->
      <polygon points="120,190 90,235 150,235" fill="#FFFFFF"/>
      <ellipse cx="120" cy="205" rx="16" ry="12" fill="${skinTone}"/>
      
      <!-- Blazer Lapels -->
      <polygon points="65,280 92,205 120,245 105,280" fill="${suitColor}"/>
      <polygon points="175,280 148,205 120,245 135,280" fill="${suitColor}"/>
      
      <!-- Subtle pendant necklace -->
      <path d="M112 188 Q120 196 128 188" stroke="#F59E0B" stroke-width="1.5" fill="none"/>
      <circle cx="120" cy="196" r="2" fill="#F59E0B"/>
      
      <!-- Neck -->
      <rect x="106" y="148" width="28" height="40" rx="4" fill="${skinTone}"/>
      
      <!-- Face -->
      <ellipse cx="120" cy="132" rx="38" ry="48" fill="${skinTone}"/>
      
      <!-- Front Hair Framing -->
      <path d="M78 125 C75 80 96 66 120 66 C144 66 165 80 162 125 C152 95 138 82 120 82 C102 82 86 98 78 125 Z" fill="${hairColor}"/>
      <path d="M74 135 C68 180 82 220 86 240 C80 200 78 160 84 130 Z" fill="${hairColor}"/>
      <path d="M166 135 C172 180 158 220 154 240 C160 200 162 160 156 130 Z" fill="${hairColor}"/>
      
      <!-- Eyebrows -->
      <path d="M94 116 Q103 111 110 115" stroke="${hairColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M130 115 Q137 111 146 116" stroke="${hairColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      
      <!-- Eyes with lashes -->
      <circle cx="103" cy="124" r="4.2" fill="#1E293B"/>
      <circle cx="137" cy="124" r="4.2" fill="#1E293B"/>
      <circle cx="105" cy="122" r="1.5" fill="#FFFFFF"/>
      <circle cx="139" cy="122" r="1.5" fill="#FFFFFF"/>
      <path d="M98 120 Q104 118 109 120" stroke="#0F172A" stroke-width="1.2" fill="none"/>
      <path d="M131 120 Q136 118 142 120" stroke="#0F172A" stroke-width="1.2" fill="none"/>
      
      <!-- Nose -->
      <path d="M120 124 L118 138 L122 138" stroke="#B87748" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      
      <!-- Warm Smile -->
      <path d="M108 152 Q120 163 132 152" stroke="#991B1B" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <path d="M112 153 Q120 158 128 153" fill="#FFFFFF"/>
    </svg>
  `;

  const chosenSvg = gender === 'female' ? femaleSvg : maleSvg;
  return `data:image/svg+xml;utf8,${encodeURIComponent(chosenSvg)}`;
}
