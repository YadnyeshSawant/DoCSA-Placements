import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newMembers = [
  { path: 'public/images/spr/aditya.jpg', name: 'Aditya Sharma', role: 'SPR, MCA', gender: 'male', bg: ['#1e293b', '#2563eb'] },
  { path: 'public/images/spr/ananya.png', name: 'Ananya Joshi', role: 'SPR, MSC CS', gender: 'female', bg: ['#831843', '#be185d'] },
  { path: 'public/images/spr/harsh.jpg', name: 'Harsh Vardhan', role: 'SPR, MCA', gender: 'male', bg: ['#0f172a', '#0284c7'] },
  { path: 'public/images/spr/isha.png', name: 'Isha Kulkarni', role: 'SPR, MCA', gender: 'female', bg: ['#581c87', '#9333ea'] },
  { path: 'public/images/spr/omkar.jpg', name: 'Omkar Patil', role: 'SPR, MCA', gender: 'male', bg: ['#14532d', '#16a34a'] },
  { path: 'public/images/spr/riya.png', name: 'Riya Deshmukh', role: 'SPR, MSC CS', gender: 'female', bg: ['#701a75', '#c026d3'] },
  { path: 'public/images/spr/siddharth.jpg', name: 'Siddharth Mehta', role: 'SPR, MCA', gender: 'male', bg: ['#7c2d12', '#ea580c'] },
];

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
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3" />
    </filter>
  </defs>

  <rect width="300" height="300" rx="36" fill="url(#bgGrad)" />
  <circle cx="150" cy="130" r="110" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4" stroke-dasharray="10 8" />
  
  <g filter="url(#shadow)">
    <path d="M 60 280 C 60 210, 240 210, 240 280 Z" fill="${isFemale ? '#8B1E3F' : '#1e293b'}" />
    <polygon points="135,210 165,210 150,250" fill="#ffffff" />
    <polygon points="146,215 154,215 152,270 148,270" fill="${isFemale ? '#E5A93C' : '#8B1E3F'}" />
    <rect x="135" y="165" width="30" height="40" fill="#d09368" rx="5" />
    ${isFemale ? `<ellipse cx="150" cy="135" rx="52" ry="60" fill="${hairColor}" />` : ''}
    <ellipse cx="150" cy="130" rx="42" ry="50" fill="${skinTone}" />
    <circle cx="106" cy="132" r="9" fill="${skinTone}" />
    <circle cx="194" cy="132" r="9" fill="${skinTone}" />
    ${
      isFemale
        ? `<path d="M 105 130 C 105 75, 195 75, 195 130 C 180 90, 120 90, 105 130 Z" fill="${hairColor}" />`
        : `<path d="M 108 125 C 105 85, 195 85, 192 125 C 185 95, 115 95, 108 125 Z" fill="${hairColor}" />`
    }
    <circle cx="130" cy="126" r="3" fill="#1f2937" />
    <circle cx="170" cy="126" r="3" fill="#1f2937" />
    <path d="M 136 152 Q 150 162 164 152" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round" />
  </g>

  <rect x="20" y="225" width="260" height="55" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.5" />
  <text x="150" y="248" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#ffffff" text-anchor="middle">
    ${member.name}
  </text>
  <text x="150" y="267" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" fill="#E5A93C" text-anchor="middle" letter-spacing="1">
    ${member.role.toUpperCase()}
  </text>
</svg>`;
}

newMembers.forEach((m) => {
  const fullPath = path.join(__dirname, '..', m.path);
  fs.writeFileSync(fullPath, generateSvgAvatar(m), 'utf8');
  console.log('Created photo at:', m.path);
});
