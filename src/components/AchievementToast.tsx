import React, { useEffect, useState, useRef } from 'react';
import { ACHIEVEMENTS_LIST, AchievementItem } from '../data/achievements';
import { Trophy, Sparkles, X } from 'lucide-react';
import { sfx } from '../utils/audio';

interface AchievementToastProps {
  clickCount: number;
  isDarkMode?: boolean;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ clickCount, isDarkMode }) => {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementItem | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const lastIndexRef = useRef<number>(-1);
  const lastUnlockTimeRef = useRef<number>(0);
  const nextTargetClickRef = useRef<number>(3); // First achievement unlocks on 3rd click
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger achievement ONLY when user clicks and reaches random click thresholds
  useEffect(() => {
    if (clickCount === 0) {
      nextTargetClickRef.current = 3;
      return;
    }

    const now = Date.now();
    // Only unlock if user reached the target click AND at least 5 seconds have passed since last achievement
    if (clickCount >= nextTargetClickRef.current && now - lastUnlockTimeRef.current > 5000) {
      lastUnlockTimeRef.current = now;

      // Pick a new random achievement
      let nextIdx = Math.floor(Math.random() * ACHIEVEMENTS_LIST.length);
      if (nextIdx === lastIndexRef.current) {
        nextIdx = (nextIdx + 1) % ACHIEVEMENTS_LIST.length;
      }
      lastIndexRef.current = nextIdx;

      const ach = ACHIEVEMENTS_LIST[nextIdx];
      setCurrentAchievement(ach);
      setIsVisible(true);
      sfx.playPop();

      // Clear any previous hide timer and show for extended duration (7.5 seconds)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 7500);

      // Schedule next achievement requirement after a random 7 to 15 clicks
      nextTargetClickRef.current = clickCount + Math.floor(7 + Math.random() * 9);
    }
  }, [clickCount]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!currentAchievement) return null;

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          label: 'Efsanevi',
        };
      case 'epic':
        return {
          bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
          label: 'Epik',
        };
      case 'rare':
        return {
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          label: 'Nadir',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          label: 'Genel',
        };
    }
  };

  const rarityInfo = getRarityBadge(currentAchievement.rarity);

  return (
    <div
      id="bottom-achievement-toast-container"
      className={`fixed bottom-16 right-4 sm:bottom-20 sm:right-6 md:bottom-20 md:right-8 z-40 transition-all duration-500 pointer-events-auto select-none max-w-[88vw] sm:max-w-sm ${
        isVisible
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
      }`}
    >
      <div
        id={`achievement-${currentAchievement.id}`}
        className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
          isDarkMode
            ? 'bg-neutral-950/95 border-amber-500/70 text-neutral-100 shadow-[0_10px_35px_rgba(245,158,11,0.3)]'
            : 'bg-white/95 border-amber-400/90 text-neutral-900 shadow-[0_10px_35px_rgba(217,119,6,0.25)]'
        }`}
      >
        {/* Animated Trophy Icon & Glow */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-neutral-950 shadow-md">
          <Trophy className="w-5 h-5 animate-bounce" style={{ animationDuration: '1.2s' }} />
          <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-200 animate-spin" />
        </div>

        {/* Content Details */}
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>🏆 BAŞARIM KAZANILDI</span>
            </span>
            <span
              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${rarityInfo.bg}`}
            >
              {rarityInfo.label}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black tracking-tight text-neutral-950 dark:text-white truncate">
            {currentAchievement.title}
          </h4>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-1">
            {currentAchievement.description}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
