import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export type OpticsSubMode =
  | 'plane_mirror'
  | 'concave_mirror'
  | 'convex_mirror'
  | 'glass_slab'
  | 'convex_lens'
  | 'concave_lens'
  | 'prism_dispersion';

export interface OpticsTelemetry {
  subMode: OpticsSubMode;
  primaryMetricLabel: string;
  secondaryMetricLabel: string;
  imageOrDeviationSummary: string;
}

export function computeOpticsTelemetry(params: {
  subMode: OpticsSubMode;
  incidenceOrObjDeg: number;
  refractiveOrFocal: number;
  objectDistanceCm?: number;
  focalLengthCm?: number;
}): OpticsTelemetry {
  const { subMode, incidenceOrObjDeg, refractiveOrFocal, objectDistanceCm, focalLengthCm } = params;

  if (subMode === 'plane_mirror') {
    return {
      subMode: 'plane_mirror',
      primaryMetricLabel: `θᵢ = ${incidenceOrObjDeg.toFixed(1)}°`,
      secondaryMetricLabel: `θᵣ = ${incidenceOrObjDeg.toFixed(1)}°`,
      imageOrDeviationSummary: 'Virtual, upright, same size, laterally inverted',
    };
  }

  if (subMode === 'glass_slab') {
    const thetaI = (incidenceOrObjDeg * Math.PI) / 180;
    const n = refractiveOrFocal;
    const sinR = Math.min(0.95, Math.sin(thetaI) / n);
    const thetaR = Math.asin(sinR);
    const rDeg = (thetaR * 180) / Math.PI;
    const approxShiftCm = Math.sin(thetaI - thetaR) / Math.max(0.2, Math.cos(thetaR)) * 5.0;
    return {
      subMode: 'glass_slab',
      primaryMetricLabel: `sin i / sin r = ${n.toFixed(2)}`,
      secondaryMetricLabel: `r = ${rDeg.toFixed(1)}° (Emergent e = ${incidenceOrObjDeg.toFixed(0)}°)`,
      imageOrDeviationSummary: `Lateral shift d ≈ ${approxShiftCm.toFixed(2)} cm`,
    };
  }

  if (subMode === 'prism_dispersion') {
    return {
      subMode: 'prism_dispersion',
      primaryMetricLabel: `n_base = ${refractiveOrFocal.toFixed(2)}`,
      secondaryMetricLabel: 'Red (min δ) → Violet (max δ)',
      imageOrDeviationSummary: 'Dispersion into 7 VIBGYOR wavelengths',
    };
  }

  const fCm = focalLengthCm ?? Math.round(10 + ((refractiveOrFocal - 1.1) / 0.9) * 18);
  const uCm = objectDistanceCm ?? Math.round(8 + ((incidenceOrObjDeg - 10) / 65) * 52);

  if (subMode === 'convex_mirror') {
    // Convex mirror: f = +fCm behind mirror, u_signed = -uCm => v_behind = (uCm * fCm) / (uCm + fCm)
    const vBehindCm = (uCm * fCm) / (uCm + fCm);
    const mag = fCm / (uCm + fCm); // positive, < 1 (upright, diminished)
    return {
      subMode: 'convex_mirror',
      primaryMetricLabel: `f = +${fCm} cm · u = −${uCm} cm`,
      secondaryMetricLabel: `v = +${vBehindCm.toFixed(1)} cm · m = +${mag.toFixed(2)}×`,
      imageOrDeviationSummary: 'Virtual, Upright & Diminished (behind mirror)',
    };
  }

  if (subMode === 'concave_lens') {
    // Diverging concave lens: f = -fCm, u = -uCm => v = -(uCm * fCm) / (uCm + fCm) (virtual, object side)
    const vVirtualCm = (uCm * fCm) / (uCm + fCm);
    const mag = fCm / (uCm + fCm); // positive, < 1 (upright, diminished)
    return {
      subMode: 'concave_lens',
      primaryMetricLabel: `f = −${fCm} cm · u = −${uCm} cm`,
      secondaryMetricLabel: `v = −${vVirtualCm.toFixed(1)} cm · m = +${mag.toFixed(2)}×`,
      imageOrDeviationSummary: 'Virtual, Upright & Diminished (same side as object)',
    };
  }

  const denom = uCm - fCm;

  if (Math.abs(denom) < 0.5) {
    return {
      subMode,
      primaryMetricLabel: `f = ${fCm} cm · u = ${uCm} cm`,
      secondaryMetricLabel: 'v = ∞ · Rays parallel (At Focus F)',
      imageOrDeviationSummary: 'Image formed at Infinity (parallel emergent rays)',
    };
  }

  const vCm = (uCm * fCm) / denom;
  const mag = -vCm / uCm;
  const isVirtual = uCm < fCm;
  const absMag = Math.abs(mag);
  const sizeLabel = absMag > 1.05 ? 'Magnified' : absMag < 0.95 ? 'Diminished' : 'Same Size';

  return {
    subMode,
    primaryMetricLabel: `f = ${fCm} cm · u = ${uCm} cm`,
    secondaryMetricLabel: `v = ${vCm < 0 ? '−' : ''}${Math.abs(vCm).toFixed(1)} cm · m = ${mag.toFixed(2)}×`,
    imageOrDeviationSummary: `${isVirtual ? 'Virtual & Upright' : 'Real & Inverted'} (${sizeLabel})`,
  };
}

interface OpticsRayCanvasProps {
  subMode: OpticsSubMode;
  incidenceOrObjDeg: number; // angle (10..75 deg) OR legacy mapped u
  refractiveOrFocal: number; // refractive index (1.1..2.0) OR legacy mapped f
  objectDistanceCm?: number; // direct object distance u (8..60 cm)
  focalLengthCm?: number; // direct focal length f (10..28 cm)
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: OpticsTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

export const OpticsRayCanvas: React.FC<OpticsRayCanvasProps> = ({
  subMode,
  incidenceOrObjDeg,
  refractiveOrFocal,
  objectDistanceCm,
  focalLengthCm,
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

  const stateRef = useRef({
    subMode,
    incidenceOrObjDeg,
    refractiveOrFocal,
    objectDistanceCm,
    focalLengthCm,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    pulse: 0,
    hitRegions: [] as DynamicCanvasHitRegion[],
    width: 640,
    height: 440,
  });

  stateRef.current.subMode = subMode;
  stateRef.current.incidenceOrObjDeg = incidenceOrObjDeg;
  stateRef.current.refractiveOrFocal = refractiveOrFocal;
  stateRef.current.objectDistanceCm = objectDistanceCm;
  stateRef.current.focalLengthCm = focalLengthCm;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    stateRef.current.pulse = 0;
  }, [resetSignal, subMode]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();
    let telemetryTick = 0;
    let lastParamKey = '';

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(220, Math.floor(rect.width));
      const h = Math.max(200, Math.floor(rect.height));
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
    window.addEventListener('orientationchange', resize);

    const drawRayArrow = (x1: number, y1: number, x2: number, y2: number, color: string, lw = 2.6) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const segLen = Math.hypot(x2 - x1, y2 - y1);
      if (segLen < 12) return;
      const mx = (x1 + x2) * 0.5;
      const my = (y1 + y2) * 0.5;
      const ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(mx + 6 * Math.cos(ang), my + 6 * Math.sin(ang));
      ctx.lineTo(mx - 5 * Math.cos(ang - 0.6), my - 5 * Math.sin(ang - 0.6));
      ctx.lineTo(mx - 5 * Math.cos(ang + 0.6), my - 5 * Math.sin(ang + 0.6));
      ctx.closePath();
      ctx.fill();
    };

    const draw = (now: number) => {
      const st = stateRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      if (st.isPlaying) {
        st.pulse += (st.reducedMotion ? dt * 0.45 : dt) * 2.2;
      }

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

      const paramKey = `${st.subMode}|${st.incidenceOrObjDeg}|${st.refractiveOrFocal}|${st.objectDistanceCm ?? ''}|${st.focalLengthCm ?? ''}`;
      const shouldPushTelemetry = paramKey !== lastParamKey || now - telemetryTick > 100;
      if (shouldPushTelemetry) {
        lastParamKey = paramKey;
        telemetryTick = now;
        onTelemetryRef.current(
          computeOpticsTelemetry({
            subMode: st.subMode,
            incidenceOrObjDeg: st.incidenceOrObjDeg,
            refractiveOrFocal: st.refractiveOrFocal,
            objectDistanceCm: st.objectDistanceCm,
            focalLengthCm: st.focalLengthCm,
          })
        );
      }

      if (st.subMode === 'plane_mirror') {
        const mx = w * 0.5;
        const my = h * 0.74;
        const mirrorW = Math.min(340, w * 0.74);
        const thetaI = (st.incidenceOrObjDeg * Math.PI) / 180;
        const rayLen = Math.min(200, h * 0.52);

        const ix = mx - rayLen * Math.sin(thetaI);
        const iy = my - rayLen * Math.cos(thetaI);
        const rx = mx + rayLen * Math.sin(thetaI);
        const ry = my - rayLen * Math.cos(thetaI);

        // Plane mirror bar + hatching
        ctx.save();
        ctx.globalAlpha = alphaFor('mirror');
        ctx.fillStyle = '#3E4C59';
        ctx.strokeStyle = isSelected('mirror') ? '#B83A2D' : '#6F4E37';
        ctx.lineWidth = isSelected('mirror') ? 3 : 2;
        ctx.fillRect(mx - mirrorW / 2, my, mirrorW, 11);
        ctx.strokeRect(mx - mirrorW / 2, my, mirrorW, 11);
        for (let hx = mx - mirrorW / 2 + 8; hx < mx + mirrorW / 2; hx += 14) {
          ctx.beginPath();
          ctx.moveTo(hx, my + 11);
          ctx.lineTo(hx - 7, my + 18);
          ctx.stroke();
        }
        ctx.restore();
        hitRegions.push({
          componentId: 'mirror',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: mx,
            cy: my + 6,
            halfW: mirrorW / 2,
            halfH: 14,
            angleRad: 0,
          },
        });

        // Normal dashed line
        ctx.save();
        ctx.globalAlpha = alphaFor('normal');
        ctx.strokeStyle = isSelected('normal') ? '#B83A2D' : '#756B63';
        ctx.lineWidth = isSelected('normal') ? 2.6 : 1.6;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx, Math.max(24, my - rayLen - 12));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#756B63';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Normal (N)', mx, Math.max(16, my - rayLen - 18));
        ctx.restore();
        hitRegions.push({
          componentId: 'normal',
          priority: 3,
          shape: {
            kind: 'polylines',
            lines: [[{ x: mx, y: my }, { x: mx, y: Math.max(24, my - rayLen) }]],
            tolerance: 12,
          },
        });

        // Incident & Reflected rays
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(
          ix,
          iy,
          mx,
          my,
          isSelected('incident_ray') ? '#B83A2D' : '#6F4E37',
          isSelected('incident_ray') ? 3.8 : 2.8
        );
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alphaFor('reflected_ray');
        drawRayArrow(
          mx,
          my,
          rx,
          ry,
          isSelected('reflected_ray') ? '#B83A2D' : '#2B7A78',
          isSelected('reflected_ray') ? 3.8 : 2.8
        );
        ctx.restore();

        const labelYOffset = Math.min(56, rayLen * 0.38);
        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`θᵢ = ${st.incidenceOrObjDeg.toFixed(0)}°`, mx - 14, my - labelYOffset);
        ctx.textAlign = 'left';
        ctx.fillText(`θᵣ = ${st.incidenceOrObjDeg.toFixed(0)}°`, mx + 14, my - labelYOffset);

        hitRegions.push({
          componentId: 'incident_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: ix, y: iy }, { x: mx, y: my }]], tolerance: 14 },
        });
        hitRegions.push({
          componentId: 'reflected_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: mx, y: my }, { x: rx, y: ry }]], tolerance: 14 },
        });
      } else if (st.subMode === 'glass_slab') {
        const slabX = w * 0.22;
        const slabW = w * 0.56;
        const slabTop = h * 0.32;
        const slabH = h * 0.36;
        const entryX = w * 0.4;
        const entryY = slabTop;

        const thetaI = (st.incidenceOrObjDeg * Math.PI) / 180;
        const n = st.refractiveOrFocal;
        const sinR = Math.min(0.95, Math.sin(thetaI) / n);
        const thetaR = Math.asin(sinR);

        const dxInside = slabH * Math.tan(thetaR);
        const exitX = entryX + dxInside;
        const exitY = slabTop + slabH;

        const incLen = Math.min(125, h * 0.28);
        const incStartX = entryX - incLen * Math.sin(thetaI);
        const incStartY = entryY - incLen * Math.cos(thetaI);
        const emEndX = exitX + incLen * Math.sin(thetaI);
        const emEndY = exitY + incLen * Math.cos(thetaI);

        // Glass slab rectangle
        ctx.save();
        ctx.globalAlpha = alphaFor('glass_slab');
        ctx.fillStyle = 'rgba(135, 190, 215, 0.35)';
        ctx.strokeStyle = isSelected('glass_slab') ? '#B83A2D' : '#3E4C59';
        ctx.lineWidth = isSelected('glass_slab') ? 3 : 2;
        ctx.fillRect(slabX, slabTop, slabW, slabH);
        ctx.strokeRect(slabX, slabTop, slabW, slabH);

        ctx.fillStyle = '#3E4C59';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Glass Slab (n = ${n.toFixed(2)})`, slabX + 8, slabTop + 18);
        ctx.restore();
        hitRegions.push({
          componentId: 'glass_slab',
          priority: 4,
          shape: {
            kind: 'rotated_rect',
            cx: slabX + slabW / 2,
            cy: slabTop + slabH / 2,
            halfW: slabW / 2,
            halfH: slabH / 2,
            angleRad: 0,
          },
        });

        // Normal at entry
        const normalHalf = Math.min(75, h * 0.25);
        ctx.save();
        ctx.globalAlpha = alphaFor('normal');
        ctx.strokeStyle = isSelected('normal') ? '#B83A2D' : '#756B63';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(entryX, slabTop - normalHalf);
        ctx.lineTo(entryX, slabTop + normalHalf);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'normal',
          priority: 3,
          shape: {
            kind: 'polylines',
            lines: [[{ x: entryX, y: slabTop - normalHalf }, { x: entryX, y: slabTop + normalHalf }]],
            tolerance: 12,
          },
        });

        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(incStartX, incStartY, entryX, entryY, isSelected('incident_ray') ? '#B83A2D' : '#6F4E37', 2.8);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alphaFor('refracted_ray');
        drawRayArrow(entryX, entryY, exitX, exitY, isSelected('refracted_ray') ? '#B83A2D' : '#2B7A78', 2.8);
        drawRayArrow(exitX, exitY, emEndX, emEndY, '#C27D38', 2.5);
        ctx.restore();

        const rDeg = (thetaR * 180) / Math.PI;
        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillText(`i = ${st.incidenceOrObjDeg.toFixed(0)}°`, entryX - 54, slabTop - 12);
        ctx.fillText(`r = ${rDeg.toFixed(1)}°`, entryX + 10, slabTop + 34);
        ctx.fillText(`e = ${st.incidenceOrObjDeg.toFixed(0)}°`, exitX + 12, exitY + 18);

        hitRegions.push({
          componentId: 'incident_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: incStartX, y: incStartY }, { x: entryX, y: entryY }]], tolerance: 14 },
        });
        hitRegions.push({
          componentId: 'refracted_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: entryX, y: entryY }, { x: exitX, y: exitY }]], tolerance: 14 },
        });
      } else if (st.subMode === 'prism_dispersion') {
        const cx = w * 0.45;
        const apexY = h * 0.2;
        const baseY = h * 0.78;
        const halfBase = (baseY - apexY) * 0.58;

        // Equilateral prism
        ctx.save();
        ctx.globalAlpha = alphaFor('prism');
        ctx.fillStyle = 'rgba(135, 190, 215, 0.34)';
        ctx.strokeStyle = isSelected('prism') ? '#B83A2D' : '#3E4C59';
        ctx.lineWidth = isSelected('prism') ? 3 : 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, apexY);
        ctx.lineTo(cx - halfBase, baseY);
        ctx.lineTo(cx + halfBase, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        hitRegions.push({
          componentId: 'prism',
          priority: 4,
          shape: { kind: 'circle', cx, cy: (apexY + baseY) * 0.55, radius: halfBase * 0.75 },
        });

        const hitX = cx - halfBase * 0.46;
        const hitY = (apexY + baseY) * 0.52;
        const inX = Math.max(20, w * 0.08);
        const inY = hitY + Math.tan(((st.incidenceOrObjDeg - 35) * Math.PI) / 180) * Math.min(65, h * 0.16);

        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(inX, inY, hitX, hitY, isSelected('incident_ray') ? '#B83A2D' : '#302820', 3.2);
        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('White Sunlight', inX, Math.max(18, inY - 10));
        ctx.restore();
        hitRegions.push({
          componentId: 'incident_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: inX, y: inY }, { x: hitX, y: hitY }]], tolerance: 14 },
        });

        const spectrum = [
          { name: 'Red', color: '#DC2626', bend: 0.16 },
          { name: 'Orange', color: '#EA580C', bend: 0.22 },
          { name: 'Yellow', color: '#CA8A04', bend: 0.27 },
          { name: 'Green', color: '#16A34A', bend: 0.33 },
          { name: 'Blue', color: '#2563EB', bend: 0.39 },
          { name: 'Indigo', color: '#4338CA', bend: 0.44 },
          { name: 'Violet', color: '#7C3AED', bend: 0.5 },
        ];
        const exitX = cx + halfBase * 0.46;
        const scaleBend = (st.refractiveOrFocal - 1) * 1.4;
        const screenX = w - Math.max(20, w * 0.08);
        const bandStep = Math.min(5.5, h * 0.02);
        const spreadScale = Math.min(145, h * 0.32);

        ctx.save();
        ctx.globalAlpha = alphaFor('refracted_ray');
        spectrum.forEach((band, idx) => {
          const exitY = hitY + 6 + idx * bandStep;
          const endY = Math.min(h - 14, exitY + band.bend * scaleBend * spreadScale);
          ctx.strokeStyle = band.color;
          ctx.lineWidth = isSelected('refracted_ray') ? 2.8 : 2.1;
          ctx.beginPath();
          ctx.moveTo(hitX, hitY);
          ctx.lineTo(exitX, exitY);
          ctx.lineTo(screenX, endY);
          ctx.stroke();
        });
        ctx.restore();

        hitRegions.push({
          componentId: 'refracted_ray',
          priority: 2,
          shape: {
            kind: 'polylines',
            lines: [[{ x: hitX, y: hitY }, { x: screenX, y: hitY + 40 }]],
            tolerance: 24,
          },
        });
      } else if (st.subMode === 'convex_mirror') {
        // Diverging Spherical Convex Mirror Bench
        const axisY = h * 0.56;
        const elemX = w * 0.56;
        const benchHalfH = Math.min(92, h * 0.36);
        const objH = Math.min(54, h * 0.21);

        const fCm =
          st.focalLengthCm ?? Math.round(10 + ((st.refractiveOrFocal - 1.1) / 0.9) * 18);
        const uCm =
          st.objectDistanceCm ?? Math.round(8 + ((st.incidenceOrObjDeg - 10) / 65) * 52);

        const pxPerCm = Math.max(1.8, Math.min(3.8, (w * 0.44) / 62));
        const fPx = fCm * pxPerCm;
        const uPx = uCm * pxPerCm;
        const objX = elemX - uPx;

        // Principal Axis
        ctx.save();
        ctx.globalAlpha = alphaFor('normal');
        ctx.strokeStyle = isSelected('normal') ? '#B83A2D' : '#756B63';
        ctx.lineWidth = isSelected('normal') ? 2.4 : 1.5;
        ctx.beginPath();
        ctx.moveTo(16, axisY);
        ctx.lineTo(w - 16, axisY);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'normal',
          priority: 5,
          shape: { kind: 'polylines', lines: [[{ x: 16, y: axisY }, { x: w - 16, y: axisY }]], tolerance: 10 },
        });

        const drawFocusDot = (fx: number, lbl: string) => {
          if (fx < 18 || fx > w - 18) return;
          ctx.fillStyle = '#6F4E37';
          ctx.beginPath();
          ctx.arc(fx, axisY, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '600 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lbl, fx, axisY + 15);
        };
        drawFocusDot(elemX + fPx, 'F');
        drawFocusDot(elemX + 2 * fPx, 'C');

        // Outward-bulging convex mirror (reflecting face faces left toward object)
        const mirrorR = benchHalfH * 1.95;
        const arcSpan = Math.asin(Math.min(0.9, benchHalfH / mirrorR));
        ctx.save();
        ctx.globalAlpha = alphaFor('convex_mirror');
        ctx.strokeStyle = isSelected('convex_mirror') ? '#B83A2D' : '#3E4C59';
        ctx.lineWidth = isSelected('convex_mirror') ? 5.5 : 4.2;
        ctx.beginPath();
        ctx.arc(elemX + mirrorR, axisY, mirrorR, Math.PI - arcSpan, Math.PI + arcSpan);
        ctx.stroke();
        // Subtle silvered back-hatching on inner right edge
        ctx.lineWidth = 1.4;
        for (let ang = Math.PI - arcSpan + 0.08; ang <= Math.PI + arcSpan - 0.08; ang += 0.14) {
          const hx = elemX + mirrorR + mirrorR * Math.cos(ang);
          const hy = axisY + mirrorR * Math.sin(ang);
          ctx.beginPath();
          ctx.moveTo(hx + 2, hy);
          ctx.lineTo(hx + 8, hy - 5);
          ctx.stroke();
        }
        ctx.restore();
        hitRegions.push({
          componentId: 'convex_mirror',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: elemX,
            cy: axisY,
            halfW: 20,
            halfH: benchHalfH,
            angleRad: 0,
          },
        });

        // Object arrow (left of mirror)
        const rayTopY = axisY - objH;
        drawRayArrow(objX, axisY, objX, rayTopY, '#302820', 3.2);
        ctx.fillStyle = '#302820';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Object (${uCm}cm)`, Math.max(42, objX), axisY + 30);

        const focusX = elemX + fPx;
        const vBehindCm = (uCm * fCm) / (uCm + fCm);
        const mag = fCm / (uCm + fCm);
        const imgX = elemX + vBehindCm * pxPerCm;
        const imgTopY = axisY - objH * mag;

        // Ray 1: Parallel to principal axis, reflects diverging away from F behind mirror
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(
          objX,
          rayTopY,
          elemX,
          rayTopY,
          isSelected('incident_ray') ? '#B83A2D' : '#6F4E37',
          isSelected('incident_ray') ? 3.4 : 2.3
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'incident_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: objX, y: rayTopY }, { x: elemX, y: rayTopY }]], tolerance: 12 },
        });

        const divDx = elemX - focusX;
        const divDy = rayTopY - axisY;
        const divScale = Math.max(0.85, Math.min(2.0, (w * 0.34) / Math.max(20, Math.abs(divDx))));
        const refOutX = elemX + divDx * divScale;
        const refOutY = Math.max(16, rayTopY + divDy * divScale);

        ctx.save();
        ctx.globalAlpha = alphaFor('reflected_ray');
        drawRayArrow(
          elemX,
          rayTopY,
          refOutX,
          refOutY,
          isSelected('reflected_ray') ? '#B83A2D' : '#2B7A78',
          isSelected('reflected_ray') ? 3.4 : 2.3
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'reflected_ray',
          priority: 2,
          shape: { kind: 'polylines', lines: [[{ x: elemX, y: rayTopY }, { x: refOutX, y: refOutY }]], tolerance: 14 },
        });

        // Ray 2: To Pole P reflecting symmetrically downward
        const slopeO = (axisY - rayTopY) / Math.max(1, elemX - objX);
        const rayCenterLen = Math.max(90, w * 0.28);
        const poleRefOutX = elemX - rayCenterLen;
        const poleRefOutY = axisY + slopeO * (elemX - poleRefOutX);
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(objX, rayTopY, elemX, axisY, '#6F4E37', 1.8);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alphaFor('reflected_ray');
        drawRayArrow(elemX, axisY, poleRefOutX, poleRefOutY, '#2B7A78', 1.8);
        ctx.restore();

        // Dashed virtual extensions behind mirror meeting at diminished upright image
        ctx.save();
        ctx.strokeStyle = '#2B7A78';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(elemX, rayTopY);
        ctx.lineTo(focusX, axisY);
        ctx.moveTo(elemX, axisY);
        ctx.lineTo(imgX, imgTopY);
        ctx.stroke();
        drawRayArrow(imgX, axisY, imgX, imgTopY, '#B83A2D', 2.8);
        ctx.restore();
        ctx.fillStyle = '#B83A2D';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Virtual Image', Math.max(46, Math.min(w - 46, imgX)), Math.max(16, imgTopY - 8));
      } else if (st.subMode === 'concave_lens') {
        // Diverging Biconcave Lens Bench
        const axisY = h * 0.56;
        const elemX = w * 0.5;
        const benchHalfH = Math.min(92, h * 0.36);
        const objH = Math.min(54, h * 0.21);

        const fCm =
          st.focalLengthCm ?? Math.round(10 + ((st.refractiveOrFocal - 1.1) / 0.9) * 18);
        const uCm =
          st.objectDistanceCm ?? Math.round(8 + ((st.incidenceOrObjDeg - 10) / 65) * 52);

        const pxPerCm = Math.max(1.8, Math.min(4.2, (w * 0.42) / 62));
        const fPx = fCm * pxPerCm;
        const uPx = uCm * pxPerCm;
        const objX = elemX - uPx;

        // Principal Axis
        ctx.save();
        ctx.globalAlpha = alphaFor('normal');
        ctx.strokeStyle = isSelected('normal') ? '#B83A2D' : '#756B63';
        ctx.lineWidth = isSelected('normal') ? 2.4 : 1.5;
        ctx.beginPath();
        ctx.moveTo(16, axisY);
        ctx.lineTo(w - 16, axisY);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'normal',
          priority: 5,
          shape: { kind: 'polylines', lines: [[{ x: 16, y: axisY }, { x: w - 16, y: axisY }]], tolerance: 10 },
        });

        const drawFocusDot = (fx: number, lbl: string) => {
          if (fx < 18 || fx > w - 18) return;
          ctx.fillStyle = '#6F4E37';
          ctx.beginPath();
          ctx.arc(fx, axisY, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '600 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lbl, fx, axisY + 15);
        };
        drawFocusDot(elemX - fPx, 'F₁');
        drawFocusDot(elemX - 2 * fPx, '2F₁');
        drawFocusDot(elemX + fPx, 'F₂');
        drawFocusDot(elemX + 2 * fPx, '2F₂');

        // Double-concave lens shape (thinner at center, flared edges)
        ctx.save();
        ctx.globalAlpha = alphaFor('concave_lens');
        ctx.fillStyle = 'rgba(135, 190, 215, 0.42)';
        ctx.strokeStyle = isSelected('concave_lens') ? '#B83A2D' : '#3E4C59';
        ctx.lineWidth = isSelected('concave_lens') ? 3.2 : 2;
        ctx.beginPath();
        ctx.moveTo(elemX - 16, axisY - benchHalfH);
        ctx.quadraticCurveTo(elemX - 3, axisY, elemX - 16, axisY + benchHalfH);
        ctx.lineTo(elemX + 16, axisY + benchHalfH);
        ctx.quadraticCurveTo(elemX + 3, axisY, elemX + 16, axisY - benchHalfH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'concave_lens',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: elemX,
            cy: axisY,
            halfW: 20,
            halfH: benchHalfH,
            angleRad: 0,
          },
        });

        // Object arrow (left of lens)
        const rayTopY = axisY - objH;
        drawRayArrow(objX, axisY, objX, rayTopY, '#302820', 3.2);
        ctx.fillStyle = '#302820';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Object (${uCm}cm)`, Math.max(42, objX), axisY + 30);

        const focusF1X = elemX - fPx;
        const vVirtualCm = (uCm * fCm) / (uCm + fCm);
        const mag = fCm / (uCm + fCm);
        const imgX = elemX - vVirtualCm * pxPerCm;
        const imgTopY = axisY - objH * mag;

        // Ray 1: Parallel to axis, refracts outward as if from F1
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(
          objX,
          rayTopY,
          elemX,
          rayTopY,
          isSelected('incident_ray') ? '#B83A2D' : '#6F4E37',
          isSelected('incident_ray') ? 3.4 : 2.3
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'incident_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: objX, y: rayTopY }, { x: elemX, y: rayTopY }]], tolerance: 12 },
        });

        const divDx = elemX - focusF1X;
        const divDy = rayTopY - axisY;
        const divScale = Math.max(0.9, Math.min(1.8, (w * 0.36) / Math.max(20, divDx)));
        const outRay1X = elemX + divDx * divScale;
        const outRay1Y = Math.max(16, rayTopY + divDy * divScale);

        ctx.save();
        ctx.globalAlpha = alphaFor('refracted_ray');
        drawRayArrow(
          elemX,
          rayTopY,
          outRay1X,
          outRay1Y,
          isSelected('refracted_ray') ? '#B83A2D' : '#C27D38',
          isSelected('refracted_ray') ? 3.4 : 2.3
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'refracted_ray',
          priority: 2,
          shape: { kind: 'polylines', lines: [[{ x: elemX, y: rayTopY }, { x: outRay1X, y: outRay1Y }]], tolerance: 14 },
        });

        // Ray 2: Straight through optical center O undeviated
        const slopeO = (axisY - rayTopY) / Math.max(1, elemX - objX);
        const rayCenterLen = Math.max(90, w * 0.32);
        const outRay2X = elemX + rayCenterLen;
        const outRay2Y = axisY + slopeO * (outRay2X - elemX);
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(objX, rayTopY, elemX, axisY, '#6F4E37', 1.8);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alphaFor('refracted_ray');
        drawRayArrow(elemX, axisY, outRay2X, outRay2Y, '#C27D38', 1.8);
        ctx.restore();

        // Dashed backward trace to F1 and virtual upright image
        ctx.save();
        ctx.strokeStyle = '#C27D38';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(elemX, rayTopY);
        ctx.lineTo(focusF1X, axisY);
        ctx.stroke();
        drawRayArrow(imgX, axisY, imgX, imgTopY, '#B83A2D', 2.8);
        ctx.restore();
        ctx.fillStyle = '#B83A2D';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Virtual Image', Math.max(46, Math.min(w - 46, imgX)), Math.max(16, imgTopY - 8));
      } else {
        // Spherical Concave Mirror or Convex Lens Bench
        const isMirror = st.subMode === 'concave_mirror';
        const mirrorComponentId = 'concave_mirror';
        const axisY = h * 0.54;
        const elemX = isMirror ? w * 0.68 : w * 0.5;
        const benchHalfH = Math.min(92, h * 0.36);
        const objH = Math.min(54, h * 0.21);

        // Direct cm values when provided, or fallback legacy mapping
        const fCm =
          st.focalLengthCm ?? Math.round(10 + ((st.refractiveOrFocal - 1.1) / 0.9) * 18);
        const uCm =
          st.objectDistanceCm ?? Math.round(8 + ((st.incidenceOrObjDeg - 10) / 65) * 52);

        const pxPerCm = Math.max(1.8, Math.min(4.2, (w * (isMirror ? 0.56 : 0.42)) / 62));
        const fPx = fCm * pxPerCm;
        const uPx = uCm * pxPerCm;
        const objX = elemX - uPx;

        // Principal Axis
        ctx.save();
        ctx.globalAlpha = alphaFor('normal');
        ctx.strokeStyle = isSelected('normal') ? '#B83A2D' : '#756B63';
        ctx.lineWidth = isSelected('normal') ? 2.4 : 1.5;
        ctx.beginPath();
        ctx.moveTo(16, axisY);
        ctx.lineTo(w - 16, axisY);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'normal',
          priority: 5,
          shape: { kind: 'polylines', lines: [[{ x: 16, y: axisY }, { x: w - 16, y: axisY }]], tolerance: 10 },
        });

        // Focal marks F and 2F / C
        const drawFocusDot = (fx: number, lbl: string) => {
          if (fx < 18 || fx > w - 18) return;
          ctx.fillStyle = '#6F4E37';
          ctx.beginPath();
          ctx.arc(fx, axisY, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '600 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lbl, fx, axisY + 15);
        };
        drawFocusDot(elemX - fPx, 'F');
        drawFocusDot(elemX - 2 * fPx, isMirror ? 'C (2F)' : '2F');
        if (!isMirror) {
          drawFocusDot(elemX + fPx, 'F₂');
          drawFocusDot(elemX + 2 * fPx, '2F₂');
        }

        // Concave Mirror or Convex Lens graphic
        if (isMirror) {
          const mirrorR = benchHalfH * 1.95;
          const arcSpan = Math.asin(Math.min(0.9, benchHalfH / mirrorR));
          ctx.save();
          ctx.globalAlpha = alphaFor(mirrorComponentId);
          ctx.strokeStyle = isSelected(mirrorComponentId) ? '#B83A2D' : '#3E4C59';
          ctx.lineWidth = isSelected(mirrorComponentId) ? 5.5 : 4.2;
          ctx.beginPath();
          ctx.arc(elemX - mirrorR, axisY, mirrorR, -arcSpan, arcSpan);
          ctx.stroke();
          ctx.restore();
          hitRegions.push({
            componentId: mirrorComponentId,
            priority: 2,
            shape: {
              kind: 'rotated_rect',
              cx: elemX,
              cy: axisY,
              halfW: 18,
              halfH: benchHalfH,
              angleRad: 0,
            },
          });
        } else {
          ctx.save();
          ctx.globalAlpha = alphaFor('convex_lens');
          ctx.fillStyle = 'rgba(135, 190, 215, 0.42)';
          ctx.strokeStyle = isSelected('convex_lens') ? '#B83A2D' : '#3E4C59';
          ctx.lineWidth = isSelected('convex_lens') ? 3.2 : 2;
          ctx.beginPath();
          ctx.moveTo(elemX, axisY - benchHalfH);
          ctx.quadraticCurveTo(elemX + 22, axisY, elemX, axisY + benchHalfH);
          ctx.quadraticCurveTo(elemX - 22, axisY, elemX, axisY - benchHalfH);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          hitRegions.push({
            componentId: 'convex_lens',
            priority: 2,
            shape: {
              kind: 'rotated_rect',
              cx: elemX,
              cy: axisY,
              halfW: 20,
              halfH: benchHalfH,
              angleRad: 0,
            },
          });
        }

        // Object arrow (left of element)
        const rayTopY = axisY - objH;
        drawRayArrow(objX, axisY, objX, rayTopY, '#302820', 3.2);
        ctx.fillStyle = '#302820';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Object (${uCm}cm)`, Math.max(42, objX), axisY + 30);

        // Compute image distance using mirror (1/f = 1/v + 1/u) or thin lens (1/f = 1/v - 1/(-u)) equations
        const denom = uCm - fCm;
        const isAtInfinity = Math.abs(denom) < 0.5;
        const focusX = isMirror ? elemX - fPx : elemX + fPx;
        const outRayId = isMirror ? 'reflected_ray' : 'refracted_ray';
        const ray2Color = isSelected(outRayId) ? '#B83A2D' : isMirror ? '#2B7A78' : '#C27D38';

        // Principal Ray 1: Parallel to principal axis
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(
          objX,
          rayTopY,
          elemX,
          rayTopY,
          isSelected('incident_ray') ? '#B83A2D' : '#6F4E37',
          isSelected('incident_ray') ? 3.4 : 2.3
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'incident_ray',
          priority: 1,
          shape: { kind: 'polylines', lines: [[{ x: objX, y: rayTopY }, { x: elemX, y: rayTopY }]], tolerance: 12 },
        });

        // Emergent Ray 1 through F
        const dxFocus = focusX - elemX;
        const dyFocus = axisY - rayTopY;
        const rayOutX = elemX + dxFocus * 2.2;
        const rayOutY = rayTopY + dyFocus * 2.2;
        ctx.save();
        ctx.globalAlpha = alphaFor(outRayId);
        drawRayArrow(elemX, rayTopY, rayOutX, rayOutY, ray2Color, isSelected(outRayId) ? 3.4 : 2.3);
        ctx.restore();

        // Principal Ray 2: Through Pole / Optical Centre
        const slopeO = (axisY - rayTopY) / Math.max(1, elemX - objX);
        const rayCenterLen = Math.max(90, w * 0.32);
        const rayCenterOutX = isMirror ? elemX - rayCenterLen : elemX + rayCenterLen;
        const rayCenterOutY = isMirror
          ? axisY + slopeO * (elemX - rayCenterOutX)
          : axisY + slopeO * (rayCenterOutX - elemX);
        ctx.save();
        ctx.globalAlpha = alphaFor('incident_ray');
        drawRayArrow(objX, rayTopY, elemX, axisY, '#6F4E37', 1.8);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alphaFor(outRayId);
        drawRayArrow(elemX, axisY, rayCenterOutX, rayCenterOutY, ray2Color, 1.8);
        ctx.restore();

        hitRegions.push({
          componentId: outRayId,
          priority: 2,
          shape: { kind: 'polylines', lines: [[{ x: elemX, y: rayTopY }, { x: rayOutX, y: rayOutY }]], tolerance: 14 },
        });

        if (isAtInfinity) {
          ctx.fillStyle = '#B83A2D';
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Rays parallel → Image at ∞', w * 0.5, Math.max(20, axisY - benchHalfH - 8));
        } else {
          const vCm = (uCm * fCm) / denom;
          const mag = -vCm / uCm;
          const isVirtual = uCm < fCm;
          const imgX = isMirror ? elemX - vCm * pxPerCm : elemX + vCm * pxPerCm;
          const imgTopY = axisY - objH * mag;

          const clampedImgX = Math.max(24, Math.min(w - 24, imgX));
          const clampedImgTop = Math.max(22, Math.min(h - 22, imgTopY));

          // Virtual ray backward extensions (dashed) when u < f
          if (isVirtual) {
            ctx.save();
            ctx.strokeStyle = ray2Color;
            ctx.lineWidth = 1.6;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(elemX, rayTopY);
            ctx.lineTo(clampedImgX, clampedImgTop);
            ctx.moveTo(elemX, axisY);
            ctx.lineTo(clampedImgX, clampedImgTop);
            ctx.stroke();
            ctx.restore();
          }

          // Formed image arrow
          ctx.save();
          if (isVirtual) ctx.setLineDash([4, 4]);
          drawRayArrow(clampedImgX, axisY, clampedImgX, clampedImgTop, '#B83A2D', 3.0);
          ctx.restore();
          ctx.fillStyle = '#B83A2D';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            isVirtual ? 'Virtual Image' : 'Real Image',
            Math.max(46, Math.min(w - 46, clampedImgX)),
            Math.max(16, Math.min(h - 10, clampedImgTop + (mag < 0 ? 14 : -8)))
          );
        }
      }

      st.hitRegions = hitRegions;
      if (st.selectedComponentId) {
        const match = hitRegions.find((r) => r.componentId === st.selectedComponentId);
        if (match) {
          const s = match.shape;
          const ax =
            s.kind === 'circle' || s.kind === 'rotated_rect'
              ? s.cx
              : s.kind === 'polylines'
                ? s.lines[0][0].x
                : w / 2;
          const ay =
            s.kind === 'circle' || s.kind === 'rotated_rect'
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
      window.removeEventListener('orientationchange', resize);
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
        aria-label="Interactive ray optics mirror, lens, refraction, and prism canvas"
      />
    </div>
  );
};
