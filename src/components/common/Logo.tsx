import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'white';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'dark',
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', title: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', title: 'text-lg', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14', title: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 'w-20 h-20', title: 'text-3xl', sub: 'text-base' },
  };

  const textColors = {
    dark: {
      title: 'text-slate-900',
      sub: 'text-blue-700 font-semibold',
    },
    light: {
      title: 'text-white',
      sub: 'text-blue-200 font-medium',
    },
    white: {
      title: 'text-white',
      sub: 'text-blue-300 font-medium',
    },
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Dominion City Heart Skyline Logo Icon */}
      <div className={`relative shrink-0 ${sizeMap[size].icon} drop-shadow-sm`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="dcHeartGradient" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="50%" stopColor="#0B2363" />
              <stop offset="100%" stopColor="#051233" />
            </linearGradient>
            <linearGradient id="dcHeartGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#2563EB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </linearGradient>
            <clipPath id="dcHeartClip">
              <path d="M50,88 C50,88 15,64 15,36 C15,20 28,14 39,20 C45,23 48,28 50,32 C52,28 55,23 61,20 C72,14 85,20 85,36 C85,64 50,88 50,88 Z" />
            </clipPath>
          </defs>

          {/* Heart Base with Brand Royal & Navy Gradient */}
          <path
            d="M50,88 C50,88 15,64 15,36 C15,20 28,14 39,20 C45,23 48,28 50,32 C52,28 55,23 61,20 C72,14 85,20 85,36 C85,64 50,88 50,88 Z"
            fill="url(#dcHeartGradient)"
            stroke="#1D4ED8"
            strokeWidth="1.5"
          />

          {/* Subtle 3D Glass / Gloss shine on top curves */}
          <path
            d="M50,32 C48,28 45,23 39,20 C28,14 15,20 15,36 C15,48 24,60 36,70 C30,55 35,32 50,32 Z"
            fill="url(#dcHeartGloss)"
          />

          {/* Group clipped to heart: City Skyline Silhouette in Clean White */}
          <g clipPath="url(#dcHeartClip)">
            {/* Ground / Baseline */}
            <rect x="15" y="66" width="70" height="2" fill="#FFFFFF" />

            {/* Building 1 (Far Left) */}
            <rect x="23" y="52" width="7" height="15" fill="#FFFFFF" rx="0.5" />
            {/* Windows for Building 1 */}
            <circle cx="25.5" cy="55.5" r="0.7" fill="#0B2363" />
            <circle cx="27.5" cy="55.5" r="0.7" fill="#0B2363" />
            <circle cx="25.5" cy="59.5" r="0.7" fill="#0B2363" />
            <circle cx="27.5" cy="59.5" r="0.7" fill="#0B2363" />

            {/* Building 2 (Mid Left Tower) */}
            <rect x="32" y="38" width="9" height="29" fill="#FFFFFF" rx="0.5" />
            <circle cx="35" cy="42" r="0.8" fill="#0B2363" />
            <circle cx="38" cy="42" r="0.8" fill="#0B2363" />
            <circle cx="35" cy="46" r="0.8" fill="#0B2363" />
            <circle cx="38" cy="46" r="0.8" fill="#0B2363" />
            <circle cx="35" cy="50" r="0.8" fill="#0B2363" />
            <circle cx="38" cy="50" r="0.8" fill="#0B2363" />
            <circle cx="35" cy="54" r="0.8" fill="#0B2363" />
            <circle cx="38" cy="54" r="0.8" fill="#0B2363" />

            {/* Building 3 (Center Highrise Tower) */}
            <rect x="43" y="27" width="12" height="40" fill="#FFFFFF" rx="0.5" />
            {/* Center tower antenna */}
            <rect x="48.5" y="23" width="1" height="4" fill="#FFFFFF" />
            {/* Windows 3 columns */}
            <circle cx="46" cy="31" r="0.8" fill="#0B2363" />
            <circle cx="49" cy="31" r="0.8" fill="#0B2363" />
            <circle cx="52" cy="31" r="0.8" fill="#0B2363" />
            <circle cx="46" cy="35" r="0.8" fill="#0B2363" />
            <circle cx="49" cy="35" r="0.8" fill="#0B2363" />
            <circle cx="52" cy="35" r="0.8" fill="#0B2363" />
            <circle cx="46" cy="39" r="0.8" fill="#0B2363" />
            <circle cx="49" cy="39" r="0.8" fill="#0B2363" />
            <circle cx="52" cy="39" r="0.8" fill="#0B2363" />
            <circle cx="46" cy="43" r="0.8" fill="#0B2363" />
            <circle cx="49" cy="43" r="0.8" fill="#0B2363" />
            <circle cx="52" cy="43" r="0.8" fill="#0B2363" />
            <circle cx="46" cy="48" r="0.8" fill="#0B2363" />
            <circle cx="49" cy="48" r="0.8" fill="#0B2363" />
            <circle cx="52" cy="48" r="0.8" fill="#0B2363" />

            {/* Building 4 (Right Tower with Angled/Pitched Roof) */}
            <path d="M57,67 L57,38 L65,31 L65,67 Z" fill="#FFFFFF" />
            <circle cx="61" cy="42" r="0.8" fill="#0B2363" />
            <circle cx="61" cy="47" r="0.8" fill="#0B2363" />
            <circle cx="61" cy="52" r="0.8" fill="#0B2363" />
            <circle cx="61" cy="57" r="0.8" fill="#0B2363" />

            {/* Building 5 (Far Right) */}
            <rect x="67" y="47" width="8" height="20" fill="#FFFFFF" rx="0.5" />
            <circle cx="69.5" cy="51" r="0.7" fill="#0B2363" />
            <circle cx="72.5" cy="51" r="0.7" fill="#0B2363" />
            <circle cx="69.5" cy="56" r="0.7" fill="#0B2363" />
            <circle cx="72.5" cy="56" r="0.7" fill="#0B2363" />
            <circle cx="69.5" cy="61" r="0.7" fill="#0B2363" />
            <circle cx="72.5" cy="61" r="0.7" fill="#0B2363" />
          </g>
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-sans ${sizeMap[size].title} ${textColors[variant].title}`}
            >
              Dominion City
            </span>
          </div>
          <span
            className={`font-bold tracking-wider uppercase text-[10px] sm:text-xs ${textColors[variant].sub}`}
          >
            Information Desk • Asaba
          </span>
        </div>
      )}
    </div>
  );
};
