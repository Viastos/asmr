import React, { useState } from 'react';
import { getCharacterByClicks } from '../data/characters';
import { Flame, Crown, Sparkles } from 'lucide-react';

interface AtomCenterProps {
  clickCount: number;
  onAtomClick: (e: React.MouseEvent) => void;
  isInfestedMode?: boolean;
  isDarkMode?: boolean;
}

export const AtomCenter: React.FC<AtomCenterProps> = ({
  clickCount,
  onAtomClick,
  isInfestedMode,
  isDarkMode,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const character = getCharacterByClicks(clickCount);
  const isMirmanuBoss = character.name === 'mirmanu';
  const clickInCycle = clickCount % 300;

  // Dynamic next tier calculation
  let nextTierText = '';
  if (clickInCycle < 50) {
    nextTierText = `${50 - clickInCycle} tık sonra: utkumuney`;
  } else if (clickInCycle < 100) {
    nextTierText = `${100 - clickInCycle} tık sonra: onplayer`;
  } else if (clickInCycle < 150) {
    nextTierText = `${150 - clickInCycle} tık sonra: 👑 FINAL BOSS (mirmanu)`;
  } else {
    const bossLeft = 300 - clickInCycle;
    nextTierText = `${bossLeft} tık sonra: BÜYÜK FİNAL & SIFIRLANIŞ!`;
  }

  // Mirmanu boss progress percentage (150 clicks to defeat: 150-299)
  const bossClicksDone = isMirmanuBoss ? clickInCycle - 150 : 0;
  const bossProgress = isMirmanuBoss ? (bossClicksDone / 150) * 100 : 0;
  const bossClicksRemaining = 150 - bossClicksDone;

  return (
    <div
      id="centerpiece-character-card"
      className={`relative flex flex-col items-center justify-center select-none ${
        isMirmanuBoss ? 'animate-pulse' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Glow */}
      <div
        className={`absolute w-72 h-72 md:w-[460px] md:h-[460px] rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isMirmanuBoss
            ? 'bg-gradient-to-r from-red-600/40 via-amber-500/40 to-yellow-500/40 scale-125 animate-spin'
            : isInfestedMode
            ? 'bg-amber-500/25 scale-125'
            : isHovered
            ? 'bg-amber-400/20 scale-110'
            : isDarkMode
            ? 'bg-amber-500/10'
            : 'bg-amber-200/15'
        }`}
        style={isMirmanuBoss ? { animationDuration: '10s' } : undefined}
      />

      {/* Mirmanu Boss Crown Tag */}
      {isMirmanuBoss && (
        <div className="relative z-20 -mb-4 flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] border border-yellow-300 animate-bounce text-xs font-black tracking-wider uppercase">
          <Crown className="w-4 h-4 text-yellow-200 animate-pulse" />
          <span>👑 FINAL BOSS: MİRMANU 👑</span>
          <Flame className="w-4 h-4 text-yellow-300" />
        </div>
      )}

      {/* Main Character Text Button */}
      <button
        id="main-character-text-btn"
        onClick={(e) => {
          e.stopPropagation();
          onAtomClick(e);
        }}
        className={`relative z-10 px-8 py-5 md:px-12 md:py-6 rounded-3xl group cursor-pointer transition-all duration-200 transform active:scale-95 focus:outline-none backdrop-blur-md border ${
          isMirmanuBoss
            ? 'bg-neutral-950/90 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.8)] ring-2 ring-amber-400/50'
            : isDarkMode
            ? 'bg-neutral-900/90 hover:bg-neutral-900 border-neutral-800 hover:border-amber-500/60 shadow-[0_8px_35px_rgba(0,0,0,0.4)]'
            : 'bg-white/90 hover:bg-white border-neutral-200 hover:border-amber-500/50 shadow-[0_8px_35px_rgba(0,0,0,0.08)]'
        }`}
      >
        {/* Tiny roaches clinging directly to the character badge */}
        <div className="absolute -top-3 -right-2 text-2xl animate-bounce" style={{ animationDuration: '1.4s' }}>
          🪳
        </div>
        <div className="absolute -bottom-2 -left-2 text-xl animate-pulse">
          🪳
        </div>

        {/* Central Character Typography (0-49: atomfurki, 50-99: utkumuney, 100-149: onplayer, 150+: mirmanu -> loops) */}
        <span
          className={`block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight lowercase transition-all duration-300 ${
            isMirmanuBoss
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 drop-shadow-[0_4px_25px_rgba(239,68,68,0.7)]'
              : isInfestedMode
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)] animate-pulse'
              : isDarkMode
              ? 'text-neutral-100 group-hover:text-amber-400 drop-shadow-sm'
              : 'text-neutral-900 group-hover:text-amber-800 drop-shadow-sm'
          }`}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.03em',
          }}
        >
          {character.label}
        </span>
      </button>

      {/* Mirmanu Boss Rage Meter / Normal Progress Indicator */}
      {isMirmanuBoss ? (
        <div className="relative z-10 mt-3 flex flex-col items-center gap-1.5 w-72 max-w-xs px-4 py-2.5 bg-neutral-900/95 border border-red-500/70 rounded-2xl shadow-xl text-xs backdrop-blur-md">
          <div className="flex items-center justify-between w-full text-neutral-300 font-bold">
            <span className="flex items-center gap-1 text-red-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-400" /> Boss Hasarı:
            </span>
            <span className="text-amber-400 font-mono font-extrabold">{bossClicksDone} / 150 ({bossClicksRemaining} tık)</span>
          </div>
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              style={{ width: `${bossProgress}%` }}
            />
          </div>
          <span className="text-[11px] text-amber-300 font-semibold text-center">{nextTierText}</span>
        </div>
      ) : (
        <div className="relative z-10 mt-3 flex items-center gap-2 px-3.5 py-1.5 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <span className="text-amber-600 dark:text-amber-400 font-bold">⚡ {clickCount} Tık</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-neutral-500 dark:text-neutral-400">{nextTierText}</span>
        </div>
      )}
    </div>
  );
};
