import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const members = [
  // CIAP
  { path: 'public/images/ciap/manas.png', name: 'Manas Mohanty', role: 'Director', gender: 'male', bg: ['#1e293b', '#8B1E3F'] },
  { path: 'public/images/ciap/sanjeeb.jpeg', name: 'Sanjeeb Biswal', role: 'Division Head', gender: 'male', bg: ['#0f172a', '#1e3a8a'] },
  
  // CDC
  { path: 'public/images/cdc/kishanprasad.jpeg', name: 'Kishanprasad Gunale', role: 'Director, CDC', gender: 'male', bg: ['#1e1b4b', '#4338ca'] },

  // Department
  { path: 'public/images/department/anuradha.jpg', name: 'Dr. Anuradha Kanade', role: 'Program Director', gender: 'female', bg: ['#8B1E3F', '#be123c'] },
  { path: 'public/images/department/raja.webp', name: 'Prof. Raja Bavani', role: 'Placement Faculty', gender: 'male', bg: ['#15803d', '#166534'] },
  { path: 'public/images/department/rahul.jpg', name: 'Prof. Rahul Ambapkar', role: 'Placement Faculty', gender: 'male', bg: ['#0369a1', '#1e40af'] },
  { path: 'public/images/department/geetika.jpeg', name: 'Dr. Geetika Parmar', role: 'Placement Faculty', gender: 'female', bg: ['#a21caf', '#701a75'] },
  { path: 'public/images/department/deepali.webp', name: 'Deepali Sonawane', role: 'Placement Faculty', gender: 'female', bg: ['#c2410c', '#9a3412'] },

  // SPRs
  { path: 'public/images/spr/yad.png', name: 'Yadnyesh Sawant', role: 'SPR, MCA', gender: 'male', bg: ['#8B1E3F', '#E5A93C'] },
  { path: 'public/images/spr/tanveer.png', name: 'Tanveer Singh', role: 'SPR, MCA', gender: 'male', bg: ['#1e293b', '#3b82f6'] },
  { path: 'public/images/spr/vipul.jpeg', name: 'Vipul Prasad', role: 'SPR, MCA', gender: 'male', bg: ['#065f46', '#047857'] },
  { path: 'public/images/spr/taha.jpeg', name: 'Taha Badami', role: 'SPR, MCA', gender: 'male', bg: ['#3730a3', '#4f46e5'] },
  { path: 'public/images/spr/gaourav.jpg', name: 'Gaourav Patil', role: 'SPR, MCA', gender: 'male', bg: ['#854d0e', '#ca8a04'] },
  { path: 'public/images/spr/sarthak.png', name: 'Sarthak Umbrajkar', role: 'SPR, MSC CS', gender: 'male', bg: ['#991b1b', '#dc2626'] },
  { path: 'public/images/spr/tejas.jpg', name: 'Tejas Thigale', role: 'SPR, MCA', gender: 'male', bg: ['#111827', '#4b5563'] },
  { path: 'public/images/spr/swapnaj.png', name: 'Swapnaj Tolnure', role: 'SPR, MCA', gender: 'male', bg: ['#1e1b4b', '#6366f1'] },
  { path: 'public/images/spr/krisha.png', name: 'Krisha Balar', role: 'SPR, MSC CS', gender: 'female', bg: ['#831843', '#db2777'] },
];

function getInitials(name) {
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s+/, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateSvgAvatar(member) {
  const isFemale = member.gender === 'female';
  const hairColor = isFemale ? '#2a1a08' : '#1e1e1e';
  const skinTone = '#e2a77d';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${member.bg[0]}" />
      <stop offset="100%" stop-color="${member.bg[1]}" />
    </linearGradient>
    <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background Card -->
  <rect width="300" height="300" rx="36" fill="url(#bgGrad)" />
  
  <!-- Subtle Decorative Geometric Ring -->
  <circle cx="150" cy="130" r="110" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4" stroke-dasharray="10 8" />
  
  <!-- Headshot Illustration -->
  <g filter="url(#shadow)">
    <!-- Shoulders / Suit -->
    <path d="M 60 280 C 60 210, 240 210, 240 280 Z" fill="${isFemale ? '#8B1E3F' : 'url(#suitGrad)'}" />
    <!-- Shirt Collar / Tie -->
    <polygon points="135,210 165,210 150,250" fill="#ffffff" />
    <polygon points="146,215 154,215 152,270 148,270" fill="${isFemale ? '#E5A93C' : '#8B1E3F'}" />
    
    <!-- Neck -->
    <rect x="135" y="165" width="30" height="40" fill="#d09368" rx="5" />
    
    <!-- Hair back (Female) -->
    ${isFemale ? `<ellipse cx="150" cy="135" rx="52" ry="60" fill="${hairColor}" />` : ''}

    <!-- Face Oval -->
    <ellipse cx="150" cy="130" rx="42" ry="50" fill="${skinTone}" />
    
    <!-- Ears -->
    <circle cx="106" cy="132" r="9" fill="${skinTone}" />
    <circle cx="194" cy="132" r="9" fill="${skinTone}" />

    <!-- Hair Front -->
    ${
      isFemale
        ? `<path d="M 105 130 C 105 75, 195 75, 195 130 C 180 90, 120 90, 105 130 Z" fill="${hairColor}" />`
        : `<path d="M 108 125 C 105 85, 195 85, 192 125 C 185 95, 115 95, 108 125 Z" fill="${hairColor}" />`
    }

    <!-- Glasses for Faculty/Directors if applicable -->
    ${
      member.role.includes('Director') || member.role.includes('Faculty')
        ? `<rect x="118" y="118" width="24" height="16" rx="4" fill="none" stroke="#1e293b" stroke-width="3" />
           <rect x="158" y="118" width="24" height="16" rx="4" fill="none" stroke="#1e293b" stroke-width="3" />
           <line x1="142" y1="124" x2="158" y2="124" stroke="#1e293b" stroke-width="3" />`
        : ''
    }

    <!-- Eyes -->
    <circle cx="130" cy="126" r="3" fill="#1f2937" />
    <circle cx="170" cy="126" r="3" fill="#1f2937" />

    <!-- Smile -->
    <path d="M 136 152 Q 150 162 164 152" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Name Badge Overlay at Bottom -->
  <rect x="20" y="225" width="260" height="55" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.5" />
  
  <text x="150" y="248" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#ffffff" text-anchor="middle">
    ${member.name}
  </text>
  <text x="150" y="267" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" fill="#E5A93C" text-anchor="middle" letter-spacing="1">
    ${member.role.toUpperCase()}
  </text>
</svg>`;
}

members.forEach((m) => {
  const fullPath = path.join(__dirname, '..', m.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, generateSvgAvatar(m), 'utf8');
  console.log('Created photo at:', m.path);
});
