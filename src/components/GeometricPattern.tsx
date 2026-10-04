import React from 'react';

interface GeometricPatternProps {
  color?: string;
  className?: string;
  variant?: 'light' | 'maroon' | 'gold';
}

export const GeometricPattern: React.FC<GeometricPatternProps> = ({
  color,
  className = '',
  variant = 'light',
}) => {
  const strokeColor =
    color ||
    (variant === 'maroon'
      ? 'rgba(255, 255, 255, 0.25)'
      : variant === 'gold'
      ? 'rgba(229, 169, 60, 0.4)'
      : 'rgba(139, 30, 63, 0.18)');

  return (
    <div className={`overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1000 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <g stroke={strokeColor} strokeWidth="1.2">
          {/* Repeating arch modular motif */}
          {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((offset) => (
            <g key={offset} transform={`translate(${offset}, 0)`}>
              {/* Outer semi circle arch */}
              <path d="M 0 120 A 50 50 0 0 1 100 120" />
              <path d="M 15 120 A 35 35 0 0 1 85 120" />
              <path d="M 30 120 A 20 20 0 0 1 70 120" />

              {/* Intersecting vertical & quadrant accents */}
              <line x1="50" y1="70" x2="50" y2="120" />
              <line x1="0" y1="0" x2="0" y2="120" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 0 60 Q 50 20 100 60" />
              <path d="M 0 0 A 50 50 0 0 0 50 50" />
              <path d="M 100 0 A 50 50 0 0 1 50 50" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};
