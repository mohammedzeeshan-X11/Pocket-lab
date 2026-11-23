import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { DynamicExperimentSpec, DynamicSimulationFrame } from '../../types/dynamicExperiment';
import type { SimulationComponentHit } from '../../systems/componentInteraction/types';
import { pickThreeObjectComponent } from '../../systems/componentInteraction/registry';
import { computeDynamicSimulationState } from '../../utils/dynamicPhysicsValidator';

interface DynamicExperiment3DViewportProps {
  spec: DynamicExperimentSpec;
  paramValues: Record<string, number>;
  isPlaying: boolean;
  reducedMotion?: boolean;
  resetSignal?: number;
  fallbackMessage: string;
  selectedComponentId?: string | null;
  onFrameUpdate?: (frame: DynamicSimulationFrame) => void;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
}

export const DynamicExperiment3DViewport: React.FC<DynamicExperiment3DViewportProps> = ({
  spec,
  paramValues,
  isPlaying,
  reducedMotion = false,
  resetSignal = 0,
  fallbackMessage,
  selectedComponentId = null,
  onFrameUpdate,
  onComponentHit,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const elapsedRef = useRef(0);
  const paramsRef = useRef(paramValues);
  paramsRef.current = paramValues;
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;
  const selectedRef = useRef(selectedComponentId);
  selectedRef.current = selectedComponentId;
  const onFrameRef = useRef(onFrameUpdate);
  onFrameRef.current = onFrameUpdate;
  const onHitRef = useRef(onComponentHit);
  onHitRef.current = onComponentHit;

  useEffect(() => {
    elapsedRef.current = 0;
  }, [resetSignal, spec.id]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    let isSoftwareGl = false;
    try {
      const probe = document.createElement('canvas');
      const glProbe = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!glProbe) {
        setWebglFailed(true);
        return;
      }
      const rendererName = String(glProbe.getParameter(glProbe.RENDERER) || '').toLowerCase();
      isSoftwareGl = rendererName.includes('swiftshader') || rendererName.includes('llvmpipe');
      renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
    } catch {
      setWebglFailed(true);
      return;
    }

    const w = Math.max(300, host.clientWidth);
    const h = Math.max(220, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1 : 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7F5F2');

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 2.4, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;

    const ambient = new THREE.AmbientLight('#FFFFFF', 0.85);
    const keyLight = new THREE.DirectionalLight('#FFF6EA', 1.45);
    keyLight.position.set(4, 7, 5);
    const fillLight = new THREE.DirectionalLight('#E6E0F0', 0.65);
    fillLight.position.set(-4, 3, -3);
    scene.add(ambient, keyLight, fillLight);

    const grid = new THREE.GridHelper(10, 20, 0x6f4e37, 0xd8d1ca);
    grid.position.y = -1.6;
    scene.add(grid);

    const selectableMeshes: THREE.Object3D[] = [];
    const compId = (idx: number) => (spec.components[idx] || spec.components[0])?.id || `part_${idx}`;

    // Build modular 3D apparatus group depending on templateId
    const primaryMat = new THREE.MeshStandardMaterial({ color: '#B83A2D', roughness: 0.35, metalness: 0.2 });
    const brassMat = new THREE.MeshStandardMaterial({ color: '#6F4E37', roughness: 0.4, metalness: 0.35 });
    const slateMat = new THREE.MeshStandardMaterial({ color: '#3E4C59', roughness: 0.45, metalness: 0.25 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#A7D8DE',
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
    });

    const primaryMesh = new THREE.Mesh(
      spec.templateId === 'inclined_plane_forces' || spec.templateId === 'buoyancy_pressure'
        ? new THREE.BoxGeometry(0.75, 0.55, 0.75)
        : new THREE.SphereGeometry(0.32, 24, 24),
      primaryMat
    );
    primaryMesh.userData.componentId = compId(0);
    selectableMeshes.push(primaryMesh);
    scene.add(primaryMesh);

    const secondaryGroup = new THREE.Group();
    scene.add(secondaryGroup);

    let rodMesh: THREE.Mesh | null = null;
    let secondaryMesh: THREE.Mesh;

    if (spec.templateId === 'pendulum_shm') {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.35), brassMat);
      stand.position.set(0, 1.5, 0);
      stand.userData.componentId = compId(1);
      selectableMeshes.push(stand);
      secondaryGroup.add(stand);

      rodMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 12), slateMat);
      rodMesh.userData.componentId = compId(2);
      selectableMeshes.push(rodMesh);
      secondaryGroup.add(rodMesh);
      secondaryMesh = stand;
    } else if (spec.templateId === 'inclined_plane_forces') {
      const wedge = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 1.4), slateMat);
      wedge.position.set(0, -0.4, 0);
      wedge.userData.componentId = compId(1);
      selectableMeshes.push(wedge);
      secondaryGroup.add(wedge);
      secondaryMesh = wedge;
    } else if (spec.templateId === 'spring_oscillation') {
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 0.8), brassMat);
      topPlate.position.set(0, 1.55, 0);
      topPlate.userData.componentId = compId(2);
      selectableMeshes.push(topPlate);
      secondaryGroup.add(topPlate);

      rodMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1, 16), slateMat);
      rodMesh.userData.componentId = compId(1);
      selectableMeshes.push(rodMesh);
      secondaryGroup.add(rodMesh);
      secondaryMesh = topPlate;
    } else if (spec.templateId === 'buoyancy_pressure') {
      const tank = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 1.8), glassMat);
      tank.position.set(0, -0.45, 0);
      tank.userData.componentId = compId(1);
      selectableMeshes.push(tank);
      secondaryGroup.add(tank);
      secondaryMesh = tank;
    } else if (spec.templateId === 'optics_ray_model') {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.18, 32), glassMat);
      lens.rotation.z = Math.PI / 2;
      lens.userData.componentId = compId(1);
      selectableMeshes.push(lens);
      secondaryGroup.add(lens);
      secondaryMesh = lens;
    } else {
      // magnetic_dipole_3d or projectile_motion fallback 3D rig
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.7), slateMat);
      base.position.set(0, -1.35, 0);
      base.userData.componentId = compId(1);
      selectableMeshes.push(base);
      secondaryGroup.add(base);
      secondaryMesh = base;
    }

    // Raycast click picking
    const raycaster = new THREE.Raycaster();
    let pointerDownPos = { x: 0, y: 0 };
    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
      const hit = pickThreeObjectComponent(
        raycaster,
        camera,
        e.clientX,
        e.clientY,
        renderer.domElement,
        selectableMeshes
      );
      onHitRef.current?.(hit);
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const resizeObs = new ResizeObserver(() => {
      if (!host) return;
      const nw = Math.max(260, host.clientWidth);
      const nh = Math.max(200, host.clientHeight);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObs.observe(host);

    let rafId = 0;
    let stopped = false;
    let lastTs = performance.now();
    let lastTelemetryPush = 0;

    const animate = () => {
      if (stopped) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      if (playingRef.current && !reducedMotion) {
        elapsedRef.current += dt;
      }

      const frame = computeDynamicSimulationState(spec, paramsRef.current, elapsedRef.current);
      if (now - lastTelemetryPush > 90) {
        lastTelemetryPush = now;
        onFrameRef.current?.(frame);
      }

      const v = frame.vectorData;
      if (spec.templateId === 'pendulum_shm') {
        const L = Math.min(2.6, Math.max(0.9, v.L || 1.2));
        const th = v.thetaRad || 0;
        const bx = L * Math.sin(th);
        const by = 1.5 - L * Math.cos(th);
        primaryMesh.position.set(bx, by, 0);
        if (rodMesh) {
          rodMesh.scale.set(1, L, 1);
          rodMesh.position.set(bx * 0.5, 1.5 - (L * 0.5) * Math.cos(th), 0);
          rodMesh.rotation.z = th;
        }
      } else if (spec.templateId === 'inclined_plane_forces') {
        const rad = v.rad || 0.5;
        secondaryMesh.rotation.z = -rad;
        const s = (v.sFrac || 0) * 3.0 - 1.5;
        primaryMesh.rotation.z = -rad;
        primaryMesh.position.set(
          Math.cos(rad) * s,
          -0.4 - Math.sin(rad) * s + 0.38,
          0
        );
      } else if (spec.templateId === 'spring_oscillation') {
        const disp = (v.x || 0) * 1.4;
        const py = -0.1 - disp;
        primaryMesh.position.set(0, py, 0);
        if (rodMesh) {
          const len = Math.max(0.4, 1.55 - py);
          rodMesh.scale.set(1, len, 1);
          rodMesh.position.set(0, py + len * 0.5, 0);
        }
      } else if (spec.templateId === 'buoyancy_pressure') {
        const sub = v.submergedRatio || 0.6;
        const floats = frame.statusFlags?.floats !== false;
        primaryMesh.position.set(0, floats ? 0.55 - sub * 0.6 : -1.1, 0);
      } else if (spec.templateId === 'projectile_motion') {
        const range = Math.max(10, v.totalRange || 20);
        const maxH = Math.max(5, v.maxH || 10);
        const nx = ((v.curX || 0) / range) * 4.4 - 2.2;
        const ny = ((v.curY || 0) / maxH) * 2.4 - 1.1;
        primaryMesh.position.set(nx, ny, 0);
      } else {
        const ang = ((v.angleDeg || 0) * Math.PI) / 180;
        primaryMesh.rotation.y = ang;
        primaryMesh.position.set(Math.cos(ang) * 1.1, 0, Math.sin(ang) * 0.6);
      }

      // Highlight selected mesh cleanly via emissive glow
      for (const m of selectableMeshes) {
        if (m instanceof THREE.Mesh && m.material instanceof THREE.MeshStandardMaterial) {
          m.material.emissive.setHex(selectedRef.current === m.userData.componentId ? 0x6f4e37 : 0x000000);
          m.material.emissiveIntensity = selectedRef.current === m.userData.componentId ? 0.45 : 0;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      const scheduleNext = () => {
        if (!stopped) rafId = requestAnimationFrame(animate);
      };
      if (isSoftwareGl) {
        const gl = renderer.getContext();
        const sync = (gl as WebGL2RenderingContext).fenceSync?.(
          (gl as WebGL2RenderingContext).SYNC_GPU_COMMANDS_COMPLETE,
          0
        );
        if (sync) {
          gl.flush();
          (gl as WebGL2RenderingContext).deleteSync(sync);
        }
        setTimeout(scheduleNext, 32);
      } else {
        scheduleNext();
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      primaryMat.dispose();
      brassMat.dispose();
      slateMat.dispose();
      glassMat.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry) {
          obj.geometry.dispose();
        }
      });
      renderer.dispose();
    };
  }, [spec, reducedMotion]);

  if (webglFailed) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 text-center bg-[#F7F5F2] text-sm text-[#756B63]">
        {fallbackMessage}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      data-testid="dynamic-3d-viewport"
      className="w-full h-full relative"
    />
  );
};
