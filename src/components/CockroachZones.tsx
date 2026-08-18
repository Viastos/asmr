import React, { useState } from 'react';
import { COCKROACH_ZONES } from '../data/randomContent';
import { ZoneData } from '../types';

interface CockroachZonesProps {
  onSelectZone: (zone: ZoneData, e: React.MouseEvent) => void;
}

export const CockroachZones: React.FC<CockroachZonesProps> = ({ onSelectZone }) => {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  return (
    <div id="cockroach-zones-container" className="absolute inset-0 pointer-events-none z-20">
      {COCKROACH_ZONES.map((zone) => {
        const isActive = activeZone === zone.id;

        return (
          <div
            key={zone.id}
            id={zone.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectZone(zone, e);
            }}
            onMouseEnter={() => setActiveZone(zone.id)}
            onMouseLeave={() => setActiveZone(null)}
            className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300"
            style={{
              left: `${zone.xPercent}%`,
              top: `${zone.yPercent}%`,
            }}
          >
            {/* Zone Beacon Pin */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute w-12 h-12 rounded-full bg-amber-500/20 group-hover:bg-amber-500/40 animate-ping pointer-events-none" />

              {/* Pin Badge */}
              <div className="relative z-10 flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 border-2 border-amber-500/60 hover:border-amber-400 px-3 py-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-all group-hover:scale-105">
                <span className="text-xl">{zone.emoji}</span>
                <span className="font-bold text-xs text-amber-200 whitespace-nowrap">
                  {zone.name}
                </span>
              </div>
            </div>

            {/* Expanded Information Tooltip on hover/click */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-neutral-950/95 border border-amber-500/50 rounded-xl p-3 text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-1.5">
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                  Bölge İstihbaratı
                </span>
                <span className="text-[10px] text-red-400 font-mono">
                  {zone.dangerLevel}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-tight">
                {zone.description}
              </p>
              <div className="mt-2 bg-amber-950/60 border border-amber-500/30 p-1.5 rounded text-[10px] text-amber-300 font-mono">
                💡 <span className="font-bold">Troll Gerçek:</span> {zone.trollFact}
              </div>
              <div className="mt-1 text-center text-[9px] text-neutral-400 font-mono">
                [Tıkla: Böcekleri buraya topla!]
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
