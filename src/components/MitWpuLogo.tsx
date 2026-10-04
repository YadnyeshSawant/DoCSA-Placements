import React from 'react';
import logoMitImg from '../assets/logoMIT.jpg';

interface MitWpuLogoProps {
  className?: string;
  variant?: 'blue' | 'white' | 'maroon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const MitWpuLogo: React.FC<MitWpuLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'blue',
}) => {
  const sizeClasses = {
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-44',
    xl: 'w-56',
    '2xl': 'w-60 sm:w-72',
  }[size];

  return (
    <div className={`flex flex-col items-center select-none ${sizeClasses} ${className}`}>
      <img
        src={logoMitImg || '/logoMIT.jpg'}
        alt="MIT-WPU Logo"
        className={`w-full h-auto object-contain rounded-md ${
          variant === 'white' ? 'bg-white p-2 shadow-sm' : ''
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
