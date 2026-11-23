import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export type HeatTransferMode = 'thermometer' | 'conduction' | 'convection' | 'radiation';

export interface HeatTransferTelemetry {
  celsius: number;
  kelvin: number;
  fahrenheit: number;
  materialOrSurfaceLabel: string;
  rateLabel: string;
}

interface HeatTransferCanvasProps {
  heatMode: HeatTransferMode;
  heaterTempC: number;
  materialIdx: number; // 0 = Copper/Black, 1 = Aluminum, 2 = Glass/Silver
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: HeatTransferTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

export const HeatTransferCanvas: React.FC<HeatTransferCanvasProps> = ({
  heatMode,
  heaterTempC,
  materialIdx,
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
    heatMode,
    heaterTempC,
    materialIdx,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    progress: 0,
    phase: 0,
    hitRegions: [] as DynamicCanvasHitRegion[],
    width: 640,
    height: 440,
  });

  stateRef.current.heatMode = heatMode;
  stateRef.current.heaterTempC = heaterTempC;
  stateRef.current.materialIdx = materialIdx;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    stateRef.current.progress = 0;
  }, [resetSignal, heatMode, materialIdx]);

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

    const materialNames = ['Copper (High Conductivity)', 'Aluminum (Medium)', 'Glass (Insulator)'];
    const condRates = [0.22, 0.13, 0.025];

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

      const effDt = st.reducedMotion ? dt * 0.45 : dt;
      if (st.isPlaying) {
        st.phase += effDt * (0.8 + (st.heaterTempC - 25) / 50);
        const r = condRates[Math.min(2, Math.max(0, st.materialIdx))];
        st.progress = Math.min(1, st.progress + effDt * r * (st.heaterTempC / 70));
      }

      const celsius = st.heaterTempC;
      const kelvin = celsius + 273.15;
      const fahrenheit = (celsius * 9) / 5 + 32;

      if (now - telemetryTick > 100) {
        telemetryTick = now;
        onTelemetryRef.current({
          celsius: Number(celsius.toFixed(1)),
          kelvin: Number(kelvin.toFixed(1)),
          fahrenheit: Number(fahrenheit.toFixed(1)),
          materialOrSurfaceLabel: materialNames[Math.min(2, st.materialIdx)] || 'Copper',
          rateLabel:
            st.heatMode === 'thermometer'
              ? `${celsius}°C = ${kelvin.toFixed(1)} K`
              : st.heatMode === 'conduction'
                ? `${Math.round(st.progress * 100)}% heat front`
                : st.heatMode === 'convection'
                  ? 'Warm fluid rising'
                  : 'Black absorbs faster than silver',
        });
      }

      const hitRegions: DynamicCanvasHitRegion[] = [];
      const isSelected = (id: string) => st.selectedComponentId === id;
      const alphaFor = (id: string) =>
        !st.selectedComponentId || st.selectedComponentId === id ? 1 : 0.42;

      // Burner helper
      const drawBurner = (bx: number, by: number, label = 'Heat Source') => {
        ctx.save();
        ctx.globalAlpha = alphaFor('heat_source');
        ctx.fillStyle = '#3E4C59';
        ctx.strokeStyle = isSelected('heat_source') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('heat_source') ? 3 : 1.5;
        ctx.beginPath();
        ctx.roundRect(bx - 22, by, 44, 34, 6);
        ctx.fill();
        ctx.stroke();

        // Flame scaled with temperature
        const flameH = 16 + ((st.heaterTempC - 30) / 70) * 24;
        const flicker = Math.sin(st.phase * 5) * 2;
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.moveTo(bx - 11, by);
        ctx.quadraticCurveTo(bx, by - flameH + flicker, bx + 11, by);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#B83A2D';
        ctx.beginPath();
        ctx.moveTo(bx - 5, by);
        ctx.quadraticCurveTo(bx, by - flameH * 0.55, bx + 5, by);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${label} (${st.heaterTempC}°C)`, bx, by + 50);
        ctx.restore();

        hitRegions.push({
          componentId: 'heat_source',
          priority: 1,
          shape: { kind: 'circle', cx: bx, cy: by + 10, radius: 34 },
        });
      };

      // Reusable Thermometer probe on right side or center
      const drawThermometer = (tx: number, ty: number, th: number, tempC: number) => {
        ctx.save();
        ctx.globalAlpha = alphaFor('thermometer_probe');
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = isSelected('thermometer_probe') ? '#B83A2D' : '#6F4E37';
        ctx.lineWidth = isSelected('thermometer_probe') ? 3 : 1.8;
        ctx.beginPath();
        ctx.roundRect(tx - 11, ty, 22, th, 11);
        ctx.fill();
        ctx.stroke();

        // Bulb
        ctx.fillStyle = '#B83A2D';
        ctx.beginPath();
        ctx.arc(tx, ty + th + 6, 15, 0, Math.PI * 2);
        ctx.fill();

        const frac = Math.min(1, Math.max(0, tempC / 110));
        const colH = frac * (th - 16);
        ctx.fillRect(tx - 4, ty + th - colH, 8, colH + 4);

        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${tempC.toFixed(1)} °C`, tx + 22, ty + th * 0.3);
        ctx.fillText(`${(tempC + 273.15).toFixed(1)} K`, tx + 22, ty + th * 0.52);
        ctx.fillText(`${((tempC * 9) / 5 + 32).toFixed(1)} °F`, tx + 22, ty + th * 0.74);
        ctx.restore();

        hitRegions.push({
          componentId: 'thermometer_probe',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: tx + 18,
            cy: ty + th / 2,
            halfW: 36,
            halfH: th / 2 + 12,
            angleRad: 0,
          },
        });
      };

      if (st.heatMode === 'thermometer') {
        drawBurner(w * 0.34, h * 0.68, 'Water Bath');
        // Water beaker
        ctx.fillStyle = 'rgba(116, 175, 206, 0.35)';
        ctx.strokeStyle = '#3E4C59';
        ctx.lineWidth = 2;
        ctx.fillRect(w * 0.22, h * 0.32, w * 0.24, h * 0.28);
        ctx.strokeRect(w * 0.22, h * 0.32, w * 0.24, h * 0.28);
        drawThermometer(w * 0.62, 68, h * 0.54, celsius);
      } else if (st.heatMode === 'conduction') {
        const rodX = 110;
        const rodW = Math.max(180, w - 260);
        const rodY = h * 0.44;
        const rodH = 26;

        drawBurner(rodX + 12, rodY + 62, 'Burner');

        const grad = ctx.createLinearGradient(rodX, 0, rodX + rodW, 0);
        const reach = Math.max(0.08, st.progress);
        grad.addColorStop(0, '#B83A2D');
        grad.addColorStop(Math.min(0.99, reach), '#D97706');
        grad.addColorStop(1, st.materialIdx === 2 ? '#CBD5E1' : st.materialIdx === 1 ? '#94A3B8' : '#B4693E');

        ctx.save();
        ctx.globalAlpha = alphaFor('conducting_rod');
        ctx.fillStyle = grad;
        ctx.strokeStyle = isSelected('conducting_rod') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('conducting_rod') ? 3 : 1.6;
        ctx.beginPath();
        ctx.roundRect(rodX, rodY, rodW, rodH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#302820';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(materialNames[st.materialIdx] || 'Copper', rodX + rodW / 2, rodY - 16);

        // Wax pins dropping sequentially along rod
        for (let i = 1; i <= 4; i++) {
          const pinX = rodX + (rodW * i) / 5;
          const threshold = i / 5;
          const dropped = st.progress >= threshold;
          const pinY = dropped ? rodY + rodH + 58 : rodY + rodH;
          ctx.fillStyle = '#6F4E37';
          ctx.fillRect(pinX - 3, pinY, 6, 22);
          ctx.fillStyle = '#E6E0F0';
          ctx.beginPath();
          ctx.arc(pinX, pinY, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        hitRegions.push({
          componentId: 'conducting_rod',
          priority: 1,
          shape: {
            kind: 'rotated_rect',
            cx: rodX + rodW / 2,
            cy: rodY + rodH / 2,
            halfW: rodW / 2,
            halfH: 20,
            angleRad: 0,
          },
        });

        drawThermometer(w - 108, 72, h * 0.52, 25 + st.progress * (celsius - 25));
      } else if (st.heatMode === 'convection') {
        const bx = w * 0.28;
        const bw = w * 0.36;
        const by = 68;
        const bh = h - 180;

        drawBurner(bx + bw / 2, by + bh + 18, 'Heater');

        ctx.save();
        ctx.globalAlpha = alphaFor('convection_fluid');
        ctx.fillStyle = 'rgba(116, 175, 206, 0.25)';
        ctx.strokeStyle = isSelected('convection_fluid') ? '#B83A2D' : '#3E4C59';
        ctx.lineWidth = isSelected('convection_fluid') ? 3 : 2;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);

        // Animated rising warm plume center, sinking cool plumes along sides
        for (let i = 0; i < 6; i++) {
          const t = (st.phase * 0.45 + i / 6) % 1;
          const cyUp = by + bh - 16 - t * (bh - 32);
          ctx.fillStyle = 'rgba(184, 58, 45, 0.78)';
          ctx.beginPath();
          ctx.arc(bx + bw / 2, cyUp, 6, 0, Math.PI * 2);
          ctx.fill();

          const cyDown = by + 16 + t * (bh - 32);
          ctx.fillStyle = 'rgba(43, 122, 120, 0.72)';
          ctx.beginPath();
          ctx.arc(bx + 24, cyDown, 5.5, 0, Math.PI * 2);
          ctx.arc(bx + bw - 24, cyDown, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Warm less-dense fluid rises ↑ · Cool sinks ↓', bx + bw / 2, by - 12);
        ctx.restore();

        hitRegions.push({
          componentId: 'convection_fluid',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: bx + bw / 2,
            cy: by + bh / 2,
            halfW: bw / 2,
            halfH: bh / 2,
            angleRad: 0,
          },
        });

        drawThermometer(w - 110, 72, h * 0.52, celsius);
      } else {
        // Radiation: Black matte vs Shiny silver cans equidistant from central heat source
        const srcX = w * 0.5;
        const srcY = h * 0.52;
        drawBurner(srcX, srcY, 'Radiant Source');

        // Infrared wave arcs radiating outward in vacuum
        ctx.strokeStyle = 'rgba(184, 58, 45, 0.5)';
        ctx.lineWidth = 1.6;
        for (let r = 40; r <= 125; r += 26) {
          const pulse = r + ((st.phase * 18) % 26);
          ctx.beginPath();
          ctx.arc(srcX, srcY - 12, pulse * 0.85, Math.PI * 0.8, Math.PI * 1.2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(srcX, srcY - 12, pulse * 0.85, -Math.PI * 0.2, Math.PI * 0.2);
          ctx.stroke();
        }

        const blackTemp = 26 + (celsius - 26) * 0.88;
        const silverTemp = 26 + (celsius - 26) * 0.34;

        ctx.save();
        ctx.globalAlpha = alphaFor('radiating_surface');
        // Left: Black surface
        ctx.fillStyle = '#22201E';
        ctx.strokeStyle = isSelected('radiating_surface') ? '#B83A2D' : '#6F4E37';
        ctx.lineWidth = isSelected('radiating_surface') ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(68, srcY - 68, 86, 118, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Black Matte', 111, srcY - 16);
        ctx.fillText(`${blackTemp.toFixed(1)} °C`, 111, srcY + 6);

        // Right: Shiny silver surface
        ctx.fillStyle = '#E5E4E2';
        ctx.strokeStyle = isSelected('radiating_surface') ? '#B83A2D' : '#756B63';
        ctx.beginPath();
        ctx.roundRect(w - 154, srcY - 68, 86, 118, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#302820';
        ctx.fillText('Shiny Silver', w - 111, srcY - 16);
        ctx.fillText(`${silverTemp.toFixed(1)} °C`, w - 111, srcY + 6);
        ctx.restore();

        hitRegions.push({
          componentId: 'radiating_surface',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: 111,
            cy: srcY - 10,
            halfW: 48,
            halfH: 62,
            angleRad: 0,
          },
        });
        hitRegions.push({
          componentId: 'radiating_surface',
          priority: 2,
          shape: {
            kind: 'rotated_rect',
            cx: w - 111,
            cy: srcY - 10,
            halfW: 48,
            halfH: 62,
            angleRad: 0,
          },
        });
      }

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
        aria-label="Interactive temperature scales and heat transfer simulation canvas"
      />
    </div>
  );
};
