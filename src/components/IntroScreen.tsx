import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { sfx } from '../utils/audio';
import HangmanIntroURL from '../data/Sound Effects/HangmanIntro.mp3';

interface IntroScreenProps {
  onComplete: () => void;
}

type EnergySegment = {
  start: number;
  end: number;
  energy: number;
};

type Beat = {
  time: number;
  width: number;
  weight: number;
};

type DustParticle = {
  x: number;
  y: number;
  size: number;
  drift: number;
  speed: number;
  delay: number;
  opacity: number;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type IntroVisualProps = {
  currentTime: number;
  titleFontFamily: string;
  creditFontFamily: string;
};

export const INTRO_DURATION_SECONDS = 12.8;
export const INTRO_FPS = 90;

const TITLE_FONT_FAMILY = '"Bungee Shade", "Press Start 2P", monospace';
const CREDIT_FONT_FAMILY = '"Orbitron", monospace';
const ALIVE_COLOR = hexToRgb('#22d3ee');
const DEAD_COLOR = hexToRgb('#ef4444');
const TITLE_COLOR = hexToRgb('#e2e8f0');
const ROPE_BASE = '#7b5838';
const ROPE_HIGHLIGHT = '#e7d4b0';
const BACKGROUND_DUST: DustParticle[] = Array.from({ length: 16 }, (_, index) => ({
  x: 6 + ((index * 13.7) % 88),
  y: 5 + ((index * 17.4) % 90),
  size: 1 + (index % 3) * 0.8,
  drift: 0.6 + (index % 5) * 0.22,
  speed: 0.45 + (index % 4) * 0.2,
  delay: index * 0.27,
  opacity: 0.18 + (index % 4) * 0.05,
}));

const ENERGY_SEGMENTS: EnergySegment[] = [
  { start: 0.0, end: 0.3, energy: 0.27 },
  { start: 0.3, end: 0.7, energy: 0.38 },
  { start: 0.7, end: 1.2, energy: 0.6 },
  { start: 1.2, end: 1.3, energy: 0.91 },
  { start: 1.3, end: 2.0, energy: 0.35 },
  { start: 2.0, end: 3.0, energy: 0.55 },
  { start: 3.0, end: 3.8, energy: 0.25 },
  { start: 3.8, end: 4.2, energy: 0.7 },
  { start: 4.2, end: 5.0, energy: 0.48 },
  { start: 5.0, end: 6.0, energy: 0.65 },
  { start: 6.0, end: 7.0, energy: 0.45 },
  { start: 7.0, end: 7.2, energy: 0.75 },
  { start: 7.2, end: 8.0, energy: 0.42 },
  { start: 8.0, end: 9.0, energy: 0.7 },
  { start: 9.0, end: 10.0, energy: 0.55 },
  { start: 10.0, end: 10.7, energy: 0.88 },
  { start: 10.7, end: 11.7, energy: 0.63 },
  { start: 11.7, end: 12.8, energy: 0.0 },
];

const BEATS: Beat[] = [
  { time: 0.08, width: 0.1, weight: 0.35 },
  { time: 0.44, width: 0.08, weight: 0.7 },
  { time: 0.82, width: 0.07, weight: 0.72 },
  { time: 1.0, width: 0.07, weight: 0.6 },
  { time: 1.2, width: 0.06, weight: 0.9 },
  { time: 4.32, width: 0.09, weight: 0.36 },
  { time: 5.12, width: 0.09, weight: 0.42 },
  { time: 5.84, width: 0.09, weight: 0.46 },
  { time: 7.12, width: 0.08, weight: 0.72 },
  { time: 7.98, width: 0.06, weight: 1.0 },
  { time: 8.7, width: 0.08, weight: 0.4 },
  { time: 9.45, width: 0.08, weight: 0.35 },
  { time: 10.08, width: 0.08, weight: 0.9 },
  { time: 10.52, width: 0.08, weight: 0.82 },
  { time: 11.2, width: 0.09, weight: 0.26 },
];

const BURST_ANGLES = Array.from({ length: 10 }, (_, index) => (Math.PI * 2 * index) / 10);
const GLITCH_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-?/<>[]{}';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const linear = (value: number) => value;
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => value * value * value;
const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const easeOutBack = (value: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
};
const easeOutQuint = (value: number) => 1 - Math.pow(1 - value, 5);

const absoluteFill: CSSProperties = {
  position: 'absolute',
  inset: 0,
};

const progressBetween = (
  currentTime: number,
  start: number,
  end: number,
  easing: (value: number) => number = linear,
) => {
  if (end <= start) {
    return currentTime >= end ? 1 : 0;
  }

  const raw = clamp((currentTime - start) / (end - start));
  return easing(raw);
};

const gaussianPulse = (time: number, center: number, width: number) => {
  const delta = time - center;
  return Math.exp(-(delta * delta) / (2 * width * width));
};

const beatPulseAt = (time: number) =>
  clamp(
    BEATS.reduce((sum, beat) => sum + gaussianPulse(time, beat.time, beat.width) * beat.weight, 0),
    0,
    1.2,
  );

const energyAt = (time: number) => {
  const clampedTime = clamp(time, 0, INTRO_DURATION_SECONDS);
  const index = ENERGY_SEGMENTS.findIndex(
    (segment) => clampedTime >= segment.start && clampedTime < segment.end,
  );
  const segment = ENERGY_SEGMENTS[index === -1 ? ENERGY_SEGMENTS.length - 1 : index];
  const nextSegment =
    ENERGY_SEGMENTS[Math.min(ENERGY_SEGMENTS.indexOf(segment) + 1, ENERGY_SEGMENTS.length - 1)];
  const localDuration = Math.max(segment.end - segment.start, 0.0001);
  const localProgress = clamp((clampedTime - segment.start) / localDuration);

  return lerp(segment.energy, nextSegment.energy, localProgress);
};

const dampedWave = (
  time: number,
  start: number,
  amplitude: number,
  frequency: number,
  decay: number,
  phase = 0,
) => {
  if (time < start) {
    return 0;
  }

  const elapsed = time - start;
  return Math.sin(elapsed * frequency + phase) * Math.exp(-elapsed * decay) * amplitude;
};

function hexToRgb(hex: string): RgbColor {
  const normalized = hex.replace('#', '');
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;
  const parsed = Number.parseInt(fullHex, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

const mixColor = (from: RgbColor, to: RgbColor, progress: number): RgbColor => ({
  r: Math.round(lerp(from.r, to.r, progress)),
  g: Math.round(lerp(from.g, to.g, progress)),
  b: Math.round(lerp(from.b, to.b, progress)),
});

const rgb = (color: RgbColor) => `rgb(${color.r}, ${color.g}, ${color.b})`;
const rgba = (color: RgbColor, alpha: number) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

const glitchText = (text: string, intensity: number, time: number, phase = 0) => {
  const amount = clamp(intensity);

  if (amount <= 0.001) {
    return text;
  }

  return text
    .split('')
    .map((character, index) => {
      if (character === ' ') {
        return ' ';
      }

      const swapSignal = Math.abs(Math.sin(time * 27 + phase * 11 + index * 17.13));
      if (swapSignal > amount) {
        return character;
      }

      const glyphIndex =
        Math.floor(
          Math.abs(Math.sin(time * 61 + phase * 7.3 + index * 29.7)) * GLITCH_GLYPHS.length,
        ) % GLITCH_GLYPHS.length;

      return GLITCH_GLYPHS[glyphIndex];
    })
    .join('');
};

const renderBurst = (
  currentTime: number,
  start: number,
  duration: number,
  x: number,
  y: number,
  stroke: string,
  keyPrefix: string,
  length = 18,
  radius = 5,
) => {
  const progress = clamp((currentTime - start) / duration);

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const eased = easeOutCubic(progress);
  const opacity = 1 - progress;
  const inner = radius + eased * 9;
  const outer = inner + length * (1 - progress * 0.45);

  return (
    <g opacity={opacity}>
      {BURST_ANGLES.map((angle, index) => (
        <line
          key={`${keyPrefix}-${index}`}
          x1={x + Math.cos(angle) * inner}
          y1={y + Math.sin(angle) * inner}
          x2={x + Math.cos(angle) * outer}
          y2={y + Math.sin(angle) * outer}
          stroke={stroke}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

export const IntroVisual = ({
  currentTime,
  titleFontFamily,
  creditFontFamily,
}: IntroVisualProps) => {
  const time = clamp(currentTime, 0, INTRO_DURATION_SECONDS);
  const energy = energyAt(time);
  const beatPulse = beatPulseAt(time);
  const ropeStart = 1.44;
  const ropeEnd = 1.86;
  const tightenStart = 2.02;
  const tightenEnd = 2.32;
  const pullStart = tightenEnd;
  const liftEnd = pullStart + 2.7;
  const titleInStart = 4.28;
  const titleInEnd = 5.34;
  const creditInStart = 10.5;
  const creditInEnd = 10.8;
  const creditOutStart = 11.8;
  const creditOutEnd = 12.62;
  const finalFadeStart = 12.42;
  const titleHangStart = titleInStart + 0.08;
  const titleHangEnd = titleHangStart + 0.62;
  const titleCursorMorphStart = titleHangEnd + 0.05;
  const titleCursorMorphCollapseEnd = titleCursorMorphStart + 0.1;
  const titleCursorMorphGrowEnd = titleCursorMorphCollapseEnd + 0.12;
  const titleManStart = titleCursorMorphGrowEnd + 0.04;
  const titleManEnd = titleManStart + 0.42;
  const titleFinalCursorCollapseStart = titleManEnd + 0.04;
  const titleFinalCursorCollapseEnd = titleManEnd + 0.18;

  const deathProgress = progressBetween(time, tightenStart, tightenEnd, easeInOutCubic);
  const liftProgress = progressBetween(time, pullStart, liftEnd, easeInOutCubic);
  const finalFade = progressBetween(time, finalFadeStart, 12.8, easeInCubic);

  const headEntry = progressBetween(time, 0.0, 0.22, easeOutBack);
  const torsoEntry = progressBetween(time, 0.22, 0.58, easeOutBack);
  const leftLegEntry = progressBetween(time, 0.72, 0.98, easeOutBack);
  const rightLegEntry = progressBetween(time, 0.9, 1.16, easeOutBack);
  const leftArmEntry = progressBetween(time, 1.08, 1.32, easeOutBack);
  const rightArmEntry = progressBetween(time, 1.22, 1.46, easeOutBack);

  const hangPresence =
    progressBetween(time, 1.46, 1.56, easeOutCubic) *
    (1 - progressBetween(time, pullStart, pullStart + 0.28, easeInCubic));
  const tensionProgress = progressBetween(time, ropeStart, tightenEnd, easeInOutCubic);
  const ropeReveal = progressBetween(time, ropeStart, ropeEnd, easeOutCubic);
  const ropeCatchProgress = progressBetween(time, ropeEnd, tightenStart, easeOutCubic);

  const titleIn = progressBetween(time, titleInStart, titleInEnd, easeOutBack);
  const creditIn = progressBetween(time, creditInStart, creditInEnd, easeOutCubic);
  const creditOut = progressBetween(time, creditOutStart, creditOutEnd, easeInCubic);

  const accentColor = mixColor(ALIVE_COLOR, DEAD_COLOR, deathProgress);
  const accentColorString = rgb(accentColor);
  const accentGlow = rgba(accentColor, 0.28 + beatPulse * 0.1 + deathProgress * 0.18);

  const swayX = Math.sin((time - 1.4) * 1.9) * (2.6 + energy * 4.4) * hangPresence;
  const swayY = Math.sin((time - 1.4) * 3.9) * (0.7 + energy * 1.2) * hangPresence;
  const swayRotation = Math.sin((time - 1.4) * 1.9) * (1.2 + energy * 2.3) * hangPresence;
  const tensionX =
    (Math.sin(time * 24) * 1.1 + Math.sin(time * 37 + 0.8) * 0.55) * tensionProgress;
  const tensionRotation = Math.sin(time * 22 + 0.5) * 0.75 * tensionProgress;
  const snapJolt = dampedWave(time, pullStart, 12, 24, 11, Math.PI / 2);
  const liftX = dampedWave(time, pullStart, 3.2, 12, 4.8);
  const liftRotation = dampedWave(time, pullStart, 1.05, 10, 5);

  const bodyTranslateX = (swayX + tensionX) * (1 - deathProgress) + liftX;
  const bodyTranslateY = swayY + snapJolt - liftProgress * 1110;
  const bodyRotation = (swayRotation + tensionRotation) * (1 - deathProgress) + liftRotation;

  const headScale = lerp(0.18, 1, headEntry) + beatPulse * 0.014;
  const headOpacity = clamp(headEntry * 1.9);
  const headSettle = dampedWave(time, 0.18, 4.5, 15, 4.8) + dampedWave(time, 0.55, 2.2, 16, 6);
  const torsoOpacity = clamp(torsoEntry * 1.6);

  const rawRopeAngle =
    -Math.cos(Math.max(time - ropeStart, 0) * 6.1) *
    21 *
    Math.exp(-Math.max(time - ropeStart, 0) * 0.9);
  const ropeAngleSettle = progressBetween(time, ropeEnd, pullStart, easeOutCubic);
  const ropeAngle =
    time < pullStart
      ? lerp(rawRopeAngle, 0, ropeAngleSettle)
      : dampedWave(time, pullStart, 1.1, 9, 10);
  const nooseDropY = lerp(-38, 286, ropeReveal);
  const nooseCatchY = lerp(nooseDropY, 250, ropeCatchProgress);
  const nooseBaseY = lerp(nooseCatchY, 235, deathProgress);
  const nooseCenterY = time < pullStart ? nooseBaseY : nooseBaseY + bodyTranslateY;
  const nooseRy = lerp(22, 8.5, deathProgress);
  const nooseRx = lerp(25, 11.5, deathProgress);
  const ropeExitProgress = progressBetween(time, liftEnd - 0.14, pullStart + 2.88, easeInCubic);
  const ropeAnchorY = lerp(10, -110, ropeExitProgress);
  const ropeEndY = nooseCenterY - nooseRy + 1;
  const ropeDisappear = progressBetween(time, pullStart + 2.7, pullStart + 2.88, easeInCubic);
  const ropeOpacity = clamp(ropeReveal * 1.4 * (1 - ropeDisappear));

  const titleHangProgress = progressBetween(time, titleHangStart, titleHangEnd, easeOutCubic);
  const typedHang =
    time >= titleHangEnd ? 'HANG' : 'HANG'.slice(0, Math.ceil(titleHangProgress * 4));
  const titleManProgress = progressBetween(time, titleManStart, titleManEnd, easeOutCubic);
  const typedMan =
    time < titleManStart
      ? ''
      : time >= titleManEnd
        ? 'MAN'
        : 'MAN'.slice(0, Math.ceil(titleManProgress * 3));
  const titleCursorMorphCollapse = progressBetween(
    time,
    titleCursorMorphStart,
    titleCursorMorphCollapseEnd,
    easeInCubic,
  );
  const titleCursorMorphGrow = progressBetween(
    time,
    titleCursorMorphCollapseEnd,
    titleCursorMorphGrowEnd,
    easeOutCubic,
  );
  const titleFinalCursorCollapse = progressBetween(
    time,
    titleFinalCursorCollapseStart,
    titleFinalCursorCollapseEnd,
    easeInCubic,
  );
  let titleCursorOpacity = 0;
  let titleCursorScaleX = 1;
  let titleCursorScaleY = 1;
  let titleCursorColor = rgb(DEAD_COLOR);

  if (time >= titleHangStart && time < titleCursorMorphStart) {
    titleCursorOpacity = 0.9 + Math.sin((time - titleHangStart) * 18) * 0.08;
    titleCursorColor = rgb(DEAD_COLOR);
  } else if (time >= titleCursorMorphStart && time < titleCursorMorphCollapseEnd) {
    titleCursorOpacity = 1;
    titleCursorScaleX = lerp(1, 0.06, titleCursorMorphCollapse);
    titleCursorScaleY = lerp(1, 0.06, titleCursorMorphCollapse);
    titleCursorColor = rgb(mixColor(DEAD_COLOR, ALIVE_COLOR, titleCursorMorphCollapse));
  } else if (time >= titleCursorMorphCollapseEnd && time < titleCursorMorphGrowEnd) {
    titleCursorOpacity = 1;
    titleCursorScaleX = lerp(0.06, 1, titleCursorMorphGrow);
    titleCursorScaleY = lerp(0.06, 1, titleCursorMorphGrow);
    titleCursorColor = rgb(ALIVE_COLOR);
  } else if (time >= titleCursorMorphGrowEnd && time < titleFinalCursorCollapseStart) {
    titleCursorOpacity =
      time < titleManStart
        ? 1
        : 0.92 + Math.sin((time - titleManStart) * 18) * 0.08;
    titleCursorColor = rgb(ALIVE_COLOR);
  } else if (time >= titleFinalCursorCollapseStart && time < titleFinalCursorCollapseEnd) {
    titleCursorOpacity = 1 - titleFinalCursorCollapse;
    titleCursorScaleX = lerp(1, 0.015, titleFinalCursorCollapse);
    titleCursorScaleY = lerp(1, 0.015, titleFinalCursorCollapse);
    titleCursorColor = rgb(ALIVE_COLOR);
  }

  // H: hard smash left at 8.40s — accelerates, shrinks, tumbles forward
  const throwHProgress = progressBetween(time, 8.40, 8.75, easeInCubic);
  const hTranslateX = throwHProgress * -700;
  const hTranslateY = throwHProgress * throwHProgress * 300;
  const hScale = 1 - throwHProgress * 0.85;
  const hRotation = throwHProgress * 55;
  const hOpacity = 1 - progressBetween(time, 8.55, 8.75, linear);

  // N: hard smash right at 8.80s — same punchy feel
  const throwNProgress = progressBetween(time, 8.80, 9.15, easeInCubic);
  const nTranslateX = throwNProgress * 700;
  const nTranslateY = throwNProgress * throwNProgress * 300;
  const nScale = 1 - throwNProgress * 0.85;
  const nRotation = throwNProgress * -55;
  const nOpacity = 1 - progressBetween(time, 8.95, 9.15, linear);

  // ANGMA: grow pop at 9.15s (1.25x), then gravity drop at 9.45s
  const angmaGrowProgress = progressBetween(time, 9.15, 9.32, easeOutBack);
  const angmaGrowScale = 1 + angmaGrowProgress * 0.25; // peaks at 1.25x
  const dropAngmaProgress = progressBetween(time, 9.45, 9.95, easeInCubic);
  const angmaTranslateY = dropAngmaProgress * 1200;
  const angmaOpacity = 1 - progressBetween(time, 9.62, 9.95, linear);

  const titleOpacity = titleIn;
  const titleScale = lerp(0.76, 1, titleIn) * (1 + beatPulse * 0.012);
  const titleTranslateY = lerp(38, 0, titleIn);

  const creditOpacity = creditIn * (1 - creditOut);
  const creditInGlitch =
    gaussianPulse(time, creditInStart + 0.05, 0.04) * 0.95 +
    gaussianPulse(time, creditInStart + 0.16, 0.055) * 0.82;
  const creditOutGlitch =
    gaussianPulse(time, creditOutStart + 0.04, 0.055) * 0.95 +
    gaussianPulse(time, creditOutStart + 0.16, 0.05) * 0.72;
  const creditOutChaos = progressBetween(time, creditOutStart - 0.02, creditOutEnd, easeInCubic);
  const creditGlitchIntensity = clamp(creditInGlitch + creditOutGlitch, 0, 1.15);
  const creditScale = lerp(0.82, 1, creditIn) * (1 + creditInGlitch * 0.028 - creditOut * 0.03);
  const creditTranslateY =
    lerp(28, 0, creditIn) +
    creditOut * 18 +
    Math.sin(time * 58 + 0.8) * creditGlitchIntensity * 2.2;
  const creditTranslateX =
    (Math.sin(time * 92) + Math.sin(time * 151 + 0.4) * 0.65) * creditGlitchIntensity * 7;
  const creditSweep = progressBetween(time, 10.56, 11.3, easeOutQuint);
  const creditSliceOffset = 8 + creditGlitchIntensity * 12;
  const creditPlateSkew =
    (Math.sin(time * 112) + Math.sin(time * 167 + 0.3) * 0.7) * creditGlitchIntensity * 1.8 +
    creditOutChaos * 5.4;
  const creditDisplayText = glitchText('BY MAYUK', creditOutChaos, time, 1);
  const creditPlateText = glitchText('ARCHIVE // SIGNAL LOST //', clamp(creditOutChaos * 1.15), time, 2);

  const backgroundGlowAlpha = 0.08 + energy * 0.12 + beatPulse * 0.05;
  const deadAuraAlpha = deathProgress * (0.08 + energy * 0.1 + beatPulse * 0.06);
  const titlePanelOpacity = titleOpacity * (0.2 + deathProgress * 0.18);
  const headLocalY = 190 + headSettle;
  const bodyRotationRadians = (bodyRotation * Math.PI) / 180;
  const headOffsetY = headLocalY - 282;
  const headCanvasX = 180 + bodyTranslateX - headOffsetY * Math.sin(bodyRotationRadians);
  const headCanvasY = 282 + bodyTranslateY + headOffsetY * Math.cos(bodyRotationRadians);
  const headClearance = 34 * headScale + 8;
  const headVisible = headCanvasY + headClearance > -4 && headCanvasY - headClearance < 544;
  const ropeAngleRadians = (ropeAngle * Math.PI) / 180;
  const nooseCanvasX = 180 - (nooseCenterY - 12) * Math.sin(ropeAngleRadians);
  const ropeNeedsHeadMask =
    headVisible && ropeOpacity > 0.001 && Math.abs(nooseCanvasX - headCanvasX) < headClearance + nooseRx + 8;
  const ropeLineEndY = ropeEndY;
  const showRopeLine = ropeOpacity > 0.001 && ropeLineEndY > ropeAnchorY + 1;
  const backNooseOpacity = 1 - progressBetween(time, pullStart + 0.16, pullStart + 0.46, easeOutCubic);
  const collarOpacity =
    ropeOpacity * progressBetween(time, tightenStart, tightenEnd + 0.08, easeOutCubic);
  const collarLeftX = 180 - nooseRx * 0.86;
  const collarRightX = 180 + nooseRx * 0.86;
  const collarTopY = nooseCenterY - nooseRy * 0.18;
  const collarBottomY = nooseCenterY + nooseRy * 0.98;

  const titleTextStyle: CSSProperties = {
    position: 'relative',
    fontFamily: titleFontFamily,
    fontSize: 'clamp(4.8rem, 10.6vw, 9.4rem)',
    letterSpacing: '0.065em',
    paddingLeft: '0.065em',
    lineHeight: 0.92,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        ...absoluteFill,
        overflow: 'visible',
        backgroundColor: '#000',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          ...absoluteFill,
          background: `
            radial-gradient(circle at 50% 40%, ${rgba(ALIVE_COLOR, backgroundGlowAlpha)} 0%, rgba(34,211,238,0.05) 24%, transparent 58%),
            radial-gradient(circle at 50% 40%, ${rgba(DEAD_COLOR, deadAuraAlpha)} 0%, rgba(239,68,68,0.04) 30%, transparent 64%),
            linear-gradient(180deg, rgba(5,8,15,0.84) 0%, rgba(0,0,0,0.94) 58%, rgba(0,0,0,1) 100%)
          `,
          transform: `scale(${1 + energy * 0.08 + beatPulse * 0.025})`,
          filter: 'blur(16px)',
          opacity: 1 - finalFade * 0.3,
        }}
      />

      <div
        style={{
          ...absoluteFill,
          background:
            'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.04) 0%, transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0) 28%)',
          opacity: 0.55,
        }}
      />

      <div style={{ ...absoluteFill, overflow: 'hidden' }}>
        {BACKGROUND_DUST.map((particle, index) => {
          const top = ((particle.y + (time * particle.speed + particle.delay) * 4.5) % 110) - 5;
          const drift = Math.sin(time * particle.drift + particle.delay) * 10;
          const dustColor = mixColor(ALIVE_COLOR, DEAD_COLOR, deathProgress * 0.85);

          return (
            <div
              key={`dust-${index}`}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${top}%`,
                width: particle.size,
                height: particle.size,
                borderRadius: 9999,
                transform: `translateX(${drift}px)`,
                opacity: particle.opacity * (0.45 + energy * 0.25) * (1 - finalFade * 0.45),
                backgroundColor: rgba(dustColor, 0.85),
                boxShadow: `0 0 10px ${rgba(dustColor, 0.22)}`,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          ...absoluteFill,
          opacity: clamp(0.1 + energy * 0.1 + beatPulse * 0.06, 0, 0.22),
          background:
            'linear-gradient(0deg, rgba(255,255,255,0.065) 0 1px, transparent 1px 4px), linear-gradient(90deg, rgba(255,0,0,0.04), rgba(0,255,255,0.02), rgba(0,0,255,0.04))',
          backgroundSize: '100% 4px, 3px 100%',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          ...absoluteFill,
          boxShadow: 'inset 0 0 160px rgba(0,0,0,0.78), inset 0 0 70px rgba(0,0,0,0.92)',
          opacity: 0.96,
        }}
      />

      <div
        style={{
          ...absoluteFill,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 'min(42vw, 540px)',
            minWidth: 300,
            height: 'min(80vh, 760px)',
            minHeight: 440,
            transform: `scale(${1 + energy * 0.02 + beatPulse * 0.015 - liftProgress * 0.025})`,
            filter: `drop-shadow(0 0 18px ${accentGlow}) drop-shadow(0 0 54px ${rgba(accentColor, 0.18 + deathProgress * 0.12)})`,
          }}
        >
          <svg viewBox="0 0 360 540" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {ropeNeedsHeadMask && (
              <defs>
                <mask id="intro-rope-head-clear" maskUnits="userSpaceOnUse">
                  <rect x={-260} y={-260} width={880} height={1100} fill="white" />
                  <circle cx={headCanvasX} cy={headCanvasY} r={34 * headScale + 4} fill="black" />
                </mask>
              </defs>
            )}

            {renderBurst(time, 0.02, 0.3, 180, 190, rgba(ALIVE_COLOR, 0.82), 'head-pop', 14, 4)}
            {renderBurst(time, 0.38, 0.24, 180, 224, rgba(ALIVE_COLOR, 0.72), 'torso-lock', 14, 4)}
            {renderBurst(time, 0.76, 0.22, 180, 332, rgba(ALIVE_COLOR, 0.68), 'leg-left', 11, 4)}
            {renderBurst(time, 0.94, 0.22, 180, 332, rgba(ALIVE_COLOR, 0.68), 'leg-right', 11, 4)}
            {renderBurst(time, 1.1, 0.2, 180, 258, rgba(ALIVE_COLOR, 0.7), 'arm-left', 12, 4)}
            {renderBurst(time, 1.24, 0.2, 180, 258, rgba(ALIVE_COLOR, 0.7), 'arm-right', 12, 4)}
            {renderBurst(time, pullStart + 0.02, 0.28, 180, 206, rgba(DEAD_COLOR, 0.95), 'death-snap', 24, 6)}

            {ropeReveal > 0.001 && (
              <g mask={ropeNeedsHeadMask ? 'url(#intro-rope-head-clear)' : undefined}>
                <g
                  transform={`rotate(${ropeAngle} 180 12)`}
                  opacity={ropeOpacity}
                >
                  {showRopeLine && (
                    <>
                      <line
                        x1={180}
                        y1={ropeAnchorY}
                        x2={180}
                        y2={ropeLineEndY}
                        stroke={ROPE_BASE}
                        strokeWidth={10}
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(231,212,176,0.14))' }}
                      />
                      <line
                        x1={180}
                        y1={ropeAnchorY}
                        x2={180}
                        y2={ropeLineEndY}
                        stroke={ROPE_HIGHLIGHT}
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        opacity={0.92}
                      />
                    </>
                  )}
                  <ellipse
                    cx={180}
                    cy={nooseCenterY}
                    rx={nooseRx}
                    ry={nooseRy}
                    fill="none"
                    stroke={ROPE_BASE}
                    strokeWidth={8}
                    opacity={backNooseOpacity}
                  />
                  <ellipse
                    cx={180}
                    cy={nooseCenterY}
                    rx={nooseRx}
                    ry={nooseRy}
                    fill="none"
                    stroke={ROPE_HIGHLIGHT}
                    strokeWidth={2.8}
                    opacity={0.92 * backNooseOpacity}
                  />
                </g>
              </g>
            )}

            <g transform={`translate(${bodyTranslateX} ${bodyTranslateY}) rotate(${bodyRotation} 180 282)`}>
              <g transform={`translate(0 ${headSettle})`} opacity={headOpacity}>
                <circle
                  cx={180}
                  cy={190}
                  r={34}
                  fill="none"
                  stroke={accentColorString}
                  strokeWidth={9}
                  transform={`translate(180 190) scale(${headScale}) translate(-180 -190)`}
                />

                {deathProgress > 0.001 && (
                  <g
                    opacity={progressBetween(time, pullStart + 0.02, pullStart + 0.18, easeOutCubic)}
                    stroke={accentColorString}
                    strokeWidth={4}
                    strokeLinecap="round"
                  >
                    <line x1={165} y1={179} x2={174} y2={188} />
                    <line x1={174} y1={179} x2={165} y2={188} />
                    <line x1={186} y1={179} x2={195} y2={188} />
                    <line x1={195} y1={179} x2={186} y2={188} />
                  </g>
                )}
              </g>

              <line
                x1={180}
                y1={224}
                x2={180}
                y2={336}
                stroke={accentColorString}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={torsoOpacity}
                transform={`translate(0 ${lerp(140, 0, torsoEntry)})`}
              />

              <g
                opacity={clamp(leftLegEntry * 1.55)}
                transform={`translate(${lerp(-170, 0, leftLegEntry)} ${lerp(170, 0, leftLegEntry)}) rotate(${lerp(-52, 0, leftLegEntry)} 180 332)`}
              >
                <line
                  x1={180}
                  y1={332}
                  x2={128}
                  y2={444}
                  stroke={accentColorString}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              </g>

              <g
                opacity={clamp(rightLegEntry * 1.55)}
                transform={`translate(${lerp(170, 0, rightLegEntry)} ${lerp(170, 0, rightLegEntry)}) rotate(${lerp(52, 0, rightLegEntry)} 180 332)`}
              >
                <line
                  x1={180}
                  y1={332}
                  x2={232}
                  y2={444}
                  stroke={accentColorString}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              </g>

              <g
                opacity={clamp(leftArmEntry * 1.55)}
                transform={`translate(${lerp(-178, 0, leftArmEntry)} ${lerp(-150, 0, leftArmEntry)}) rotate(${lerp(-48, 0, leftArmEntry)} 180 258)`}
              >
                <line
                  x1={180}
                  y1={258}
                  x2={118}
                  y2={316}
                  stroke={accentColorString}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              </g>

              <g
                opacity={clamp(rightArmEntry * 1.55)}
                transform={`translate(${lerp(178, 0, rightArmEntry)} ${lerp(-150, 0, rightArmEntry)}) rotate(${lerp(48, 0, rightArmEntry)} 180 258)`}
              >
                <line
                  x1={180}
                  y1={258}
                  x2={242}
                  y2={316}
                  stroke={accentColorString}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              </g>
            </g>

            {collarOpacity > 0.001 && nooseCenterY > -36 && nooseCenterY < 560 && (
              <g opacity={collarOpacity}>
                <path
                  d={`M ${collarLeftX} ${collarTopY} C ${collarLeftX + nooseRx * 0.28} ${collarBottomY} ${collarRightX - nooseRx * 0.28} ${collarBottomY} ${collarRightX} ${collarTopY}`}
                  fill="none"
                  stroke={ROPE_BASE}
                  strokeWidth={7.5}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 9px rgba(231,212,176,0.16))' }}
                />
                <path
                  d={`M ${collarLeftX} ${collarTopY} C ${collarLeftX + nooseRx * 0.28} ${collarBottomY} ${collarRightX - nooseRx * 0.28} ${collarBottomY} ${collarRightX} ${collarTopY}`}
                  fill="none"
                  stroke={ROPE_HIGHLIGHT}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  opacity={0.92}
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {renderTitle({
        titleOpacity,
        titleScale,
        titleTranslateY,
        titleFontFamily,
        panelOpacity: titlePanelOpacity,
        textStyle: titleTextStyle,
        typedHang,
        typedMan,
        showCursor: titleCursorOpacity > 0.001,
        cursorOpacity: titleCursorOpacity,
        cursorScaleX: titleCursorScaleX,
        cursorScaleY: titleCursorScaleY,
        cursorColor: titleCursorColor,
        hTranslateX,
        hTranslateY,
        hRotation,
        hScale,
        hOpacity,
        nTranslateX,
        nTranslateY,
        nRotation,
        nScale,
        nOpacity,
        angmaGrowScale,
        angmaTranslateY,
        angmaOpacity,
      })}

      {creditOpacity > 0.001 && (
        <div
          style={{
            ...absoluteFill,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 'min(74vw, 760px)',
              padding: '22px 34px',
              overflow: 'hidden',
              opacity: creditOpacity,
              transform: `translateX(${creditTranslateX}px) translateY(${creditTranslateY}px) scale(${creditScale}) skewX(${creditPlateSkew}deg)`,
              background:
                'linear-gradient(90deg, rgba(0,0,0,0), rgba(5,14,24,0.72) 12%, rgba(7,20,31,0.96) 50%, rgba(5,14,24,0.72) 88%, rgba(0,0,0,0))',
              borderTop: `1px solid ${rgba(ALIVE_COLOR, 0.34)}`,
              borderBottom: `1px solid ${rgba(DEAD_COLOR, 0.24 + deathProgress * 0.16)}`,
              boxShadow: `0 0 42px rgba(0,0,0,0.56), 0 0 22px ${rgba(accentColor, 0.16)}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
                opacity: 0.18,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '20% 7% auto 7%',
                textAlign: 'center',
                fontFamily: '"Share Tech Mono", "Courier New", monospace',
                fontSize: 'clamp(0.72rem, 1.2vw, 1rem)',
                letterSpacing: '0.18em',
                color: rgba(ALIVE_COLOR, 0.18 + creditOutChaos * 0.34),
                opacity: creditOutChaos * 0.9,
                whiteSpace: 'nowrap',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
              }}
            >
              {creditPlateText}
            </div>
            <div
              style={{
                position: 'absolute',
                left: `${lerp(-32, 108, creditSweep)}%`,
                top: 0,
                width: '26%',
                height: '100%',
                transform: 'skewX(-20deg)',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translateX(${creditSliceOffset}px)`,
                textAlign: 'center',
                fontFamily: creditFontFamily,
                fontWeight: 700,
                fontSize: 'clamp(2.45rem, 5.9vw, 4.45rem)',
                letterSpacing: '0.18em',
                paddingLeft: '0.18em',
                color: rgba(ALIVE_COLOR, 0.46 + creditGlitchIntensity * 0.18),
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                clipPath: 'inset(0 0 54% 0)',
                opacity: 0.32 + creditGlitchIntensity * 0.22,
                mixBlendMode: 'screen',
                pointerEvents: 'none',
              }}
            >
              {creditDisplayText}
            </div>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translateX(${-creditSliceOffset * 0.8}px)`,
                textAlign: 'center',
                fontFamily: creditFontFamily,
                fontWeight: 700,
                fontSize: 'clamp(2.45rem, 5.9vw, 4.45rem)',
                letterSpacing: '0.18em',
                paddingLeft: '0.18em',
                color: rgba(DEAD_COLOR, 0.28 + creditGlitchIntensity * 0.18),
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                clipPath: 'inset(56% 0 0 0)',
                opacity: 0.26 + creditGlitchIntensity * 0.18,
                mixBlendMode: 'screen',
                pointerEvents: 'none',
              }}
            >
              {creditDisplayText}
            </div>
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                fontFamily: creditFontFamily,
                fontWeight: 700,
                fontSize: 'clamp(2.45rem, 5.9vw, 4.45rem)',
                letterSpacing: '0.18em',
                paddingLeft: '0.18em',
                color: rgb(TITLE_COLOR),
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textShadow: `0 0 18px ${rgba(ALIVE_COLOR, 0.2)}, 0 0 34px ${rgba(accentColor, 0.12)}`,
                filter: `blur(${creditOutChaos * 0.9}px)`,
              }}
            >
              {creditDisplayText}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          ...absoluteFill,
          backgroundColor: '#000',
          opacity: clamp(finalFade * 0.22, 0, 0.22),
        }}
      />
    </div>
  );
};

function renderTitle({
  titleOpacity,
  titleScale,
  titleTranslateY,
  titleFontFamily,
  panelOpacity,
  textStyle,
  typedHang,
  typedMan,
  showCursor,
  cursorOpacity,
  cursorScaleX,
  cursorScaleY,
  cursorColor,
  hTranslateX,
  hTranslateY,
  hRotation,
  hScale,
  hOpacity,
  nTranslateX,
  nTranslateY,
  nRotation,
  nScale,
  nOpacity,
  angmaGrowScale,
  angmaTranslateY,
  angmaOpacity,
}: {
  titleOpacity: number;
  titleScale: number;
  titleTranslateY: number;
  titleFontFamily: string;
  panelOpacity: number;
  textStyle: CSSProperties;
  typedHang: string;
  typedMan: string;
  showCursor: boolean;
  cursorOpacity: number;
  cursorScaleX: number;
  cursorScaleY: number;
  cursorColor: string;
  hTranslateX: number;
  hTranslateY: number;
  hRotation: number;
  hScale: number;
  hOpacity: number;
  nTranslateX: number;
  nTranslateY: number;
  nRotation: number;
  nScale: number;
  nOpacity: number;
  angmaGrowScale: number;
  angmaTranslateY: number;
  angmaOpacity: number;
}): ReactNode {
  if (titleOpacity <= 0.001 && hOpacity <= 0.001 && nOpacity <= 0.001 && angmaOpacity <= 0.001) {
    return null;
  }
  const titleHangStyle: CSSProperties = {
    color: 'rgb(255, 221, 221)',
    textShadow:
      '0 0 12px rgba(255,232,232,0.32), 0 0 26px rgba(239,68,68,0.88), 0 0 62px rgba(220,38,38,0.58), 0 0 120px rgba(127,29,29,0.44)',
  };
  const titleManStyle: CSSProperties = {
    color: 'rgb(236, 251, 255)',
    textShadow:
      '0 0 12px rgba(236,251,255,0.42), 0 0 26px rgba(34,211,238,0.88), 0 0 64px rgba(34,211,238,0.62), 0 0 128px rgba(8,145,178,0.42)',
  };
  const cursorStyle: CSSProperties = {
    width: 12,
    height: '0.86em',
    marginLeft: 10,
    borderRadius: 9999,
    background: cursorColor,
    boxShadow: `0 0 14px ${cursorColor}, 0 0 36px ${cursorColor}`,
    opacity: cursorOpacity,
    transform: `translateY(-1px) scale(${cursorScaleX}, ${cursorScaleY})`,
    transformOrigin: 'center center',
    filter: `blur(${(1 - cursorOpacity) * 0.7}px)`,
  };

  // Before 8.50s: individual letter opacities all follow titleOpacity.
  // After 8.50s: each letter manages its own physics-driven opacity.
  const throwStarted = hOpacity < 0.999 || nOpacity < 0.999 || angmaOpacity < 0.999;
  const letterOpacityH = throwStarted ? hOpacity : titleOpacity;
  const letterOpacityAngma = throwStarted ? angmaOpacity : titleOpacity;
  const letterOpacityN = throwStarted ? nOpacity : titleOpacity;

  return (
    <div
      style={{
        ...absoluteFill,
        zIndex: 20,
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 'min(80vw, 980px)',
            height: 'clamp(100px, 12vw, 164px)',
            transform: 'translate(-50%, -50%)',
            borderRadius: 9999,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 18%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 82%, transparent)',
            filter: 'blur(8px)',
            opacity: panelOpacity,
          }}
        />
        <div
          style={{
            ...textStyle,
            fontFamily: titleFontFamily,
            display: 'inline-flex',
            alignItems: 'flex-end',
            overflow: 'visible',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: `translate(${hTranslateX}px, ${hTranslateY}px) rotate(${hRotation}deg) scale(${hScale})`,
              opacity: letterOpacityH,
              willChange: 'transform, opacity',
            }}
          >
            <span style={titleHangStyle}>{typedHang.slice(0, 1)}</span>
          </span>
          <span
            style={{
              display: 'inline-block',
              transform: `translateY(${angmaTranslateY}px) scale(${angmaGrowScale})`,
              opacity: letterOpacityAngma,
              willChange: 'transform, opacity',
              overflow: 'visible',
            }}
          >
            <span style={titleHangStyle}>{typedHang.slice(1)}</span>
            <span style={titleManStyle}>{typedMan.slice(0, 2)}</span>
          </span>
          <span
            style={{
              display: 'inline-block',
              transform: `translate(${nTranslateX}px, ${nTranslateY}px) rotate(${nRotation}deg) scale(${nScale})`,
              opacity: letterOpacityN,
              willChange: 'transform, opacity',
            }}
          >
            <span style={titleManStyle}>{typedMan.slice(2)}</span>
          </span>
          {showCursor && <span style={cursorStyle} />}
        </div>
      </div>
    </div>
  );
}

export const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    sfx.stopCurrent();
    setCurrentTime(0);
    audio.volume = 1;
    audio.currentTime = 0;

    let frameId = 0;
    let fallbackStart = performance.now();
    let finished = false;

    const stopPlayback = () => {
      audio.pause();
      audio.currentTime = 0;
    };

    const cleanupInteractionListeners = () => {
      window.removeEventListener('pointerdown', retryPlayback);
      window.removeEventListener('keydown', retryPlayback);
    };

    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      cancelAnimationFrame(frameId);
      cleanupInteractionListeners();
      stopPlayback();
      onComplete();
    };

    const syncClock = () => {
      if (finished) {
        return;
      }

      const fallbackTime = Math.min(
        Math.max((performance.now() - fallbackStart) / 1000, 0),
        INTRO_DURATION_SECONDS,
      );
      const audioTime =
        !audio.paused && Number.isFinite(audio.currentTime) && audio.currentTime > 0.01
          ? audio.currentTime
          : fallbackTime;
      const nextTime = Math.min(Math.max(audioTime, 0), INTRO_DURATION_SECONDS);

      setCurrentTime((previous) =>
        Math.abs(previous - nextTime) > 1 / INTRO_FPS ? nextTime : previous,
      );

      if (nextTime >= INTRO_DURATION_SECONDS || audio.ended) {
        finish();
        return;
      }

      frameId = requestAnimationFrame(syncClock);
    };

    const attemptPlayback = () => {
      const fallbackTime = Math.min(
        Math.max((performance.now() - fallbackStart) / 1000, 0),
        INTRO_DURATION_SECONDS - 0.05,
      );

      audio.currentTime = fallbackTime;
      audio
        .play()
        .then(() => {
          fallbackStart = performance.now() - audio.currentTime * 1000;
        })
        .catch(() => {});
    };

    function retryPlayback() {
      attemptPlayback();
    }

    const handleEnded = () => finish();

    audio.addEventListener('ended', handleEnded);
    window.addEventListener('pointerdown', retryPlayback);
    window.addEventListener('keydown', retryPlayback);

    attemptPlayback();
    frameId = requestAnimationFrame(syncClock);

    return () => {
      finished = true;
      cancelAnimationFrame(frameId);
      audio.removeEventListener('ended', handleEnded);
      cleanupInteractionListeners();
      stopPlayback();
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        overflow: 'visible',
        backgroundColor: '#000',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <audio ref={audioRef} src={HangmanIntroURL} preload="auto" />
      <IntroVisual
        currentTime={currentTime}
        titleFontFamily={TITLE_FONT_FAMILY}
        creditFontFamily={CREDIT_FONT_FAMILY}
      />
    </div>
  );
};
