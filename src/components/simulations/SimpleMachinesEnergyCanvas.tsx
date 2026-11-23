import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export interface EnergyMachinesTelemetry {
  subMode: 'pendulum' | 'machines';
  totalEnergyJ: number;
  kineticEnergyJ: number;
  potentialEnergyJ: number;
  mechanicalAdvantage: number;
  requiredEffortN: number;
}

interface SimpleMachinesEnergyCanvasProps {
  subMode: 'pendulum' | 'machines';
  massKg: number;
  releaseHeightOrArm: number;
  dampingOrStrands: number;
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: EnergyMachinesTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

export const SimpleMachinesEnergyCanvas: React.FC<SimpleMachinesEnergyCanvasProps> = ({
  subMode,
  massKg,
  releaseHeightOrArm,
  dampingOrStrands,
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
    massKg,
    releaseHeightOrArm,
    dampingOrStrands,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    thetaRad: 0.72,
    omegaRad: 0,
    initialEnergyJ: 0,
    hitRegions: [] as DynamicCanvasHitRegion[],
    width: 640,
    height: 440,
  });

  stateRef.current.subMode = subMode;
  stateRef.current.massKg = massKg;
  stateRef.current.releaseHeightOrArm = releaseHeightOrArm;
  stateRef.current.dampingOrStrands = dampingOrStrands;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    const L = 8.5; // physical equivalent pendulum arm in metres so releaseHeight (1..8 m) maps to valid angle
    const cosTheta0 = Math.max(-0.5, 1 - releaseHeightOrArm / L);
    const theta0 = Math.acos(cosTheta0);
    stateRef.current.thetaRad = theta0;
    stateRef.current.omegaRad = 0;
    stateRef.current.initialEnergyJ = massKg * 9.8 * releaseHeightOrArm;
  }, [resetSignal, subMode, releaseHeightOrArm, massKg]);

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

      if (st.subMode === 'pendulum') {
        const L = 8.5;
        const maxAngleRad = Math.acos(Math.max(-0.5, 1 - st.releaseHeightOrArm / L));
        const zeta = st.dampingOrStrands * 0.065;

        if (st.isPlaying) {
          const effDt = st.reducedMotion ? dt * 0.45 : dt;
          const subSteps = 2;
          const hStep = effDt / subSteps;
          const accelFn = (th: number, om: number) => -(g / L) * Math.sin(th) - zeta * om;
          for (let step = 0; step < subSteps; step++) {
            const th = st.thetaRad;
            const om = st.omegaRad;

            const k1Th = om;
            const k1Om = accelFn(th, om);

            const k2Th = om + 0.5 * hStep * k1Om;
            const k2Om = accelFn(th + 0.5 * hStep * k1Th, k2Th);

            const k3Th = om + 0.5 * hStep * k2Om;
            const k3Om = accelFn(th + 0.5 * hStep * k2Th, k3Th);

            const k4Th = om + hStep * k3Om;
            const k4Om = accelFn(th + hStep * k3Th, k4Th);

            st.thetaRad += (hStep / 6) * (k1Th + 2 * k2Th + 2 * k3Th + k4Th);
            st.omegaRad += (hStep / 6) * (k1Om + 2 * k2Om + 2 * k3Om + k4Om);
          }
        }

        const totalInitialE = Math.max(0.1, st.massKg * g * st.releaseHeightOrArm);
        const angle = st.thetaRad;
        const heightM = Math.max(0, L * (1 - Math.cos(angle)));
        const pe = st.massKg * g * heightM;
        const speed = L * st.omegaRad;
        const ke = 0.5 * st.massKg * speed * speed;
        const heat = Math.max(0, totalInitialE - (pe + ke));

        if (now - telemetryTick > 100) {
          telemetryTick = now;
          onTelemetryRef.current({
            subMode: 'pendulum',
            totalEnergyJ: Number(totalInitialE.toFixed(1)),
            kineticEnergyJ: Number(ke.toFixed(1)),
            potentialEnergyJ: Number(pe.toFixed(1)),
            mechanicalAdvantage: 1,
            requiredEffortN: Number((st.massKg * g).toFixed(1)),
          });
        }

        const pivotX = w * 0.36;
        const pivotY = 56;
        const rodLen = Math.min(h * 0.56, w * 0.32);
        const bobX = pivotX + rodLen * Math.sin(angle);
        const bobY = pivotY + rodLen * Math.cos(angle);
        const lowestY = pivotY + rodLen;
        const releaseY = pivotY + rodLen * Math.cos(maxAngleRad);

        // Height reference dashed line
        ctx.save();
        ctx.globalAlpha = alphaFor('track_height_marker');
        ctx.strokeStyle = isSelected('track_height_marker') ? '#B83A2D' : '#756B63';
        ctx.lineWidth = isSelected('track_height_marker') ? 2.6 : 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(pivotX - rodLen * 0.85, releaseY);
        ctx.lineTo(pivotX + rodLen * 0.85, releaseY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`h₀ = ${st.releaseHeightOrArm.toFixed(1)} m`, 28, releaseY - 6);
        ctx.restore();

        hitRegions.push({
          componentId: 'track_height_marker',
          priority: 3,
          shape: {
            kind: 'polylines',
            lines: [
              [
                { x: pivotX - rodLen * 0.85, y: releaseY },
                { x: pivotX + rodLen * 0.85, y: releaseY },
              ],
            ],
            tolerance: 12,
          },
        });

        // Pendulum arc guide
        ctx.strokeStyle = 'rgba(111, 78, 55, 0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          pivotX,
          pivotY,
          rodLen,
          Math.PI / 2 - maxAngleRad,
          Math.PI / 2 + maxAngleRad
        );
        ctx.stroke();

        // Support rod & fulcrum pivot
        ctx.save();
        ctx.globalAlpha = st.selectedComponentId ? 0.55 : 1;
        ctx.strokeStyle = '#302820';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alphaFor('fulcrum_pivot');
        ctx.fillStyle = isSelected('fulcrum_pivot') ? '#B83A2D' : '#6F4E37';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        hitRegions.push({
          componentId: 'fulcrum_pivot',
          priority: 2,
          shape: { kind: 'circle', cx: pivotX, cy: pivotY, radius: 15 },
        });

        // Ground datum bar
        ctx.strokeStyle = '#D8D1CA';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, lowestY + 26);
        ctx.lineTo(pivotX + rodLen * 0.9, lowestY + 26);
        ctx.stroke();

        // Energy Bob
        const bobR = Math.min(26, 14 + st.massKg * 1.1);
        ctx.save();
        ctx.globalAlpha = alphaFor('energy_bob');
        ctx.fillStyle = '#6F4E37';
        ctx.strokeStyle = isSelected('energy_bob') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('energy_bob') ? 3.2 : 2;
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${st.massKg}kg`, bobX, bobY + 4);
        ctx.restore();
        hitRegions.push({
          componentId: 'energy_bob',
          priority: 1,
          shape: { kind: 'circle', cx: bobX, cy: bobY, radius: bobR + 6 },
        });

        // Live KE / PE Energy Bar Gauge Card (right panel)
        const cardX = Math.round(w * 0.65);
        const cardW = w - cardX - 24;
        const cardY = 42;
        const cardH = h - 78;

        ctx.save();
        ctx.globalAlpha = alphaFor('ke_pe_meter');
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = isSelected('ke_pe_meter') ? '#6F4E37' : '#D8D1CA';
        ctx.lineWidth = isSelected('ke_pe_meter') ? 2.5 : 1.4;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Live Energy Meter (J)', cardX + cardW / 2, cardY + 24);

        const bars = [
          { label: 'KE', val: ke, color: '#2B7A78' },
          { label: 'PE', val: pe, color: '#6F4E37' },
          { label: 'Heat', val: heat, color: '#B83A2D' },
        ];
        const barBaseY = cardY + cardH - 36;
        const maxBarH = cardH - 86;
        const bw = Math.min(34, (cardW - 50) / 3);

        bars.forEach((b, idx) => {
          const bx = cardX + 20 + idx * (bw + 14);
          const bh = Math.max(2, (b.val / Math.max(1, totalInitialE)) * maxBarH);
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.roundRect(bx, barBaseY - bh, bw, bh, 4);
          ctx.fill();
          ctx.fillStyle = '#302820';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.fillText(b.label, bx + bw / 2, barBaseY + 14);
          ctx.fillStyle = '#756B63';
          ctx.fillText(`${Math.round(b.val)}`, bx + bw / 2, barBaseY - bh - 6);
        });
        ctx.restore();

        hitRegions.push({
          componentId: 'ke_pe_meter',
          priority: 4,
          shape: {
            kind: 'rotated_rect',
            cx: cardX + cardW / 2,
            cy: cardY + cardH / 2,
            halfW: cardW / 2,
            halfH: cardH / 2,
            angleRad: 0,
          },
        });
      } else {
        // Lever & Pulley Mechanical Advantage mode
        const loadN = st.massKg * g;
        const strands = Math.max(1, Math.round(st.dampingOrStrands) + 1);
        const leverArmRatio = Math.max(0.5, st.releaseHeightOrArm / 2);
        const pulleyEffortN = loadN / strands;
        const leverEffortN = loadN / leverArmRatio;
        const liftAnim = st.isPlaying ? Math.sin(now * 0.002) * 14 : 0;

        if (now - telemetryTick > 100) {
          telemetryTick = now;
          onTelemetryRef.current({
            subMode: 'machines',
            totalEnergyJ: Number((loadN * 2).toFixed(1)),
            kineticEnergyJ: Number(leverEffortN.toFixed(1)),
            potentialEnergyJ: Number(loadN.toFixed(1)),
            mechanicalAdvantage: Number(strands.toFixed(1)),
            requiredEffortN: Number(pulleyEffortN.toFixed(1)),
          });
        }

        // Left half: Lever with Fulcrum
        const fulcrumX = w * 0.27;
        const fulcrumY = h * 0.65;
        const beamAngle = -0.09 + liftAnim * 0.003;
        const loadArmPx = 74;
        const effArmPx = Math.min(130, loadArmPx * leverArmRatio);

        ctx.save();
        ctx.translate(fulcrumX, fulcrumY - 16);
        ctx.rotate(beamAngle);
        ctx.fillStyle = '#6F4E37';
        ctx.beginPath();
        ctx.roundRect(-loadArmPx, -6, loadArmPx + effArmPx, 12, 4);
        ctx.fill();

        // Load box on left arm
        ctx.fillStyle = '#3E4C59';
        ctx.beginPath();
        ctx.roundRect(-loadArmPx + 4, -38, 36, 32, 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(loadN)}N`, -loadArmPx + 22, -18);
        ctx.restore();

        // Fulcrum triangle
        ctx.save();
        ctx.globalAlpha = alphaFor('fulcrum_pivot');
        ctx.fillStyle = isSelected('fulcrum_pivot') ? '#B83A2D' : '#302820';
        ctx.beginPath();
        ctx.moveTo(fulcrumX, fulcrumY - 12);
        ctx.lineTo(fulcrumX - 18, fulcrumY + 18);
        ctx.lineTo(fulcrumX + 18, fulcrumY + 18);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Lever MA = ${leverArmRatio.toFixed(1)}× · Effort = ${leverEffortN.toFixed(1)} N`,
          fulcrumX,
          h - 32
        );

        hitRegions.push({
          componentId: 'fulcrum_pivot',
          priority: 2,
          shape: { kind: 'circle', cx: fulcrumX, cy: fulcrumY, radius: 24 },
        });

        // Right half: Pulley Rig
        const px = w * 0.74;
        const pyTop = 88;
        const pBlockY = 210 + liftAnim;

        // Overhead support
        ctx.strokeStyle = '#302820';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px - 60, 48);
        ctx.lineTo(px + 60, 48);
        ctx.stroke();

        // Top pulley wheel
        ctx.save();
        ctx.globalAlpha = alphaFor('pulley_wheel');
        ctx.fillStyle = '#E5E4E2';
        ctx.strokeStyle = isSelected('pulley_wheel') ? '#B83A2D' : '#6F4E37';
        ctx.lineWidth = isSelected('pulley_wheel') ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.arc(px, pyTop, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rope strands representing MA = strands
        ctx.strokeStyle = '#6F4E37';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < Math.min(5, strands); i++) {
          const offset = (i - (Math.min(5, strands) - 1) / 2) * 8;
          ctx.beginPath();
          ctx.moveTo(px + offset, pyTop + 12);
          ctx.lineTo(px + offset, pBlockY);
          ctx.stroke();
        }
        ctx.restore();

        // Suspended load
        ctx.save();
        ctx.globalAlpha = alphaFor('energy_bob');
        ctx.fillStyle = '#6F4E37';
        ctx.strokeStyle = isSelected('energy_bob') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('energy_bob') ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(px - 28, pBlockY, 56, 42, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(loadN)} N`, px, pBlockY + 25);
        ctx.restore();

        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillText(
          `Pulley (${strands} strands) · Effort = ${pulleyEffortN.toFixed(1)} N`,
          px,
          h - 32
        );

        hitRegions.push({
          componentId: 'pulley_wheel',
          priority: 1,
          shape: { kind: 'circle', cx: px, cy: pyTop, radius: 32 },
        });
        hitRegions.push({
          componentId: 'energy_bob',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: px,
            cy: pBlockY + 21,
            halfW: 32,
            halfH: 25,
            angleRad: 0,
          },
        });
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
        aria-label="Interactive work, energy conservation, lever, and pulley simulation canvas"
      />
    </div>
  );
};
