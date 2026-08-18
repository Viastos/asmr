import React, { useState } from 'react';
import { Plus, RefreshCw, Lightbulb, Skull, Sun, Moon, Eye, ChevronUp } from 'lucide-react';
import { ASSETS, getCharacterByClicks } from '../data/characters';

interface ControlBarProps {
  clickCount: number;
  aliveCount: number;
  deadCount: number;
  isLightsOn: boolean;
  isDarkMode: boolean;
  isBugEyeActive: boolean;
  onAddSwarm: (count: number) => void;
  onThrowSlipper: () => void;
  onSprayRaid: () => void;
  onDropCrumbs: () => void;
  onKillAllCockroaches: () => void;
  onToggleLights: () => void;
  onToggleDarkMode: () => void;
  onResetGame: () => void;
  onToggleBugEye: () => void;
  onToggleCollapse: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  clickCount,
  aliveCount,
  deadCount,
  isLightsOn,
  isDarkMode,
  isBugEyeActive,
  onAddSwarm,
  onThrowSlipper,
  onSprayRaid,
  onDropCrumbs,
  onKillAllCockroaches,
  onToggleLights,
  onToggleDarkMode,
  onResetGame,
  onToggleBugEye,
  onToggleCollapse,
}) => {
  const [slipperImgError, setSlipperImgError] = useState(false);
  const [crumbsImgError, setCrumbsImgError] = useState(false);
  const [sprayImgError, setSprayImgError] = useState(false);

  const character = getCharacterByClicks(clickCount);

  return (
    <header
      id="main-control-navbar"
      className="fixed top-3 left-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 px-4 py-2.5 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.3)] select-none text-neutral-900 dark:text-neutral-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Brand, Active Character & Live Counters */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 rounded-xl">
          <img
            src={ASSETS.logoDirect}
            alt="Logo"
            className="w-6 h-6 object-contain drop-shadow-sm hover:rotate-12 transition-transform"
            onError={(e) => {
              // fallback if network fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-extrabold text-xs md:text-sm tracking-tight text-amber-950 dark:text-amber-300">
            {character.label}
          </span>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Canlı:</span>
            <span className="font-bold text-neutral-950 dark:text-neutral-100">{aliveCount}</span>
          </div>

          {deadCount > 0 && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
              <span className="text-red-600 dark:text-red-400">Ölü:</span>
              <span className="font-bold text-red-950 dark:text-red-300">{deadCount}</span>
            </div>
          )}

          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Tık:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{clickCount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* +5 Böcek */}
        <button
          id="btn-add-swarm-5"
          onClick={(e) => {
            e.stopPropagation();
            onAddSwarm(5);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          title="+5 Hamamböceği Ekle"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>🪳 +5</span>
        </button>

        {/* 🚨 İSTİLA (+20) */}
        <button
          id="btn-add-swarm-20"
          onClick={(e) => {
            e.stopPropagation();
            onAddSwarm(20);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
          title="20 Böceklik İstila Başlat"
        >
          <span>🚨 +20</span>
        </button>

        {/* 🩴 Terlik */}
        <button
          id="btn-throw-slipper"
          onClick={(e) => {
            e.stopPropagation();
            onThrowSlipper();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-950 dark:text-purple-200 border border-purple-300/80 dark:border-purple-700/60 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Terlik Fırlat (Böcekleri Ez)"
        >
          {!slipperImgError ? (
            <img
              src={ASSETS.slipperDirect}
              alt="Terlik"
              referrerPolicy="no-referrer"
              className="w-5 h-5 object-contain"
              onError={() => setSlipperImgError(true)}
            />
          ) : (
            <span className="text-base">🩴</span>
          )}
          <span>Terlik</span>
        </button>

        {/* 💨 Fısfıs / Raid */}
        <button
          id="btn-spray-raid"
          onClick={(e) => {
            e.stopPropagation();
            onSprayRaid();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-950 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Fısfıs Sık (Böcekleri Zehirle)"
        >
          {!sprayImgError ? (
            <img
              src={ASSETS.sprayDirect}
              alt="Fısfıs"
              referrerPolicy="no-referrer"
              className="w-5 h-5 object-contain"
              onError={() => setSprayImgError(true)}
            />
          ) : (
            <span className="text-base">💨</span>
          )}
          <span>Fısfıs</span>
        </button>

        {/* 🍞 Kırıntılar (+10 Böcek Çeker) */}
        <button
          id="btn-drop-crumbs"
          onClick={(e) => {
            e.stopPropagation();
            onDropCrumbs();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/40 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-950 dark:text-yellow-200 border border-yellow-300/80 dark:border-yellow-700/60 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Ekmek Kırıntısı At (+10 Böcek Çağırır)"
        >
          {!crumbsImgError ? (
            <img
              src={ASSETS.crumbsDirect}
              alt="Kırıntılar"
              referrerPolicy="no-referrer"
              className="w-6 h-6 object-contain"
              onError={() => setCrumbsImgError(true)}
            />
          ) : (
            <span className="text-lg">🍞</span>
          )}
          <span>Kırıntı (+10)</span>
        </button>

        {/* ☠️ TÜM BÖCEKLERİ ÖLDÜR BUTONU */}
        <button
          id="btn-kill-all-cockroaches"
          onClick={(e) => {
            e.stopPropagation();
            onKillAllCockroaches();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-red-500/25"
          title="Tüm Hamamböceklerini Öldür (Toplu İtlaf)"
        >
          <Skull className="w-3.5 h-3.5 animate-pulse" />
          <span>Tümünü Öldür</span>
        </button>

        {/* 💡 Işık Aç/Kapat */}
        <button
          id="btn-toggle-lights"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLights();
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border shadow-sm ${
            isLightsOn
              ? 'bg-yellow-400 text-neutral-950 border-yellow-500'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 border-neutral-200 dark:border-neutral-700'
          }`}
          title="Işığı Aç / Kapat"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isLightsOn ? 'Işık Açık' : 'Işık'}</span>
        </button>

        {/* 🌓 Dark / Light Tema Değiştirici */}
        <button
          id="btn-toggle-theme"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDarkMode();
          }}
          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
          title={isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
        </button>

        {/* 👁️ BÖCEK GÖZÜ (Bug POV View) */}
        <button
          id="btn-toggle-bug-eye"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBugEye();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border shadow-sm ${
            isBugEyeActive
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/60'
          }`}
          title="Böcek Gözü Modu (Böceğin Birinci Şahıs Görüşüne Geç)"
        >
          <Eye className="w-4 h-4 animate-pulse" />
          <span>Böcek Gözü</span>
        </button>

        {/* 🔄 Sıfırla (Reset) */}
        <button
          id="btn-clear-board"
          onClick={(e) => {
            e.stopPropagation();
            onResetGame();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-700 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Oyunu Sıfırla (Tık sayısını ve tahtayı başlangıca döndür)"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sıfırla</span>
        </button>

        {/* 🔼 Barı Gizle / Kapat Butonu */}
        <button
          id="btn-collapse-navbar"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="flex items-center gap-1 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-neutral-200 dark:border-neutral-700 shadow-sm"
          title="Üst Menü Çubuğunu Gizle (Kapat)"
        >
          <ChevronUp className="w-4 h-4" />
          <span className="hidden md:inline">Gizle</span>
        </button>
      </div>
    </header>
  );
};
