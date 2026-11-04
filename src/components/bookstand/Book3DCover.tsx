import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface Book3DCoverProps {
  coverPhoto?: string;
  title: string;
  author?: string;
  category?: string;
  className?: string;
  badge?: React.ReactNode;
  aspectRatioClass?: string;
  showHoverEffect?: boolean;
}

export const Book3DCover: React.FC<Book3DCoverProps> = ({
  coverPhoto,
  title,
  author,
  category,
  className = '',
  badge,
  aspectRatioClass = 'aspect-[3/4]',
  showHoverEffect = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Background fallback gradients based on category
  const getFallbackGradient = (cat?: string) => {
    switch (cat) {
      case 'Spiritual Growth':
        return 'from-[#2E0854] via-[#581C87] to-[#1A0430]';
      case 'Leadership':
        return 'from-[#4A0404] via-[#831843] to-[#200000]';
      case 'Prayer & Fasting':
        return 'from-[#063023] via-[#065F46] to-[#021811]';
      case 'Finance & Stewardship':
        return 'from-[#2E1905] via-[#78350F] to-[#120A02]';
      case 'Purpose & Destiny':
        return 'from-[#082F49] via-[#0369A1] to-[#031726]';
      default:
        return 'from-[#0B1D42] via-[#15357A] to-[#071228]';
    }
  };

  const hasValidPhoto = coverPhoto && !imgError && coverPhoto.trim().length > 0;

  return (
    <div
      className={`relative group select-none ${aspectRatioClass} w-full rounded-r-lg rounded-l-xs overflow-hidden transition-all duration-300 ${
        showHoverEffect
          ? 'hover:scale-[1.025] hover:-translate-y-1 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_35px_-8px_rgba(0,0,0,0.5)]'
          : 'shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)]'
      } ${className}`}
      style={{
        perspective: '1000px',
      }}
    >
      {/* 1. Base Book Cover Content */}
      {hasValidPhoto ? (
        <img
          src={coverPhoto}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-r-lg rounded-l-xs"
          loading="lazy"
        />
      ) : (
        /* Realistic Embossed Fallback Cover */
        <div
          className={`w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br ${getFallbackGradient(
            category
          )} text-white border border-amber-400/30 rounded-r-lg rounded-l-xs`}
        >
          {/* Embossed Border */}
          <div className="absolute inset-2 border border-amber-400/40 rounded-sm pointer-events-none" />

          <div className="relative z-10 text-center pt-2">
            <span className="text-[9px] font-black tracking-widest uppercase text-amber-300/90 block">
              {category || 'Dominion City Publications'}
            </span>
          </div>

          <div className="relative z-10 text-center px-2 py-4">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-black font-serif tracking-wide text-white line-clamp-3 leading-snug">
              {title}
            </h4>
            <div className="w-12 h-0.5 bg-amber-400/60 mx-auto my-2" />
            <p className="text-[10px] font-bold text-amber-300/90 tracking-wide uppercase">
              {author || 'Dr. David Ogbueli'}
            </p>
          </div>

          <div className="relative z-10 text-center pb-1">
            <span className="text-[8px] font-semibold tracking-wider text-slate-300/70 uppercase">
              Official Literature Desk
            </span>
          </div>
        </div>
      )}

      {/* 2. Realistic 3D Book Spine Overlay (Left edge crease & highlight) */}
      <div
        className="absolute inset-y-0 left-0 w-4 sm:w-5 pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 25%, rgba(255,255,255,0.25) 45%, rgba(0,0,0,0.2) 65%, transparent 100%)',
        }}
      />

      {/* 3. Realistic Page Block Simulation (Right Edge & Bottom Edge) */}
      <div
        className="absolute inset-y-0 right-0 w-[3px] pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, #FFFFFF 40%, #E2E8F0 70%, #94A3B8 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[2px] pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 50%, #94A3B8 100%)',
        }}
      />

      {/* 4. Glossy Commercial Sheen (Diagonal laminate reflection) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-60 group-hover:opacity-80"
        style={{
          background:
            'linear-gradient(125deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 35%, transparent 60%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* 5. Custom Badge slot (e.g. In Stock, Price, Discount) */}
      {badge && <div className="absolute top-2 right-2 z-30">{badge}</div>}
    </div>
  );
};
