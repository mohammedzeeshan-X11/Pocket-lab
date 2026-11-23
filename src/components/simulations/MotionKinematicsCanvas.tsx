import React, { useEffect, useRef, useState } from 'react';
import type {
  DynamicCanvasHitRegion,
  SimulationComponentHit,
} from '../../systems/componentInteraction/types';
import { hitTestGeometricRegions } from '../../systems/componentInteraction/registry';

export interface MotionTelemetry {
  elapsedSec: number;
  distanceM: number;
  displacementM: number;
  velocityMs: number;
  accelerationMs2: number;
}

export type MotionPathMode = 'linear' | 'circular';

interface MotionKinematicsCanvasProps {
  preset?: string;
  pathMode: MotionPathMode;
  initialSpeed: number;
  acceleration: number;
  pathLength: number;
  isPlaying: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  selectedComponentId?: string | null;
  onTelemetryChange: (telemetry: MotionTelemetry) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

export const MotionKinematicsCanvas: React.FC<MotionKinematicsCanvasProps> = ({
  preset = 'class9_graphs_acceleration',
  pathMode,
  initialSpeed,
  acceleration,
  pathLength,
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
    preset,
    pathMode,
    initialSpeed,
    acceleration,
    pathLength,
    isPlaying,
    reducedMotion,
    selectedComponentId,
    simTime: 0,
    distance: 0,
    xPos: 0,
    theta: 0,
    history: [] as Array<{ t: number; s: number; v: number }>,
    hitRegions: [] as DynamicCanvasHitRegion[],
    width: 640,
    height: 440,
  });

  stateRef.current.preset = preset;
  stateRef.current.pathMode = pathMode;
  stateRef.current.initialSpeed = initialSpeed;
  stateRef.current.acceleration = acceleration;
  stateRef.current.pathLength = pathLength;
  stateRef.current.isPlaying = isPlaying;
  stateRef.current.reducedMotion = reducedMotion;
  stateRef.current.selectedComponentId = selectedComponentId;

  useEffect(() => {
    const s = stateRef.current;
    s.simTime = 0;
    s.distance = 0;
    s.xPos = 0;
    s.theta = 0;
    s.history = [{ t: 0, s: 0, v: initialSpeed }];
  }, [resetSignal, pathMode, initialSpeed, acceleration, pathLength, preset]);

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

      const trackMaxM = Math.max(10, st.pathLength * 6);
      let curVelocity = st.initialSpeed;
      let curDisplacement = 0;

      if (st.isPlaying) {
        const effDt = st.reducedMotion ? dt * 0.45 : dt;
        if (st.pathMode === 'linear') {
          curVelocity = Math.max(0, st.initialSpeed + st.acceleration * st.simTime);
          const nextX =
            st.initialSpeed * (st.simTime + effDt) +
            0.5 * st.acceleration * (st.simTime + effDt) * (st.simTime + effDt);
          if (nextX > trackMaxM || (curVelocity <= 0 && st.acceleration < 0 && st.simTime > 0.6)) {
            st.simTime = 0;
            st.distance = 0;
            st.xPos = 0;
            st.history = [{ t: 0, s: 0, v: st.initialSpeed }];
          } else {
            st.simTime += effDt;
            st.xPos = Math.max(0, nextX);
            st.distance = st.xPos;
            curVelocity = Math.max(0, st.initialSpeed + st.acceleration * st.simTime);
          }
          curDisplacement = st.xPos;
        } else {
          const radius = Math.max(2, st.pathLength);
          const speed = Math.max(0.5, st.initialSpeed);
          const omega = speed / radius;
          st.simTime += effDt;
          st.theta += omega * effDt;
          st.distance = speed * st.simTime;
          curVelocity = speed;
          curDisplacement =
            2 * radius * Math.abs(Math.sin((st.theta % (Math.PI * 2)) * 0.5));
        }

        if (
          st.history.length === 0 ||
          st.simTime - st.history[st.history.length - 1].t >= 0.08
        ) {
          st.history.push({ t: st.simTime, s: st.distance, v: curVelocity });
          if (st.history.length > 90) st.history.shift();
        }
      } else {
        if (st.pathMode === 'linear') {
          curVelocity = Math.max(0, st.initialSpeed + st.acceleration * st.simTime);
          curDisplacement = st.xPos;
        } else {
          const radius = Math.max(2, st.pathLength);
          curVelocity = Math.max(0.5, st.initialSpeed);
          curDisplacement =
            2 * radius * Math.abs(Math.sin((st.theta % (Math.PI * 2)) * 0.5));
        }
      }

      if (now - telemetryTick > 100) {
        telemetryTick = now;
        onTelemetryRef.current({
          elapsedSec: Number(st.simTime.toFixed(1)),
          distanceM: Number(st.distance.toFixed(2)),
          displacementM: Number(curDisplacement.toFixed(2)),
          velocityMs: Number(curVelocity.toFixed(2)),
          accelerationMs2:
            st.pathMode === 'linear' ? Number(st.acceleration.toFixed(2)) : 0,
        });
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = st.width;
      const h = st.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Warm ivory background with subtle lab grid
      ctx.fillStyle = '#F7F5F2';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(216, 209, 202, 0.45)';
      ctx.lineWidth = 1;
      for (let gx = 24; gx < w; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 24; gy < h; gy += 32) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const hitRegions: DynamicCanvasHitRegion[] = [];
      const isSelected = (id: string) => st.selectedComponentId === id;
      const alphaFor = (id: string) =>
        !st.selectedComponentId || st.selectedComponentId === id ? 1 : 0.42;

      // Top zone: Physics motion stage (top 54%)
      const stageBottom = Math.round(h * 0.52);

      if (st.pathMode === 'linear') {
        const trackLeft = 48;
        const trackRight = w - 42;
        const trackY = Math.round(stageBottom * 0.56);
        const usableW = Math.max(120, trackRight - trackLeft);

        // Metre scale rail
        ctx.strokeStyle = '#302820';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(trackLeft, trackY + 18);
        ctx.lineTo(trackRight, trackY + 18);
        ctx.stroke();

        const ticks = 10;
        ctx.fillStyle = '#756B63';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i <= ticks; i++) {
          const tx = trackLeft + (usableW * i) / ticks;
          const mVal = ((trackMaxM * i) / ticks).toFixed(0);
          ctx.beginPath();
          ctx.moveTo(tx, trackY + 13);
          ctx.lineTo(tx, trackY + 24);
          ctx.strokeStyle = i === 0 ? '#B83A2D' : '#756B63';
          ctx.lineWidth = i === 0 ? 2.5 : 1.2;
          ctx.stroke();
          ctx.fillText(`${mVal}m`, tx, trackY + 38);
        }

        // Reference Origin O
        const originX = trackLeft;
        const originY = trackY + 18;
        ctx.save();
        ctx.globalAlpha = alphaFor('reference_origin');
        ctx.fillStyle = isSelected('reference_origin') ? '#B83A2D' : '#6F4E37';
        ctx.beginPath();
        ctx.arc(originX, originY, isSelected('reference_origin') ? 9 : 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillText('Origin (0 m)', originX + 14, originY + 52);
        ctx.restore();

        hitRegions.push({
          componentId: 'reference_origin',
          priority: 2,
          shape: { kind: 'circle', cx: originX, cy: originY, radius: 18 },
        });

        const cartX =
          trackLeft + Math.min(1, st.xPos / trackMaxM) * usableW;
        const cartY = trackY;

        // Distance path strip
        ctx.save();
        ctx.globalAlpha = alphaFor('distance_path');
        ctx.strokeStyle = isSelected('distance_path') ? '#B45309' : '#6F4E37';
        ctx.lineWidth = isSelected('distance_path') ? 5 : 3.5;
        ctx.beginPath();
        ctx.moveTo(originX, trackY + 6);
        ctx.lineTo(cartX, trackY + 6);
        ctx.stroke();
        ctx.restore();

        hitRegions.push({
          componentId: 'distance_path',
          priority: 4,
          shape: {
            kind: 'polylines',
            lines: [[{ x: originX, y: trackY + 6 }, { x: Math.max(originX + 20, cartX), y: trackY + 6 }]],
            tolerance: 10,
          },
        });

        // Displacement arrow above cart line
        const dispY = trackY - 34;
        if (cartX - originX > 18) {
          ctx.save();
          ctx.globalAlpha = alphaFor('displacement_vector');
          ctx.strokeStyle = isSelected('displacement_vector') ? '#B83A2D' : '#2B7A78';
          ctx.lineWidth = isSelected('displacement_vector') ? 3.2 : 2.2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(originX, dispY);
          ctx.lineTo(cartX - 6, dispY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = isSelected('displacement_vector') ? '#B83A2D' : '#2B7A78';
          ctx.beginPath();
          ctx.moveTo(cartX, dispY);
          ctx.lineTo(cartX - 9, dispY - 5);
          ctx.lineTo(cartX - 9, dispY + 5);
          ctx.closePath();
          ctx.fill();
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Δx = ${curDisplacement.toFixed(1)} m`, (originX + cartX) / 2, dispY - 8);
          ctx.restore();

          hitRegions.push({
            componentId: 'displacement_vector',
            priority: 3,
            shape: {
              kind: 'polylines',
              lines: [[{ x: originX, y: dispY }, { x: cartX, y: dispY }]],
              tolerance: 12,
            },
          });
        }

        // Moving Cart body
        const cartW = 46;
        const cartH = 24;
        ctx.save();
        ctx.globalAlpha = alphaFor('moving_body');
        if (isSelected('moving_body')) {
          ctx.fillStyle = 'rgba(111, 78, 55, 0.16)';
          ctx.fillRect(cartX - cartW / 2 - 5, cartY - cartH - 5, cartW + 10, cartH + 10);
        }
        ctx.fillStyle = '#6F4E37';
        ctx.strokeStyle = isSelected('moving_body') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('moving_body') ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(cartX - cartW / 2, cartY - cartH, cartW, cartH, 6);
        ctx.fill();
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#302820';
        ctx.beginPath();
        ctx.arc(cartX - 13, cartY + 2, 5, 0, Math.PI * 2);
        ctx.arc(cartX + 13, cartY + 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        hitRegions.push({
          componentId: 'moving_body',
          priority: 1,
          shape: {
            kind: 'rotated_rect',
            cx: cartX,
            cy: cartY - cartH / 2,
            halfW: cartW / 2 + 6,
            halfH: cartH / 2 + 6,
            angleRad: 0,
          },
        });

        // Velocity vector from cart
        const vArrowLen = Math.min(85, Math.max(18, curVelocity * 6));
        const vEndX = Math.min(w - 16, cartX + cartW / 2 + vArrowLen);
        const vMidY = cartY - cartH / 2;
        ctx.save();
        ctx.globalAlpha = alphaFor('velocity_vector');
        ctx.strokeStyle = isSelected('velocity_vector') ? '#B83A2D' : '#C27D38';
        ctx.lineWidth = isSelected('velocity_vector') ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.moveTo(cartX + cartW / 2, vMidY);
        ctx.lineTo(vEndX, vMidY);
        ctx.stroke();
        ctx.fillStyle = isSelected('velocity_vector') ? '#B83A2D' : '#C27D38';
        ctx.beginPath();
        ctx.moveTo(vEndX + 4, vMidY);
        ctx.lineTo(vEndX - 6, vMidY - 5);
        ctx.lineTo(vEndX - 6, vMidY + 5);
        ctx.closePath();
        ctx.fill();
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`v = ${curVelocity.toFixed(1)} m/s`, cartX + cartW / 2 + 4, vMidY - 10);
        ctx.restore();

        hitRegions.push({
          componentId: 'velocity_vector',
          priority: 2,
          shape: {
            kind: 'polylines',
            lines: [[{ x: cartX + cartW / 2, y: vMidY }, { x: vEndX + 4, y: vMidY }]],
            tolerance: 12,
          },
        });
      } else {
        // Circular motion mode
        const cx = w * 0.5;
        const cy = stageBottom * 0.52;
        const rPx = Math.min(stageBottom * 0.36, w * 0.24);
        const ox = cx + rPx * Math.cos(st.theta);
        const oy = cy + rPx * Math.sin(st.theta);

        // Orbit circle (Distance path)
        ctx.save();
        ctx.globalAlpha = alphaFor('distance_path');
        ctx.strokeStyle = isSelected('distance_path') ? '#B45309' : '#6F4E37';
        ctx.lineWidth = isSelected('distance_path') ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'distance_path',
          priority: 4,
          shape: {
            kind: 'points',
            points: Array.from({ length: 16 }, (_, idx) => ({
              x: cx + rPx * Math.cos((idx / 16) * Math.PI * 2),
              y: cy + rPx * Math.sin((idx / 16) * Math.PI * 2),
            })),
            tolerance: 16,
          },
        });

        // Origin at start angle = 0
        const startX = cx + rPx;
        const startY = cy;
        ctx.save();
        ctx.globalAlpha = alphaFor('reference_origin');
        ctx.fillStyle = isSelected('reference_origin') ? '#B83A2D' : '#302820';
        ctx.beginPath();
        ctx.arc(startX, startY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Origin (r=${st.pathLength.toFixed(1)}m)`, startX + 10, startY + 4);
        ctx.restore();
        hitRegions.push({
          componentId: 'reference_origin',
          priority: 2,
          shape: { kind: 'circle', cx: startX, cy: startY, radius: 16 },
        });

        // Radius line & centre
        ctx.strokeStyle = '#756B63';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ox, oy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#756B63';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Displacement chord from Origin to body
        ctx.save();
        ctx.globalAlpha = alphaFor('displacement_vector');
        ctx.strokeStyle = isSelected('displacement_vector') ? '#B83A2D' : '#2B7A78';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(ox, oy);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'displacement_vector',
          priority: 3,
          shape: {
            kind: 'polylines',
            lines: [[{ x: startX, y: startY }, { x: ox, y: oy }]],
            tolerance: 10,
          },
        });

        // Tangent velocity vector
        const tangAngle = st.theta + Math.PI / 2;
        const vLen = Math.min(58, 22 + curVelocity * 3.2);
        const vx2 = ox + vLen * Math.cos(tangAngle);
        const vy2 = oy + vLen * Math.sin(tangAngle);
        ctx.save();
        ctx.globalAlpha = alphaFor('velocity_vector');
        ctx.strokeStyle = isSelected('velocity_vector') ? '#B83A2D' : '#C27D38';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(vx2, vy2);
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'velocity_vector',
          priority: 2,
          shape: {
            kind: 'polylines',
            lines: [[{ x: ox, y: oy }, { x: vx2, y: vy2 }]],
            tolerance: 12,
          },
        });

        // Moving body
        ctx.save();
        ctx.globalAlpha = alphaFor('moving_body');
        ctx.fillStyle = '#6F4E37';
        ctx.strokeStyle = isSelected('moving_body') ? '#B83A2D' : '#302820';
        ctx.lineWidth = isSelected('moving_body') ? 3 : 1.8;
        ctx.beginPath();
        ctx.arc(ox, oy, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        hitRegions.push({
          componentId: 'moving_body',
          priority: 1,
          shape: { kind: 'circle', cx: ox, cy: oy, radius: 16 },
        });
      }

      // Bottom zone: Live Distance-Time & Velocity-Time Plotter (2 clean side-by-side graphs)
      const plotTop = stageBottom + 10;
      const plotHeight = h - plotTop - 16;
      const graphGap = 16;
      const graphW = (w - 48 - graphGap) / 2;

      const drawPlot = (
        gx: number,
        title: string,
        color: string,
        maxYVal: number,
        unit: string,
        accessor: (pt: { t: number; s: number; v: number }) => number
      ) => {
        ctx.save();
        ctx.globalAlpha = alphaFor('motion_graph');
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = isSelected('motion_graph') ? '#6F4E37' : '#D8D1CA';
        ctx.lineWidth = isSelected('motion_graph') ? 2.4 : 1.2;
        ctx.beginPath();
        ctx.roundRect(gx, plotTop, graphW, plotHeight, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#302820';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, gx + 12, plotTop + 18);

        const padL = 34;
        const padR = 14;
        const padT = 28;
        const padB = 22;
        const iw = Math.max(40, graphW - padL - padR);
        const ih = Math.max(30, plotHeight - padT - padB);
        const axX0 = gx + padL;
        const axY0 = plotTop + padT + ih;

        ctx.strokeStyle = '#D8D1CA';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(axX0, plotTop + padT);
        ctx.lineTo(axX0, axY0);
        ctx.lineTo(axX0 + iw, axY0);
        ctx.stroke();

        ctx.fillStyle = '#756B63';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`0`, axX0 - 12, axY0 + 3);
        ctx.fillText(`${maxYVal.toFixed(0)}${unit}`, gx + 4, plotTop + padT + 8);
        ctx.textAlign = 'right';
        ctx.fillText('time (s)', axX0 + iw, axY0 + 14);
        ctx.textAlign = 'left';

        if (st.history.length > 1) {
          const maxT = Math.max(4, st.history[st.history.length - 1].t);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          st.history.forEach((pt, idx) => {
            const px = axX0 + (pt.t / maxT) * iw;
            const py = axY0 - Math.min(1, Math.max(0, accessor(pt) / maxYVal)) * ih;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }
        ctx.restore();
      };

      drawPlot(24, 'Distance vs. Time (x–t)', '#6F4E37', Math.max(20, trackMaxM), 'm', (p) => p.s);
      drawPlot(
        24 + graphW + graphGap,
        'Velocity vs. Time (v–t)',
        '#2B7A78',
        Math.max(12, st.initialSpeed + Math.max(0, st.acceleration) * 4 + 4),
        'm/s',
        (p) => p.v
      );

      hitRegions.push({
        componentId: 'motion_graph',
        priority: 5,
        shape: {
          kind: 'rotated_rect',
          cx: w / 2,
          cy: plotTop + plotHeight / 2,
          halfW: (w - 48) / 2,
          halfH: plotHeight / 2,
          angleRad: 0,
        },
      });

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
                : s.points[0]?.x || w / 2;
          const ay =
            s.kind === 'circle' || s.kind === 'rotated_rect'
              ? s.cy
              : s.kind === 'polylines'
                ? s.lines[0][0].y
                : s.points[0]?.y || h / 2;
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
        aria-label="Interactive motion and kinematics simulation canvas"
      />
    </div>
  );
};
