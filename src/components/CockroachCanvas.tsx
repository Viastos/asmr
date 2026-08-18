import React, { useEffect, useRef } from 'react';
import { CockroachData } from '../types';

interface CockroachCanvasProps {
  cockroachesRef: React.MutableRefObject<CockroachData[]>;
  onCockroachClick?: (bugId: string, clientX: number, clientY: number) => void;
  isLightsOn: boolean;
  isDarkMode: boolean;
  cameraBugId?: string | null;
}

export const CockroachCanvas: React.FC<CockroachCanvasProps> = ({
  cockroachesRef,
  onCockroachClick,
  isLightsOn,
  cameraBugId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isLightsOnRef = useRef<boolean>(isLightsOn);
  const cameraBugIdRef = useRef<string | null | undefined>(cameraBugId);

  useEffect(() => {
    isLightsOnRef.current = isLightsOn;
  }, [isLightsOn]);

  useEffect(() => {
    cameraBugIdRef.current = cameraBugId;
  }, [cameraBugId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Smooth camera tracking variables for Bug POV Zoom
    let camX = window.innerWidth / 2;
    let camY = window.innerHeight / 2;
    let camZoom = 1.0;

    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fast, realistic drawing of a single cockroach without CPU-choking shadowBlur
    const drawBug = (bug: CockroachData, now: number) => {
      const { x, y, angle, size, state, legPhase, mutationType, diedAt } = bug;
      const isDead = state === 'dead';

      // Dead fade-out calculation
      let opacity = 1.0;
      if (isDead) {
        if (diedAt) {
          const elapsed = now - diedAt;
          opacity = Math.max(0, 0.85 * (1 - elapsed / 3500));
        } else {
          opacity = 0.8;
        }
      }

      if (opacity <= 0.01) return;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(((angle + 90) * Math.PI) / 180);

      const scale = size / 60;
      ctx.scale(scale, scale);

      // Fast color mapping
      let bodyColor = '#4a1906';
      let pronotumColor = '#662408';
      let wingLineColor = '#2d1003';
      let legColor = '#2b0f03';

      if (isDead) {
        bodyColor = '#374151';
        pronotumColor = '#4b5563';
        wingLineColor = '#1f2937';
        legColor = '#374151';
      } else if (mutationType === 'golden') {
        bodyColor = '#d97706';
        pronotumColor = '#fbbf24';
        wingLineColor = '#92400e';
        legColor = '#78350f';
      } else if (mutationType === 'radioactive') {
        bodyColor = '#16a34a';
        pronotumColor = '#22c55e';
        wingLineColor = '#14532d';
        legColor = '#15803d';
      } else if (mutationType === 'giant') {
        bodyColor = '#2e0f03';
        pronotumColor = '#451505';
        wingLineColor = '#170601';
        legColor = '#1c0701';
      }

      // Fast shadow ellipse (no blur pass)
      if (!isDead) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(2, 8, 17, 27, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Leg animations (tripod gait)
      const legMult = isDead ? 0 : state === 'scurrying' ? 1.6 : 1.0;
      const l1 = isDead ? -4 : Math.sin(legPhase * legMult) * 12;
      const l2 = isDead ? -6 : Math.sin(legPhase * legMult + Math.PI) * 12;
      const l3 = isDead ? -5 : Math.sin(legPhase * legMult + 0.5) * 12;
      const r1 = isDead ? -4 : Math.sin(legPhase * legMult + Math.PI) * 12;
      const r2 = isDead ? -6 : Math.sin(legPhase * legMult) * 12;
      const r3 = isDead ? -5 : Math.sin(legPhase * legMult + Math.PI + 0.5) * 12;

      // 1. LEGS (6 Articulated segmented legs)
      ctx.strokeStyle = legColor;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left Legs
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.quadraticCurveTo(-26 + l1 * 0.5, -22, -34 + l1, -30);
      ctx.moveTo(-12, 5);
      ctx.quadraticCurveTo(-28 + l2 * 0.5, 5, -38 + l2, 18);
      ctx.moveTo(-10, 20);
      ctx.quadraticCurveTo(-26 + l3 * 0.5, 30, -36 + l3, 44);

      // Right Legs
      ctx.moveTo(10, -10);
      ctx.quadraticCurveTo(26 + r1 * 0.5, -22, 34 + r1, -30);
      ctx.moveTo(12, 5);
      ctx.quadraticCurveTo(28 + r2 * 0.5, 5, 38 + r2, 18);
      ctx.moveTo(10, 20);
      ctx.quadraticCurveTo(26 + r3 * 0.5, 30, 36 + r3, 44);
      ctx.stroke();

      // 2. ANTENNAE (2 long twitching curves)
      const antTwitch = isDead ? 0 : Math.sin(legPhase * 1.6) * 6;
      ctx.strokeStyle = legColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-4, -28);
      ctx.bezierCurveTo(-14 + antTwitch, -45, -22 - antTwitch, -65, -30 + antTwitch, -75);
      ctx.moveTo(4, -28);
      ctx.bezierCurveTo(14 - antTwitch, -45, 22 + antTwitch, -65, 30 - antTwitch, -75);
      ctx.stroke();

      // 3. CERCI (Tail sensory spines)
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, 38);
      ctx.lineTo(-12, 48);
      ctx.moveTo(6, 38);
      ctx.lineTo(12, 48);
      ctx.stroke();

      // 4. BODY & ELYTRA
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 10, 16, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing center seam
      ctx.strokeStyle = wingLineColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 36);
      ctx.stroke();

      // Glossy highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(-5, 8, 4, 16, -0.15, 0, Math.PI * 0.8);
      ctx.stroke();

      // 5. PRONOTUM
      ctx.fillStyle = pronotumColor;
      ctx.beginPath();
      ctx.ellipse(0, -16, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pronotum shield pattern
      ctx.fillStyle = wingLineColor;
      ctx.beginPath();
      ctx.ellipse(0, -16, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 6. HEAD & EYES
      ctx.fillStyle = wingLineColor;
      ctx.beginPath();
      ctx.ellipse(0, -26, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tiny compound eyes
      ctx.fillStyle = isDead ? '#9ca3af' : '#111827';
      ctx.beginPath();
      ctx.arc(-4, -28, 1.6, 0, Math.PI * 2);
      ctx.arc(4, -28, 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Upright Nametag Badge for Special Characters (Atomfurki, Utkumuney, Onplayer, Mirmanu)
      const charLower = (bug.name || '').toLowerCase();
      const isMirmanu = charLower.includes('mirmanu');
      const isAtomfurki = charLower.includes('atomfurki');
      const isUtkumuney = charLower.includes('utkumuney');
      const isOnplayer = charLower.includes('onplayer');

      if (isMirmanu || isAtomfurki || isUtkumuney || isOnplayer) {
        ctx.save();
        ctx.globalAlpha = opacity;

        let labelText = bug.name;
        let badgeBg = 'rgba(15, 23, 42, 0.92)';
        let badgeBorder = '#f59e0b';
        let textColor = '#ffffff';
        let fontSize = 11;

        if (isMirmanu) {
          labelText = isDead ? '💀 Mirmanu' : '👑 Mirmanu';
          badgeBg = 'rgba(69, 10, 10, 0.94)';
          badgeBorder = '#ef4444';
          textColor = '#fef08a';
          fontSize = 13;
        } else if (isAtomfurki) {
          labelText = 'Atomfurki';
          badgeBg = 'rgba(30, 27, 75, 0.92)';
          badgeBorder = '#f59e0b';
          textColor = '#fde68a';
          fontSize = 11;
        } else if (isUtkumuney) {
          labelText = 'Utkumuney';
          badgeBg = 'rgba(8, 47, 73, 0.92)';
          badgeBorder = '#06b6d4';
          textColor = '#a5f3fc';
          fontSize = 11;
        } else if (isOnplayer) {
          labelText = 'Onplayer';
          badgeBg = 'rgba(59, 7, 100, 0.92)';
          badgeBorder = '#a855f7';
          textColor = '#e9d5ff';
          fontSize = 11;
        }

        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        const textWidth = ctx.measureText(labelText).width;
        const padX = isMirmanu ? 8 : 6;
        const padY = 3.5;
        const badgeW = textWidth + padX * 2;
        const badgeH = fontSize + padY * 2;
        const badgeX = x - badgeW / 2;
        const badgeY = y - (size * 0.72) - badgeH;

        // Draw shadow & badge container
        ctx.fillStyle = badgeBg;
        ctx.strokeStyle = badgeBorder;
        ctx.lineWidth = isMirmanu ? 2 : 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        ctx.fill();
        ctx.stroke();

        // Draw label text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, x, badgeY + badgeH / 2 + 0.5);

        ctx.restore();
      }
    };

    // Unified 60-120FPS physics + rendering loop
    const frameLoop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const curWallTime = Date.now();

      const bugs = cockroachesRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const lightMult = isLightsOnRef.current ? 2.0 : 1.0;

      // 1. Move insects in-place across full screen area
      for (let i = 0; i < bugs.length; i++) {
        const bug = bugs[i];
        if (bug.state === 'dead') continue;

        const dx = bug.targetX - bug.x;
        const dy = bug.targetY - bug.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let curSpeed = bug.speed * lightMult;
        if (bug.state === 'scurrying') curSpeed *= 1.6;

        if (dist > 6) {
          const step = Math.min(dist, curSpeed * 60 * dt);
          bug.x += (dx / dist) * step;
          bug.y += (dy / dist) * step;

          const targetAngleRad = Math.atan2(dy, dx);
          const targetAngleDeg = (targetAngleRad * 180) / Math.PI;

          let angleDiff = targetAngleDeg - bug.angle;
          while (angleDiff < -180) angleDiff += 360;
          while (angleDiff > 180) angleDiff -= 360;
          bug.angle += angleDiff * 0.22;

          bug.legPhase += curSpeed * 0.35;
        } else {
          // Dynamic full-room waypoint generation (corners, walls, open floor, cross-room dashes)
          const roll = Math.random();
          if (roll < 0.3) {
            // Wall or corner patrol
            const isHorizontal = Math.random() > 0.5;
            bug.targetX = isHorizontal ? 20 + Math.random() * (w - 40) : Math.random() > 0.5 ? 25 : w - 25;
            bug.targetY = !isHorizontal ? 20 + Math.random() * (h - 40) : Math.random() > 0.5 ? 25 : h - 25;
          } else if (roll < 0.65) {
            // Full room crossing dash
            bug.targetX = 20 + Math.random() * (w - 40);
            bug.targetY = 20 + Math.random() * (h - 40);
          } else {
            // Center wander
            bug.targetX = w * 0.15 + Math.random() * (w * 0.7);
            bug.targetY = h * 0.15 + Math.random() * (h * 0.7);
          }

          bug.speed = 2.5 + Math.random() * 3.8;
          bug.state = Math.random() < 0.25 ? 'scurrying' : 'crawling';
        }
      }

      // 2. Camera tracking & zooming for Bug POV
      const activeCamBugId = cameraBugIdRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (activeCamBugId) {
        const trackedBug = bugs.find((b) => b.id === activeCamBugId);
        if (trackedBug) {
          // Smooth camera tracking following the active bug
          camX += (trackedBug.x - camX) * 0.14;
          camY += (trackedBug.y - camY) * 0.14;
          camZoom += (3.2 - camZoom) * 0.12;
        } else {
          camZoom += (1.0 - camZoom) * 0.12;
        }
      } else {
        camZoom += (1.0 - camZoom) * 0.12;
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (camZoom > 1.05) {
        // Camera centered on tracked bug with zoom
        ctx.translate(w / 2, h / 2);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-camX, -camY);
      }

      for (let i = 0; i < bugs.length; i++) {
        drawBug(bugs[i], curWallTime);
      }

      ctx.restore();

      animId = requestAnimationFrame(frameLoop);
    };

    animId = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [cockroachesRef]);

  // Click detection on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bugs = cockroachesRef.current;
    for (let i = bugs.length - 1; i >= 0; i--) {
      const b = bugs[i];
      if (b.state === 'dead') continue;
      const dx = b.x - clickX;
      const dy = b.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = Math.max(b.size * 0.9, 32);

      if (dist <= hitRadius) {
        onCockroachClick?.(b.id, e.clientX, e.clientY);
        return;
      }
    }
  };

  return (
    <canvas
      id="cockroaches-simulation-canvas"
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="absolute inset-0 pointer-events-auto z-20 cursor-crosshair"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
