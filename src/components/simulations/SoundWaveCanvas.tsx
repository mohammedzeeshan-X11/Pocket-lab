import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export type SoundMedium = 'air' | 'water' | 'steel';

export interface SoundWaveTelemetry {
  speedMs: number;
  wavelengthM: number;
  periodMs: number;
  echoDelaySec: number;
  isDistinctEcho: boolean;
}

interface SoundWaveCanvasProps {
  frequencyHz: number;
  amplitudePct: number;
  wallDistanceM: number;
  medium: SoundMedium;
  echoMode: boolean;
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: SoundWaveTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

const MEDIUM_SPEEDS: Record<SoundMedium, number> = {
  air: 343,
  water: 1480,
  steel: 5100,
};

export const SoundWaveCanvas: React.FC<SoundWaveCanvasProps> = ({
  frequencyHz,
  amplitudePct,
  wallDistanceM,
  medium,
  echoMode,
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
    frequencyHz,
    amplitudePct,
    wallDistanceM,
    medium,
    echoMode,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    phase: 0,
    hitRegions: [] as DynamicCanvasHitRegion[],
    width: 640,
    height: 440,
  });

  stateRef.current.frequencyHz = frequencyHz;
  stateRef.current.amplitudePct = amplitudePct;
  stateRef.current.wallDistanceM = wallDistanceM;
  stateRef.current.medium = medium;
  stateRef.current.echoMode = echoMode;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    stateRef.current.phase = 0;
  }, [resetSignal, medium]);

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

      const effDt = st.reducedMotion ? dt * 0.45 : dt;
      if (st.isPlaying) {
        st.phase += effDt * (2.5 + (st.frequencyHz / 220) * 1.8);
      }

      const speed = MEDIUM_SPEEDS[st.medium];
      const wavelengthM = speed / st.frequencyHz;
      const periodMs = 1000 / st.frequencyHz;
      const echoDelaySec = (2 * st.wallDistanceM) / speed;
      const isDistinctEcho = echoDelaySec >= 0.1;

      if (now - telemetryTick > 100) {
        telemetryTick = now;
        onTelemetryRef.current({
          speedMs: speed,
          wavelengthM: Number(wavelengthM.toFixed(2)),
          periodMs: Number(periodMs.toFixed(2)),
          echoDelaySec: Number(echoDelaySec.toFixed(3)),
          isDistinctEcho,
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

      // Top section: Longitudinal air particles tube
      const tubeX = 96;
      const tubeRight = st.echoMode ? w - 68 : w - 34;
      const tubeW = Math.max(160, tubeRight - tubeX);
      const tubeY = Math.round(h * 0.14);
      const tubeH = Math.round(h * 0.4);

      ctx.save();
      ctx.globalAlpha =
        !st.selectedComponentId ||
        isSelected('wave') ||
        isSelected('compression') ||
        isSelected('rarefaction')
          ? 1
          : 0.42;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = isSelected('wave') ? '#B83A2D' : '#D8D1CA';
      ctx.lineWidth = isSelected('wave') ? 2.5 : 1.4;
      ctx.beginPath();
      ctx.roundRect(tubeX - 6, tubeY, tubeW + 12, tubeH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Vibrating diaphragm / speaker cone
      const coneOsc = Math.sin(st.phase) * (4 + (st.amplitudePct / 100) * 11);
      const spkX = 64 + coneOsc;
      const spkY = tubeY + tubeH / 2;

      ctx.save();
      ctx.globalAlpha = alphaFor('vibrating_source');
      ctx.fillStyle = '#6F4E37';
      ctx.strokeStyle = isSelected('vibrating_source') ? '#B83A2D' : '#302820';
      ctx.lineWidth = isSelected('vibrating_source') ? 3 : 1.8;
      ctx.beginPath();
      ctx.moveTo(spkX - 24, spkY - 22);
      ctx.lineTo(spkX + 16, spkY - 44);
      ctx.lineTo(spkX + 16, spkY + 44);
      ctx.lineTo(spkX - 24, spkY + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      hitRegions.push({
        componentId: 'vibrating_source',
        priority: 1,
        shape: { kind: 'circle', cx: spkX, cy: spkY, radius: 42 },
      });

      // Wave number visually proportional to frequency
      const cyclesAcross = 1.6 + ((st.frequencyHz - 120) / 760) * 3.8;
      const kVis = (Math.PI * 2 * cyclesAcross) / tubeW;
      const ampPx = 5 + (st.amplitudePct / 100) * 18;

      const cols = 38;
      const rows = 5;
      let firstCompX = tubeX + 40;
      let firstRareX = tubeX + 95;

      for (let c = 0; c <= cols; c++) {
        const baseX = tubeX + 12 + ((tubeW - 24) * c) / cols;
        const disp = ampPx * Math.sin(kVis * (baseX - tubeX) - st.phase);
        const px = baseX + disp;
        const slopeCos = Math.cos(kVis * (baseX - tubeX) - st.phase);

        if (c > 4 && c < 20 && slopeCos < -0.85) firstCompX = px;
        if (c > 4 && c < 24 && slopeCos > 0.85) firstRareX = px;

        const isComp = slopeCos < -0.25;
        ctx.save();
        if (st.selectedComponentId) {
          if (isSelected('compression')) {
            ctx.globalAlpha = isComp ? 1 : 0.3;
          } else if (isSelected('rarefaction')) {
            ctx.globalAlpha = !isComp ? 1 : 0.3;
          } else {
            ctx.globalAlpha = isSelected('wave') ? 1 : 0.42;
          }
        }
        for (let r = 0; r < rows; r++) {
          const py = tubeY + 22 + ((tubeH - 44) * r) / (rows - 1);
          ctx.fillStyle = isComp ? '#6F4E37' : '#3E4C59';
          ctx.beginPath();
          ctx.arc(px, py, isComp ? 3.5 : 2.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Label markers for Compression and Rarefaction
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.globalAlpha = alphaFor('compression');
      ctx.fillStyle = isSelected('compression') ? '#B83A2D' : '#6F4E37';
      ctx.fillText('Compression (C)', firstCompX, tubeY - 10);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alphaFor('rarefaction');
      ctx.fillStyle = isSelected('rarefaction') ? '#B83A2D' : '#2B7A78';
      ctx.fillText('Rarefaction (R)', firstRareX, tubeY - 10);
      ctx.restore();

      hitRegions.push({
        componentId: 'compression',
        priority: 2,
        shape: { kind: 'circle', cx: firstCompX, cy: tubeY + tubeH / 2, radius: 28 },
      });
      hitRegions.push({
        componentId: 'rarefaction',
        priority: 2,
        shape: { kind: 'circle', cx: firstRareX, cy: tubeY + tubeH / 2, radius: 28 },
      });
      hitRegions.push({
        componentId: 'wave',
        priority: 5,
        shape: {
          kind: 'rotated_rect',
          cx: tubeX + tubeW / 2,
          cy: tubeY + tubeH / 2,
          halfW: tubeW / 2,
          halfH: tubeH / 2,
          angleRad: 0,
        },
      });

      // Echo wall & reflected ping indicator
      if (st.echoMode) {
        ctx.save();
        ctx.globalAlpha = st.selectedComponentId ? 0.45 : 1;
        const wallX = tubeRight + 16;
        ctx.fillStyle = '#3E4C59';
        ctx.fillRect(wallX, tubeY - 6, 16, tubeH + 12);
        ctx.fillStyle = '#302820';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillText(`${st.wallDistanceM}m`, wallX + 8, tubeY - 14);
        ctx.restore();
      }

      // Bottom section: Transverse pressure-variation curve y(x,t)
      const graphX = 48;
      const graphW = w - 82;
      const graphY = Math.round(h * 0.62);
      const graphH = Math.round(h * 0.3);
      const midY = graphY + graphH / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#D8D1CA';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(graphX, graphY, graphW, graphH, 10);
      ctx.fill();
      ctx.stroke();

      // Zero pressure line
      ctx.strokeStyle = '#D8D1CA';
      ctx.beginPath();
      ctx.moveTo(graphX + 12, midY);
      ctx.lineTo(graphX + graphW - 12, midY);
      ctx.stroke();

      // Pressure wave
      const curveAmp = (st.amplitudePct / 100) * (graphH * 0.38);
      ctx.strokeStyle = '#6F4E37';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let px = 14; px <= graphW - 14; px += 3) {
        const y = midY - curveAmp * Math.cos(kVis * px - st.phase);
        if (px === 14) ctx.moveTo(graphX + px, y);
        else ctx.lineTo(graphX + px, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#302820';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Pressure Waveform · f = ${st.frequencyHz} Hz · λ = ${wavelengthM.toFixed(2)} m · T = ${periodMs.toFixed(2)} ms`,
        graphX + 14,
        graphY + 18
      );

      st.hitRegions = hitRegions;
      if (st.selectedComponentId) {
        const match = hitRegions.find((r) => r.componentId === st.selectedComponentId);
        if (match) {
          const s = match.shape;
          const ax = s.kind === 'circle' || s.kind === 'rotated_rect' ? s.cx : w / 2;
          const ay = s.kind === 'circle' || s.kind === 'rotated_rect' ? s.cy : h / 2;
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
        aria-label="Interactive longitudinal sound wave and echo simulation canvas"
      />
    </div>
  );
};
