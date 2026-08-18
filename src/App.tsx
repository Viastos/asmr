import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ChevronDown, Eye } from 'lucide-react';
import { CockroachCanvas } from './components/CockroachCanvas';
import { AtomCenter } from './components/AtomCenter';
import { ControlBar } from './components/ControlBar';
import { BugEyeOverlay } from './components/BugEyeOverlay';
import { YouTubeBackgroundAudio } from './components/YouTubeBackgroundAudio';
import { AchievementToast } from './components/AchievementToast';
import { CockroachData, FloatingItem, Shockwave, BreadCrumb } from './types';
import { ASSETS, CHARACTER_PHRASES, getCharacterByClicks } from './data/characters';
import { COCKROACH_NAMES } from './data/randomContent';
import { sfx } from './utils/audio';

// Helper to generate initial 15 cockroaches
function createInitialCockroaches(): CockroachData[] {
  const initial: CockroachData[] = [];
  const count = 15;
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;

  const specialNames = ['Mirmanu', 'Atomfurki', 'Utkumuney', 'Onplayer'];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 160 + (i % 3) * 80;
    
    // Assign special character names to initial bugs
    let bugName: string;
    let bugSize: number;
    let bugMutation: 'giant' | 'golden' | 'radioactive' | 'normal' = 'normal';

    if (i === 0) {
      bugName = 'Mirmanu';
      bugSize = 100; // Mirmanu is large/giant
      bugMutation = 'giant';
    } else if (i === 1) {
      bugName = 'Atomfurki';
      bugSize = 54;
      bugMutation = 'golden';
    } else if (i === 2) {
      bugName = 'Utkumuney';
      bugSize = 54;
    } else if (i === 3) {
      bugName = 'Onplayer';
      bugSize = 54;
    } else {
      bugName = COCKROACH_NAMES[i % COCKROACH_NAMES.length];
      const isMirmanu = bugName.toLowerCase().includes('mirmanu');
      if (isMirmanu) {
        bugSize = 84;
        bugMutation = 'giant';
      } else {
        bugSize = 34 + (i % 4) * 5;
      }
    }

    initial.push({
      id: `init-bug-${Date.now()}-${i}`,
      x: w / 2 + Math.cos(angle) * radius,
      y: h / 2 + Math.sin(angle) * radius,
      angle: (angle * 180) / Math.PI + 90,
      targetX: w / 2 + Math.cos(angle) * radius,
      targetY: h / 2 + Math.sin(angle) * radius,
      speed: bugName === 'Mirmanu' ? 1.8 : 2.2 + (i % 4) * 0.8,
      size: bugSize,
      state: 'crawling',
      name: bugName,
      legPhase: i * 1.5,
      isOrbiting: false,
      mutationType: bugMutation,
    });
  }
  return initial;
}

export default function App() {
  const [clickCount, setClickCount] = useState<number>(0);
  const [isLightsOn, setIsLightsOn] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
  const [isBugEyeActive, setIsBugEyeActive] = useState<boolean>(false);
  const [trackedBugId, setTrackedBugId] = useState<string | null>(null);

  // State counters for navbar
  const [aliveCount, setAliveCount] = useState<number>(15);
  const [deadCount, setDeadCount] = useState<number>(0);

  // Toxic green spray haze/vignette effect on corners
  const [sprayVignette, setSprayVignette] = useState<boolean>(false);
  const sprayVignetteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref-based cockroaches state for 60-120fps lag-free canvas simulation
  const cockroachesRef = useRef<CockroachData[]>(createInitialCockroaches());

  // Breadcrumbs on floor
  const [crumbs, setCrumbs] = useState<BreadCrumb[]>([]);
  // Floating animated items (slippers, spray clouds, crumbs, readable phrases)
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  // Shockwaves / impact marks
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  const lastPhraseTimeRef = useRef<number>(0);
  const lastCounterSyncRef = useRef<number>(0);
  const screenShakeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active character based on clicks (cycles every 50 clicks: atomfurki -> utkumuney -> onplayer -> mirmanu -> atomfurki...)
  const activeChar = getCharacterByClicks(clickCount);
  const isMirmanuBoss = activeChar.name === 'mirmanu';

  // Apply dark mode directly to HTML and body tags for 100% reliable black theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.backgroundColor = '#000000';
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff';
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  // Sync counters helper (lightweight)
  const syncBugCounts = useCallback(() => {
    const bugs = cockroachesRef.current;
    let alive = 0;
    let dead = 0;
    for (let i = 0; i < bugs.length; i++) {
      if (bugs[i].state === 'dead') dead++;
      else alive++;
    }
    setAliveCount(alive);
    setDeadCount(dead);
  }, []);

  // Screen shake helper (lightweight and throttled)
  const triggerScreenShake = useCallback((durationMs: number = 180) => {
    if (screenShakeTimerRef.current) clearTimeout(screenShakeTimerRef.current);
    setScreenShake(true);
    screenShakeTimerRef.current = setTimeout(() => setScreenShake(false), durationMs);
  }, []);

  // Highly optimized Boss Hit (Single click during boss mode: fast, zero lag, GPU accelerated)
  const triggerBossHit = useCallback(
    (originX: number, originY: number) => {
      sfx.playBossExplosion();
      triggerScreenShake(120);

      const now = Date.now();
      const waveColors = ['#ef4444', '#f59e0b', '#fbbf24', '#dc2626'];
      const color = waveColors[Math.floor(Math.random() * waveColors.length)];

      setShockwaves((prev) => [
        ...prev.slice(-3),
        { id: `boss-hit-${now}-${Math.random()}`, x: originX, y: originY, color, createdAt: now },
      ]);
    },
    [triggerScreenShake]
  );

  // Trigger epic final boss major milestone explosions (Boss Awakening & Grand Finale only)
  const triggerBossExplosion = useCallback(
    (originX: number, originY: number, isGrandFinale: boolean = false) => {
      sfx.playBossExplosion();
      triggerScreenShake(isGrandFinale ? 500 : 250);

      const now = Date.now();
      const explosionColors = ['#ef4444', '#f59e0b', '#fbbf24', '#dc2626', '#7c3aed'];

      const newWaves: Shockwave[] = [
        { id: `boss-wave-${now}-1`, x: originX, y: originY, color: '#ef4444', createdAt: now },
        { id: `boss-wave-${now}-2`, x: originX, y: originY, color: '#f59e0b', createdAt: now + 40 },
      ];

      if (isGrandFinale) {
        newWaves.push({ id: `boss-wave-${now}-3`, x: originX, y: originY, color: '#8b5cf6', createdAt: now + 80 });
      }

      setShockwaves((prev) => [...prev.slice(-3), ...newWaves]);

      // Optimized confetti burst
      confetti({
        particleCount: isGrandFinale ? 120 : 50,
        spread: isGrandFinale ? 140 : 90,
        origin: {
          x: originX / window.innerWidth,
          y: originY / window.innerHeight,
        },
        colors: explosionColors,
        disableForReducedMotion: true,
      });
    },
    [triggerScreenShake]
  );

  // Spawn random character phrase at safe readable spots across the screen
  const spawnTrollItem = useCallback(
    (customX?: number, customY?: number, customText?: string) => {
      const now = Date.now();

      // If user rapid clicks, throttle phrase spawning so text remains completely readable & lightweight
      if (!customText && now - lastPhraseTimeRef.current < 450) {
        return;
      }
      lastPhraseTimeRef.current = now;

      const w = typeof window !== 'undefined' ? window.innerWidth : 800;
      const h = typeof window !== 'undefined' ? window.innerHeight : 600;

      let spawnX = customX;
      let spawnY = customY;

      if (!customText || !customX || !customY) {
        const sectors = [
          { x: 180 + Math.random() * (w * 0.25), y: 140 + Math.random() * 120 },
          { x: w * 0.65 + Math.random() * (w * 0.2), y: 140 + Math.random() * 120 },
          { x: 160 + Math.random() * (w * 0.2), y: h * 0.45 + Math.random() * 120 },
          { x: w * 0.68 + Math.random() * (w * 0.2), y: h * 0.45 + Math.random() * 120 },
          { x: 180 + Math.random() * (w * 0.25), y: h * 0.72 + Math.random() * 100 },
          { x: w * 0.62 + Math.random() * (w * 0.25), y: h * 0.72 + Math.random() * 100 },
        ];
        const selected = sectors[Math.floor(Math.random() * sectors.length)];
        spawnX = selected.x;
        spawnY = selected.y;
      }

      const phrases = CHARACTER_PHRASES[activeChar.name] || CHARACTER_PHRASES.atomfurki;
      const phrase = customText || phrases[Math.floor(Math.random() * phrases.length)];

      const newItem: FloatingItem = {
        id: `item-${now}-p-${Math.random()}`,
        x: Math.min(Math.max(spawnX, 140), w - 160),
        y: Math.min(Math.max(spawnY, 120), h - 140),
        vx: 0,
        vy: 0,
        rotation: (Math.random() - 0.5) * 2,
        vRot: 0,
        scale: 1,
        type: 'text',
        content: phrase,
        createdAt: now,
        lifetime: 3200,
      };

      setFloatingItems((prev) => [
        ...prev.filter((i) => i.type !== 'text').slice(-6),
        ...prev.filter((i) => i.type === 'text').slice(-2),
        newItem,
      ]);
    },
    [activeChar.name]
  );

  // Dynamic crumb consumption loop: cockroaches eat crumbs progressively until crumbs disappear completely
  useEffect(() => {
    const eatingInterval = setInterval(() => {
      setCrumbs((prevCrumbs) => {
        if (prevCrumbs.length === 0) return prevCrumbs;
        const bugs = cockroachesRef.current;
        let hasChanges = false;

        const nextCrumbs = prevCrumbs
          .map((crumb) => {
            const currentBites = crumb.bitesLeft ?? 24;
            const maxBites = crumb.maxBites ?? 24;

            // Count how many living bugs are near this crumb
            let eatingBugCount = 0;
            bugs.forEach((b) => {
              if (b.state === 'dead') return;
              const dx = b.x - crumb.x;
              const dy = b.y - crumb.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 85) {
                eatingBugCount++;
                b.state = 'eating';
              }
            });

            if (eatingBugCount > 0) {
              hasChanges = true;
              const bitesTaken = Math.min(currentBites, Math.max(1, Math.min(eatingBugCount, 3)));
              const newBites = currentBites - bitesTaken;

              if (newBites <= 0) {
                // Crumb completely eaten and finished!
                sfx.playPop();
                spawnTrollItem(crumb.x, crumb.y - 40, '😋 KIRINTI BİTTİ! (YUTULDU)');
                // Disperse eating bugs across room
                bugs.forEach((b) => {
                  if (b.state === 'eating') {
                    b.state = 'scurrying';
                    b.speed = 4 + Math.random() * 4;
                    b.targetX = 20 + Math.random() * (window.innerWidth - 40);
                    b.targetY = 20 + Math.random() * (window.innerHeight - 40);
                  }
                });
                return null;
              }

              return {
                ...crumb,
                bitesLeft: newBites,
                scale: Math.max(0.18, newBites / maxBites),
              };
            }

            return crumb;
          })
          .filter((c): c is BreadCrumb => c !== null);

        return hasChanges ? nextCrumbs : prevCrumbs;
      });
    }, 400);

    return () => clearInterval(eatingInterval);
  }, [spawnTrollItem]);

  // General Screen Click handler
  const handleScreenClick = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    setClickCount((prev) => {
      const next = prev + 1;

      // Special Boss Transition at 150 clicks in cycle: Boss Entrance Explosion!
      if (next % 300 === 150) {
        triggerBossExplosion(window.innerWidth / 2, window.innerHeight / 2, true);
        spawnTrollItem(
          window.innerWidth / 2,
          window.innerHeight / 2 - 80,
          '👑 FINAL BOSS: MİRMANU UYANDI! KRALİYET İSTİLASI BAŞLADI (150 TIK CANI VAR)!'
        );
      }
      // Special Finale at 300 clicks: Mirmanu Defeated (after 150 hard boss clicks) & Loops back to atomfurki
      else if (next % 300 === 0) {
        triggerBossExplosion(window.innerWidth / 2, window.innerHeight / 2, true);
        spawnTrollItem(
          window.innerWidth / 2,
          window.innerHeight / 2 - 80,
          '🎆 FINAL BOSS MAĞLUP EDİLDİ! EFSANEVİ BAŞLANGIÇ (atomfurki)!'
        );
      }
      // Periodic boss milestone confetti (every 25 hits during boss)
      else if (next % 300 > 150 && next % 25 === 0) {
        confetti({
          particleCount: 25,
          spread: 70,
          origin: { x: x / window.innerWidth, y: y / window.innerHeight },
          colors: ['#ef4444', '#f59e0b', '#fbbf24'],
          disableForReducedMotion: true,
        });
      }
      // Standard milestone celebration every 50 clicks outside boss
      else if (next % 50 === 0) {
        confetti({
          particleCount: 60,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#b45309', '#f59e0b', '#dc2626', '#16a34a'],
          disableForReducedMotion: true,
        });
      }
      return next;
    });

    if (isMirmanuBoss) {
      triggerBossHit(x, y);
    } else {
      sfx.playRandomClickSound();
      setShockwaves((prev) => [
        ...prev.slice(-3),
        {
          id: `shock-${Date.now()}-${Math.random()}`,
          x,
          y,
          color: isDarkMode ? '#f59e0b' : '#d97706',
          createdAt: Date.now(),
        },
      ]);
    }

    spawnTrollItem();

    // Scatter nearby cockroaches
    cockroachesRef.current.forEach((bug) => {
      if (bug.state === 'dead') return;
      const dx = bug.x - x;
      const dy = bug.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220) {
        const pushAngle = Math.atan2(dy, dx);
        bug.targetX = Math.min(Math.max(bug.x + Math.cos(pushAngle) * 180, 40), window.innerWidth - 40);
        bug.targetY = Math.min(Math.max(bug.y + Math.sin(pushAngle) * 180, 40), window.innerHeight - 40);
        bug.speed = isLightsOn ? 13 : 8;
        bug.state = 'scurrying';
      }
    });
  };

  // Cockroach Click Handler
  const handleCockroachClick = (bugId: string, clientX: number, clientY: number) => {
    sfx.playCockroachScurry();
    sfx.playSqueak();

    if (isMirmanuBoss) {
      triggerBossHit(clientX, clientY);
    }

    spawnTrollItem(clientX, clientY);

    cockroachesRef.current.forEach((bug) => {
      if (bug.id === bugId && bug.state !== 'dead') {
        const escapeAngle = Math.random() * Math.PI * 2;
        bug.targetX = Math.min(Math.max(bug.x + Math.cos(escapeAngle) * 280, 50), window.innerWidth - 50);
        bug.targetY = Math.min(Math.max(bug.y + Math.sin(escapeAngle) * 280, 50), window.innerHeight - 50);
        bug.speed = 11;
        bug.state = 'scurrying';
      }
    });
  };

  // Character Center Click (Atom Button)
  const handleAtomClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next % 300 === 150 || next % 300 === 0) {
        triggerBossExplosion(window.innerWidth / 2, window.innerHeight / 2, true);
      } else if (next % 50 === 0) {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#b45309', '#f59e0b', '#dc2626', '#16a34a'],
          disableForReducedMotion: true,
        });
      }
      return next;
    });

    if (isMirmanuBoss) {
      triggerBossHit(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      sfx.playBoing();
      sfx.playCockroachScurry();
    }

    spawnTrollItem();

    // Scatter living roaches
    cockroachesRef.current.forEach((bug) => {
      if (bug.state === 'dead') return;
      const randA = Math.random() * Math.PI * 2;
      bug.targetX = window.innerWidth / 2 + Math.cos(randA) * 320;
      bug.targetY = window.innerHeight / 2 + Math.sin(randA) * 320;
      bug.speed = 8.5;
      bug.state = 'scurrying';
    });
  };

  // Helper to spawn additional cockroaches
  const spawnCockroachesCount = (count: number, targetNearX?: number, targetNearY?: number) => {
    const newBugs: CockroachData[] = [];
    const centerX = targetNearX || window.innerWidth / 2;
    const centerY = targetNearY || window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const id = `swarm-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
      const randomName = COCKROACH_NAMES[Math.floor(Math.random() * COCKROACH_NAMES.length)];
      const startSide = Math.floor(Math.random() * 4);
      let startX = 0;
      let startY = 0;

      if (startSide === 0) {
        startX = Math.random() * window.innerWidth;
        startY = -40;
      } else if (startSide === 1) {
        startX = window.innerWidth + 40;
        startY = Math.random() * window.innerHeight;
      } else if (startSide === 2) {
        startX = Math.random() * window.innerWidth;
        startY = window.innerHeight + 40;
      } else {
        startX = -40;
        startY = Math.random() * window.innerHeight;
      }

      const isMutant = Math.random() < 0.25;
      const isMirmanu = randomName.toLowerCase().includes('mirmanu');
      const isNamedHero =
        randomName.toLowerCase().includes('atomfurki') ||
        randomName.toLowerCase().includes('utkumuney') ||
        randomName.toLowerCase().includes('onplayer');

      const bugSize = isMirmanu
        ? 84 + Math.random() * 16
        : isNamedHero
        ? 52 + Math.random() * 6
        : isMutant
        ? 48 + Math.random() * 12
        : 34 + Math.random() * 12;

      newBugs.push({
        id,
        x: startX,
        y: startY,
        angle: Math.random() * 360,
        targetX: centerX + (Math.random() - 0.5) * 200,
        targetY: centerY + (Math.random() - 0.5) * 200,
        speed: isMirmanu ? 2.5 + Math.random() * 1.5 : 3.5 + Math.random() * 3.5,
        size: bugSize,
        state: 'scurrying',
        name: randomName,
        legPhase: Math.random() * 10,
        isOrbiting: false,
        mutationType: isMirmanu ? 'giant' : isMutant ? 'radioactive' : 'normal',
      });
    }

    cockroachesRef.current = [...cockroachesRef.current, ...newBugs];
    syncBugCounts();
  };

  // Add swarm (+5 or +20)
  const handleAddSwarm = (count: number) => {
    sfx.playInvasionHorn();
    sfx.playCockroachScurry();

    confetti({
      particleCount: count * 3,
      spread: 100,
      origin: { y: 0.85 },
      colors: ['#78350f', '#b45309', '#f59e0b'],
    });

    spawnCockroachesCount(count);

    spawnTrollItem(
      window.innerWidth / 2,
      window.innerHeight / 2 - 80,
      `🚨 +${count} YENİ HAMAMBÖCEĞİ GELDİ!`
    );
  };

  // Slipper Action (Kills cockroaches in impact radius)
  const handleThrowSlipper = () => {
    sfx.playSlipperSlap();
    triggerScreenShake(320);

    // Haptic feedback for touch devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // ignore
      }
    }

    const targetX = window.innerWidth * 0.25 + Math.random() * (window.innerWidth * 0.5);
    const targetY = window.innerHeight * 0.25 + Math.random() * (window.innerHeight * 0.5);
    const now = Date.now();

    setFloatingItems((prev) => [
      ...prev.slice(-12),
      {
        id: `slipper-${now}`,
        x: targetX,
        y: targetY - 40,
        vx: 0,
        vy: 3.5,
        rotation: (Math.random() - 0.5) * 45,
        vRot: (Math.random() - 0.5) * 6,
        scale: 1.3,
        type: 'slipper',
        createdAt: now,
        lifetime: 1400,
        imageUrl: ASSETS.slipperDirect,
      },
    ]);

    setShockwaves((prev) => [
      ...prev.slice(-8),
      {
        id: `slipper-shock-${now}`,
        x: targetX,
        y: targetY,
        color: '#dc2626',
        createdAt: now,
      },
    ]);

    let killedBySlipper = 0;
    cockroachesRef.current.forEach((b) => {
      if (b.state === 'dead') return;
      const dx = b.x - targetX;
      const dy = b.y - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 260 || (killedBySlipper < 5 && Math.random() < 0.45)) {
        killedBySlipper++;
        b.state = 'dead';
        b.diedAt = now;
        b.speed = 0;
      } else {
        const escAngle = Math.random() * Math.PI * 2;
        b.targetX = Math.min(Math.max(b.x + Math.cos(escAngle) * 260, 50), window.innerWidth - 50);
        b.targetY = Math.min(Math.max(b.y + Math.sin(escAngle) * 260, 50), window.innerHeight - 50);
        b.speed = 10;
        b.state = 'scurrying';
      }
    });

    syncBugCounts();

    spawnTrollItem(
      targetX,
      targetY - 60,
      killedBySlipper > 0 ? `💥 ŞLAAAP! ${killedBySlipper} BÖCEK EZİLDİ!` : '💨 ISKALADIN! BÖCEKLER KAÇTI!'
    );
  };

  // Raid Spray Action
  const handleSprayRaid = () => {
    sfx.playRaidSpray();

    // Trigger toxic green screen corners/edges haze
    if (sprayVignetteTimerRef.current) clearTimeout(sprayVignetteTimerRef.current);
    setSprayVignette(true);
    sprayVignetteTimerRef.current = setTimeout(() => {
      setSprayVignette(false);
    }, 2200);

    const now = Date.now();
    const sprayPositions = [
      { x: window.innerWidth * 0.35, y: window.innerHeight * 0.4 },
      { x: window.innerWidth * 0.65, y: window.innerHeight * 0.4 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.65 },
    ];

    setFloatingItems((prev) => [
      ...prev.slice(-10),
      ...sprayPositions.map((pos, idx) => ({
        id: `raid-cloud-${now}-${idx}`,
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5,
        rotation: (Math.random() - 0.5) * 20,
        vRot: (Math.random() - 0.5) * 2,
        scale: 1.4,
        type: 'raid_cloud' as const,
        createdAt: now,
        lifetime: 1800,
        imageUrl: ASSETS.sprayDirect,
      })),
    ]);

    let poisonKilled = 0;
    cockroachesRef.current.forEach((b) => {
      if (b.state === 'dead') return;
      if (Math.random() < 0.7) {
        poisonKilled++;
        b.state = 'dead';
        b.diedAt = now;
        b.speed = 0;
      } else {
        b.speed = b.speed * 1.4;
        b.state = 'scurrying';
      }
    });

    syncBugCounts();

    spawnTrollItem(
      window.innerWidth / 2,
      window.innerHeight / 2 - 90,
      `💨 PSSSHHH! ${poisonKilled} BÖCEK ZEHİRLENDİ!`
    );
  };

  // Breadcrumbs Action
  const handleDropCrumbs = () => {
    sfx.playMunch();

    const crumbX = window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6);
    const crumbY = window.innerHeight * 0.25 + Math.random() * (window.innerHeight * 0.5);

    setCrumbs((prev) => [
      ...prev.slice(-3),
      {
        id: `crumb-${Date.now()}`,
        x: crumbX,
        y: crumbY,
        bitesLeft: 24,
        maxBites: 24,
        scale: 1,
        createdAt: Date.now(),
      },
    ]);

    spawnCockroachesCount(10, crumbX, crumbY);

    cockroachesRef.current.forEach((bug) => {
      if (bug.state === 'dead') return;
      bug.targetX = crumbX + (Math.random() - 0.5) * 60;
      bug.targetY = crumbY + (Math.random() - 0.5) * 60;
      bug.speed = 7.5;
      bug.state = 'eating';
    });

    spawnTrollItem(
      crumbX,
      crumbY - 60,
      '🍞 EKMEK KIRINTISI ATILDI! (+10 BÖCEK KOŞUYOR!)'
    );
  };

  // Mass Extermination Action
  const handleKillAllCockroaches = () => {
    sfx.playRaidSpray();
    sfx.playSlipperSlap();

    const now = Date.now();

    setShockwaves((prev) => [
      ...prev.slice(-6),
      {
        id: `exterm-shock-${now}-1`,
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5,
        color: '#dc2626',
        createdAt: now,
      },
      {
        id: `exterm-shock-${now}-2`,
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5,
        color: '#ef4444',
        createdAt: now,
      },
    ]);

    cockroachesRef.current.forEach((b) => {
      b.state = 'dead';
      b.diedAt = now;
      b.speed = 0;
    });

    syncBugCounts();

    spawnTrollItem(
      window.innerWidth / 2,
      window.innerHeight / 2,
      '☠️ TÜM BÖCEKLER İTLAF EDİLDİ!'
    );

    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#ef4444', '#7f1d1d', '#1f2937'],
    });
  };

  // Reset Action
  const handleResetGame = () => {
    sfx.playPop();
    setClickCount(0);
    setFloatingItems([]);
    setShockwaves([]);
    setCrumbs([]);
    cockroachesRef.current = createInitialCockroaches();
    syncBugCounts();

    spawnTrollItem(
      window.innerWidth / 2,
      window.innerHeight / 2,
      '🔄 OYUN SIFIRLANDI! (atomfurki Başlangıç)'
    );
  };

  // Toggle Lights Action
  const handleToggleLights = () => {
    sfx.playLightSwitch();
    setIsLightsOn((prev) => {
      const next = !prev;
      if (next) {
        sfx.playCockroachScurry();
        sfx.playSqueak();
        spawnTrollItem(
          window.innerWidth / 2,
          window.innerHeight / 2,
          '💡 IŞIK AÇILDI! BÖCEKLER KAÇIŞIYOR!'
        );

        cockroachesRef.current.forEach((b) => {
          if (b.state === 'dead') return;
          const cornerX = Math.random() < 0.5 ? 50 : window.innerWidth - 50;
          const cornerY = Math.random() < 0.5 ? 70 : window.innerHeight - 70;
          b.targetX = cornerX + (Math.random() - 0.5) * 80;
          b.targetY = cornerY + (Math.random() - 0.5) * 80;
          b.speed = 12;
          b.state = 'scurrying';
        });
      } else {
        spawnTrollItem(
          window.innerWidth / 2,
          window.innerHeight / 2,
          '🌑 IŞIK KAPANDI!'
        );
      }
      return next;
    });
  };

  // Lightweight UI & Physics cleanup loop (Runs at low frequency, zero UI lag, 0% CPU impact)
  useEffect(() => {
    const interval = setInterval(() => {
      const curWallTime = Date.now();

      // Dead bug cleanup check
      let hasDeadCleanup = false;
      const bugs = cockroachesRef.current;
      for (let i = 0; i < bugs.length; i++) {
        if (bugs[i].state === 'dead' && bugs[i].diedAt && curWallTime - bugs[i].diedAt >= 3500) {
          hasDeadCleanup = true;
          break;
        }
      }

      if (hasDeadCleanup) {
        cockroachesRef.current = bugs.filter((bug) => {
          if (bug.state === 'dead' && bug.diedAt) {
            return curWallTime - bug.diedAt < 3500;
          }
          return true;
        });
        syncBugCounts();
      }

      // Sync alive/dead counter
      if (curWallTime - lastCounterSyncRef.current > 600) {
        lastCounterSyncRef.current = curWallTime;
        syncBugCounts();
      }

      // Expire floating items
      setFloatingItems((prev) => prev.filter((item) => curWallTime - item.createdAt < item.lifetime));

      // Expire shockwaves
      setShockwaves((prev) => prev.filter((sw) => curWallTime - sw.createdAt < 650));
    }, 400);

    return () => clearInterval(interval);
  }, [syncBugCounts]);

  return (
    <main
      id="cockroach-app-container"
      onClick={handleScreenClick}
      className={`relative w-full h-screen overflow-hidden select-none cursor-crosshair transition-colors duration-500 ${
        isDarkMode ? 'dark' : ''
      } ${screenShake ? 'animate-screen-shake' : ''}`}
      style={{
        backgroundColor: isDarkMode
          ? isLightsOn
            ? '#0a0a0a'
            : '#000000'
          : isLightsOn
          ? '#fffbeb'
          : '#ffffff',
      }}
    >
      {/* Hidden Dual YouTube Background Audio (Demokratik Kongo + Mirmanu Thematic Boss Layer) */}
      <YouTubeBackgroundAudio isMirmanuBoss={isMirmanuBoss} />

      {/* 💨 Toxic Green Raid Spray Corner & Edge Fog Vignette */}
      <div
        className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-700 ${
          sprayVignette ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          boxShadow: 'inset 0 0 110px rgba(34, 197, 94, 0.6), inset 0 0 200px rgba(16, 185, 129, 0.38)',
        }}
      >
        {/* Top-Left Corner Toxic Fog */}
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-emerald-500/35 blur-3xl pointer-events-none" />
        {/* Top-Right Corner Toxic Fog */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-green-500/35 blur-3xl pointer-events-none" />
        {/* Bottom-Left Corner Toxic Fog */}
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-lime-500/35 blur-3xl pointer-events-none" />
        {/* Bottom-Right Corner Toxic Fog */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/35 blur-3xl pointer-events-none" />
      </div>

      {/* Mirmanu Final Boss Screen Border Glowing Aura */}
      {isMirmanuBoss && (
        <div className="absolute inset-0 pointer-events-none z-30 border-4 md:border-8 border-red-500/30 animate-pulse shadow-[inset_0_0_60px_rgba(239,68,68,0.4)]" />
      )}

      {/* Subtle floor tile grid (light vs pitch dark adaptation) */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDarkMode
            ? 'opacity-[0.03] bg-[linear-gradient(to_right,#555_1px,transparent_1px),linear-gradient(to_bottom,#555_1px,transparent_1px)] bg-[size:4rem_4rem]'
            : 'opacity-[0.035] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]'
        }`}
      />

      {/* Top Navbar & Action Controls */}
      {isNavbarVisible ? (
        <ControlBar
          clickCount={clickCount}
          aliveCount={aliveCount}
          deadCount={deadCount}
          isLightsOn={isLightsOn}
          isDarkMode={isDarkMode}
          isBugEyeActive={isBugEyeActive}
          onAddSwarm={handleAddSwarm}
          onThrowSlipper={handleThrowSlipper}
          onSprayRaid={handleSprayRaid}
          onDropCrumbs={handleDropCrumbs}
          onKillAllCockroaches={handleKillAllCockroaches}
          onToggleLights={handleToggleLights}
          onToggleDarkMode={() => setIsDarkMode((d) => !d)}
          onResetGame={handleResetGame}
          onToggleBugEye={() => setIsBugEyeActive((b) => !b)}
          onToggleCollapse={() => setIsNavbarVisible(false)}
        />
      ) : (
        /* Collapsed Navbar Floating Quick Action Bar */
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-neutral-900/95 border border-neutral-300/80 dark:border-neutral-700 rounded-2xl shadow-2xl backdrop-blur-md max-w-[96vw] overflow-x-auto select-none">
          {/* Menüyü Aç */}
          <button
            id="btn-open-navbar"
            onClick={(e) => {
              e.stopPropagation();
              setIsNavbarVisible(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="Üst Menü Çubuğunu Aç"
          >
            <ChevronDown className="w-4 h-4 text-amber-500 animate-bounce" />
            <span className="hidden sm:inline">Menüyü Aç</span>
          </button>

          {/* 🩴 Terlik */}
          <button
            id="btn-quick-slipper"
            onClick={(e) => {
              e.stopPropagation();
              handleThrowSlipper();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md whitespace-nowrap"
            title="Terlik Fırlat (10-25 Böcek Ezilir)"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/95 dark:bg-neutral-900/95 shadow-sm border border-amber-300 dark:border-amber-700/60 p-0.5 shrink-0">
              <img src={ASSETS.slipperDirect} alt="Terlik" className="w-5 h-5 object-contain" />
            </span>
            <span>Terlik</span>
          </button>

          {/* 💨 Fısfıs */}
          <button
            id="btn-quick-raid"
            onClick={(e) => {
              e.stopPropagation();
              handleSprayRaid();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md whitespace-nowrap"
            title="Fısfıs Sık (Böcekleri Zehirle)"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/95 dark:bg-neutral-900/95 shadow-sm border border-emerald-300 dark:border-emerald-700/60 p-0.5 shrink-0">
              <img src={ASSETS.sprayDirect} alt="Fısfıs" className="w-5 h-5 object-contain" />
            </span>
            <span>Fısfıs</span>
          </button>

          {/* 🍞 Kırıntı */}
          <button
            id="btn-quick-crumbs"
            onClick={(e) => {
              e.stopPropagation();
              handleDropCrumbs();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md whitespace-nowrap"
            title="Kırıntı Dök (Böcekleri Çek)"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/95 dark:bg-neutral-900/95 shadow-sm border border-orange-300 dark:border-orange-700/60 p-0.5 shrink-0">
              <img src={ASSETS.crumbsDirect} alt="Kırıntı" className="w-5 h-5 object-contain" />
            </span>
            <span>Kırıntı</span>
          </button>

          {/* +5 Böcek */}
          <button
            id="btn-quick-add-5"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSwarm(5);
            }}
            className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-mono font-bold border border-neutral-300 dark:border-neutral-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="5 Böcek Ekle"
          >
            +5
          </button>

          {/* +20 Böcek */}
          <button
            id="btn-quick-add-20"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSwarm(20);
            }}
            className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-mono font-bold border border-neutral-300 dark:border-neutral-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="20 Böcek Ekle"
          >
            +20
          </button>

          {/* ☠️ Tümünü Öldür */}
          <button
            id="btn-quick-kill-all"
            onClick={(e) => {
              e.stopPropagation();
              handleKillAllCockroaches();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm whitespace-nowrap"
            title="Tüm Böcekleri Öldür"
          >
            <span>☠️ Tümünü Öldür</span>
          </button>

          {/* 👁️ Böcek Gözü */}
          <button
            id="btn-quick-bugeye"
            onClick={(e) => {
              e.stopPropagation();
              setIsBugEyeActive((b) => !b);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
              isBugEyeActive
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/60'
            }`}
            title="Böcek Gözü Modu (POV)"
          >
            <Eye className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Böcek Gözü</span>
          </button>
        </div>
      )}

      {/* 👁️ Full-Screen Insect POV Bug Eye Overlay */}
      {isBugEyeActive && (
        <BugEyeOverlay
          cockroachesRef={cockroachesRef}
          isLightsOn={isLightsOn}
          isDarkMode={isDarkMode}
          trackedBugId={trackedBugId}
          onTrackedBugChange={setTrackedBugId}
          onClose={() => setIsBugEyeActive(false)}
        />
      )}

      {/* Centerpiece Character (atomfurki -> utkumuney -> onplayer -> mirmanu -> loops) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <AtomCenter
          clickCount={clickCount}
          onAtomClick={handleAtomClick}
          isInfestedMode={isLightsOn || aliveCount > 25}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Large Bread Crumbs on Floor with Real-Time Progressive Eating & Vanishing */}
      {crumbs.map((c) => {
        const scale = c.scale ?? 1;
        const bitesLeft = c.bitesLeft ?? 24;
        const maxBites = c.maxBites ?? 24;
        const percent = Math.round((bitesLeft / maxBites) * 100);

        return (
          <div
            key={c.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 flex flex-col items-center"
            style={{
              left: `${c.x}px`,
              top: `${c.y}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <img
              src={ASSETS.crumbsDirect}
              alt="Kırıntı"
              referrerPolicy="no-referrer"
              className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl select-none"
              onError={(e) => {
                (e.currentTarget.parentNode as HTMLElement).innerHTML =
                  '<span class="text-7xl md:text-8xl drop-shadow-2xl select-none">🍞</span>';
              }}
            />
            <div className="bg-neutral-950/85 border border-amber-500/70 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-md mt-[-8px]">
              🍞 %{percent}
            </div>
          </div>
        );
      })}

      {/* Ultra High-Performance HTML5 Canvas Cockroaches Simulation (Lag-Free 60-120FPS with 300+ Bugs) */}
      <CockroachCanvas
        cockroachesRef={cockroachesRef}
        onCockroachClick={handleCockroachClick}
        isLightsOn={isLightsOn}
        isDarkMode={isDarkMode}
        cameraBugId={isBugEyeActive ? trackedBugId : null}
      />

      {/* Shockwaves / Impact Rings (GPU Accelerated CSS Animation) */}
      {shockwaves.map((sw) => {
        const size = isMirmanuBoss ? 240 : 140;
        return (
          <div
            key={sw.id}
            className="absolute rounded-full pointer-events-none animate-shockwave"
            style={{
              left: `${sw.x}px`,
              top: `${sw.y}px`,
              width: `${size}px`,
              height: `${size}px`,
              border: `3px solid ${sw.color}`,
              boxShadow: `0 0 14px ${sw.color}`,
            }}
          />
        );
      })}

      {/* Floating Animated Slippers, Raid Clouds, Highly Readable Phrases (GPU Accelerated) */}
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className={`absolute pointer-events-none z-40 ${
            item.type === 'text' ? 'animate-float-text' : 'animate-float-item'
          }`}
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
          }}
        >
          {item.type === 'slipper' ? (
            <div className="relative animate-bounce" style={{ animationDuration: '0.6s' }}>
              <img
                src={item.imageUrl || ASSETS.slipperDirect}
                alt="Terlik"
                referrerPolicy="no-referrer"
                className="w-60 h-60 object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.45)] select-none"
                onError={(e) => {
                  (e.currentTarget.parentNode as HTMLElement).innerHTML =
                    '<span class="text-9xl drop-shadow-[0_25px_30px_rgba(0,0,0,0.45)] select-none">🩴</span>';
                }}
              />
            </div>
          ) : item.type === 'raid_cloud' ? (
            <div className="flex items-center gap-1 opacity-90 animate-pulse">
              <img
                src={item.imageUrl || ASSETS.sprayDirect}
                alt="Fısfıs"
                referrerPolicy="no-referrer"
                className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_6px_20px_rgba(34,197,94,0.65)] select-none"
                onError={(e) => {
                  (e.currentTarget.parentNode as HTMLElement).innerHTML =
                    '<span class="text-6xl md:text-7xl drop-shadow-[0_6px_20px_rgba(34,197,94,0.65)] select-none">💨</span>';
                }}
              />
            </div>
          ) : (
            <div className="px-5 py-2.5 rounded-2xl text-sm md:text-base font-extrabold tracking-wide shadow-[0_10px_35px_rgba(0,0,0,0.25)] border-2 border-amber-500/90 bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-amber-200 whitespace-nowrap drop-shadow-lg backdrop-blur-md">
              💬 {item.content}
            </div>
          )}
        </div>
      ))}

      {/* Bottom Floating Random Achievements Toast (Triggers on user clicks) */}
      <AchievementToast clickCount={clickCount} isDarkMode={isDarkMode} />
    </main>
  );
}
