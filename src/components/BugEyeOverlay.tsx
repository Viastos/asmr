import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, ArrowLeft, ArrowRight, ShieldAlert, Zap, Radio, Moon, Activity } from 'lucide-react';
import { CockroachData } from '../types';

interface BugEyeOverlayProps {
  cockroachesRef: React.MutableRefObject<CockroachData[]>;
  isLightsOn: boolean;
  isDarkMode: boolean;
  trackedBugId: string | null;
  onTrackedBugChange: (bugId: string) => void;
  onClose: () => void;
}

export const BugEyeOverlay: React.FC<BugEyeOverlayProps> = ({
  cockroachesRef,
  isLightsOn,
  isDarkMode,
  trackedBugId,
  onTrackedBugChange,
  onClose,
}) => {
  const [thermalMode, setThermalMode] = useState<boolean>(true);
  const [radarPing, setRadarPing] = useState<number>(0);
  const [telemetry, setTelemetry] = useState<{
    name: string;
    speed: number;
    state: string;
    x: number;
    y: number;
    angle: number;
    isAlive: boolean;
    size: number;
  }>({
    name: 'Böcek #1',
    speed: 0,
    state: 'crawling',
    x: 0,
    y: 0,
    angle: 0,
    isAlive: true,
    size: 40,
  });

  const antennaPhaseRef = useRef<number>(0);
  const [antennaOffset, setAntennaOffset] = useState<{ left: number; right: number }>({ left: 0, right: 0 });

  // Select first available live bug on mount if not set
  useEffect(() => {
    const bugs = cockroachesRef.current;
    if (!trackedBugId && bugs.length > 0) {
      const aliveBug = bugs.find((b) => b.state !== 'dead') || bugs[0];
      if (aliveBug) {
        onTrackedBugChange(aliveBug.id);
      }
    }
  }, [cockroachesRef, trackedBugId, onTrackedBugChange]);

  // High-frequency telemetry tracking loop
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const bugs = cockroachesRef.current;
      if (bugs.length > 0) {
        let currentBug = bugs.find((b) => b.id === trackedBugId);
        if (!currentBug || (currentBug.state === 'dead' && bugs.some((b) => b.state !== 'dead'))) {
          // Switch to another live bug if current died
          currentBug = bugs.find((b) => b.state !== 'dead') || bugs[0];
          if (currentBug && currentBug.id !== trackedBugId) {
            onTrackedBugChange(currentBug.id);
          }
        }

        if (currentBug) {
          antennaPhaseRef.current += (currentBug.speed + 1) * 0.15;
          const phase = antennaPhaseRef.current;

          setTelemetry({
            name: currentBug.name,
            speed: Math.round(currentBug.speed * 4.2 * 10) / 10,
            state: currentBug.state,
            x: Math.round(currentBug.x),
            y: Math.round(currentBug.y),
            angle: Math.round(currentBug.angle),
            isAlive: currentBug.state !== 'dead',
            size: currentBug.size,
          });

          setAntennaOffset({
            left: Math.sin(phase) * 14 + Math.sin(phase * 2.3) * 6,
            right: Math.cos(phase * 0.9) * 14 + Math.sin(phase * 1.8) * 6,
          });
        }
      }
      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [cockroachesRef, trackedBugId, onTrackedBugChange]);

  // Radar ping timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarPing((p) => (p + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleNextBug = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const bugs = cockroachesRef.current;
    if (bugs.length === 0) return;
    const currentIndex = bugs.findIndex((b) => b.id === trackedBugId);
    const nextIndex = (currentIndex + 1) % bugs.length;
    onTrackedBugChange(bugs[nextIndex].id);
  };

  const handlePrevBug = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const bugs = cockroachesRef.current;
    if (bugs.length === 0) return;
    const currentIndex = bugs.findIndex((b) => b.id === trackedBugId);
    const prevIndex = (currentIndex - 1 + bugs.length) % bugs.length;
    onTrackedBugChange(bugs[prevIndex].id);
  };

  const isMirmanu = telemetry.name.toLowerCase().includes('mirmanu');

  return (
    <div
      id="bug-eye-overlay"
      className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between select-none overflow-hidden"
      style={{
        background: thermalMode
          ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.04) 0%, rgba(5, 46, 22, 0.25) 75%, rgba(2, 20, 10, 0.65) 100%)'
          : 'radial-gradient(circle at center, rgba(234, 179, 8, 0.03) 0%, rgba(69, 26, 3, 0.25) 75%, rgba(20, 5, 0, 0.65) 100%)',
      }}
    >
      {/* 1. Insect Compound Eye Hexagonal Grid Facets (Ommatidia Shader) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle, ${
            thermalMode ? '#22c55e' : '#eab308'
          } 1.5px, transparent 1.5px)`,
          backgroundSize: '14px 14px',
        }}
      />

      {/* 2. Panoramic Barrel Distortion & Fisheye Vignette Border */}
      <div className="absolute inset-0 pointer-events-none border-[8px] md:border-[18px] border-black/70 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

      {/* 3. Scanlines Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.7) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* TOP HEADER: Bug Identity & Viewport Controls */}
      <div className="relative z-10 pointer-events-auto flex items-center justify-between gap-3 p-3 md:p-5 bg-neutral-950/80 backdrop-blur-md border-b border-emerald-500/30 text-white">
        {/* Left: Active Bug Info */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${isMirmanu ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse' : 'bg-emerald-950/80 border-emerald-500 text-emerald-400'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                👁️ BÖCEK GÖZÜ (POV)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${telemetry.isAlive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
                {telemetry.isAlive ? 'CANLI' : 'EZİLDİ'}
              </span>
            </div>
            <div className="font-extrabold text-sm md:text-base text-neutral-100 flex items-center gap-1.5">
              <span>{telemetry.name}</span>
              {isMirmanu && <span className="text-xs bg-red-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">BOSS</span>}
            </div>
          </div>
        </div>

        {/* Center: Bug Switcher Buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 p-1 rounded-xl">
          <button
            id="bug-eye-prev"
            onClick={handlePrevBug}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Önceki Böcek"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 text-neutral-400">Böceği Değiştir</span>
          <button
            id="bug-eye-next"
            onClick={handleNextBug}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Sonraki Böcek"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Mode Toggle & Close Button */}
        <div className="flex items-center gap-2">
          <button
            id="bug-eye-toggle-thermal"
            onClick={(e) => {
              e.stopPropagation();
              setThermalMode((m) => !m);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors border cursor-pointer ${
              thermalMode
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'bg-amber-950/80 border-amber-500 text-amber-300'
            }`}
            title="Görüş Modunu Değiştir (Gece Görüşü / Koku Radarı)"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden md:inline">{thermalMode ? 'GECE GÖRÜŞÜ' : 'KOKU MODU'}</span>
          </button>

          <button
            id="bug-eye-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
            title="Böcek Gözünden Çık"
          >
            <X className="w-4 h-4" />
            <span>Kapat</span>
          </button>
        </div>
      </div>

      {/* CENTER HUD: Reticle, Olfactory Compass & Danger Level */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none">
        {/* Reticle Target Sight */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 border border-emerald-500/20 rounded-full flex items-center justify-center">
          <div className="w-24 h-24 border border-dashed border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '14s' }} />
          <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <div className="absolute top-1 font-mono text-[10px] text-emerald-400/80 tracking-widest">
            KIRINTI RADARI
          </div>
          {/* Compass ticks */}
          <div className="absolute left-2 text-[9px] font-mono text-emerald-500/60">W</div>
          <div className="absolute right-2 text-[9px] font-mono text-emerald-500/60">E</div>
          <div className="absolute top-2 text-[9px] font-mono text-emerald-500/60">N</div>
          <div className="absolute bottom-2 text-[9px] font-mono text-emerald-500/60">S</div>
        </div>

        {/* Threat Level Overlay */}
        <div className="absolute top-4 left-4 bg-neutral-950/80 border border-emerald-500/30 backdrop-blur-sm p-2.5 rounded-xl font-mono text-xs text-neutral-200">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
            <span>TEHLİKE ANALİZİ</span>
          </div>
          <div className="text-[11px] text-neutral-300 space-y-0.5">
            <div>Terlik Riski: <span className="text-red-400 font-bold">YÜKSEK (%78)</span></div>
            <div>Raid Yoğunluğu: <span className="text-emerald-400 font-bold">ORTA</span></div>
            <div>Işık Durumu: <span className="text-yellow-400 font-bold">{isLightsOn ? 'IŞIK AÇIK (PANİK!)' : 'GÜVENLİ KARANLIK'}</span></div>
          </div>
        </div>
      </div>

      {/* FOREGROUND: Realistic Twitching Cockroach Antennae */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-between px-6 md:px-24 h-64 overflow-hidden z-20">
        {/* Left Antenna */}
        <div
          className="w-1.5 md:w-2 bg-gradient-to-t from-amber-950 via-amber-800 to-amber-600 rounded-full origin-bottom transform transition-transform duration-75 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
          style={{
            height: '100%',
            transform: `rotate(${-28 + antennaOffset.left}deg)`,
          }}
        />
        {/* Right Antenna */}
        <div
          className="w-1.5 md:w-2 bg-gradient-to-t from-amber-950 via-amber-800 to-amber-600 rounded-full origin-bottom transform transition-transform duration-75 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
          style={{
            height: '100%',
            transform: `rotate(${28 + antennaOffset.right}deg)`,
          }}
        />
      </div>

      {/* BOTTOM FOOTER: Insect Sensor Telemetry & Quick Navigation */}
      <div className="relative z-30 pointer-events-auto p-3 md:p-4 bg-neutral-950/85 backdrop-blur-md border-t border-emerald-500/30 text-white flex flex-wrap items-center justify-between gap-3">
        {/* Telemetry Metrics */}
        <div className="flex items-center gap-3 md:gap-6 font-mono text-xs flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-neutral-400">Hız:</span>
            <span className="font-bold text-emerald-300">{telemetry.speed} cm/s</span>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-neutral-400">Durum:</span>
            <span className="font-bold text-amber-300 uppercase">
              {telemetry.state === 'scurrying' ? '⚡ Depar Atıyor' : telemetry.state === 'dead' ? '💀 Ezildi' : '🐾 Yürüyor'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
            <span className="text-neutral-400">Konum:</span>
            <span className="font-bold text-neutral-200">X: {telemetry.x}, Y: {telemetry.y}</span>
          </div>
        </div>

        {/* Mobile Next/Prev Buttons */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={handlePrevBug}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold"
          >
            ← Önceki
          </button>
          <button
            onClick={handleNextBug}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold"
          >
            Sonraki →
          </button>
        </div>
      </div>
    </div>
  );
};
