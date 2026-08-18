import React from 'react';
import { CockroachData } from '../types';

interface CockroachProps {
  bug: CockroachData;
  onClickBug?: (bugId: string, e: React.MouseEvent) => void;
}

export const Cockroach: React.FC<CockroachProps> = ({ bug, onClickBug }) => {
  const { x, y, angle, size, state, legPhase, mutationType } = bug;
  const isMoving = (state === 'crawling' || state === 'scurrying') && state !== 'dead';
  const isDead = state === 'dead';
  const isDeadPretending = state === 'dead_pretend';

  // Calculate leg positions based on leg phase (tripod gait)
  const legSpeedMult = isDead ? 0 : state === 'scurrying' ? 1.6 : 1.0;
  const l1 = isDead ? -8 : Math.sin(legPhase * legSpeedMult) * 15;
  const l2 = isDead ? -12 : Math.sin(legPhase * legSpeedMult + Math.PI) * 15;
  const l3 = isDead ? -10 : Math.sin(legPhase * legSpeedMult + 0.5) * 15;
  const r1 = isDead ? -8 : Math.sin(legPhase * legSpeedMult + Math.PI) * 15;
  const r2 = isDead ? -12 : Math.sin(legPhase * legSpeedMult) * 15;
  const r3 = isDead ? -10 : Math.sin(legPhase * legSpeedMult + Math.PI + 0.5) * 15;

  const antWave = isDead ? 0 : Math.sin(legPhase * 1.8) * 10;

  // Colors based on mutation
  let shellColor1 = '#381302';
  let shellColor2 = '#612507';
  let shellColor3 = '#85320c';
  let shellColor4 = '#1f0a01';
  let legColor = '#2d1003';

  if (isDead) {
    shellColor1 = '#4b5563';
    shellColor2 = '#374151';
    shellColor3 = '#1f2937';
    shellColor4 = '#111827';
    legColor = '#374151';
  } else if (mutationType === 'golden') {
    shellColor1 = '#b45309';
    shellColor2 = '#d97706';
    shellColor3 = '#fbbf24';
    shellColor4 = '#78350f';
    legColor = '#78350f';
  } else if (mutationType === 'radioactive') {
    shellColor1 = '#14532d';
    shellColor2 = '#16a34a';
    shellColor3 = '#4ade80';
    shellColor4 = '#052e16';
    legColor = '#14532d';
  } else if (mutationType === 'giant') {
    shellColor1 = '#1a0701';
    shellColor2 = '#381302';
    shellColor3 = '#612507';
    shellColor4 = '#0d0300';
    legColor = '#170601';
  }

  // Dead cockroach fading out
  let deadOpacity = 0.75;
  if (isDead && bug.diedAt) {
    const elapsed = Date.now() - bug.diedAt;
    deadOpacity = Math.max(0, 0.75 * (1 - elapsed / 3500));
  }

  return (
    <div
      id={`cockroach-${bug.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onClickBug?.(bug.id, e);
      }}
      className={`absolute select-none will-change-transform z-30 cursor-pointer transition-opacity duration-300 ${
        isDead ? 'rotate-180 pointer-events-none' : isDeadPretending ? 'opacity-80' : ''
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size * 1.5}px`,
        opacity: isDead ? deadOpacity : undefined,
        transform: `translate(-50%, -50%) rotate(${angle + 90}deg) ${
          isDead || isDeadPretending ? 'rotateX(180deg) scale(0.92)' : ''
        }`,
      }}
    >
      {/* SVG Realistic Cockroach */}
      <svg
        viewBox="0 0 100 150"
        className={`w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] ${
          mutationType === 'golden' ? 'drop-shadow-[0_0_10px_rgba(217,119,6,0.7)]' : ''
        } ${mutationType === 'radioactive' ? 'drop-shadow-[0_0_10px_rgba(22,163,74,0.7)]' : ''}`}
      >
        <defs>
          <linearGradient id={`shellGrad-${bug.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={shellColor1} />
            <stop offset="35%" stopColor={shellColor2} />
            <stop offset="65%" stopColor={shellColor3} />
            <stop offset="100%" stopColor={shellColor4} />
          </linearGradient>

          <linearGradient id={`pronotumGrad-${bug.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={shellColor2} />
            <stop offset="50%" stopColor={shellColor3} />
            <stop offset="100%" stopColor={shellColor1} />
          </linearGradient>
        </defs>

        {/* --- LEGS (Tripod Gait articulated pairs) --- */}
        <g stroke={legColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Front Leg */}
          <path
            d={`M 40 45 Q ${20 + l1} 30 12 18 T ${5 + l1 * 0.5} 8`}
            className={isMoving ? 'transition-all duration-75' : ''}
          />
          {/* Left Middle Leg */}
          <path
            d={`M 38 65 Q ${12 + l2} 60 5 68 T ${0 + l2 * 0.5} 80`}
            className={isMoving ? 'transition-all duration-75' : ''}
          />
          {/* Left Hind Leg */}
          <path
            d={`M 38 85 Q ${15 + l3} 95 6 120 T ${2 + l3 * 0.5} 145`}
            className={isMoving ? 'transition-all duration-75' : ''}
          />

          {/* Right Front Leg */}
          <path
            d={`M 60 45 Q ${80 + r1} 30 88 18 T ${95 + r1 * 0.5} 8`}
            className={isMoving ? 'transition-all duration-75' : ''}
          />
          {/* Right Middle Leg */}
          <path
            d={`M 62 65 Q ${88 + r2} 60 95 68 T ${100 + r2 * 0.5} 80`}
            className={isMoving ? 'transition-all duration-75' : ''}
          />
          {/* Right Hind Leg */}
          <path
            d={`M 62 85 Q ${85 + r3} 95 94 120 T ${98 + r3 * 0.5} 145`}
            className={isMoving ? 'transition-all duration-75' : ''}
          />
        </g>

        {/* Cerci (tail tips) */}
        <g stroke={shellColor1} strokeWidth="2.5" strokeLinecap="round">
          <line x1="45" y1="120" x2="38" y2="136" />
          <line x1="55" y1="120" x2="62" y2="136" />
        </g>

        {/* Abdomen segments base */}
        <ellipse cx="50" cy="85" rx="19" ry="35" fill={shellColor4} />

        {/* Wings / Elytra Shell */}
        <g>
          {/* Left Elytron */}
          <path
            d="M 50 48 Q 27 58 31 95 Q 35 122 49 122 Q 50 100 50 48 Z"
            fill={`url(#shellGrad-${bug.id})`}
            stroke="#1d0a01"
            strokeWidth="1.5"
          />
          {/* Right Elytron */}
          <path
            d="M 50 48 Q 73 58 69 95 Q 65 122 51 122 Q 50 100 50 48 Z"
            fill={`url(#shellGrad-${bug.id})`}
            stroke="#1d0a01"
            strokeWidth="1.5"
          />
          {/* Center Elytra Spine */}
          <line x1="50" y1="48" x2="50" y2="122" stroke="#140600" strokeWidth="1.5" />
          {/* Shell Shine */}
          {!isDead && (
            <path
              d="M 39 55 Q 35 75 41 105"
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* Pronotum Shield */}
        <ellipse
          cx="50"
          cy="42"
          rx="18"
          ry="14"
          fill={`url(#pronotumGrad-${bug.id})`}
          stroke="#1d0a01"
          strokeWidth="1.5"
        />
        {/* Pronotum dark center mask */}
        <ellipse cx="50" cy="42" rx="9" ry="6" fill="#140600" />

        {/* Head */}
        <ellipse cx="50" cy="27" rx="9.5" ry="7.5" fill="#2d1003" stroke="#140600" strokeWidth="1.2" />

        {/* Eyes */}
        {isDead ? (
          <g stroke="#ffffff" strokeWidth="1.5">
            <line x1="41" y1="23" x2="45" y2="27" />
            <line x1="45" y1="23" x2="41" y2="27" />
            <line x1="55" y1="23" x2="59" y2="27" />
            <line x1="59" y1="23" x2="55" y2="27" />
          </g>
        ) : (
          <>
            <ellipse cx="43" cy="25" rx="2.8" ry="3.8" fill="#090301" />
            <ellipse cx="57" cy="25" rx="2.8" ry="3.8" fill="#090301" />
            <circle cx="42.5" cy="24" r="0.9" fill="#ffffff" opacity="0.9" />
            <circle cx="56.5" cy="24" r="0.9" fill="#ffffff" opacity="0.9" />
          </>
        )}

        {/* Antennae */}
        <g stroke={legColor} strokeWidth="1.3" strokeLinecap="round" fill="none">
          <path d={`M 46 22 Q ${30 + antWave} 5 10 -18 T ${-6 + antWave * 1.5} -38`} />
          <path d={`M 54 22 Q ${70 - antWave} 5 90 -18 T ${106 - antWave * 1.5} -38`} />
        </g>
      </svg>
    </div>
  );
};
