import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export interface ForceBuoyancyTelemetry {
  mode: 'friction' | 'buoyancy';
  netForceN: number;
  frictionOrUpthrustN: number;
  accelerationOrDepth: number;
  pressureKpa: number;
  statusLabel: string;
}

interface ForceBuoyancyCanvasProps {
  preset?: string;
  forceOrDensity: number; // Sliding: Applied Force (N); Buoyancy: Object density (400..2200 kg/m^3 mapped)
  massKg: number;
  frictionOrFluid: number; // Sliding: mu (0.05..0.65); Buoyancy: fluid density factor (0.05..0.65 -> 800..1300 kg/m3)
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: ForceBuoyancyTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

export const ForceBuoyancyCanvas: React.FC<ForceBuoyancyCanvasProps> = ({
  preset = 'friction_surfaces',
  forceOrDensity,
  massKg,
  frictionOrFluid,
  isPlaying,
  reducedMotion,
  resetSignal,
  selectedComponentId = null,
  onTelemetryChange,
  onComponentHit,
  onAnchorMove,
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

  const isBuoyancyPreset =
    preset === 'buoyancy_pressure' || preset === 'archimedes_fluid';

  const stateRef = useRef({
    isBuoyancyPreset,
    forceOrDensity,
    massKg,
    frictionOrFluid,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    blockXFrac: 0.14,
    blockVel: 0,
    submergeFrac: 0.5,
    submergeVel: 0,
    hitRegions: [] as DynamicCanvasHitRegion[],
    width: 640,
    height: 440,
  });

  stateRef.current.isBuoyancyPreset = isBuoyancyPreset;
  stateRef.current.forceOrDensity = forceOrDensity;
  stateRef.current.massKg = massKg;
  stateRef.current.frictionOrFluid = frictionOrFluid;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    stateRef.current.blockXFrac = 0.14;
    stateRef.current.blockVel = 0;
    stateRef.current.submergeFrac = 0.35;
    stateRef.current.submergeVel = 0;
  }, [resetSignal, isBuoyancyPreset]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();
    let telemetryTick = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(240, Math.floor(rect.width));
      const h = Math.max(240, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      stateRef.current.width = w;
      stateRef.current.height = h;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const drawArrow = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      width = 3
    ) => {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2 + 5 * Math.cos(angle), y2 + 5 * Math.sin(angle));
      ctx.lineTo(x2 - 8 * Math.cos(angle - 0.55), y2 - 8 * Math.sin(angle - 0.55));
      ctx.lineTo(x2 - 8 * Math.cos(angle + 0.55), y2 - 8 * Math.sin(angle + 0.55));
      ctx.closePath();
      ctx.fill();
    };

    const draw = (now: number) => {
      const st = stateRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = st.width;
      const h = st.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = '#F7F5F2';
      ctx.fillRect(0, 0, w, h);

      const hitRegions: DynamicCanvasHitRegion[] = [];
      const isSelected = (id: string) => st.selectedComponentId === id;
      const alphaFor = (id: string) =>
        !st.selectedComponentId || st.selectedComponentId === id ? 1 : 0.42;
      const g = 9.8;

      if (!st.isBuoyancyPreset) {
        // Horizontal friction & Newton's 2nd law track
        const normalN = st.massKg * g;
        const maxFriction = st.frictionOrFluid * normalN;
        const netForce =
          st.forceOrDensity > maxFriction ? st.forceOrDensity - maxFriction : 0;
        const actualFriction =
          st.forceOrDensity > maxFriction ? maxFriction : st.forceOrDensity;
        const accel = netForce / Math.max(0.5, st.massKg);

        if (st.isPlaying) {
          const effDt = st.reducedMotion ? dt * 0.45 : dt;
          if (accel > 0.01) {
            st.blockVel += accel * effDt * 0.09;
            st.blockXFrac += st.blockVel * effDt;
          } else {
            st.blockVel = Math.max(0, st.blockVel - 0.25 * effDt);
            st.blockXFrac += st.blockVel * effDt;
          }
          if (st.blockXFrac > 0.84) {
            st.blockXFrac = 0.12;
            st.blockVel = 0;
          }
        }

        if (now - telemetryTick > 100) {
          telemetryTick = now;
          onTelemetryRef.current({
            mode: 'friction',
            netForceN: Number(netForce.toFixed(1)),
            frictionOrUpthrustN: Number(actualFriction.toFixed(1)),
            accelerationOrDepth: Number(accel.toFixed(2)),
            pressureKpa: Number(((normalN / 0.12) / 1000).toFixed(2)),
            statusLabel:
              netForce > 0.05 ? 'Unbalanced · Accelerating' : 'Balanced · Static Equilibrium',
          });
        }

        const surfaceY = Math.round(h * 0.64);
        // Surface floor
        ctx.save();
        ctx.globalAlpha = alphaFor('surface_or_fluid');
        const surfaceName =
          st.frictionOrFluid <= 0.14
            ? 'Smooth Ice (Low μ)'
            : st.frictionOrFluid <= 0.38
              ? 'Polished Wood (Medium μ)'
              : 'Coarse Sandpaper (High μ)';
        ctx.fillStyle =
          st.frictionOrFluid <= 0.14
            ? '#DFEFF5'
            : st.frictionOrFluid <= 0.38
              ? '#E7D7C1'
              : '#D4BFA8';
        ctx.fillRect(36, surfaceY, w - 72, 34);
        ctx.strokeStyle = isSelected('surface_or_fluid') ? '#B83A2D' : '#6F4E37';
        ctx.lineWidth = isSelected('surface_or_fluid') ? 2.5 : 1.5;
        ctx.strokeRect(36, surfaceY, w - 72, 34);

        if (st.frictionOrFluid > 0.38) {
          ctx.fillStyle = '#8C745D';
          for (let rx = 44; rx < w - 44; rx += 10) {
            ctx.fillRect(rx, surfaceY + 3, 2, 2);
          }
        }

        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(surfaceName, w / 2, surfaceY + 22);
        ctx.restore();

        hitRegions.push({
          componentId: 'surface_or_fluid',
          priority: 4,
          shape: {
            kind: 'rotated_rect',
            cx: w / 2,
            cy: surfaceY + 17,
            halfW: (w - 72) / 2,
            halfH: 17,
            angleRad: 0,
          },
        });

        // Test Block
        const blockSize = Math.min(84, 52 + st.massKg * 3.5);
        const bx = 48 + st.blockXFrac * (w - 130);
        const by = surfaceY - blockSize;

        ctx.save();
        ctx.globalAlpha = alphaFor('test_block');
        if (isSelected('test_block')) {
          ctx.fillStyle = 'rgba(111, 78, 55, 0.18)';
          ctx.fillRect(bx - blockSize / 2 - 6, by - 6, blockSize + 12, blockSize + 12);
        }
        ctx.fillStyle = '#6F4E37';
        ctx.strokeStyle = isSelected('test_block') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('test_block') ? 2.6 : 1.8;
        ctx.beginPath();
        ctx.roundRect(bx - blockSize / 2, by, blockSize, blockSize, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${st.massKg.toFixed(1)} kg`, bx, by + blockSize / 2 + 5);
        ctx.restore();

        hitRegions.push({
          componentId: 'test_block',
          priority: 1,
          shape: {
            kind: 'rotated_rect',
            cx: bx,
            cy: by + blockSize / 2,
            halfW: blockSize / 2 + 4,
            halfH: blockSize / 2 + 4,
            angleRad: 0,
          },
        });

        // Applied Force Arrow (rightward)
        const fLen = Math.min(130, 26 + st.forceOrDensity * 1.7);
        const fStartX = bx + blockSize / 2 + 4;
        const fY = by + blockSize / 2;
        if (st.forceOrDensity > 0) {
          ctx.save();
          ctx.globalAlpha = alphaFor('applied_force_arrow');
          drawArrow(
            fStartX,
            fY,
            fStartX + fLen,
            fY,
            isSelected('applied_force_arrow') ? '#B83A2D' : '#2B7A78',
            isSelected('applied_force_arrow') ? 4.5 : 3.2
          );
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#2B7A78';
          ctx.fillText(`F_app = ${st.forceOrDensity.toFixed(0)} N`, fStartX + 4, fY - 12);
          ctx.restore();
          hitRegions.push({
            componentId: 'applied_force_arrow',
            priority: 2,
            shape: {
              kind: 'polylines',
              lines: [[{ x: fStartX, y: fY }, { x: fStartX + fLen, y: fY }]],
              tolerance: 14,
            },
          });
        }

        // Friction Force Arrow (leftward along bottom edge)
        const frLen = Math.min(115, 22 + actualFriction * 1.7);
        if (actualFriction > 0.5) {
          const frStartX = bx - blockSize / 2 - 4;
          const frY = surfaceY - 10;
          ctx.save();
          ctx.globalAlpha = alphaFor('friction_force_arrow');
          drawArrow(
            frStartX,
            frY,
            Math.max(20, frStartX - frLen),
            frY,
            isSelected('friction_force_arrow') ? '#B45309' : '#B83A2D',
            isSelected('friction_force_arrow') ? 4.5 : 3.2
          );
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillStyle = '#B83A2D';
          ctx.fillText(`f = ${actualFriction.toFixed(1)} N`, frStartX - 4, frY - 12);
          ctx.restore();
          hitRegions.push({
            componentId: 'friction_force_arrow',
            priority: 2,
            shape: {
              kind: 'polylines',
              lines: [
                [
                  { x: frStartX, y: frY },
                  { x: Math.max(20, frStartX - frLen), y: frY },
                ],
              ],
              tolerance: 14,
            },
          });
        }

        // Summary equation banner at top of stage
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#D8D1CA';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(36, 22, w - 72, 56, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#302820';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `F_net = ${st.forceOrDensity.toFixed(1)} N − ${actualFriction.toFixed(1)} N = ${netForce.toFixed(1)} N  |  a = F_net / m = ${accel.toFixed(2)} m/s²`,
          w / 2,
          55
        );
      } else {
        // Liquid Buoyancy & Hydrostatic Pressure mode with RK4 vertical dynamics
        const objDensity = 450 + (st.forceOrDensity / 60) * 1700;
        const fluidDensity = 850 + ((st.frictionOrFluid - 0.05) / 0.6) * 450;

        const targetSubmerge = Math.min(1, Math.max(0.15, objDensity / fluidDensity));
        const floats = objDensity <= fluidDensity;

        if (st.isPlaying) {
          const effDt = st.reducedMotion ? dt * 0.45 : dt;
          const subSteps = 2;
          const hStep = effDt / subSteps;
          const accelBuoy = (s: number, v: number) => {
            const clampedSub = Math.min(1, Math.max(0, s));
            const gravityTerm = g;
            const upthrustTerm = g * (fluidDensity / objDensity) * clampedSub;
            return (gravityTerm - upthrustTerm) * 1.4 - 4.2 * v;
          };
          for (let step = 0; step < subSteps; step++) {
            const s = st.submergeFrac;
            const v = st.submergeVel;

            const k1S = v;
            const k1V = accelBuoy(s, v);

            const k2S = v + 0.5 * hStep * k1V;
            const k2V = accelBuoy(s + 0.5 * hStep * k1S, k2S);

            const k3S = v + 0.5 * hStep * k2V;
            const k3V = accelBuoy(s + 0.5 * hStep * k2S, k3S);

            const k4S = v + hStep * k3V;
            const k4V = accelBuoy(s + hStep * k3S, k4S);

            st.submergeFrac += (hStep / 6) * (k1S + 2 * k2S + 2 * k3S + k4S);
            st.submergeVel += (hStep / 6) * (k1V + 2 * k2V + 2 * k3V + k4V);
            if (st.submergeFrac < 0.05) {
              st.submergeFrac = 0.05;
              st.submergeVel = Math.max(0, st.submergeVel);
            } else if (!floats && st.submergeFrac > 1.0) {
              st.submergeFrac = 1.0;
              st.submergeVel = 0;
            }
          }
        } else {
          st.submergeFrac = targetSubmerge;
          st.submergeVel = 0;
        }

        const volumeM3 = st.massKg / objDensity;
        const weightN = st.massKg * g;
        const submergedV = volumeM3 * Math.min(1, st.submergeFrac);
        const upthrustN = fluidDensity * submergedV * g;
        const netVert = Math.abs(weightN - upthrustN);

        const tankX = Math.round(w * 0.24);
        const tankW = Math.round(w * 0.52);
        const tankTop = 58;
        const tankH = h - 98;
        const waterTop = tankTop + 62;
        const waterH = tankH - 62;
        const depthM = floats ? Math.min(1, st.submergeFrac) * 0.6 : 1.8;
        const pressureKpa = 101.325 + (fluidDensity * g * depthM) / 1000;

        if (now - telemetryTick > 100) {
          telemetryTick = now;
          onTelemetryRef.current({
            mode: 'buoyancy',
            netForceN: Number(netVert.toFixed(1)),
            frictionOrUpthrustN: Number(upthrustN.toFixed(1)),
            accelerationOrDepth: Number(depthM.toFixed(2)),
            pressureKpa: Number(pressureKpa.toFixed(2)),
            statusLabel: floats
              ? `Floats (${Math.round(targetSubmerge * 100)}% submerged)`
              : 'Sinks · Weight exceeds Max Buoyancy',
          });
        }

        // Fluid column
        ctx.save();
        ctx.globalAlpha = alphaFor('surface_or_fluid');
        const grad = ctx.createLinearGradient(0, waterTop, 0, tankTop + tankH);
        grad.addColorStop(0, 'rgba(116, 175, 206, 0.42)');
        grad.addColorStop(1, 'rgba(43, 122, 120, 0.58)');
        ctx.fillStyle = grad;
        ctx.fillRect(tankX, waterTop, tankW, waterH);

        ctx.strokeStyle = isSelected('surface_or_fluid') ? '#B83A2D' : '#3E4C59';
        ctx.lineWidth = isSelected('surface_or_fluid') ? 3 : 2;
        ctx.strokeRect(tankX, tankTop, tankW, tankH);
        ctx.restore();

        hitRegions.push({
          componentId: 'surface_or_fluid',
          priority: 5,
          shape: {
            kind: 'rotated_rect',
            cx: tankX + tankW / 2,
            cy: waterTop + waterH / 2,
            halfW: tankW / 2,
            halfH: waterH / 2,
            angleRad: 0,
          },
        });

        // Depth markings on left side of tank
        ctx.fillStyle = '#302820';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        [0, 0.5, 1.0, 1.5, 2.0].forEach((dm, idx) => {
          const dy = waterTop + (idx / 4) * (waterH - 12);
          ctx.fillText(`${dm.toFixed(1)}m`, tankX - 8, dy + 4);
          ctx.beginPath();
          ctx.moveTo(tankX, dy);
          ctx.lineTo(tankX + 8, dy);
          ctx.strokeStyle = '#3E4C59';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Submerged or floating block
        const bSize = 72;
        const bx = tankX + tankW / 2;
        const by = floats
          ? waterTop - bSize * (1 - st.submergeFrac)
          : tankTop + tankH - bSize - 6;

        ctx.save();
        ctx.globalAlpha = alphaFor('test_block');
        ctx.fillStyle = '#6F4E37';
        ctx.strokeStyle = isSelected('test_block') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('test_block') ? 3 : 1.8;
        ctx.beginPath();
        ctx.roundRect(bx - bSize / 2, by, bSize, bSize, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(objDensity)} kg/m³`, bx, by + bSize / 2 + 4);
        ctx.restore();

        hitRegions.push({
          componentId: 'test_block',
          priority: 1,
          shape: {
            kind: 'rotated_rect',
            cx: bx,
            cy: by + bSize / 2,
            halfW: bSize / 2 + 4,
            halfH: bSize / 2 + 4,
            angleRad: 0,
          },
        });

        // Downward Weight Vector (from block center)
        const wLen = Math.min(82, 26 + weightN * 0.65);
        ctx.save();
        ctx.globalAlpha = alphaFor('applied_force_arrow');
        drawArrow(
          bx + 14,
          by + bSize / 2,
          bx + 14,
          by + bSize / 2 + wLen,
          isSelected('applied_force_arrow') ? '#B45309' : '#B83A2D',
          3
        );
        ctx.fillStyle = '#B83A2D';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`W = ${weightN.toFixed(1)} N`, bx + 22, by + bSize / 2 + wLen);
        ctx.restore();
        hitRegions.push({
          componentId: 'applied_force_arrow',
          priority: 2,
          shape: {
            kind: 'polylines',
            lines: [
              [
                { x: bx + 14, y: by + bSize / 2 },
                { x: bx + 14, y: by + bSize / 2 + wLen },
              ],
            ],
            tolerance: 14,
          },
        });

        // Upward Buoyant Upthrust Vector
        const bLen = Math.min(82, 26 + upthrustN * 0.65);
        ctx.save();
        ctx.globalAlpha = alphaFor('buoyancy_arrow');
        drawArrow(
          bx - 14,
          by + bSize / 2,
          bx - 14,
          Math.max(tankTop + 14, by + bSize / 2 - bLen),
          isSelected('buoyancy_arrow') ? '#B45309' : '#2B7A78',
          3
        );
        ctx.fillStyle = '#2B7A78';
        ctx.textAlign = 'right';
        ctx.fillText(
          `F_b = ${upthrustN.toFixed(1)} N`,
          bx - 22,
          Math.max(tankTop + 20, by + bSize / 2 - bLen)
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'buoyancy_arrow',
          priority: 2,
          shape: {
            kind: 'polylines',
            lines: [
              [
                { x: bx - 14, y: by + bSize / 2 },
                { x: bx - 14, y: Math.max(tankTop + 14, by + bSize / 2 - bLen) },
              ],
            ],
            tolerance: 14,
          },
        });

        // Top fluid telemetry caption
        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Fluid ρ = ${Math.round(fluidDensity)} kg/m³ · Pressure P ≈ ${pressureKpa.toFixed(1)} kPa`,
          w / 2,
          34
        );
      }

      st.hitRegions = hitRegions;
      if (st.selectedComponentId) {
        const match = hitRegions.find((r) => r.componentId === st.selectedComponentId);
        if (match) {
          const s = match.shape;
          const ax =
            s.kind === 'rotated_rect'
              ? s.cx
              : s.kind === 'polylines'
                ? s.lines[0][0].x
                : w / 2;
          const ay =
            s.kind === 'rotated_rect'
              ? s.cy
              : s.kind === 'polylines'
                ? s.lines[0][0].y
                : h / 2;
          onAnchorMoveRef.current?.({ x: ax, y: ay }, { width: w, height: h });
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hit = hitTestGeometricRegions(
      { x: e.clientX - rect.left, y: e.clientY - rect.top },
      stateRef.current.hitRegions
    );
    setHoverSelectable(Boolean(hit));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const hit = hitTestGeometricRegions(pt, stateRef.current.hitRegions);
    if (hit) {
      onComponentHitRef.current?.({
        componentId: hit.componentId,
        anchorPx: hit.hitPoint,
        viewportSize: { width: rect.width, height: rect.height },
      });
    } else {
      onComponentHitRef.current?.(null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className={`block w-full h-full ${hoverSelectable ? 'cursor-pointer' : 'cursor-default'}`}
        aria-label="Interactive forces, friction, pressure, and buoyancy simulation canvas"
      />
    </div>
  );
};
