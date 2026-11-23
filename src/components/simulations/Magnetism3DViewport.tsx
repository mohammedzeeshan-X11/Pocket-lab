import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { computeLocalMagneticField3D, traceLocalFieldLine3D } from '../../utils/magnetismPhysics';
import type { SimulationComponentHit } from '../../systems/componentInteraction/types';
import {
  pickThreeObjectComponent,
  projectWorldPointToViewport,
} from '../../systems/componentInteraction/registry';

interface Magnetism3DViewportProps {
  magnetYawDeg: number;
  magnetPitchDeg: number;
  strength: number;
  isPlaying: boolean;
  showFieldLines: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  fallbackMessage: string;
  selectedComponentId?: string | null;
  onComponentHit?: (hit: SimulationComponentHit | null) => void;
  onAnchorMove?: (
    anchor: { x: number; y: number },
    viewport: { width: number; height: number }
  ) => void;
}

// Pre-allocated math helpers for zero-GC animation loop
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _anchorWorld = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _mat4 = new THREE.Matrix4();
const _scaleVec = new THREE.Vector3(1, 1, 1);
const _upVec = new THREE.Vector3(0, 1, 0);

function createPoleLabelTexture(letter: 'N' | 'S', bgColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 132px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 128, 134);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(48, 40, 32, 0.30)');
  grad.addColorStop(0.55, 'rgba(48, 40, 32, 0.11)');
  grad.addColorStop(1, 'rgba(48, 40, 32, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Magnetism3DViewport: React.FC<Magnetism3DViewportProps> = ({
  magnetYawDeg,
  magnetPitchDeg,
  strength,
  isPlaying,
  showFieldLines,
  reducedMotion,
  resetSignal,
  fallbackMessage,
  selectedComponentId = null,
  onComponentHit,
  onAnchorMove,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState(false);

  const onComponentHitRef = useRef(onComponentHit);
  onComponentHitRef.current = onComponentHit;
  const onAnchorMoveRef = useRef(onAnchorMove);
  onAnchorMoveRef.current = onAnchorMove;

  const stateRef = useRef({
    magnetYawDeg,
    magnetPitchDeg,
    strength,
    isPlaying,
    showFieldLines,
    reducedMotion,
    selectedComponentId,
    resetCameraRequested: false,
  });

  useEffect(() => {
    stateRef.current.magnetYawDeg = magnetYawDeg;
    stateRef.current.magnetPitchDeg = magnetPitchDeg;
    stateRef.current.strength = strength;
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.showFieldLines = showFieldLines;
    stateRef.current.reducedMotion = reducedMotion;
    stateRef.current.selectedComponentId = selectedComponentId ?? null;
  }, [
    magnetYawDeg,
    magnetPitchDeg,
    strength,
    isPlaying,
    showFieldLines,
    reducedMotion,
    selectedComponentId,
  ]);

  useEffect(() => {
    if (resetSignal > 0) {
      stateRef.current.resetCameraRequested = true;
    }
  }, [resetSignal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const initialW = Math.max(220, container.clientWidth);
    const initialH = Math.max(200, container.clientHeight);
    renderer.setSize(initialW, initialH);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1eeea);
    scene.fog = new THREE.FogExp2(0xf1eeea, 0.032);

    const disposables: Array<{ dispose: () => void }> = [];

    if (!isSoftwareGl) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      scene.environment = envTexture;
      roomEnv.dispose();
      pmremGenerator.dispose();
      disposables.push(envTexture);
    }

    const camera = new THREE.PerspectiveCamera(42, initialW / initialH, 0.1, 80);
    const defaultCamPos = new THREE.Vector3(0, 4.2, 8.6);
    camera.position.copy(defaultCamPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.2;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.target.set(0, 0, 0);
    controls.update();

    controls.addEventListener('start', () => {
      stateRef.current.resetCameraRequested = false;
    });

    const hemiLight = new THREE.HemisphereLight(
      0xe6e0f0,
      0x8f8275,
      isSoftwareGl ? 1.35 : 0.85
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.85);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd9d2e9, 0.95);
    rimLight.position.set(-6, 3, -5);
    scene.add(rimLight);

    const floorGeo = new THREE.CircleGeometry(7.5, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe5e4e2,
      roughness: 0.88,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2.35;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    disposables.push(floorGeo, floorMat);

    const ringGeo = new THREE.RingGeometry(3.2, 3.24, 72);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6f4e37,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -2.33;
    scene.add(ringMesh);
    disposables.push(ringGeo, ringMat);

    const shadowTex = createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(5.6, 5.6);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.32;
    scene.add(shadowPlane);
    disposables.push(shadowTex, shadowPlaneGeo, shadowPlaneMat);

    const magnetSystem = new THREE.Group();
    scene.add(magnetSystem);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const northTex = createPoleLabelTexture('N', '#B83A2D');
    const southTex = createPoleLabelTexture('S', '#3E4C59');
    northTex.anisotropy = maxAniso;
    southTex.anisotropy = maxAniso;
    disposables.push(northTex, southTex);

    const barShape = new THREE.Shape();
    const bw = 0.36;
    const bh = 0.36;
    const br = 0.06;
    barShape.moveTo(-bw + br, -bh);
    barShape.lineTo(bw - br, -bh);
    barShape.quadraticCurveTo(bw, -bh, bw, -bh + br);
    barShape.lineTo(bw, bh - br);
    barShape.quadraticCurveTo(bw, bh, bw - br, bh);
    barShape.lineTo(-bw + br, bh);
    barShape.quadraticCurveTo(-bw, bh, -bw, bh - br);
    barShape.lineTo(-bw, -bh + br);
    barShape.quadraticCurveTo(-bw, -bh, -bw + br, -bh);

    const halfExtrudeGeo = new THREE.ExtrudeGeometry(barShape, {
      depth: 1.45,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    halfExtrudeGeo.rotateY(Math.PI / 2);
    disposables.push(halfExtrudeGeo);

    const northMat = new THREE.MeshPhysicalMaterial({
      color: 0xb83a2d,
      roughness: 0.28,
      metalness: 0.32,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    });
    const southMat = new THREE.MeshStandardMaterial({
      color: 0x3e4c59,
      roughness: 0.35,
      metalness: 0.72,
    });
    disposables.push(northMat, southMat);

    const northMesh = new THREE.Mesh(halfExtrudeGeo, northMat);
    northMesh.position.x = 0.08;
    northMesh.castShadow = true;
    northMesh.userData.componentId = 'north_pole';
    magnetSystem.add(northMesh);

    const southMesh = new THREE.Mesh(halfExtrudeGeo, southMat);
    southMesh.rotation.y = Math.PI;
    southMesh.position.x = -0.08;
    southMesh.castShadow = true;
    southMesh.userData.componentId = 'south_pole';
    magnetSystem.add(southMesh);

    // Distinct central ferromagnetic body collar (neutral zone between N and S poles)
    const collarGeo = new THREE.BoxGeometry(0.56, 0.80, 0.80);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xb89668,
      metalness: 0.86,
      roughness: 0.24,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.castShadow = true;
    collarMesh.userData.componentId = 'magnet_body';
    magnetSystem.add(collarMesh);
    disposables.push(collarGeo, collarMat);

    // Selection BackSide outline shells for unmistakable 3D focus feedback
    const poleOutlineMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const northOutlineMesh = new THREE.Mesh(halfExtrudeGeo, poleOutlineMat);
    northOutlineMesh.position.copy(northMesh.position);
    northOutlineMesh.scale.set(1.06, 1.12, 1.12);
    northOutlineMesh.visible = false;
    magnetSystem.add(northOutlineMesh);

    const southOutlineMesh = new THREE.Mesh(halfExtrudeGeo, poleOutlineMat);
    southOutlineMesh.rotation.copy(southMesh.rotation);
    southOutlineMesh.position.copy(southMesh.position);
    southOutlineMesh.scale.set(1.06, 1.12, 1.12);
    southOutlineMesh.visible = false;
    magnetSystem.add(southOutlineMesh);

    const collarOutlineMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    const collarOutlineMesh = new THREE.Mesh(collarGeo, collarOutlineMat);
    collarOutlineMesh.scale.set(1.14, 1.11, 1.11);
    collarOutlineMesh.visible = false;
    magnetSystem.add(collarOutlineMesh);
    disposables.push(poleOutlineMat, collarOutlineMat);

    const decalGeo = new THREE.PlaneGeometry(0.52, 0.52);
    const nDecalMat = new THREE.MeshStandardMaterial({
      map: northTex,
      roughness: 0.4,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const sDecalMat = new THREE.MeshStandardMaterial({
      map: southTex,
      roughness: 0.4,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    disposables.push(decalGeo, nDecalMat, sDecalMat);

    const nTop = new THREE.Mesh(decalGeo, nDecalMat);
    nTop.rotation.x = -Math.PI / 2;
    nTop.position.set(1.05, 0.395, 0);
    nTop.userData.componentId = 'north_pole';
    magnetSystem.add(nTop);

    const sTop = new THREE.Mesh(decalGeo, sDecalMat);
    sTop.rotation.x = -Math.PI / 2;
    sTop.position.set(-1.05, 0.395, 0);
    sTop.userData.componentId = 'south_pole';
    magnetSystem.add(sTop);

    const nFront = new THREE.Mesh(decalGeo, nDecalMat);
    nFront.position.set(1.05, 0, 0.395);
    nFront.userData.componentId = 'north_pole';
    magnetSystem.add(nFront);

    const sFront = new THREE.Mesh(decalGeo, sDecalMat);
    sFront.position.set(-1.05, 0, 0.395);
    sFront.userData.componentId = 'south_pole';
    magnetSystem.add(sFront);

    const fieldGroup = new THREE.Group();
    magnetSystem.add(fieldGroup);

    const fieldCurves: THREE.CatmullRomCurve3[] = [];
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x6f4e37,
      roughness: 0.45,
      metalness: 0.25,
      transparent: true,
      opacity: 0.72,
    });
    disposables.push(tubeMat);

    const azimuthPlanes = 6;
    const radialSeeds = [0.22, 0.42];
    const arrowAnchors: Array<{ pos: THREE.Vector3; dir: THREE.Vector3 }> = [];

    for (let p = 0; p < azimuthPlanes; p++) {
      const phi = (p / azimuthPlanes) * Math.PI * 2;
      for (const rad of radialSeeds) {
        const startPt = {
          x: 1.48,
          y: Math.cos(phi) * rad,
          z: Math.sin(phi) * rad,
        };
        const rawPts = traceLocalFieldLine3D(startPt, 1.35, 0.14, 150);
        if (rawPts.length < 6) continue;

        const vecPts = rawPts.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z));
        const curve = new THREE.CatmullRomCurve3(vecPts);
        fieldCurves.push(curve);

        const tubeGeo = new THREE.TubeGeometry(curve, 56, 0.022, 7, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.userData.componentId = 'field_lines';
        fieldGroup.add(tubeMesh);
        disposables.push(tubeGeo);

        const midPos = curve.getPointAt(0.5);
        const midTan = curve.getTangentAt(0.5).normalize();
        arrowAnchors.push({ pos: midPos, dir: midTan });
      }
    }

    // Distinct selectable direction arrow cones along the 3D field lines
    const coneGeo = new THREE.ConeGeometry(0.085, 0.24, 12);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x6f4e37,
      roughness: 0.35,
      metalness: 0.4,
    });
    const arrowInstanced = new THREE.InstancedMesh(coneGeo, coneMat, arrowAnchors.length);
    arrowAnchors.forEach((anchor, idx) => {
      _quat.setFromUnitVectors(_upVec, anchor.dir);
      _mat4.compose(anchor.pos, _quat, _scaleVec);
      arrowInstanced.setMatrixAt(idx, _mat4);
    });
    arrowInstanced.instanceMatrix.needsUpdate = true;
    arrowInstanced.computeBoundingSphere();
    arrowInstanced.userData.componentId = 'field_direction_arrows';
    fieldGroup.add(arrowInstanced);
    disposables.push(coneGeo, coneMat);

    const tracerCount = fieldCurves.length * 2;
    const tracerGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const tracerMat = new THREE.MeshStandardMaterial({
      color: 0xb83a2d,
      emissive: 0x6f4e37,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.3,
    });
    const tracerInstanced = new THREE.InstancedMesh(tracerGeo, tracerMat, tracerCount);
    tracerInstanced.frustumCulled = false;
    fieldGroup.add(tracerInstanced);
    disposables.push(tracerGeo, tracerMat);

    const probeGroup = new THREE.Group();
    probeGroup.position.set(0, -0.45, 2.75);
    scene.add(probeGroup);

    const probeBaseGeo = new THREE.CylinderGeometry(0.45, 0.48, 0.14, 32);
    const probeBaseMat = new THREE.MeshStandardMaterial({
      color: 0xb89668,
      metalness: 0.88,
      roughness: 0.24,
    });
    const probeBase = new THREE.Mesh(probeBaseGeo, probeBaseMat);
    probeBase.castShadow = true;
    probeBase.userData.componentId = 'compass_needle';
    probeGroup.add(probeBase);
    disposables.push(probeBaseGeo, probeBaseMat);

    const probeDialGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.15, 32);
    const probeDialMat = new THREE.MeshStandardMaterial({
      color: 0xf7f5f2,
      roughness: 0.65,
      metalness: 0.05,
    });
    const probeDial = new THREE.Mesh(probeDialGeo, probeDialMat);
    probeDial.userData.componentId = 'compass_needle';
    probeGroup.add(probeDial);
    disposables.push(probeDialGeo, probeDialMat);

    const probeNeedleGroup = new THREE.Group();
    probeNeedleGroup.position.y = 0.12;
    probeGroup.add(probeNeedleGroup);

    const needleNorthGeo = new THREE.ConeGeometry(0.06, 0.32, 8);
    needleNorthGeo.rotateZ(-Math.PI / 2);
    needleNorthGeo.translate(0.16, 0, 0);
    const needleNorthMat = new THREE.MeshStandardMaterial({ color: 0xb83a2d, roughness: 0.35 });
    const needleNorthMesh = new THREE.Mesh(needleNorthGeo, needleNorthMat);
    needleNorthMesh.userData.componentId = 'compass_needle';
    probeNeedleGroup.add(needleNorthMesh);

    const needleSouthGeo = new THREE.ConeGeometry(0.06, 0.32, 8);
    needleSouthGeo.rotateZ(Math.PI / 2);
    needleSouthGeo.translate(-0.16, 0, 0);
    const needleSouthMat = new THREE.MeshStandardMaterial({ color: 0x3e4c59, roughness: 0.4 });
    const needleSouthMesh = new THREE.Mesh(needleSouthGeo, needleSouthMat);
    needleSouthMesh.userData.componentId = 'compass_needle';
    probeNeedleGroup.add(needleSouthMesh);
    disposables.push(needleNorthGeo, needleNorthMat, needleSouthGeo, needleSouthMat);

    // Distinct brass center pivot pin + invisible wide raycast proxy for reliable clicking
    const pivotPinGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.22, 16);
    const pivotPinMat = new THREE.MeshStandardMaterial({
      color: 0x8a5a19,
      metalness: 0.92,
      roughness: 0.22,
    });
    const compassPivotMesh = new THREE.Mesh(pivotPinGeo, pivotPinMat);
    compassPivotMesh.position.set(0, 0.14, 0);
    compassPivotMesh.userData.componentId = 'compass_pivot';
    probeGroup.add(compassPivotMesh);

    const pivotProxyGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const pivotProxyMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pivotHitProxy = new THREE.Mesh(pivotProxyGeo, pivotProxyMat);
    pivotHitProxy.position.set(0, 0.16, 0);
    pivotHitProxy.userData.componentId = 'compass_pivot';
    probeGroup.add(pivotHitProxy);

    // Compass & pivot selection halo rings
    const probeHaloGeo = new THREE.TorusGeometry(0.54, 0.025, 10, 48);
    const probeHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const probeHaloMesh = new THREE.Mesh(probeHaloGeo, probeHaloMat);
    probeHaloMesh.rotation.x = Math.PI / 2;
    probeHaloMesh.position.y = 0.04;
    probeHaloMesh.visible = false;
    probeGroup.add(probeHaloMesh);

    const pivotHaloGeo = new THREE.TorusGeometry(0.14, 0.018, 10, 32);
    const pivotHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    const pivotHaloMesh = new THREE.Mesh(pivotHaloGeo, pivotHaloMat);
    pivotHaloMesh.rotation.x = Math.PI / 2;
    pivotHaloMesh.position.y = 0.17;
    pivotHaloMesh.visible = false;
    probeGroup.add(pivotHaloMesh);

    disposables.push(
      pivotPinGeo,
      pivotPinMat,
      pivotProxyGeo,
      pivotProxyMat,
      probeHaloGeo,
      probeHaloMat,
      pivotHaloGeo,
      pivotHaloMat
    );

    // Raycaster for two-stage component selection + hover highlight
    const raycaster = new THREE.Raycaster();
    let downX = 0;
    let downY = 0;
    let lastHoverCheck = 0;
    let hoveredComponentId: string | null = null;

    // Anchor tracking so tooltips stay anchored to moving/orbited 3D components
    let activeAnchorLocal = new THREE.Vector3(0, 0.42, 0);
    let activeAnchorSpace: 'magnet' | 'probe' | 'none' = 'none';

    const selectableMeshes: THREE.Object3D[] = [
      pivotHitProxy,
      compassPivotMesh,
      needleNorthMesh,
      needleSouthMesh,
      probeBase,
      probeDial,
      collarMesh,
      northMesh,
      southMesh,
      nTop,
      sTop,
      nFront,
      sFront,
      arrowInstanced,
      ...fieldGroup.children.filter((c) => c.userData?.componentId === 'field_lines'),
    ];

    const resolveDefaultAnchorForComponent = (compId: string) => {
      switch (compId) {
        case 'north_pole':
          activeAnchorSpace = 'magnet';
          activeAnchorLocal.set(1.05, 0.42, 0);
          break;
        case 'south_pole':
          activeAnchorSpace = 'magnet';
          activeAnchorLocal.set(-1.05, 0.42, 0);
          break;
        case 'magnet_body':
        case 'bar_magnet':
          activeAnchorSpace = 'magnet';
          activeAnchorLocal.set(0, 0.46, 0);
          break;
        case 'field_direction_arrows':
          activeAnchorSpace = 'magnet';
          if (arrowAnchors[0]) {
            activeAnchorLocal.copy(arrowAnchors[0].pos);
          } else {
            activeAnchorLocal.set(0, 1.35, 0);
          }
          break;
        case 'field_lines':
          activeAnchorSpace = 'magnet';
          activeAnchorLocal.set(0.4, 1.15, 0.4);
          break;
        case 'compass_pivot':
          activeAnchorSpace = 'probe';
          activeAnchorLocal.set(0, 0.25, 0);
          break;
        case 'compass_needle':
          activeAnchorSpace = 'probe';
          activeAnchorLocal.set(0.18, 0.22, 0);
          break;
        default:
          activeAnchorSpace = 'none';
      }
    };

    const onDomPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onDomPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      const hoverHit = pickThreeObjectComponent(
        raycaster,
        camera,
        e.clientX,
        e.clientY,
        renderer.domElement,
        selectableMeshes
      );
      hoveredComponentId = hoverHit ? hoverHit.componentId : null;
      renderer.domElement.style.cursor = hoverHit ? 'pointer' : 'grab';
    };

    const onDomPointerLeave = () => {
      hoveredComponentId = null;
      renderer.domElement.style.cursor = 'grab';
    };

    const onDomPointerUp = (e: PointerEvent) => {
      if (!onComponentHitRef.current) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const rawHits = raycaster.intersectObjects(selectableMeshes, false);

      let matchedHit: THREE.Intersection<THREE.Object3D> | null = null;
      for (const h of rawHits) {
        if (typeof h.object?.userData?.componentId === 'string') {
          matchedHit = h;
          break;
        }
      }

      if (!matchedHit) {
        activeAnchorSpace = 'none';
        onComponentHitRef.current(null);
        return;
      }

      const compId = String(matchedHit.object.userData.componentId);
      const hitAnchor = projectWorldPointToViewport(
        matchedHit.point,
        camera,
        rect.width,
        rect.height
      );

      // Record hit local anchor for smooth live tracking when orbiting/rotating
      if (
        matchedHit.object === compassPivotMesh ||
        matchedHit.object === pivotHitProxy ||
        matchedHit.object === needleNorthMesh ||
        matchedHit.object === needleSouthMesh ||
        matchedHit.object === probeBase ||
        matchedHit.object === probeDial
      ) {
        activeAnchorSpace = 'probe';
        activeAnchorLocal.copy(matchedHit.point);
        probeGroup.worldToLocal(activeAnchorLocal);
      } else {
        activeAnchorSpace = 'magnet';
        activeAnchorLocal.copy(matchedHit.point);
        magnetSystem.worldToLocal(activeAnchorLocal);
      }

      onComponentHitRef.current({
        componentId: compId,
        anchorPx: hitAnchor,
        viewportSize: { width: rect.width, height: rect.height },
      });
    };

    renderer.domElement.addEventListener('pointerdown', onDomPointerDown);
    renderer.domElement.addEventListener('pointermove', onDomPointerMove);
    renderer.domElement.addEventListener('pointerleave', onDomPointerLeave);
    renderer.domElement.addEventListener('pointerup', onDomPointerUp);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const handleResize = () => {
      const w = Math.max(220, container.clientWidth);
      const h = Math.max(200, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('orientationchange', handleResize);

    let frameId = 0;
    let disposed = false;
    let lastClock = performance.now();
    let tracerPhase = 0;
    let currentYaw = 0;
    let currentPitch = 0;
    let prevSelectedId: string | null = null;
    let prevArrowsEmphasized = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastClock) / 1000);
      lastClock = now;

      const s = stateRef.current;
      const targetYaw = THREE.MathUtils.degToRad(s.magnetYawDeg);
      const targetPitch = THREE.MathUtils.degToRad(s.magnetPitchDeg);

      if (s.reducedMotion) {
        currentYaw = targetYaw;
        currentPitch = targetPitch;
      } else {
        currentYaw = THREE.MathUtils.damp(currentYaw, targetYaw, 10, dt);
        currentPitch = THREE.MathUtils.damp(currentPitch, targetPitch, 10, dt);
      }

      magnetSystem.rotation.set(0, currentYaw, currentPitch, 'YXZ');
      fieldGroup.visible = s.showFieldLines;

      const sel = s.selectedComponentId;
      if (sel !== prevSelectedId) {
        if (sel && activeAnchorSpace === 'none') {
          resolveDefaultAnchorForComponent(sel);
        } else if (!sel) {
          activeAnchorSpace = 'none';
        }
        prevSelectedId = sel;
      }

      // Smooth laboratory pulse (respecting reducedMotion)
      const pulse = s.reducedMotion ? 1 : 0.72 + 0.28 * Math.sin(now * 0.005);
      const hov = hoveredComponentId;
      const bodySel = sel === 'magnet_body' || sel === 'bar_magnet';
      const bodyHov = hov === 'magnet_body' || hov === 'bar_magnet';

      // Show/hide BackSide outline shells and halo rings with pulsing emphasis
      northOutlineMesh.visible = sel === 'north_pole' || bodySel;
      southOutlineMesh.visible = sel === 'south_pole' || bodySel;
      collarOutlineMesh.visible = bodySel;
      poleOutlineMat.opacity = (sel === 'north_pole' || sel === 'south_pole' ? 0.85 : 0.45) * pulse;
      collarOutlineMat.opacity = 0.82 * pulse;

      probeHaloMesh.visible = sel === 'compass_needle';
      probeHaloMat.opacity = 0.85 * pulse;
      probeHaloMesh.scale.setScalar(sel === 'compass_needle' && !s.reducedMotion ? 0.98 + 0.05 * pulse : 1);

      pivotHaloMesh.visible = sel === 'compass_pivot';
      pivotHaloMat.opacity = 0.92 * pulse;
      pivotHaloMesh.scale.setScalar(sel === 'compass_pivot' && !s.reducedMotion ? 0.96 + 0.08 * pulse : 1);

      // Apply visual emissive + contrast dimming across all 7 components
      const northFocus = sel === 'north_pole' || bodySel;
      const southFocus = sel === 'south_pole' || bodySel;
      const compassFocus = sel === 'compass_needle' || sel === 'compass_pivot';
      const fieldSelected = sel === 'field_lines';
      const fieldHovered = hov === 'field_lines';
      const arrowsSelected = sel === 'field_direction_arrows';
      const arrowsHovered = hov === 'field_direction_arrows';

      northMat.color.setHex(sel && !northFocus ? 0xd4968e : 0xb83a2d);
      nDecalMat.color.setHex(sel && !northFocus ? 0xc2bcb6 : 0xffffff);
      northMat.emissive.setHex(
        sel === 'north_pole' || hov === 'north_pole'
          ? 0xf59e0b
          : bodySel || bodyHov
            ? 0x6f4e37
            : 0x000000
      );
      northMat.emissiveIntensity =
        sel === 'north_pole'
          ? 0.72 * pulse
          : bodySel
            ? 0.24
            : hov === 'north_pole' || bodyHov
              ? 0.22
              : 0;

      southMat.color.setHex(sel && !southFocus ? 0x9aa2aa : 0x3e4c59);
      sDecalMat.color.setHex(sel && !southFocus ? 0xc2bcb6 : 0xffffff);
      southMat.emissive.setHex(
        sel === 'south_pole' || hov === 'south_pole'
          ? 0x8b5cf6
          : bodySel || bodyHov
            ? 0x6f4e37
            : 0x000000
      );
      southMat.emissiveIntensity =
        sel === 'south_pole'
          ? 0.78 * pulse
          : bodySel
            ? 0.24
            : hov === 'south_pole' || bodyHov
              ? 0.24
              : 0;

      collarMat.color.setHex(sel && !bodySel ? 0xd4c8b8 : 0xb89668);
      collarMat.emissive.setHex(bodySel || bodyHov ? 0xd97706 : 0x000000);
      collarMat.emissiveIntensity = bodySel ? 0.72 * pulse : bodyHov ? 0.24 : 0;

      probeBaseMat.color.setHex(sel && !compassFocus ? 0xd4c8b8 : 0xb89668);
      probeDialMat.color.setHex(sel && !compassFocus ? 0xe5e0da : 0xf7f5f2);
      needleNorthMat.color.setHex(sel && sel !== 'compass_needle' ? 0xd4968e : 0xb83a2d);
      needleSouthMat.color.setHex(sel && sel !== 'compass_needle' ? 0x9aa2aa : 0x3e4c59);
      probeBaseMat.emissive.setHex(
        sel === 'compass_needle' || hov === 'compass_needle' ? 0xd97706 : 0x000000
      );
      probeBaseMat.emissiveIntensity =
        sel === 'compass_needle' ? 0.55 * pulse : hov === 'compass_needle' ? 0.2 : 0;
      needleNorthMat.emissive.setHex(
        sel === 'compass_needle' || hov === 'compass_needle' ? 0xf59e0b : 0x000000
      );
      needleNorthMat.emissiveIntensity =
        sel === 'compass_needle' ? 0.72 * pulse : hov === 'compass_needle' ? 0.24 : 0;
      needleSouthMat.emissive.setHex(
        sel === 'compass_needle' || hov === 'compass_needle' ? 0x6f4e37 : 0x000000
      );
      needleSouthMat.emissiveIntensity =
        sel === 'compass_needle' ? 0.55 * pulse : hov === 'compass_needle' ? 0.2 : 0;

      pivotPinMat.color.setHex(sel && !compassFocus ? 0xc8b8a4 : 0x8a5a19);
      pivotPinMat.emissive.setHex(
        sel === 'compass_pivot' || hov === 'compass_pivot' ? 0xf59e0b : 0x000000
      );
      pivotPinMat.emissiveIntensity =
        sel === 'compass_pivot' ? 0.95 * pulse : hov === 'compass_pivot' ? 0.35 : 0;

      tubeMat.color.setHex(fieldSelected ? 0xb45309 : sel && !arrowsSelected ? 0xa39182 : 0x6f4e37);
      tubeMat.opacity = fieldSelected
        ? 0.98
        : arrowsSelected
          ? 0.34
          : sel
            ? Math.min(0.4, 0.22 + s.strength * 0.08)
            : fieldHovered
              ? 0.88
              : Math.min(0.92, 0.34 + s.strength * 0.25);
      tubeMat.emissive.setHex(fieldSelected || fieldHovered ? 0xd97706 : 0x000000);
      tubeMat.emissiveIntensity = fieldSelected ? 0.68 * pulse : fieldHovered ? 0.28 : 0;

      coneMat.color.setHex(
        arrowsSelected ? 0xf59e0b : sel && !fieldSelected ? 0xb5a395 : 0x6f4e37
      );
      coneMat.emissive.setHex(arrowsSelected || arrowsHovered ? 0xd97706 : 0x000000);
      coneMat.emissiveIntensity = arrowsSelected ? 0.92 * pulse : arrowsHovered ? 0.35 : 0;

      if (arrowsSelected || prevArrowsEmphasized) {
        const arrowScale = arrowsSelected ? 1.28 + (s.reducedMotion ? 0.08 : 0.14 * pulse) : 1;
        _scaleVec.setScalar(arrowScale);
        for (let idx = 0; idx < arrowAnchors.length; idx++) {
          const anchor = arrowAnchors[idx];
          _quat.setFromUnitVectors(_upVec, anchor.dir);
          _mat4.compose(anchor.pos, _quat, _scaleVec);
          arrowInstanced.setMatrixAt(idx, _mat4);
        }
        arrowInstanced.instanceMatrix.needsUpdate = true;
        _scaleVec.set(1, 1, 1);
        prevArrowsEmphasized = arrowsSelected;
      }

      if (s.isPlaying && !s.reducedMotion && s.showFieldLines) {
        tracerPhase = (tracerPhase + dt * (0.24 + s.strength * 0.14)) % 1;
      }
      tracerInstanced.visible = s.showFieldLines && s.isPlaying && !s.reducedMotion;

      if (tracerInstanced.visible) {
        for (let i = 0; i < fieldCurves.length; i++) {
          const curve = fieldCurves[i];
          for (let j = 0; j < 2; j++) {
            const u = (tracerPhase + i * 0.09 + j * 0.5) % 1;
            curve.getPointAt(u, _vecA);
            _quat.identity();
            _mat4.compose(_vecA, _quat, _scaleVec);
            tracerInstanced.setMatrixAt(i * 2 + j, _mat4);
          }
        }
        tracerInstanced.instanceMatrix.needsUpdate = true;
      }

      _vecA.copy(probeGroup.position);
      magnetSystem.updateMatrixWorld();
      magnetSystem.worldToLocal(_vecA);
      const localB = computeLocalMagneticField3D(_vecA.x, _vecA.y, _vecA.z, s.strength);
      _vecB.set(localB.x, localB.y, localB.z);
      _vecB.applyQuaternion(magnetSystem.quaternion).normalize();
      const targetNeedleAngle = Math.atan2(-_vecB.z, _vecB.x);
      let diff = targetNeedleAngle - probeNeedleGroup.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      probeNeedleGroup.rotation.y += s.reducedMotion ? diff : diff * Math.min(1, dt * 12);

      if (s.resetCameraRequested) {
        camera.position.lerp(defaultCamPos, Math.min(1, dt * 7));
        controls.target.lerp(_vecA.set(0, 0, 0), Math.min(1, dt * 7));
        if (camera.position.distanceTo(defaultCamPos) < 0.04) {
          camera.position.copy(defaultCamPos);
          controls.target.set(0, 0, 0);
          s.resetCameraRequested = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Project selected component anchor smoothly after camera update
      if (sel && activeAnchorSpace !== 'none' && onAnchorMoveRef.current) {
        probeGroup.updateMatrixWorld();
        magnetSystem.updateMatrixWorld();
        _anchorWorld.copy(activeAnchorLocal);
        if (activeAnchorSpace === 'magnet') {
          magnetSystem.localToWorld(_anchorWorld);
        } else {
          probeGroup.localToWorld(_anchorWorld);
        }
        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const projected = projectWorldPointToViewport(
            _anchorWorld,
            camera,
            rect.width,
            rect.height
          );
          onAnchorMoveRef.current(projected, {
            width: rect.width,
            height: rect.height,
          });
        }
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onDomPointerDown);
      renderer.domElement.removeEventListener('pointermove', onDomPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onDomPointerLeave);
      renderer.domElement.removeEventListener('pointerup', onDomPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="w-full h-full min-h-[220px] rounded-xl bg-[#E5E4E2]/70 border border-[#D8D1CA] flex items-center justify-center p-8 text-center">
        <p className="text-sm text-[#302820] max-w-md">{fallbackMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden touch-none"
    />
  );
};
