import React, { useEffect, useRef, useState } from 'react';
import { computeMagneticField2D, traceFieldLine2D, type Vec2 } from '../../utils/magnetismPhysics';
import type { DynamicCanvasHitRegion, SimulationComponentHit } from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export interface CompassTelemetry {
  magnitudeMt: number;
  angleDeg: number;
  relX: number;
  relY: number;
}

interface Magnetism2DCanvasProps {
  magnetAngleDeg: number;
  strength: number;
  isPlaying: boolean;
  showVectorGrid: boolean;
  showFieldLines: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  onTelemetryChange: (telemetry: CompassTelemetry) => void;
  selectedComponentId?: string | null;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (anchor: { x: number; y: number }, viewport: { width: number; height: number }) => void;
  showCompass?: boolean;
  showDirectionArrows?: boolean;
  compassCount?: number;
  highlightIntersectionTest?: boolean;
  compassPosition?: { x: number; y: number };
  onCompassPositionChange?: (pos: { x: number; y: number }) => void;
}

type CornerRadii = number | [number, number, number, number];

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii
) {
  const [tl, tr, br, bl] =
    typeof radii === 'number' ? [radii, radii, radii, radii] : radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr > 0) ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  else ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br);
  if (br > 0) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  else ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);
  if (bl > 0) ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  else ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);
  if (tl > 0) ctx.quadraticCurveTo(x, y, x + tl, y);
  else ctx.lineTo(x, y);
  ctx.closePath();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  angleRad: number,
  size: number,
  fillStyle: string,
  highlighted = false
) {
  if (highlighted) {
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)';
    ctx.fillStyle = 'rgba(254, 243, 199, 0.72)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ax, ay, size + 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = highlighted ? '#B45309' : fillStyle;
  ctx.beginPath();
  const s = highlighted ? size * 1.28 : size;
  ctx.moveTo(ax + s * Math.cos(angleRad), ay + s * Math.sin(angleRad));
  ctx.lineTo(
    ax - s * 0.75 * Math.cos(angleRad - 0.62),
    ay - s * 0.75 * Math.sin(angleRad - 0.62)
  );
  ctx.lineTo(
    ax - s * 0.75 * Math.cos(angleRad + 0.62),
    ay - s * 0.75 * Math.sin(angleRad + 0.62)
  );
  ctx.closePath();
  ctx.fill();
}

const AUXILIARY_COMPASS_PRESETS: Vec2[] = [
  { x: -145, y: -90 },
  { x: 145, y: 90 },
  { x: -145, y: 90 },
  { x: 0, y: -135 },
  { x: 0, y: 135 },
  { x: -205, y: 0 },
];

export const Magnetism2DCanvas: React.FC<Magnetism2DCanvasProps> = ({
  magnetAngleDeg,
  strength,
  isPlaying,
  showVectorGrid,
  showFieldLines,
  reducedMotion,
  resetSignal,
  onTelemetryChange,
  selectedComponentId = null,
  onComponentHit,
  onAnchorMove,
  showCompass = true,
  showDirectionArrows = true,
  compassCount = 1,
  highlightIntersectionTest = false,
  compassPosition,
  onCompassPositionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverSelectable, setHoverSelectable] = useState(false);

  const onTelemetryRef = useRef(onTelemetryChange);
  onTelemetryRef.current = onTelemetryChange;
  const onComponentHitRef = useRef(onComponentHit);
  onComponentHitRef.current = onComponentHit;
  const onAnchorMoveRef = useRef(onAnchorMove);
  onAnchorMoveRef.current = onAnchorMove;
  const onCompassPositionChangeRef = useRef(onCompassPositionChange);
  onCompassPositionChangeRef.current = onCompassPositionChange;

  const stateRef = useRef({
    magnetAngleDeg,
    strength,
    isPlaying,
    showVectorGrid,
    showFieldLines,
    reducedMotion,
    selectedComponentId,
    showCompass,
    showDirectionArrows,
    compassCount,
    highlightIntersectionTest,
    compassOffset: { x: 135, y: -90 },
    needleAngleRad: 0,
    auxNeedleAngles: AUXILIARY_COMPASS_PRESETS.map(() => 0),
    isDraggingCompass: false,
    pointerDownClient: { x: 0, y: 0 },
    pointerDragged: false,
    pulsePhase: 0,
    lastLayout: {
      width: 640,
      height: 440,
      scale: 1,
      magnetLen: 164,
      magnetHeight: 44,
      compassRadius: 28,
      fieldLines: [] as Vec2[][],
      arrowPoints: [] as Array<{ x: number; y: number }>,
      auxCompasses: [] as Array<{ x: number; y: number; r: number }>,
    },
  });

  useEffect(() => {
    stateRef.current.magnetAngleDeg = magnetAngleDeg;
    stateRef.current.strength = strength;
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.showVectorGrid = showVectorGrid;
    stateRef.current.showFieldLines = showFieldLines;
    stateRef.current.reducedMotion = reducedMotion;
    stateRef.current.selectedComponentId = selectedComponentId ?? null;
    stateRef.current.showCompass = showCompass;
    stateRef.current.showDirectionArrows = showDirectionArrows;
    stateRef.current.compassCount = Math.max(1, Math.min(7, compassCount));
    stateRef.current.highlightIntersectionTest = highlightIntersectionTest;
  }, [
    magnetAngleDeg,
    strength,
    isPlaying,
    showVectorGrid,
    showFieldLines,
    reducedMotion,
    selectedComponentId,
    showCompass,
    showDirectionArrows,
    compassCount,
    highlightIntersectionTest,
  ]);

  useEffect(() => {
    if (resetSignal > 0) {
      stateRef.current.compassOffset = { x: 135, y: -90 };
    }
  }, [resetSignal]);

  useEffect(() => {
    if (!compassPosition || stateRef.current.isDraggingCompass) return;
    const nextX = compassPosition.x;
    const nextY = -compassPosition.y;
    if (
      Math.abs(nextX - stateRef.current.compassOffset.x) > 0.5 ||
      Math.abs(nextY - stateRef.current.compassOffset.y) > 0.5
    ) {
      stateRef.current.compassOffset = { x: nextX, y: nextY };
    }
  }, [compassPosition]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = Math.max(240, container.clientWidth || 640);
    let height = Math.max(200, container.clientHeight || 440);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let lastTime = performance.now();
    let frameId = 0;
    let lastTelemetryPush = 0;
    let disposed = false;

    let cachedKey = '';
    let cachedLines: Vec2[][] = [];

    const buildDipoleFieldLines = (angleRad: number, scale: number): Vec2[][] => {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const perpX = -sin;
      const perpY = cos;
      const lines: Vec2[][] = [];

      const stopRadius = 26 * scale;
      const shellRadii = [56, 88, 128, 176, 232].map((r) => r * scale);

      for (const r of shellRadii) {
        for (const side of [-1, 1]) {
          const sx = r * side * perpX;
          const sy = r * side * perpY;
          const forward = traceFieldLine2D(sx, sy, 1, angleRad, stopRadius, 200, 5.5, 620);
          const backward = traceFieldLine2D(sx, sy, -1, angleRad, stopRadius, 200, 5.5, 620);
          const fullLoop = [...backward.reverse(), ...forward.slice(1)];
          if (fullLoop.length >= 4) {
            lines.push(fullLoop);
          }
        }
      }

      const axialStart = 68 * scale;
      const northAxis = traceFieldLine2D(
        axialStart * cos,
        axialStart * sin,
        1,
        angleRad,
        stopRadius,
        75,
        6,
        620
      );
      if (northAxis.length >= 3) lines.push(northAxis);

      const southAxis = traceFieldLine2D(
        -axialStart * cos,
        -axialStart * sin,
        -1,
        angleRad,
        stopRadius,
        75,
        6,
        620
      ).reverse();
      if (southAxis.length >= 3) lines.push(southAxis);

      return lines;
    };

    const drawCompassProbe = (
      x: number,
      y: number,
      radius: number,
      needleAngle: number,
      highlightNeedle: boolean,
      highlightPivot: boolean,
      activeDrag: boolean,
      showTangentHint: boolean,
      dimmedProbe = false
    ) => {
      ctx.save();
      ctx.translate(x, y);
      if (dimmedProbe) {
        ctx.globalAlpha = 0.42;
      }

      if (showTangentHint) {
        ctx.save();
        ctx.rotate(needleAngle);
        ctx.strokeStyle = 'rgba(111, 78, 55, 0.36)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(-radius - 14, 0);
        ctx.lineTo(radius + 14, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      if (highlightNeedle) {
        ctx.strokeStyle = '#6F4E37';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(48, 40, 32, 0.2)';
      ctx.beginPath();
      ctx.arc(2, 4, radius + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activeDrag ? '#6F4E37' : '#8C6B4B';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D8D1CA';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = '#756B63';
      for (let i = 0; i < 12; i++) {
        const ta = (i * Math.PI) / 6;
        const inner = i % 3 === 0 ? radius - 5.5 : radius - 3;
        ctx.lineWidth = i % 3 === 0 ? 1.4 : 0.9;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ta) * inner, Math.sin(ta) * inner);
        ctx.lineTo(Math.cos(ta) * (radius - 1), Math.sin(ta) * (radius - 1));
        ctx.stroke();
      }

      ctx.save();
      ctx.rotate(needleAngle);
      const needleLen = Math.max(8, radius - 5);
      const needleW = radius < 22 ? 4 : 5.5;

      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.moveTo(needleLen, 0);
      ctx.lineTo(0, -needleW);
      ctx.lineTo(0, needleW);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.moveTo(-needleLen, 0);
      ctx.lineTo(0, -needleW);
      ctx.lineTo(0, needleW);
      ctx.closePath();
      ctx.fill();

      if (highlightNeedle) {
        ctx.strokeStyle = '#6F4E37';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(needleLen, 0);
        ctx.lineTo(0, -needleW);
        ctx.lineTo(-needleLen, 0);
        ctx.lineTo(0, needleW);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // Central Brass Pivot Pin (independently selectable)
      const pivotRadius = radius < 22 ? 3.5 : 4.6;
      if (highlightPivot) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0, pivotRadius + 5.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(217, 119, 6, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, pivotRadius + 5.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = highlightPivot ? '#D97706' : '#6F4E37';
      ctx.beginPath();
      ctx.arc(0, 0, pivotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F7F5F2';
      ctx.beginPath();
      ctx.arc(0, 0, pivotRadius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawScene = (now: number) => {
      if (width <= 0 || height <= 0) return;

      const rawDt = (now - lastTime) / 1000;
      const dt = Math.max(0, Math.min(0.05, Number.isFinite(rawDt) ? rawDt : 0));
      lastTime = now;

      const s = stateRef.current;
      const angleRad = (s.magnetAngleDeg * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;
      const rawScale = Math.min(width / 680, height / 460);
      const scale = Math.max(0.62, Math.min(1.2, rawScale));
      const magnetLen = 168 * scale;
      const magnetHeight = 46 * scale;
      const coreRadius = 30 * scale;
      const compassRadius = Math.round(28 * Math.max(0.84, scale));

      if (s.isPlaying && !s.reducedMotion) {
        s.pulsePhase = (((s.pulsePhase + dt * (0.24 + s.strength * 0.14)) % 1) + 1) % 1;
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Background
      ctx.fillStyle = '#F7F5F2';
      ctx.fillRect(0, 0, width, height);

      // 2. Lab Coordinate Grid
      const gridStep = 36;
      ctx.strokeStyle = '#E6DFD6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = cx % gridStep; gx < width; gx += gridStep) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = cy % gridStep; gy < height; gy += gridStep) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      ctx.strokeStyle = '#CFC6BC';
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx, cy + 14);
      ctx.stroke();

      const nextArrowPoints: Array<{ x: number; y: number }> = [];
      const isArrowsSelected = s.selectedComponentId === 'field_direction_arrows';
      const hasSel = Boolean(s.selectedComponentId);
      const isBodySelected =
        s.selectedComponentId === 'magnet_body' || s.selectedComponentId === 'bar_magnet';
      const isAnyCompassSelected =
        s.selectedComponentId === 'compass_needle' || s.selectedComponentId === 'compass_pivot';

      // 3. Optional Vector Field Grid
      if (s.showVectorGrid) {
        ctx.save();
        ctx.globalAlpha = !hasSel || isArrowsSelected ? 1 : 0.36;
        const vecStep = width < 480 ? 44 : 48;
        for (let vx = cx % vecStep; vx < width; vx += vecStep) {
          for (let vy = cy % vecStep; vy < height; vy += vecStep) {
            const rx = vx - cx;
            const ry = vy - cy;
            if (Math.hypot(rx, ry) < magnetLen * 0.56) continue;

            const b = computeMagneticField2D(rx, ry, angleRad, s.strength, coreRadius);
            const alpha = Math.min(0.75, Math.max(0.18, b.magnitude * 0.18));
            const arrowLen = 15;
            const dx = Math.cos(b.angleRad) * arrowLen * 0.5;
            const dy = Math.sin(b.angleRad) * arrowLen * 0.5;

            ctx.strokeStyle = isArrowsSelected
              ? 'rgba(217, 119, 6, 0.85)'
              : `rgba(111, 78, 55, ${alpha.toFixed(2)})`;
            ctx.lineWidth = isArrowsSelected ? 1.8 : 1.4;
            ctx.beginPath();
            ctx.moveTo(vx - dx, vy - dy);
            ctx.lineTo(vx + dx, vy + dy);
            ctx.stroke();

            drawArrowHead(
              ctx,
              vx + dx,
              vy + dy,
              b.angleRad,
              4.8,
              `rgba(111, 78, 55, ${alpha.toFixed(2)})`,
              isArrowsSelected
            );
            nextArrowPoints.push({ x: rx + dx, y: ry + dy });
          }
        }
        ctx.restore();
      }

      // 4. Magnetic Dipole Field Lines (RK4 Streamlines)
      const cacheKey = `${s.magnetAngleDeg.toFixed(1)}_${scale.toFixed(2)}`;
      if (cacheKey !== cachedKey) {
        cachedLines = buildDipoleFieldLines(angleRad, scale);
        cachedKey = cacheKey;
      }

      if (s.showFieldLines) {
        const isLinesSelected = s.selectedComponentId === 'field_lines';
        const lineDim = hasSel && !isLinesSelected && !isArrowsSelected ? 0.36 : 1;
        const lineAlpha = isLinesSelected
          ? 0.98
          : Math.min(0.92, 0.36 + s.strength * 0.25) * lineDim;
        const lineWidth = isLinesSelected
          ? 3.2
          : Math.min(2.4, 1.15 + s.strength * 0.42);

        for (let idx = 0; idx < cachedLines.length; idx++) {
          const pts = cachedLines[idx];
          if (!pts || pts.length < 3) continue;

          if (isLinesSelected) {
            ctx.strokeStyle = 'rgba(111, 78, 55, 0.22)';
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(cx + pts[0].x, cy + pts[0].y);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(cx + pts[i].x, cy + pts[i].y);
            }
            ctx.stroke();
          }

          const isInner = idx < 6;
          ctx.strokeStyle = isLinesSelected
            ? '#6F4E37'
            : isInner
            ? `rgba(111, 78, 55, ${lineAlpha.toFixed(2)})`
            : `rgba(117, 107, 99, ${(lineAlpha * 0.78).toFixed(2)})`;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(cx + pts[0].x, cy + pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(cx + pts[i].x, cy + pts[i].y);
          }
          ctx.stroke();

          if (s.showDirectionArrows) {
            ctx.save();
            ctx.globalAlpha = !hasSel || isArrowsSelected || isLinesSelected ? 1 : 0.38;
            const arrowFractions = pts.length > 40 ? [0.25, 0.5, 0.75] : [0.5];
            for (const fracPos of arrowFractions) {
              const aIdx = Math.max(1, Math.min(pts.length - 2, Math.floor(pts.length * fracPos)));
              const p0 = pts[aIdx - 1];
              const p1 = pts[aIdx + 1];
              const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
              drawArrowHead(
                ctx,
                cx + pts[aIdx].x,
                cy + pts[aIdx].y,
                ang,
                6.2,
                '#6F4E37',
                isArrowsSelected
              );
              nextArrowPoints.push({ x: pts[aIdx].x, y: pts[aIdx].y });
            }
            ctx.restore();
          }

          if (s.isPlaying && !s.reducedMotion && pts.length > 8) {
            ctx.save();
            ctx.globalAlpha = lineDim;
            const phase = (((s.pulsePhase + idx * 0.13) % 1) + 1) % 1;
            const tPos = phase * (pts.length - 1);
            const pIdx = Math.max(0, Math.min(pts.length - 2, Math.floor(tPos)));
            const frac = tPos - pIdx;
            const pA = pts[pIdx];
            const pB = pts[pIdx + 1];
            if (pA && pB) {
              const px = cx + pA.x + (pB.x - pA.x) * frac;
              const py = cy + pA.y + (pB.y - pA.y) * frac;
              ctx.fillStyle = '#6F4E37';
              ctx.beginPath();
              ctx.arc(px, py, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }
      }

      // 5. Horizontal Bar Magnet (Centered) with Distinct S / Magnet Body Collar / N
      const bodyHalfBand = magnetLen * 0.15;
      const dimSouth = hasSel && !isBodySelected && s.selectedComponentId !== 'south_pole';
      const dimNorth = hasSel && !isBodySelected && s.selectedComponentId !== 'north_pole';
      const dimCollar = hasSel && !isBodySelected;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);

      ctx.save();
      ctx.globalAlpha = hasSel && !isBodySelected && dimNorth && dimSouth ? 0.45 : 1;
      ctx.fillStyle = 'rgba(48, 40, 32, 0.16)';
      traceRoundedRect(ctx, -magnetLen / 2 + 3, -magnetHeight / 2 + 5, magnetLen, magnetHeight, 6);
      ctx.fill();
      ctx.restore();

      // South Pole Half (-X)
      ctx.save();
      ctx.globalAlpha = dimSouth ? 0.42 : 1;
      ctx.fillStyle = '#374151';
      traceRoundedRect(ctx, -magnetLen / 2, -magnetHeight / 2, magnetLen / 2 + 1, magnetHeight, [6, 0, 0, 6]);
      ctx.fill();
      ctx.restore();

      // North Pole Half (+X)
      ctx.save();
      ctx.globalAlpha = dimNorth ? 0.42 : 1;
      ctx.fillStyle = '#C83E31';
      traceRoundedRect(ctx, 0, -magnetHeight / 2, magnetLen / 2, magnetHeight, [0, 6, 6, 0]);
      ctx.fill();
      ctx.restore();

      // Central Ferromagnetic Magnet Body Band (makes magnet_body visibly distinct)
      ctx.save();
      ctx.globalAlpha = dimCollar ? 0.48 : 1;
      ctx.fillStyle = '#D8D1CA';
      ctx.fillRect(-bodyHalfBand, -magnetHeight / 2, bodyHalfBand * 2, magnetHeight);

      ctx.fillStyle = '#8C6B4B';
      ctx.fillRect(-3, -magnetHeight / 2, 6, magnetHeight);
      ctx.restore();

      const grad = ctx.createLinearGradient(0, -magnetHeight / 2, 0, magnetHeight / 2);
      grad.addColorStop(0, 'rgba(255,255,255,0.22)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = grad;
      traceRoundedRect(ctx, -magnetLen / 2, -magnetHeight / 2, magnetLen, magnetHeight, 6);
      ctx.fill();

      ctx.strokeStyle = hasSel && dimNorth && dimSouth && dimCollar ? 'rgba(48,40,32,0.45)' : '#302820';
      ctx.lineWidth = 1.5;
      traceRoundedRect(ctx, -magnetLen / 2, -magnetHeight / 2, magnetLen, magnetHeight, 6);
      ctx.stroke();

      // Visual Component Highlight Rings
      if (isBodySelected) {
        ctx.strokeStyle = '#6F4E37';
        ctx.lineWidth = 3.5;
        traceRoundedRect(ctx, -magnetLen / 2 - 5, -magnetHeight / 2 - 5, magnetLen + 10, magnetHeight + 10, 9);
        ctx.stroke();

        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(-bodyHalfBand - 2, -magnetHeight / 2 - 3, bodyHalfBand * 2 + 4, magnetHeight + 6);
      } else if (s.selectedComponentId === 'north_pole') {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3.5;
        traceRoundedRect(ctx, bodyHalfBand, -magnetHeight / 2 - 5, magnetLen / 2 - bodyHalfBand + 5, magnetHeight + 10, [4, 9, 9, 4]);
        ctx.stroke();
      } else if (s.selectedComponentId === 'south_pole') {
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 3.5;
        traceRoundedRect(ctx, -magnetLen / 2 - 5, -magnetHeight / 2 - 5, magnetLen / 2 - bodyHalfBand + 5, magnetHeight + 10, [9, 4, 4, 9]);
        ctx.stroke();
      }

      ctx.font = `700 ${Math.round(16 * scale)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.save();
      ctx.globalAlpha = dimSouth ? 0.55 : 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.translate(-magnetLen * 0.33, 0);
      ctx.rotate(-angleRad);
      ctx.fillText('S', 0, 1);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = dimNorth ? 0.55 : 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.translate(magnetLen * 0.33, 0);
      ctx.rotate(-angleRad);
      ctx.fillText('N', 0, 1);
      ctx.restore();

      ctx.restore();

      // 6. Auxiliary Multi-Compass Probes
      const auxCount = s.showCompass
        ? Math.max(0, Math.min(AUXILIARY_COMPASS_PRESETS.length, s.compassCount - 1))
        : 0;
      const auxRadius = Math.round(compassRadius * 0.72);
      const nextAuxCompasses: Array<{ x: number; y: number; r: number }> = [];
      for (let i = 0; i < auxCount; i++) {
        const preset = AUXILIARY_COMPASS_PRESETS[i];
        const axOffset = preset.x * scale;
        const ayOffset = preset.y * scale;
        const auxField = computeMagneticField2D(
          axOffset,
          ayOffset,
          angleRad,
          s.strength,
          coreRadius
        );
        let auxDiff = auxField.angleRad - s.auxNeedleAngles[i];
        while (auxDiff > Math.PI) auxDiff -= Math.PI * 2;
        while (auxDiff < -Math.PI) auxDiff += Math.PI * 2;
        s.auxNeedleAngles[i] +=
          s.reducedMotion || dt === 0 ? auxDiff : auxDiff * Math.min(1, dt * 15);

        drawCompassProbe(
          cx + axOffset,
          cy + ayOffset,
          auxRadius,
          s.auxNeedleAngles[i],
          s.selectedComponentId === 'compass_needle',
          s.selectedComponentId === 'compass_pivot',
          false,
          true,
          hasSel && !isAnyCompassSelected
        );
        nextAuxCompasses.push({ x: axOffset, y: ayOffset, r: auxRadius });
      }

      // 7. Primary Draggable Brass Compass & Exact Dipole Alignment
      const pad = compassRadius + 10;
      const maxOffsetX = Math.max(40, width / 2 - pad);
      const maxOffsetY = Math.max(40, height / 2 - pad);
      s.compassOffset.x = Math.max(-maxOffsetX, Math.min(maxOffsetX, s.compassOffset.x));
      s.compassOffset.y = Math.max(-maxOffsetY, Math.min(maxOffsetY, s.compassOffset.y));

      const compX = cx + s.compassOffset.x;
      const compY = cy + s.compassOffset.y;
      const field = computeMagneticField2D(
        s.compassOffset.x,
        s.compassOffset.y,
        angleRad,
        s.strength,
        coreRadius
      );

      let diff = field.angleRad - s.needleAngleRad;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      s.needleAngleRad += s.reducedMotion || dt === 0 ? diff : diff * Math.min(1, dt * 15);

      if (s.showCompass) {
        if (s.highlightIntersectionTest) {
          const vecLen = compassRadius + 36;
          const tx = compX + Math.cos(field.angleRad) * vecLen;
          const ty = compY + Math.sin(field.angleRad) * vecLen;
          ctx.strokeStyle = '#6F4E37';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(compX, compY);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          drawArrowHead(ctx, tx, ty, field.angleRad, 7, '#6F4E37', false);

          const altAngle = field.angleRad + 0.85;
          const hx = compX + Math.cos(altAngle) * (vecLen - 6);
          const hy = compY + Math.sin(altAngle) * (vecLen - 6);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(184, 58, 45, 0.55)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(compX, compY);
          ctx.lineTo(hx, hy);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = '#302820';
          ctx.font = '600 11px Outfit, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(
            'Single B vector here (≠ 2 directions)',
            Math.min(width - 210, compX + compassRadius + 10),
            Math.max(18, compY - compassRadius - 8)
          );
        }

        drawCompassProbe(
          compX,
          compY,
          compassRadius,
          s.needleAngleRad,
          s.selectedComponentId === 'compass_needle',
          s.selectedComponentId === 'compass_pivot',
          s.isDraggingCompass,
          true,
          hasSel && !isAnyCompassSelected
        );
      }

      s.lastLayout = {
        width,
        height,
        scale,
        magnetLen,
        magnetHeight,
        compassRadius,
        fieldLines: cachedLines,
        arrowPoints: nextArrowPoints,
        auxCompasses: nextAuxCompasses,
      };

      ctx.restore();

      if (now - lastTelemetryPush > 66) {
        lastTelemetryPush = now;
        const deg = ((field.angleRad * 180) / Math.PI + 360) % 360;
        const tel = {
          magnitudeMt: Number((field.magnitude * 1.4).toFixed(2)),
          angleDeg: Math.round(deg),
          relX: Math.round(s.compassOffset.x),
          relY: Math.round(-s.compassOffset.y),
        };
        onTelemetryRef.current(tel);
        if (s.isDraggingCompass) {
          onCompassPositionChangeRef.current?.({ x: tel.relX, y: tel.relY });
        }

        // Keep tooltip anchored cleanly if compass/magnet moved dynamically
        if (onAnchorMoveRef.current && s.selectedComponentId) {
          if (
            s.selectedComponentId === 'compass_needle' ||
            s.selectedComponentId === 'compass_pivot'
          ) {
            onAnchorMoveRef.current(
              { x: compX, y: compY },
              { width, height }
            );
          } else if (s.selectedComponentId === 'north_pole') {
            onAnchorMoveRef.current(
              {
                x: cx + Math.cos(angleRad) * (magnetLen * 0.34),
                y: cy + Math.sin(angleRad) * (magnetLen * 0.34),
              },
              { width, height }
            );
          } else if (s.selectedComponentId === 'south_pole') {
            onAnchorMoveRef.current(
              {
                x: cx - Math.cos(angleRad) * (magnetLen * 0.34),
                y: cy - Math.sin(angleRad) * (magnetLen * 0.34),
              },
              { width, height }
            );
          } else if (
            s.selectedComponentId === 'magnet_body' ||
            s.selectedComponentId === 'bar_magnet'
          ) {
            onAnchorMoveRef.current({ x: cx, y: cy }, { width, height });
          }
        }
      }
    };

    const syncCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const nextW = Math.max(220, Math.round(rect.width));
      const nextH = Math.max(200, Math.round(rect.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetPixelW = Math.round(nextW * nextDpr);
      const targetPixelH = Math.round(nextH * nextDpr);

      if (
        canvas.width !== targetPixelW ||
        canvas.height !== targetPixelH ||
        nextW !== width ||
        nextH !== height
      ) {
        width = nextW;
        height = nextH;
        dpr = nextDpr;
        canvas.width = targetPixelW;
        canvas.height = targetPixelH;
        drawScene(performance.now());
      }
    };

    syncCanvasSize();
    drawScene(performance.now());

    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(container);
    window.addEventListener('orientationchange', syncCanvasSize);

    const loop = (now: number) => {
      if (disposed) return;
      drawScene(now);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('orientationchange', syncCanvasSize);
    };
  }, []);

  const getRelativePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
      cssX: clientX - rect.left,
      cssY: clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const buildHitRegions = (): DynamicCanvasHitRegion[] => {
    const s = stateRef.current;
    const {
      magnetLen,
      magnetHeight,
      compassRadius,
      fieldLines,
      arrowPoints,
      auxCompasses,
    } = s.lastLayout;
    const angleRad = (s.magnetAngleDeg * Math.PI) / 180;
    const bodyHalfBand = magnetLen * 0.15;
    const regions: DynamicCanvasHitRegion[] = [];

    if (s.showCompass) {
      regions.push({
        componentId: 'compass_pivot',
        priority: 1,
        shape: {
          kind: 'circle',
          cx: s.compassOffset.x,
          cy: s.compassOffset.y,
          radius: 9.5,
        },
      });
      regions.push({
        componentId: 'compass_needle',
        priority: 2,
        shape: {
          kind: 'circle',
          cx: s.compassOffset.x,
          cy: s.compassOffset.y,
          radius: compassRadius + 10,
        },
      });

      for (const aux of auxCompasses) {
        regions.push({
          componentId: 'compass_pivot',
          priority: 2,
          shape: { kind: 'circle', cx: aux.x, cy: aux.y, radius: 7 },
        });
        regions.push({
          componentId: 'compass_needle',
          priority: 3,
          shape: { kind: 'circle', cx: aux.x, cy: aux.y, radius: aux.r + 7 },
        });
      }
    }

    // Magnet central body & North/South poles (rotated rectangles)
    regions.push({
      componentId: 'magnet_body',
      priority: 4,
      shape: {
        kind: 'rotated_rect',
        cx: 0,
        cy: 0,
        halfW: bodyHalfBand,
        halfH: magnetHeight / 2 + 8,
        angleRad,
      },
    });

    const poleCenterOffset = (bodyHalfBand + magnetLen / 2) * 0.5;
    const poleHalfW = (magnetLen / 2 - bodyHalfBand) * 0.5 + 6;
    regions.push({
      componentId: 'north_pole',
      priority: 5,
      shape: {
        kind: 'rotated_rect',
        cx: Math.cos(angleRad) * poleCenterOffset,
        cy: Math.sin(angleRad) * poleCenterOffset,
        halfW: poleHalfW,
        halfH: magnetHeight / 2 + 8,
        angleRad,
      },
    });

    regions.push({
      componentId: 'south_pole',
      priority: 5,
      shape: {
        kind: 'rotated_rect',
        cx: -Math.cos(angleRad) * poleCenterOffset,
        cy: -Math.sin(angleRad) * poleCenterOffset,
        halfW: poleHalfW,
        halfH: magnetHeight / 2 + 8,
        angleRad,
      },
    });

    // Direction arrows take priority over underlying field lines
    if (s.showFieldLines && s.showDirectionArrows && arrowPoints.length > 0) {
      regions.push({
        componentId: 'field_direction_arrows',
        priority: 6,
        shape: {
          kind: 'points',
          points: arrowPoints,
          tolerance: 14,
        },
      });
    }

    // Magnetic field lines
    if (s.showFieldLines && fieldLines.length > 0) {
      regions.push({
        componentId: 'field_lines',
        priority: 7,
        shape: {
          kind: 'polylines',
          lines: fieldLines,
          tolerance: 11,
        },
      });
    }

    return regions;
  };

  const hitTestPointer = (
    rx: number,
    ry: number,
    width: number,
    height: number
  ): SimulationComponentHit | null => {
    const regions = buildHitRegions();
    const matched = hitTestGeometricRegions({ x: rx, y: ry }, regions);
    if (!matched) return null;

    return {
      componentId: matched.componentId,
      anchorPx: {
        x: width / 2 + matched.hitPoint.x,
        y: height / 2 + matched.hitPoint.y,
      },
      viewportSize: { width, height },
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getRelativePointer(e.clientX, e.clientY);
    if (!pt) return;
    const s = stateRef.current;
    s.pointerDownClient = { x: e.clientX, y: e.clientY };
    s.pointerDragged = false;

    const hit = hitTestPointer(pt.x, pt.y, pt.width, pt.height);
    if (
      !hit ||
      hit.componentId === 'compass_needle' ||
      hit.componentId === 'compass_pivot'
    ) {
      s.isDraggingCompass = true;
      if (!hit) {
        s.compassOffset = { x: pt.x, y: pt.y };
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (
      Math.hypot(e.clientX - s.pointerDownClient.x, e.clientY - s.pointerDownClient.y) > 6
    ) {
      s.pointerDragged = true;
    }

    const pt = getRelativePointer(e.clientX, e.clientY);
    if (!pt) return;

    if (s.isDraggingCompass) {
      s.compassOffset = { x: pt.x, y: pt.y };
      return;
    }

    const hit = hitTestPointer(pt.x, pt.y, pt.width, pt.height);
    setHoverSelectable(Boolean(hit));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const wasDragging = s.isDraggingCompass;
    const wasClick = !s.pointerDragged;
    s.isDraggingCompass = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (wasDragging) {
      onCompassPositionChangeRef.current?.({
        x: Math.round(s.compassOffset.x),
        y: Math.round(-s.compassOffset.y),
      });
    }

    if (wasClick && onComponentHitRef.current) {
      const pt = getRelativePointer(e.clientX, e.clientY);
      if (pt) {
        const hit = hitTestPointer(pt.x, pt.y, pt.width, pt.height);
        onComponentHitRef.current(hit);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => setHoverSelectable(false)}
        className={`block w-full h-full touch-none ${
          hoverSelectable
            ? 'cursor-pointer'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />
    </div>
  );
};
