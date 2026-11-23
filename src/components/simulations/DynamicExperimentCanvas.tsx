import React, { useEffect, useRef } from 'react';
import type { DynamicExperimentSpec, DynamicSimulationFrame } from '../../types/dynamicExperiment';
import type { SimulationComponentHit } from '../../systems/componentInteraction/types';
import { computeDynamicSimulationState } from '../../utils/dynamicPhysicsValidator';

interface DynamicExperimentCanvasProps {
  spec: DynamicExperimentSpec;
  paramValues: Record<string, number>;
  isPlaying: boolean;
  reducedMotion?: boolean;
  resetSignal?: number;
  selectedComponentId?: string | null;
  onFrameUpdate?: (frame: DynamicSimulationFrame) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
}

interface CanvasComponentTarget {
  id: string;
  label: string;
  cx: number;
  cy: number;
  radius: number;
}

export const DynamicExperimentCanvas: React.FC<DynamicExperimentCanvasProps> = ({
  spec,
  paramValues,
  isPlaying,
  reducedMotion = false,
  resetSignal = 0,
  selectedComponentId = null,
  onFrameUpdate,
  onComponentHit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef<number>(0);
  const targetsRef = useRef<CanvasComponentTarget[]>([]);
  const paramsRef = useRef(paramValues);
  paramsRef.current = paramValues;
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;
  const selectedRef = useRef(selectedComponentId);
  selectedRef.current = selectedComponentId;
  const onFrameRef = useRef(onFrameUpdate);
  onFrameRef.current = onFrameUpdate;

  useEffect(() => {
    elapsedRef.current = 0;
  }, [resetSignal, spec.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let lastTs = performance.now();
    let lastTelemetryPush = 0;

    const drawArrow = (
      ctx: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      label?: string
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len < 6) return;
      const ang = Math.atan2(dy, dx);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const head = 8;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45));
      ctx.lineTo(x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45));
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillText(label, x2 + 6, y2 - 4);
      }
      ctx.restore();
    };

    const drawInteractiveHotspots = (
      ctx: CanvasRenderingContext2D,
      targets: CanvasComponentTarget[]
    ) => {
      for (const tgt of targets) {
        const isSel = selectedRef.current === tgt.id;
        ctx.save();
        ctx.beginPath();
        ctx.arc(tgt.cx, tgt.cy, isSel ? tgt.radius + 4 : tgt.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isSel ? '#6F4E37' : 'rgba(111, 78, 55, 0.25)';
        ctx.lineWidth = isSel ? 2.5 : 1.2;
        if (!isSel) ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = '600 11px system-ui, sans-serif';
        const tw = ctx.measureText(tgt.label).width;
        const bx = Math.max(8, Math.min(canvas.clientWidth - tw - 16, tgt.cx - tw / 2 - 5));
        const by = Math.max(10, tgt.cy - tgt.radius - 22);
        ctx.fillStyle = isSel ? '#6F4E37' : 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = isSel ? '#6F4E37' : '#D8D1CA';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, tw + 10, 18, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSel ? '#FFFFFF' : '#302820';
        ctx.fillText(tgt.label, bx + 5, by + 12.5);
        ctx.restore();
      }
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      if (playingRef.current && !reducedMotion) {
        elapsedRef.current += dt;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(300, canvas.clientWidth);
      const h = Math.max(220, canvas.clientHeight);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Warm ivory clean graph paper background
      ctx.fillStyle = '#F7F5F2';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(111, 78, 55, 0.06)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 32) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const frame = computeDynamicSimulationState(spec, paramsRef.current, elapsedRef.current);
      if (now - lastTelemetryPush > 90) {
        lastTelemetryPush = now;
        onFrameRef.current?.(frame);
      }

      const v = frame.vectorData;
      const targets: CanvasComponentTarget[] = [];
      const compAt = (idx: number, defX: number, defY: number, rad = 22) => {
        const comp = spec.components[idx] || spec.components[0];
        if (!comp) return null;
        return { id: comp.id, label: comp.label, cx: defX, cy: defY, radius: rad };
      };

      switch (spec.templateId) {
        case 'pendulum_shm': {
          const pivotX = w * 0.5;
          const pivotY = h * 0.16;
          const lengthScale = Math.min(h * 0.58, 70 + (v.L || 1) * 58);
          const theta = v.thetaRad || 0;
          const bobX = pivotX + lengthScale * Math.sin(theta);
          const bobY = pivotY + lengthScale * Math.cos(theta);

          // Support beam
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(pivotX - 90, pivotY - 12, 180, 10);
          // Equilibrium dashed vertical
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = '#A89F96';
          ctx.beginPath();
          ctx.moveTo(pivotX, pivotY);
          ctx.lineTo(pivotX, pivotY + lengthScale + 18);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arc trail
          ctx.strokeStyle = 'rgba(111, 78, 55, 0.22)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pivotX, pivotY, lengthScale, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();

          // String
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(pivotX, pivotY);
          ctx.lineTo(bobX, bobY);
          ctx.stroke();

          // Pivot & Bob
          ctx.fillStyle = '#6F4E37';
          ctx.beginPath();
          ctx.arc(pivotX, pivotY, 7, 0, Math.PI * 2);
          ctx.fill();

          const bobRad = 15 + Math.min(10, (v.m || 1) * 2);
          ctx.fillStyle = '#B83A2D';
          ctx.beginPath();
          ctx.arc(bobX, bobY, bobRad, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Velocity tangent arrow
          const tangX = Math.cos(theta) * (v.omega || 0) * 30;
          const tangY = -Math.sin(theta) * (v.omega || 0) * 30;
          drawArrow(ctx, bobX, bobY, bobX + tangX, bobY + tangY, '#2B5B6C', 'v');
          drawArrow(ctx, bobX, bobY, bobX, bobY + 38, '#6F4E37', 'mg');

          const c0 = compAt(0, bobX, bobY, bobRad + 6);
          const c1 = compAt(1, pivotX, pivotY, 18);
          const c2 = compAt(2, (pivotX + bobX) * 0.5, (pivotY + bobY) * 0.5, 18);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'projectile_motion': {
          const padL = 54;
          const padB = h - 42;
          const maxR = Math.max(15, v.totalRange || 30);
          const maxAlt = Math.max(10, v.maxH || 15);
          const scaleX = (w - padL - 40) / maxR;
          const scaleY = (padB - 46) / maxAlt;
          const scale = Math.min(scaleX, scaleY);

          // Ground line
          ctx.fillStyle = '#E5E4E2';
          ctx.fillRect(0, padB, w, h - padB);
          ctx.strokeStyle = '#6F4E37';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(20, padB);
          ctx.lineTo(w - 20, padB);
          ctx.stroke();

          // Trajectory parabola
          const pts = frame.trailPoints || [];
          if (pts.length > 1) {
            ctx.strokeStyle = '#6F4E37';
            ctx.lineWidth = 2.4;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            pts.forEach((p, i) => {
              const sx = padL + p.x * scale;
              const sy = padB - p.y * scale;
              if (i === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            });
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const startY = padB - (v.h0 || 0) * scale;
          const curSx = padL + (v.curX || 0) * scale;
          const curSy = padB - (v.curY || 0) * scale;

          // Launcher platform
          ctx.fillStyle = '#3E4C59';
          ctx.fillRect(padL - 16, startY, 32, Math.max(8, padB - startY));

          // Instantaneous projectile
          ctx.fillStyle = '#B83A2D';
          ctx.beginPath();
          ctx.arc(curSx, curSy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2;
          ctx.stroke();

          drawArrow(ctx, padL, startY, padL + (v.vx0 || 10) * 1.4, startY - (v.vy0 || 10) * 1.4, '#2B5B6C', 'v₀');

          const c0 = compAt(0, curSx, curSy, 18);
          const c1 = compAt(1, padL, startY, 20);
          const c2 = compAt(2, padL + (v.totalRange || 20) * scale, padB, 18);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'inclined_plane_forces': {
          const rad = v.rad || Math.PI / 6;
          const baseL = Math.min(w * 0.62, 340);
          const x0 = w * 0.18;
          const y0 = h * 0.78;
          const xTop = x0;
          const yTop = y0 - baseL * Math.tan(rad);
          const xEnd = x0 + baseL;
          const clampedTopY = Math.max(46, yTop);

          // Ramp wedge
          ctx.fillStyle = '#E5E4E2';
          ctx.strokeStyle = '#6F4E37';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(xEnd, y0);
          ctx.lineTo(xTop, clampedTopY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          const sFrac = 0.22 + (v.sFrac || 0) * 0.58;
          const bx = xTop + (xEnd - xTop) * sFrac;
          const by = clampedTopY + (y0 - clampedTopY) * sFrac;
          const slopeAng = Math.atan2(y0 - clampedTopY, xEnd - xTop);

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(slopeAng);
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(-24, -32, 48, 32);
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2;
          ctx.strokeRect(-24, -32, 48, 32);
          ctx.restore();

          // Force vectors from block center
          const cx = bx + Math.sin(slopeAng) * 16;
          const cy = by - Math.cos(slopeAng) * 16;
          drawArrow(ctx, cx, cy, cx, cy + 56, '#302820', 'mg');
          drawArrow(ctx, cx, cy, cx + Math.sin(slopeAng) * 48, cy - Math.cos(slopeAng) * 48, '#2B5B6C', 'N');
          drawArrow(ctx, cx, cy, cx - Math.cos(slopeAng) * 38, cy - Math.sin(slopeAng) * 38, '#B83A2D', 'f');

          const c0 = compAt(0, cx, cy, 24);
          const c1 = compAt(1, (x0 + xEnd) * 0.45, (y0 + clampedTopY) * 0.55, 22);
          const c2 = compAt(2, cx + Math.sin(slopeAng) * 38, cy - Math.cos(slopeAng) * 38, 18);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'spring_oscillation': {
          const anchorX = w * 0.5;
          const topY = 44;
          const eqY = h * 0.52;
          const dispPx = (v.x || 0) * 170;
          const massY = clampNum(eqY + dispPx, topY + 60, h - 55);

          // Support bar
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(anchorX - 80, topY - 10, 160, 10);

          // Coiled spring zig-zag
          ctx.strokeStyle = '#3E4C59';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(anchorX, topY);
          const coils = 12;
          const span = massY - 22 - topY;
          for (let i = 1; i <= coils; i++) {
            const yy = topY + (span * i) / coils;
            const xx = anchorX + (i % 2 === 0 ? -18 : 18);
            ctx.lineTo(xx, yy);
          }
          ctx.lineTo(anchorX, massY - 22);
          ctx.stroke();

          // Mass block
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(anchorX - 28, massY - 22, 56, 44);
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2;
          ctx.strokeRect(anchorX - 28, massY - 22, 56, 44);

          // Equilibrium line
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = '#756B63';
          ctx.beginPath();
          ctx.moveTo(anchorX - 110, eqY);
          ctx.lineTo(anchorX + 110, eqY);
          ctx.stroke();
          ctx.setLineDash([]);

          drawArrow(ctx, anchorX + 44, massY, anchorX + 44, massY - clampNum((v.x || 0) * 160, -60, 60), '#B83A2D', 'F = -kx');

          const c0 = compAt(0, anchorX, massY, 26);
          const c1 = compAt(1, anchorX, (topY + massY) * 0.5, 22);
          const c2 = compAt(2, anchorX - 85, eqY, 18);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'buoyancy_pressure': {
          const tankX = w * 0.25;
          const tankW = w * 0.5;
          const tankTop = h * 0.16;
          const tankBottom = h * 0.86;
          const fluidTop = h * 0.34;

          // Beaker walls
          ctx.fillStyle = 'rgba(43, 91, 108, 0.16)';
          ctx.fillRect(tankX, fluidTop, tankW, tankBottom - fluidTop);
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(tankX, tankTop);
          ctx.lineTo(tankX, tankBottom);
          ctx.lineTo(tankX + tankW, tankBottom);
          ctx.lineTo(tankX + tankW, tankTop);
          ctx.stroke();

          const subRatio = v.submergedRatio || 0.7;
          const floats = frame.statusFlags?.floats !== false;
          const blockSize = 68;
          const blockY = floats
            ? fluidTop - blockSize * (1 - subRatio)
            : tankBottom - blockSize - 8;
          const blockX = w * 0.5 - blockSize * 0.5;

          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(blockX, blockY, blockSize, blockSize);
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2;
          ctx.strokeRect(blockX, blockY, blockSize, blockSize);

          drawArrow(ctx, w * 0.5 - 16, blockY + blockSize * 0.5, w * 0.5 - 16, blockY + blockSize * 0.5 - 52, '#2E7D32', 'F_b');
          drawArrow(ctx, w * 0.5 + 16, blockY + blockSize * 0.5, w * 0.5 + 16, blockY + blockSize * 0.5 + 52, '#B83A2D', 'mg');

          const c0 = compAt(0, w * 0.5, blockY + blockSize * 0.5, 28);
          const c1 = compAt(1, tankX + tankW * 0.78, (fluidTop + tankBottom) * 0.5, 22);
          const c2 = compAt(2, w * 0.5 - 16, blockY - 10, 18);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'lever_pulley_energy': {
          const pivX = w * 0.5;
          const pivY = h * 0.62;
          const tilt = v.tiltRad || 0;
          const armScale = Math.min(w * 0.34, 155);
          const dLeft = clampNum(((v.loadArm || 0.5) / 2.5) * armScale, 45, armScale);
          const dRight = clampNum(((v.effortArm || 1.5) / 2.5) * armScale, 45, armScale);

          // Fulcrum triangle
          ctx.fillStyle = '#3E4C59';
          ctx.beginPath();
          ctx.moveTo(pivX, pivY);
          ctx.lineTo(pivX - 24, pivY + 42);
          ctx.lineTo(pivX + 24, pivY + 42);
          ctx.closePath();
          ctx.fill();

          ctx.save();
          ctx.translate(pivX, pivY);
          ctx.rotate(tilt);
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(-dLeft - 14, -8, dLeft + dRight + 28, 14);
          // Load box on left
          ctx.fillStyle = '#B83A2D';
          ctx.fillRect(-dLeft - 20, -48, 40, 40);
          ctx.restore();

          const loadX = pivX - dLeft * Math.cos(tilt);
          const loadY = pivY - dLeft * Math.sin(tilt) - 28;
          const effX = pivX + dRight * Math.cos(tilt);
          const effY = pivY + dRight * Math.sin(tilt);
          drawArrow(ctx, effX, effY, effX, effY + 46, '#2B5B6C', 'F_effort');

          const c0 = compAt(0, loadX, loadY, 24);
          const c1 = compAt(1, pivX, pivY + 18, 22);
          const c2 = compAt(2, effX, effY + 16, 20);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'optics_ray_model': {
          const midX = w * 0.5;
          const midY = h * 0.5;
          const incRad = ((v.incDeg || 35) * Math.PI) / 180;
          const refrRad = ((v.refrDeg || 22) * Math.PI) / 180;
          const isTIR = Boolean(frame.statusFlags?.isTIR);

          // Medium 2 shaded bottom region
          ctx.fillStyle = 'rgba(230, 224, 240, 0.58)';
          ctx.fillRect(0, midY, w, h - midY);
          ctx.strokeStyle = '#6F4E37';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(24, midY);
          ctx.lineTo(w - 24, midY);
          ctx.stroke();

          // Normal vertical dashed line
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = '#756B63';
          ctx.beginPath();
          ctx.moveTo(midX, 34);
          ctx.lineTo(midX, h - 34);
          ctx.stroke();
          ctx.setLineDash([]);

          const rayLen = Math.min(w, h) * 0.36;
          const ix = midX - Math.sin(incRad) * rayLen;
          const iy = midY - Math.cos(incRad) * rayLen;
          drawArrow(ctx, ix, iy, midX, midY, '#B83A2D', 'Incident');

          if (isTIR) {
            const rx = midX + Math.sin(incRad) * rayLen;
            const ry = midY - Math.cos(incRad) * rayLen;
            drawArrow(ctx, midX, midY, rx, ry, '#D97706', 'TIR Reflected');
          } else {
            const rx = midX + Math.sin(refrRad) * rayLen;
            const ry = midY + Math.cos(refrRad) * rayLen;
            drawArrow(ctx, midX, midY, rx, ry, '#2B5B6C', 'Refracted');
          }

          const c0 = compAt(0, (ix + midX) * 0.5, (iy + midY) * 0.5, 20);
          const c1 = compAt(1, midX, midY, 22);
          const c2 = compAt(2, midX + 80, midY + 48, 22);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'dc_circuit_model': {
          const isParallel = Boolean(frame.statusFlags?.isParallel);
          const lx = w * 0.22;
          const rx = w * 0.78;
          const ty = h * 0.26;
          const by = h * 0.74;

          // Wires loop
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 3;
          ctx.strokeRect(lx, ty, rx - lx, by - ty);

          // Battery on left
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(lx - 18, (ty + by) * 0.5 - 24, 36, 48);
          ctx.strokeStyle = '#B83A2D';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(lx - 18, (ty + by) * 0.5 - 8);
          ctx.lineTo(lx + 18, (ty + by) * 0.5 - 8);
          ctx.stroke();
          ctx.strokeStyle = '#3E4C59';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(lx - 10, (ty + by) * 0.5 + 8);
          ctx.lineTo(lx + 10, (ty + by) * 0.5 + 8);
          ctx.stroke();

          // Resistor boxes
          const drawRes = (cx: number, cy: number, tag: string) => {
            ctx.fillStyle = '#FEF3C7';
            ctx.strokeStyle = '#6F4E37';
            ctx.lineWidth = 2;
            ctx.fillRect(cx - 32, cy - 14, 64, 28);
            ctx.strokeRect(cx - 32, cy - 14, 64, 28);
            ctx.fillStyle = '#302820';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(tag, cx - 22, cy + 4);
          };

          if (isParallel) {
            ctx.strokeStyle = '#302820';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lx + 50, (ty + by) * 0.5);
            ctx.lineTo(rx - 50, (ty + by) * 0.5);
            ctx.stroke();
            drawRes(w * 0.5, ty, `R₁ ${v.R1}Ω`);
            drawRes(w * 0.5, (ty + by) * 0.5, `R₂ ${v.R2}Ω`);
          } else {
            drawRes(w * 0.4, ty, `R₁ ${v.R1}Ω`);
            drawRes(w * 0.65, ty, `R₂ ${v.R2}Ω`);
          }

          // Animated electron dots
          const phase = (elapsedRef.current * Math.max(0.4, v.I || 1)) % 1;
          ctx.fillStyle = '#D97706';
          for (let k = 0; k < 4; k++) {
            const frac = (phase + k * 0.25) % 1;
            const px = lx + frac * (rx - lx);
            ctx.beginPath();
            ctx.arc(px, by, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          const c0 = compAt(0, lx, (ty + by) * 0.5, 24);
          const c1 = compAt(1, w * 0.45, ty, 24);
          const c2 = compAt(2, w * 0.55, by, 20);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'wave_acoustics': {
          const midY = h * 0.5;
          const pts = frame.curvePoints || [];
          const lx = 46;
          const rx = w - 46;
          const span = rx - lx;

          // Axis
          ctx.strokeStyle = '#D8D1CA';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, midY);
          ctx.lineTo(rx, midY);
          ctx.stroke();

          // Wave curve
          if (pts.length > 1) {
            ctx.strokeStyle = '#2B5B6C';
            ctx.lineWidth = 3;
            ctx.beginPath();
            pts.forEach((p, idx) => {
              const sx = lx + p.x * span;
              const sy = midY - p.y * (h * 0.28);
              if (idx === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            });
            ctx.stroke();
          }

          // Tuning fork / source on left
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(lx - 14, midY - 26, 14, 52);

          const c0 = compAt(0, lx - 7, midY, 22);
          const c1 = compAt(1, w * 0.5, midY, 24);
          const c2 = compAt(2, w * 0.72, midY - 34, 20);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'thermal_calorimetry': {
          const beX = w * 0.28;
          const beY = h * 0.34;
          const beW = 140;
          const beH = h * 0.48;
          const curT2 = v.curT2 || 30;
          const teq = v.Teq || 45;

          // Calorimeter beaker
          const warmth = clampNum((curT2 - 15) / 75, 0, 1);
          ctx.fillStyle = `rgba(${Math.round(60 + warmth * 165)}, ${Math.round(130 - warmth * 40)}, ${Math.round(190 - warmth * 130)}, 0.35)`;
          ctx.fillRect(beX, beY + 24, beW, beH - 24);
          ctx.strokeStyle = '#302820';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(beX, beY, beW, beH);

          // Thermometer probe
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(beX + beW * 0.65, beY - 36, 12, beH * 0.75);
          ctx.strokeRect(beX + beW * 0.65, beY - 36, 12, beH * 0.75);
          ctx.fillStyle = '#B83A2D';
          ctx.fillRect(beX + beW * 0.65 + 3, beY + beH * 0.38 - warmth * 42, 6, 36 + warmth * 42);

          // Cooling/Mixing Curve chart on right
          const gx = w * 0.56;
          const gy = h * 0.25;
          const gw = w * 0.36;
          const gh = h * 0.55;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(gx, gy, gw, gh);
          ctx.strokeStyle = '#D8D1CA';
          ctx.strokeRect(gx, gy, gw, gh);

          const pts = frame.curvePoints || [];
          if (pts.length > 1) {
            ctx.strokeStyle = '#B83A2D';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            pts.forEach((p, idx) => {
              const px = gx + (idx / (pts.length - 1)) * (gw - 20) + 10;
              const py = gy + gh - clampNum((p.y / 100) * (gh - 20), 8, gh - 12);
              if (idx === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            });
            ctx.stroke();
          }

          ctx.fillStyle = '#302820';
          ctx.font = '600 11px monospace';
          ctx.fillText(`T_eq = ${teq.toFixed(1)}°C`, gx + 12, gy + 20);

          const c0 = compAt(0, beX + beW * 0.35, beY + beH * 0.6, 26);
          const c1 = compAt(1, beX + beW * 0.65 + 6, beY + 12, 20);
          const c2 = compAt(2, gx + gw * 0.5, gy + gh * 0.5, 22);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }

        case 'magnetic_dipole_3d':
        default: {
          const cx = w * 0.45;
          const cy = h * 0.5;
          const ang = ((v.angleDeg || 0) * Math.PI) / 180;

          // Dipole flux loops
          ctx.strokeStyle = 'rgba(111, 78, 55, 0.45)';
          ctx.lineWidth = 1.8;
          for (const ry of [44, 82, 118]) {
            ctx.beginPath();
            ctx.ellipse(cx, cy - ry * 0.5, 95, ry * 0.55, ang, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(cx, cy + ry * 0.5, 95, ry * 0.55, ang, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ang);
          ctx.fillStyle = '#B83A2D';
          ctx.fillRect(-60, -16, 60, 32);
          ctx.fillStyle = '#3E4C59';
          ctx.fillRect(0, -16, 60, 32);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText('N', -36, 5);
          ctx.fillText('S', 26, 5);
          ctx.restore();

          // Probe sensor compass
          const probeX = Math.min(w - 55, cx + 110 + (v.r || 4) * 10);
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#6F4E37';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(probeX, cy, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          drawArrow(ctx, probeX - 10, cy, probeX + 12, cy, '#B83A2D');

          const c0 = compAt(0, cx, cy, 26);
          const c1 = compAt(1, probeX, cy, 22);
          const c2 = compAt(2, cx, cy - 64, 20);
          if (c0) targets.push(c0);
          if (c1) targets.push(c1);
          if (c2) targets.push(c2);
          break;
        }
      }

      drawInteractiveHotspots(ctx, targets);
      targetsRef.current = targets;
      ctx.restore();

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [spec, reducedMotion]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onComponentHit) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    let closest: CanvasComponentTarget | null = null;
    let bestDist = Infinity;
    for (const tgt of targetsRef.current) {
      const d = Math.hypot(px - tgt.cx, py - tgt.cy);
      if (d <= Math.max(28, tgt.radius + 10) && d < bestDist) {
        bestDist = d;
        closest = tgt;
      }
    }

    if (!closest) {
      onComponentHit(null);
      return;
    }

    onComponentHit({
      componentId: closest.id,
      anchorPx: { x: closest.cx, y: closest.cy },
      viewportSize: { width: rect.width, height: rect.height },
    });
  };

  return (
    <canvas
      ref={canvasRef}
      data-testid="dynamic-2d-canvas"
      onClick={handleCanvasClick}
      className="w-full h-full block cursor-pointer"
      aria-label={spec.title}
    />
  );
};

function clampNum(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}
