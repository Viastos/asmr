export interface CockroachData {
  id: string;
  x: number;
  y: number;
  angle: number; // degrees
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  state: 'crawling' | 'scurrying' | 'eating' | 'dancing' | 'dead_pretend' | 'dead' | 'mutated';
  name: string;
  legPhase: number;
  orbitAngle?: number;
  orbitRadius?: number;
  isOrbiting: boolean;
  zone?: string;
  mutationType?: 'giant' | 'golden' | 'radioactive' | 'normal';
  diedAt?: number;
}

export interface ZoneData {
  id: string;
  name: string;
  emoji: string;
  description: string;
  xPercent: number;
  yPercent: number;
  dangerLevel: string;
  trollFact: string;
}

export interface FloatingItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  type: 'emoji' | 'text' | 'slipper' | 'crumb' | 'raid_cloud';
  content: string;
  imageUrl?: string;
  color?: string;
  createdAt: number;
  lifetime: number;
}

export interface BreadCrumb {
  id: string;
  x: number;
  y: number;
  amount?: number;
  bitesLeft?: number;
  maxBites?: number;
  scale?: number;
  createdAt: number;
}

export interface RetroPopupItem {
  id: string;
  x: number;
  y: number;
  title: string;
  message: string;
  icon: string;
  type?: 'warning' | 'troll' | 'achievement';
}

export interface Shockwave {
  id: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
  text?: string;
}
