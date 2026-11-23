import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export type CircuitSubMode =
  | 'conductors'
  | 'ohms_law'
  | 'series'
  | 'parallel'
  | 'electromagnet';

export type ConductorMaterial = 'copper' | 'graphite' | 'plastic' | 'dry_wood';

export interface ElectricCircuitTelemetry {
  subMode: CircuitSubMode;
  switchClosed: boolean;
  equivalentResistanceOhm: number;
  totalCurrentA: number;
  powerWatts: number;
  branchSummary: string;
}

interface ElectricCircuitCanvasProps {
  subMode: CircuitSubMode;
  voltageV: number;
  resistance1: number;
  resistance2OrTurns: number;
  switchClosed: boolean;
  onToggleSwitch?: () => void;
  conductorMaterial: ConductorMaterial;
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: ElectricCircuitTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

const MATERIAL_RES: Record<ConductorMaterial, { label: string; r: number }> = {
  copper: { label: 'Copper Wire', r: 2 },
  graphite: { label: 'Pencil Graphite', r: 12 },
  plastic: { label: 'Plastic Rod (Insulator)', r: 1e9 },
  dry_wood: { label: 'Dry Wood (Insulator)', r: 1e9 },
};

export const ElectricCircuitCanvas: React.FC<ElectricCircuitCanvasProps> = ({
  subMode,
  voltageV,
  resistance1,
  resistance2OrTurns,
  switchClosed,
  onToggleSwitch,
  conductorMaterial,
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
  const onToggleSwitchRef = useRef(onToggleSwitch);
  onToggleSwitchRef.current = onToggleSwitch;

  const stateRef = useRef({
    subMode,
    voltageV,
    resistance1,
    resistance2OrTurns,
    switchClosed,
    conductorMaterial,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    flowOffset: 0,
    needleAngle: 0,
    hitRegions: [] as DynamicCanvasHitRegion[],
    switchCircle: { cx: 0, cy: 0, r: 24 },
    width: 640,
    height: 440,
  });

  stateRef.current.subMode = subMode;
  stateRef.current.voltageV = voltageV;
  stateRef.current.resistance1 = resistance1;
  stateRef.current.resistance2OrTurns = resistance2OrTurns;
  stateRef.current.switchClosed = switchClosed;
  stateRef.current.conductorMaterial = conductorMaterial;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    stateRef.current.flowOffset = 0;
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

    const drawResistorZigzag = (
      rx: number,
      ry: number,
      rw: number,
      label: string,
      selected: boolean
    ) => {
      ctx.strokeStyle = selected ? '#B83A2D' : '#6F4E37';
      ctx.lineWidth = selected ? 3.2 : 2.2;
      ctx.beginPath();
      const segs = 6;
      const sx = rx - rw / 2;
      ctx.moveTo(sx, ry);
      for (let i = 0; i < segs; i++) {
        const px = sx + ((i + 0.5) / segs) * rw;
        const py = ry + (i % 2 === 0 ? -11 : 11);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(rx + rw / 2, ry);
      ctx.stroke();

      ctx.fillStyle = '#302820';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, rx, ry - 18);
    };

    const draw = (now: number) => {
      const st = stateRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      // Compute electrical state
      let rEq = st.resistance1;
      let isOpenInsulator = false;
      let branchSummary = '';

      if (st.subMode === 'conductors') {
        const mat = MATERIAL_RES[st.conductorMaterial];
        if (mat.r > 1e5) {
          isOpenInsulator = true;
          rEq = Infinity;
          branchSummary = `${mat.label} blocks charge flow`;
        } else {
          rEq = mat.r + 4; // includes bulb resistance
          branchSummary = `${mat.label} completes the loop`;
        }
      } else if (st.subMode === 'ohms_law') {
        rEq = st.resistance1;
        branchSummary = `Slope ΔV/ΔI = ${rEq.toFixed(1)} Ω`;
      } else if (st.subMode === 'series') {
        rEq = st.resistance1 + st.resistance2OrTurns;
        branchSummary = `Series R_s = ${st.resistance1} + ${st.resistance2OrTurns} = ${rEq.toFixed(1)} Ω`;
      } else if (st.subMode === 'parallel') {
        rEq =
          (st.resistance1 * st.resistance2OrTurns) /
          Math.max(0.1, st.resistance1 + st.resistance2OrTurns);
        const i1 = st.switchClosed ? st.voltageV / st.resistance1 : 0;
        const i2 = st.switchClosed ? st.voltageV / st.resistance2OrTurns : 0;
        branchSummary = `I₁ = ${i1.toFixed(2)} A · I₂ = ${i2.toFixed(2)} A`;
      } else {
        rEq = Math.max(2, st.resistance1);
        const turns = Math.max(4, Math.round(st.resistance2OrTurns));
        const bIdx = st.switchClosed ? (st.voltageV / rEq) * turns * 0.14 : 0;
        branchSummary = `Solenoid Turns N = ${turns} · B index = ${bIdx.toFixed(1)} mT`;
      }

      const activeFlow = st.switchClosed && !isOpenInsulator;
      const totalCurrent = activeFlow && Number.isFinite(rEq) ? st.voltageV / rEq : 0;
      const powerW = st.voltageV * totalCurrent;

      if (st.isPlaying && activeFlow && totalCurrent > 0) {
        const effDt = st.reducedMotion ? dt * 0.45 : dt;
        st.flowOffset = (st.flowOffset + effDt * Math.min(90, 18 + totalCurrent * 28)) % 28;
      }

      const targetNeedle =
        st.subMode === 'electromagnet' && activeFlow
          ? Math.min(1.35, 0.25 + totalCurrent * 0.45)
          : 0;
      st.needleAngle += (targetNeedle - st.needleAngle) * Math.min(1, dt * 6);

      if (now - telemetryTick > 100) {
        telemetryTick = now;
        onTelemetryRef.current({
          subMode: st.subMode,
          switchClosed: st.switchClosed,
          equivalentResistanceOhm: Number.isFinite(rEq) ? Number(rEq.toFixed(2)) : 9999,
          totalCurrentA: Number(totalCurrent.toFixed(2)),
          powerWatts: Number(powerW.toFixed(2)),
          branchSummary,
        });
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

      // Circuit loop bounding rectangle
      const hasSideGraph = st.subMode === 'ohms_law' && w > 520;
      const loopRight = hasSideGraph ? w * 0.62 : w - 58;
      const loopLeft = 64;
      const loopTop = 64;
      const loopBot = h - 72;
      const midX = (loopLeft + loopRight) / 2;
      const midY = (loopTop + loopBot) / 2;

      // Copper connecting wires
      ctx.save();
      ctx.globalAlpha = alphaFor('wires');
      if (isSelected('wires')) {
        ctx.strokeStyle = 'rgba(184, 58, 45, 0.24)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(loopLeft, midY - 26);
        ctx.lineTo(loopLeft, loopTop);
        ctx.lineTo(loopRight, loopTop);
        ctx.lineTo(loopRight, loopBot);
        ctx.lineTo(loopLeft, loopBot);
        ctx.lineTo(loopLeft, midY + 26);
        ctx.stroke();
      }
      ctx.strokeStyle = isSelected('wires') ? '#B83A2D' : '#6F4E37';
      ctx.lineWidth = isSelected('wires') ? 4.5 : 3.2;
      ctx.beginPath();
      ctx.moveTo(loopLeft, midY - 26);
      ctx.lineTo(loopLeft, loopTop);
      ctx.lineTo(loopRight, loopTop);
      ctx.lineTo(loopRight, loopBot);
      ctx.lineTo(loopLeft, loopBot);
      ctx.lineTo(loopLeft, midY + 26);
      ctx.stroke();
      ctx.restore();

      hitRegions.push({
        componentId: 'wires',
        priority: 6,
        shape: {
          kind: 'polylines',
          lines: [
            [
              { x: loopLeft, y: midY - 26 },
              { x: loopLeft, y: loopTop },
              { x: loopRight, y: loopTop },
              { x: loopRight, y: loopBot },
              { x: loopLeft, y: loopBot },
              { x: loopLeft, y: midY + 26 },
            ],
          ],
          tolerance: 14,
        },
      });

      // Left edge: DC Battery
      ctx.save();
      ctx.globalAlpha = alphaFor('battery');
      ctx.strokeStyle = isSelected('battery') ? '#B83A2D' : '#302820';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(loopLeft - 18, midY - 12);
      ctx.lineTo(loopLeft + 18, midY - 12);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(loopLeft - 10, midY + 12);
      ctx.lineTo(loopLeft + 10, midY + 12);
      ctx.stroke();

      ctx.fillStyle = '#B83A2D';
      ctx.font = '700 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', loopLeft - 24, midY - 10);
      ctx.fillStyle = '#3E4C59';
      ctx.fillText('−', loopLeft - 24, midY + 16);
      ctx.fillStyle = '#302820';
      ctx.fillText(`${st.voltageV.toFixed(1)} V`, loopLeft + 34, midY + 4);
      ctx.restore();

      hitRegions.push({
        componentId: 'battery',
        priority: 1,
        shape: { kind: 'circle', cx: loopLeft, cy: midY, radius: 28 },
      });

      // Bottom edge: Interactive Knife Switch (clickable to both select & toggle)
      const swX = midX - 24;
      const swY = loopBot;
      st.switchCircle = { cx: swX + 24, cy: swY, r: 24 };
      ctx.fillStyle = '#F7F5F2';
      ctx.fillRect(swX - 6, swY - 12, 60, 24);
      ctx.save();
      ctx.globalAlpha = alphaFor('switch');
      ctx.fillStyle = isSelected('switch') ? '#B83A2D' : '#302820';
      ctx.beginPath();
      ctx.arc(swX, swY, 4.5, 0, Math.PI * 2);
      ctx.arc(swX + 48, swY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSelected('switch') ? '#B83A2D' : '#6F4E37';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(swX, swY);
      if (st.switchClosed) {
        ctx.lineTo(swX + 48, swY);
      } else {
        ctx.lineTo(swX + 42, swY - 22);
      }
      ctx.stroke();

      ctx.fillStyle = '#302820';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        st.switchClosed ? 'Switch CLOSED (Click to open)' : 'Switch OPEN (Click to close)',
        swX + 24,
        swY + 24
      );
      ctx.restore();
      hitRegions.push({
        componentId: 'switch',
        priority: 1,
        shape: { kind: 'circle', cx: swX + 24, cy: swY - 4, radius: 26 },
      });

      // Top edge components based on subMode
      if (st.subMode === 'conductors') {
        ctx.save();
        ctx.globalAlpha = alphaFor('resistor');
        const mat = MATERIAL_RES[st.conductorMaterial];
        const rx = midX - 45;
        ctx.fillStyle =
          st.conductorMaterial === 'copper'
            ? '#B4693E'
            : st.conductorMaterial === 'graphite'
              ? '#3E4C59'
              : st.conductorMaterial === 'plastic'
                ? '#C9D6DF'
                : '#C8A882';
        ctx.strokeStyle = isSelected('resistor') ? '#B83A2D' : '#302820';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rx - 44, loopTop - 10, 88, 20, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillText(mat.label, rx, loopTop - 18);
        ctx.restore();
        hitRegions.push({
          componentId: 'resistor',
          priority: 2,
          shape: { kind: 'rotated_rect', cx: rx, cy: loopTop, halfW: 48, halfH: 18, angleRad: 0 },
        });
      } else if (st.subMode === 'ohms_law') {
        ctx.fillStyle = '#F7F5F2';
        ctx.fillRect(midX - 42, loopTop - 14, 84, 28);
        ctx.save();
        ctx.globalAlpha = alphaFor('resistor');
        drawResistorZigzag(midX, loopTop, 72, `R = ${st.resistance1} Ω`, isSelected('resistor'));
        ctx.restore();
        hitRegions.push({
          componentId: 'resistor',
          priority: 2,
          shape: { kind: 'rotated_rect', cx: midX, cy: loopTop, halfW: 42, halfH: 20, angleRad: 0 },
        });
      } else if (st.subMode === 'series') {
        const r1x = loopLeft + (loopRight - loopLeft) * 0.34;
        const r2x = loopLeft + (loopRight - loopLeft) * 0.68;
        ctx.fillStyle = '#F7F5F2';
        ctx.fillRect(r1x - 36, loopTop - 14, 72, 28);
        ctx.fillRect(r2x - 36, loopTop - 14, 72, 28);
        ctx.save();
        ctx.globalAlpha = alphaFor('resistor');
        drawResistorZigzag(r1x, loopTop, 62, `R₁ = ${st.resistance1} Ω`, isSelected('resistor'));
        drawResistorZigzag(r2x, loopTop, 62, `R₂ = ${st.resistance2OrTurns} Ω`, isSelected('resistor'));
        ctx.restore();
        hitRegions.push({
          componentId: 'resistor',
          priority: 2,
          shape: { kind: 'rotated_rect', cx: midX, cy: loopTop, halfW: 120, halfH: 20, angleRad: 0 },
        });
      } else if (st.subMode === 'parallel') {
        // Two parallel branches on top horizontal rail
        const b1Y = loopTop - 24;
        const b2Y = loopTop + 26;
        const bxL = midX - 66;
        const bxR = midX + 66;
        ctx.fillStyle = '#F7F5F2';
        ctx.fillRect(bxL, loopTop - 32, bxR - bxL, 64);

        ctx.save();
        ctx.globalAlpha = alphaFor('wires');
        ctx.strokeStyle = isSelected('wires') ? '#B83A2D' : '#6F4E37';
        ctx.lineWidth = isSelected('wires') ? 3.5 : 2.6;
        ctx.beginPath();
        ctx.moveTo(bxL, loopTop);
        ctx.lineTo(bxL, b1Y);
        ctx.lineTo(bxR, b1Y);
        ctx.lineTo(bxR, loopTop);
        ctx.moveTo(bxL, loopTop);
        ctx.lineTo(bxL, b2Y);
        ctx.lineTo(bxR, b2Y);
        ctx.lineTo(bxR, loopTop);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#F7F5F2';
        ctx.fillRect(midX - 32, b1Y - 12, 64, 24);
        ctx.fillRect(midX - 32, b2Y - 12, 64, 24);
        ctx.save();
        ctx.globalAlpha = alphaFor('resistor');
        drawResistorZigzag(midX, b1Y, 56, `R₁=${st.resistance1}Ω`, isSelected('resistor'));
        drawResistorZigzag(midX, b2Y, 56, `R₂=${st.resistance2OrTurns}Ω`, isSelected('resistor'));
        ctx.restore();
        hitRegions.push({
          componentId: 'resistor',
          priority: 2,
          shape: { kind: 'rotated_rect', cx: midX, cy: loopTop, halfW: 72, halfH: 40, angleRad: 0 },
        });
      } else {
        // Solenoid / Electromagnet coil on top rail + nearby compass needle
        const turns = Math.max(4, Math.min(14, Math.round(st.resistance2OrTurns)));
        const coilW = 124;
        const cxCoil = midX;
        ctx.save();
        ctx.globalAlpha = alphaFor('electromagnet_coil');
        // Soft iron core
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(cxCoil - coilW / 2, loopTop - 9, coilW, 18);

        ctx.strokeStyle = isSelected('electromagnet_coil') ? '#B83A2D' : '#B4693E';
        ctx.lineWidth = isSelected('electromagnet_coil') ? 3.4 : 2.6;
        for (let i = 0; i < turns; i++) {
          const lx = cxCoil - coilW / 2 + 8 + (i / turns) * (coilW - 16);
          ctx.beginPath();
          ctx.ellipse(lx, loopTop, 5, 16, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          activeFlow ? `Solenoid Active (${turns} turns) · N ◀═══▶ S` : `Solenoid Off (${turns} turns)`,
          cxCoil,
          loopTop - 24
        );
        ctx.restore();
        hitRegions.push({
          componentId: 'electromagnet_coil',
          priority: 1,
          shape: { kind: 'rotated_rect', cx: cxCoil, cy: loopTop, halfW: coilW / 2 + 6, halfH: 24, angleRad: 0 },
        });

        // Deflecting compass needle inside loop center below solenoid
        ctx.save();
        ctx.globalAlpha = st.selectedComponentId ? 0.52 : 1;
        const compX = cxCoil;
        const compY = loopTop + 68;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#6F4E37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(compX, compY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(compX, compY);
        ctx.rotate(st.needleAngle);
        ctx.fillStyle = '#B83A2D';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#3E4C59';
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.restore();
      }

      // Right edge: Bulb Load glowing proportionally to power
      const bulbX = loopRight;
      const bulbY = midY;
      const glowFrac = activeFlow ? Math.min(1, powerW / 18) : 0;
      ctx.save();
      ctx.globalAlpha = alphaFor('bulb');
      if (glowFrac > 0.02) {
        const gGrad = ctx.createRadialGradient(bulbX, bulbY, 4, bulbX, bulbY, 44);
        gGrad.addColorStop(0, `rgba(250, 204, 21, ${0.45 + glowFrac * 0.45})`);
        gGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 44, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = activeFlow ? `rgba(254, 240, 138, ${0.35 + glowFrac * 0.65})` : '#E5E4E2';
      ctx.strokeStyle = isSelected('bulb') ? '#B83A2D' : '#302820';
      ctx.lineWidth = isSelected('bulb') ? 3 : 2;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#302820';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeFlow ? `${powerW.toFixed(1)} W` : 'Off', bulbX, bulbY + 34);
      ctx.restore();

      hitRegions.push({
        componentId: 'bulb',
        priority: 1,
        shape: { kind: 'circle', cx: bulbX, cy: bulbY, radius: 24 },
      });

      // Moving current direction arrows along loop when circuit is active
      if (activeFlow && totalCurrent > 0) {
        ctx.save();
        ctx.globalAlpha = alphaFor('current_direction');
        const arrowColor = isSelected('current_direction') ? '#B83A2D' : '#2B7A78';
        for (let d = st.flowOffset; d < loopRight - loopLeft - 24; d += 56) {
          const ax = loopLeft + 18 + d;
          const ay = loopTop;
          ctx.fillStyle = arrowColor;
          ctx.beginPath();
          ctx.moveTo(ax + 6, ay);
          ctx.lineTo(ax - 3, ay - 5);
          ctx.lineTo(ax - 3, ay + 5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        hitRegions.push({
          componentId: 'current_direction',
          priority: 3,
          shape: { kind: 'circle', cx: loopLeft + 64, cy: loopTop, radius: 18 },
        });
      }

      // Live V-I Ohm's Law chart panel on the right
      if (hasSideGraph) {
        const gx = loopRight + 32;
        const gw = w - gx - 24;
        const gy = 54;
        const gh = h - 108;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#D8D1CA';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(gx, gy, gw, gh, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Live V–I Characteristic', gx + gw / 2, gy + 24);

        const padL = 36;
        const padB = 34;
        const axX = gx + padL;
        const axY = gy + gh - padB;
        const iw = gw - padL - 18;
        const ih = gh - 44 - padB;

        ctx.strokeStyle = '#D8D1CA';
        ctx.beginPath();
        ctx.moveTo(axX, gy + 44);
        ctx.lineTo(axX, axY);
        ctx.lineTo(axX + iw, axY);
        ctx.stroke();

        // Line V = I*R
        ctx.strokeStyle = '#6F4E37';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(axX, axY);
        const maxI = 3;
        const vAtMaxI = Math.min(12, maxI * rEq);
        const endI = vAtMaxI / Math.max(0.5, rEq);
        ctx.lineTo(axX + (endI / maxI) * iw, axY - (vAtMaxI / 12) * ih);
        ctx.stroke();

        // Operating dot
        if (activeFlow) {
          const curX = axX + Math.min(1, totalCurrent / maxI) * iw;
          const curY = axY - Math.min(1, st.voltageV / 12) * ih;
          ctx.fillStyle = '#B83A2D';
          ctx.beginPath();
          ctx.arc(curX, curY, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#756B63';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('Current I (A)', axX + iw / 2, axY + 20);
        ctx.fillText('12V', gx + 14, gy + 50);
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

    // Direct switch click toggles circuit ON/OFF immediately AND identifies switch
    const sw = stateRef.current.switchCircle;
    if (Math.hypot(pt.x - sw.cx, pt.y - sw.cy) <= sw.r) {
      onToggleSwitchRef.current?.();
    }

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
        aria-label="Interactive electric circuit, Ohm's law, series/parallel, and solenoid simulation canvas"
      />
    </div>
  );
};
