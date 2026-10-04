import React from 'react';
import ctLogoWebp from '../assets/ct-logo.webp';

export type CompanyLogoType =
  | 'ey'
  | 'deutsche-bank'
  | 'barclays'
  | 'deloitte'
  | 'microsoft'
  | 'tcs'
  | 'persistent'
  | 'amazon'
  | 'celebal'
  | 'virtusa'
  | 'custom';

interface CompanyLogoProps {
  type: CompanyLogoType;
  companyName?: string;
  customUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  type,
  companyName = '',
  customUrl,
  className = '',
  size = 'lg',
}) => {
  if (type === 'custom' && customUrl) {
    return (
      <img
        src={customUrl}
        alt={companyName || 'Company Logo'}
        className={`object-contain h-12 sm:h-14 md:h-16 max-w-[260px] ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  switch (type) {
    case 'ey':
      return (
        <div className={`relative flex flex-col justify-center items-center select-none py-1 ${className}`}>
          {/* Signature yellow slash accent */}
          <svg viewBox="0 0 100 24" className="w-16 sm:w-20 h-5 sm:h-6 absolute -top-2 right-1 overflow-visible pointer-events-none">
            <polygon points="20,18 90,0 80,6 10,24" fill="#FFE600" />
          </svg>
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl md:text-[42px] font-black text-slate-900 tracking-tighter leading-none">
              EY
            </span>
          </div>
          <span className="text-[8px] sm:text-[9.5px] font-bold text-slate-600 tracking-tight leading-none mt-1 text-center whitespace-nowrap">
            Building a better working world
          </span>
        </div>
      );

    case 'deutsche-bank':
      return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
          {/* Official Deutsche Bank square with slash */}
          <div className="w-11 h-11 sm:w-13 sm:h-13 bg-[#0018A8] flex items-center justify-center rounded-[3px] p-2 shrink-0 shadow-sm">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <line x1="8" y1="32" x2="32" y2="8" stroke="white" strokeWidth="6" strokeLinecap="square" />
            </svg>
          </div>
          <span className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#0018A8] tracking-tight">
            Deutsche Bank
          </span>
        </div>
      );

    case 'barclays':
      return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
          {/* Barclays cyan eagle icon */}
          <div className="w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" fill="#00AEEF" className="w-full h-full drop-shadow-xs">
              <path d="M50 5 L60 25 L85 25 L68 40 L75 65 L50 50 L25 65 L32 40 L15 25 L40 25 Z" />
              <circle cx="50" cy="50" r="18" fill="white" />
              <path d="M50 38 L56 50 L44 50 Z" fill="#00AEEF" />
            </svg>
          </div>
          <span className="text-xl sm:text-2xl md:text-[26px] font-black text-[#00395D] tracking-wider">
            BARCLAYS
          </span>
        </div>
      );

    case 'deloitte':
      return (
        <div className={`flex items-baseline select-none ${className}`}>
          <span className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-slate-900">
            Deloitte
          </span>
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#86BC25] ml-1 inline-block" />
        </div>
      );

    case 'microsoft':
      return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
          <div className="grid grid-cols-2 gap-1 w-9 h-9 sm:w-11 sm:h-11 shrink-0">
            <div className="bg-[#F25022] w-full h-full rounded-[1px]" />
            <div className="bg-[#7FBA00] w-full h-full rounded-[1px]" />
            <div className="bg-[#00A4EF] w-full h-full rounded-[1px]" />
            <div className="bg-[#FFB900] w-full h-full rounded-[1px]" />
          </div>
          <span className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
            Microsoft
          </span>
        </div>
      );

    case 'persistent':
      return (
        <div className={`flex items-center gap-2.5 select-none ${className}`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ED6B22] rounded-full flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-xs">
            P
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Persistent
          </span>
        </div>
      );

    case 'tcs':
      return (
        <div className={`flex items-center gap-2.5 select-none ${className}`}>
          <span className="text-3xl sm:text-4xl font-black text-[#0B3A75] tracking-tight">
            TCS
          </span>
          <span className="text-sm sm:text-base font-bold px-2.5 py-1 bg-[#E6F0FA] text-[#0B3A75] rounded-md tracking-wide">
            Digital
          </span>
        </div>
      );

    case 'amazon':
      return (
        <div className={`flex flex-col items-center select-none ${className}`}>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">amazon</span>
          <svg viewBox="0 0 80 18" className="w-20 sm:w-24 h-4 sm:h-5 -mt-0.5">
            <path d="M5 4 Q 40 18 75 4" fill="none" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 2 L75 4 L72 8" fill="#FF9900" stroke="#FF9900" strokeWidth="1.2" />
          </svg>
        </div>
      );

    case 'celebal':
      return (
        <div className={`flex items-center justify-center select-none overflow-visible ${className}`}>
          <img
            src={ctLogoWebp}
            alt={companyName || 'Celebal Technologies'}
            className="h-12 sm:h-14 md:h-16 w-auto object-contain max-w-[260px]"
          />
        </div>
      );

    case 'virtusa':
      return (
        <div className={`flex items-center justify-center select-none ${className}`}>
          {customUrl ? (
            <img
              src={customUrl}
              alt={companyName || 'Virtusa'}
              className="h-12 sm:h-14 md:h-16 w-auto object-contain max-w-[260px]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#001E62] lowercase">
                virtusa
              </span>
              <span className="w-3 h-3 rounded-full bg-[#00A3E0]" />
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className={`flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg select-none ${className}`}>
          <span className="text-lg font-bold text-slate-800">{companyName || 'Corporate Partner'}</span>
        </div>
      );
  }
};
