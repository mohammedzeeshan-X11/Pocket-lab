import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface PhysicsAmbientBackdropProps {
  reducedMotion?: boolean;
}

// Pre-allocated math helpers for zero-GC animation loop
const _dummyObj = new THREE.Object3D();
const _baseColor = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const PhysicsAmbientBackdrop: React.FC<PhysicsAmbientBackdropProps> = ({
  reducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFallback, setWebglFallback] = useState(false);
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRenderTarget: THREE.WebGLRenderTarget | null = null;
    let frameId = 0;
    let disposed = false;

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
      disposableGeometries.push(geo);
      return geo;
    };
    const trackMat = <T extends THREE.Material>(mat: T): T => {
      disposableMaterials.push(mat);
      return mat;
    };

    try {
      const isSoftwareGl = detectSoftwareWebGL();
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
      camera.position.set(0, 0, 11.5);

      // Studio environment reflections for metallic/glass physics props
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      roomEnv.dispose();
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();
      pmremGenerator = null;

      // Luminous warm peach & studio alabaster lighting for claymorphism 3D props
      const hemiLight = new THREE.HemisphereLight(0xfff9f2, 0xfcead6, 1.15);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.25);
      keyLight.position.set(6, 7, 8);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xd9f2e8, 0.8);
      rimLight.position.set(-7, -3, 5);
      scene.add(rimLight);

      // Matte tactile 3D Claymorphism materials (orange, teal, periwinkle, warm porcelain)
      const mochaBronzeMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xf49a3c,
          roughness: 0.56,
          metalness: 0.06,
        })
      );
      const copperMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x49ad8b,
          roughness: 0.54,
          metalness: 0.06,
        })
      );
      const platinumMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xfff5ea,
          roughness: 0.48,
          metalness: 0.04,
        })
      );
      const lavenderOrbMat = trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0x6e85e8,
          roughness: 0.36,
          metalness: 0.04,
          clearcoat: 0.45,
          clearcoatRoughness: 0.32,
        })
      );
      const prismGlassMat = trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0xdff5ec,
          roughness: 0.24,
          metalness: 0.04,
          clearcoat: 0.85,
          clearcoatRoughness: 0.16,
          transparent: true,
          opacity: isSoftwareGl ? 0.56 : 0.68,
        })
      );
      const faintBeamMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xf7b977,
          transparent: true,
          opacity: 0.28,
        })
      );
      const waveWireMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xe6c8aa,
          wireframe: true,
          transparent: true,
          opacity: 0.22,
        })
      );

      // Root group for smooth mouse + scroll parallax
      const parallaxRoot = new THREE.Group();
      scene.add(parallaxRoot);

      // ================================================================
      // 1. Upper-Right Composite 3D Bohr Atom Observatory (9 parts)
      // ================================================================
      const atomGroup = new THREE.Group();
      atomGroup.position.set(3.65, 2.0, -1.75);
      atomGroup.scale.setScalar(1.18);
      parallaxRoot.add(atomGroup);

      const nucleusGroup = new THREE.Group();
      const nucleonGeo = trackGeo(new THREE.SphereGeometry(0.16, 18, 18));
      const nucleonOffsets: Array<[number, number, number, THREE.Material]> = [
        [0, 0, 0, mochaBronzeMat],
        [0.14, 0.08, 0.06, platinumMat],
        [-0.13, -0.07, 0.08, copperMat],
        [0.06, -0.13, -0.09, lavenderOrbMat],
        [-0.08, 0.12, -0.08, mochaBronzeMat],
      ];
      for (const [nx, ny, nz, mat] of nucleonOffsets) {
        const nMesh = new THREE.Mesh(nucleonGeo, mat);
        nMesh.position.set(nx, ny, nz);
        nucleusGroup.add(nMesh);
      }
      atomGroup.add(nucleusGroup);

      const orbitRingGeo = trackGeo(new THREE.TorusGeometry(1.38, 0.022, 12, 72));
      const electronGeo = trackGeo(new THREE.SphereGeometry(0.085, 16, 16));
      const electronPivots: Array<{ pivot: THREE.Group; speed: number }> = [];

      const orbitConfigs: Array<{
        rx: number;
        ry: number;
        rz: number;
        ringMat: THREE.Material;
        elecMat: THREE.Material;
        speed: number;
        startAngle: number;
      }> = [
        { rx: 0.95, ry: 0.25, rz: 0.3, ringMat: platinumMat, elecMat: mochaBronzeMat, speed: 0.58, startAngle: 0.4 },
        { rx: -0.82, ry: 0.65, rz: -0.45, ringMat: lavenderOrbMat, elecMat: copperMat, speed: -0.46, startAngle: 2.1 },
        { rx: 0.35, ry: -0.95, rz: 0.72, ringMat: copperMat, elecMat: lavenderOrbMat, speed: 0.38, startAngle: 4.3 },
      ];

      for (const cfg of orbitConfigs) {
        const orbitPlane = new THREE.Group();
        orbitPlane.rotation.set(cfg.rx, cfg.ry, cfg.rz);

        const ring = new THREE.Mesh(orbitRingGeo, cfg.ringMat);
        orbitPlane.add(ring);

        const pivot = new THREE.Group();
        pivot.rotation.z = cfg.startAngle;
        const electron = new THREE.Mesh(electronGeo, cfg.elecMat);
        electron.position.set(1.38, 0, 0);
        pivot.add(electron);

        orbitPlane.add(pivot);
        atomGroup.add(orbitPlane);
        electronPivots.push({ pivot, speed: cfg.speed });
      }

      // ================================================================
      // 2. Mid-Left Composite 3D Optical Glass Prism Assembly (7 parts)
      // ================================================================
      const prismGroup = new THREE.Group();
      prismGroup.position.set(-3.75, 0.2, -1.85);
      prismGroup.scale.setScalar(1.15);
      prismGroup.rotation.set(0.24, 0.52, -0.18);
      parallaxRoot.add(prismGroup);

      const prismBodyGeo = trackGeo(new THREE.CylinderGeometry(0.88, 0.88, 1.38, 3, 1));
      const prismBody = new THREE.Mesh(prismBodyGeo, prismGlassMat);
      prismGroup.add(prismBody);

      const prismCapGeo = trackGeo(new THREE.CylinderGeometry(0.92, 0.92, 0.08, 3, 1));
      const prismTopCap = new THREE.Mesh(prismCapGeo, platinumMat);
      prismTopCap.position.y = 0.71;
      prismGroup.add(prismTopCap);

      const prismBottomCap = new THREE.Mesh(prismCapGeo, mochaBronzeMat);
      prismBottomCap.position.y = -0.71;
      prismGroup.add(prismBottomCap);

      const caliperRingGeo = trackGeo(new THREE.TorusGeometry(1.32, 0.02, 10, 64));
      const caliperRing = new THREE.Mesh(caliperRingGeo, copperMat);
      caliperRing.rotation.x = Math.PI / 2.4;
      prismGroup.add(caliperRing);

      const beamGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.032, 2.6, 8));
      const lightBeam = new THREE.Mesh(beamGeo, faintBeamMat);
      lightBeam.position.set(1.45, -0.05, 0);
      lightBeam.rotation.z = Math.PI / 2.2;
      prismGroup.add(lightBeam);

      const beamUpper = new THREE.Mesh(beamGeo, faintBeamMat);
      beamUpper.position.set(1.42, 0.24, 0.08);
      beamUpper.rotation.z = Math.PI / 2.02;
      prismGroup.add(beamUpper);

      const beamLower = new THREE.Mesh(beamGeo, faintBeamMat);
      beamLower.position.set(1.4, -0.32, -0.06);
      beamLower.rotation.z = Math.PI / 2.42;
      prismGroup.add(beamLower);

      // ================================================================
      // 3. Lower-Right Composite 3D Gimbaled Gyroscope & Compass (4 parts)
      // ================================================================
      const gyroGroup = new THREE.Group();
      gyroGroup.position.set(3.4, -2.25, -2.05);
      gyroGroup.scale.setScalar(1.12);
      parallaxRoot.add(gyroGroup);

      const gyroOuterRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(1.05, 0.032, 12, 56)),
        mochaBronzeMat
      );
      gyroGroup.add(gyroOuterRing);

      const gyroInnerRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.76, 0.028, 12, 48)),
        platinumMat
      );
      gyroInnerRing.rotation.x = Math.PI / 3;
      gyroGroup.add(gyroInnerRing);

      const gyroCore = new THREE.Mesh(
        trackGeo(new THREE.OctahedronGeometry(0.32, 0)),
        lavenderOrbMat
      );
      gyroGroup.add(gyroCore);

      // ================================================================
      // 4. Center-Spanning Flowing Harmonic Wave & Soft Orbital Ring
      // ================================================================
      const centerArcMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xf4b679,
          roughness: 0.45,
          metalness: 0.08,
          transparent: true,
          opacity: 0.34,
        })
      );
      const centerOrbitArc = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(3.45, 0.018, 10, 96)),
        centerArcMat
      );
      centerOrbitArc.position.set(0, 0.15, -3.3);
      centerOrbitArc.rotation.set(1.12, 0.32, -0.25);
      parallaxRoot.add(centerOrbitArc);

      const waveGeo = trackGeo(new THREE.PlaneGeometry(20, 4.4, 56, 10));
      const waveMesh = new THREE.Mesh(waveGeo, waveWireMat);
      waveMesh.position.set(0, -1.25, -3.7);
      waveMesh.rotation.x = -Math.PI / 2.55;
      parallaxRoot.add(waveMesh);

      const wavePosAttr = waveGeo.attributes.position as THREE.BufferAttribute;
      const baseWaveCount = wavePosAttr.count;
      const baseWaveX = new Float32Array(baseWaveCount);
      const baseWaveY = new Float32Array(baseWaveCount);
      for (let i = 0; i < baseWaveCount; i++) {
        baseWaveX[i] = wavePosAttr.getX(i);
        baseWaveY[i] = wavePosAttr.getY(i);
      }

      // ================================================================
      // 5. Instanced Floating Physics Motes (30 gentle spheres across field)
      // ================================================================
      const moteCount = 30;
      const moteGeo = trackGeo(new THREE.SphereGeometry(0.06, 10, 10));
      const moteMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.32,
          metalness: 0.25,
          transparent: true,
          opacity: 0.72,
        })
      );
      const moteInstanced = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
      moteInstanced.frustumCulled = false;

      const moteSeeds: Array<{
        x: number;
        y: number;
        z: number;
        speed: number;
        phase: number;
        scale: number;
      }> = [];
      const paletteColors = [0xf49a3c, 0x49ad8b, 0x6e85e8, 0xf7c592];

      for (let i = 0; i < moteCount; i++) {
        const x = (((i * 2.13) % 12.6) - 6.3);
        const y = ((i * 1.93) % 7.2) - 3.6;
        const z = -1.6 - ((i * 0.71) % 3.2);
        const scale = 0.7 + ((i * 0.29) % 0.8);
        moteSeeds.push({
          x,
          y,
          z,
          speed: 0.35 + ((i * 0.17) % 0.55),
          phase: i * 1.1,
          scale,
        });
        _dummyObj.position.set(x, y, z);
        _dummyObj.scale.setScalar(scale);
        _dummyObj.updateMatrix();
        moteInstanced.setMatrixAt(i, _dummyObj.matrix);
        _baseColor.setHex(paletteColors[i % paletteColors.length]);
        moteInstanced.setColorAt(i, _baseColor);
      }
      moteInstanced.instanceMatrix.needsUpdate = true;
      if (moteInstanced.instanceColor) moteInstanced.instanceColor.needsUpdate = true;
      moteInstanced.computeBoundingSphere();
      parallaxRoot.add(moteInstanced);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      // Pointer & scroll state for gentle interactive parallax
      let targetPointerX = 0;
      let targetPointerY = 0;
      let currentPointerX = 0;
      let currentPointerY = 0;
      let targetScrollRatio = 0;
      let currentScrollRatio = 0;

      const handlePointerMove = (e: PointerEvent) => {
        if (reducedMotionRef.current) return;
        const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
        const ny = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
        targetPointerX = THREE.MathUtils.clamp(nx, -1, 1);
        targetPointerY = THREE.MathUtils.clamp(ny, -1, 1);
      };

      const handleScroll = () => {
        if (reducedMotionRef.current) return;
        const docHeight = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        );
        targetScrollRatio = THREE.MathUtils.clamp(window.scrollY / docHeight, 0, 1);
      };

      const updateResponsiveFraming = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));

        // Tuck instruments closer inward on narrow/mobile viewports so they stay visible without cluttering
        const compactFactor = w < 768 ? 0.58 : w < 1120 ? 0.8 : 1;
        atomGroup.position.x = 3.65 * compactFactor;
        prismGroup.position.x = -3.75 * compactFactor;
        gyroGroup.position.x = 3.4 * compactFactor;
      };

      updateResponsiveFraming();
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', updateResponsiveFraming);

      const clock = new THREE.Clock();
      let elapsedAccum = 0;

      const stepScene = (delta: number, elapsed: number) => {
        // Update electrons around Bohr atom
        for (const ep of electronPivots) {
          ep.pivot.rotation.z += delta * ep.speed;
        }
        atomGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.22;
        atomGroup.position.y = 2.15 + Math.sin(elapsed * 0.55) * 0.14;

        // Gentle prism rotation & refracted beam tilt
        prismGroup.rotation.y += delta * 0.22;
        prismGroup.rotation.x = 0.24 + Math.sin(elapsed * 0.4) * 0.08;
        prismGroup.position.y = 0.2 + Math.cos(elapsed * 0.48) * 0.14;
        caliperRing.rotation.z -= delta * 0.18;

        // Subtle center orbital arc & gyroscope precession
        centerOrbitArc.rotation.z += delta * 0.08;
        gyroOuterRing.rotation.y += delta * 0.28;
        gyroInnerRing.rotation.z += delta * 0.42;
        gyroCore.rotation.x += delta * 0.5;
        gyroCore.rotation.y += delta * 0.35;

        // Standing wave deformation (zero-GC direct buffer mutation)
        for (let i = 0; i < baseWaveCount; i++) {
          const bx = baseWaveX[i];
          const by = baseWaveY[i];
          const zWave =
            Math.sin(bx * 0.55 + elapsed * 1.15) * 0.24 +
            Math.cos(by * 0.9 - elapsed * 0.85) * 0.1;
          wavePosAttr.setZ(i, zWave);
        }
        wavePosAttr.needsUpdate = true;

        // Instanced floating photon dust
        for (let i = 0; i < moteCount; i++) {
          const seed = moteSeeds[i];
          const dy = Math.sin(elapsed * seed.speed + seed.phase) * 0.22;
          const dx = Math.cos(elapsed * seed.speed * 0.7 + seed.phase) * 0.14;
          _dummyObj.position.set(seed.x + dx, seed.y + dy, seed.z);
          _dummyObj.scale.setScalar(seed.scale);
          _dummyObj.updateMatrix();
          moteInstanced.setMatrixAt(i, _dummyObj.matrix);
        }
        moteInstanced.instanceMatrix.needsUpdate = true;

        // Smooth damped pointer & scroll parallax
        currentPointerX = THREE.MathUtils.damp(currentPointerX, targetPointerX, 4.5, delta);
        currentPointerY = THREE.MathUtils.damp(currentPointerY, targetPointerY, 4.5, delta);
        currentScrollRatio = THREE.MathUtils.damp(currentScrollRatio, targetScrollRatio, 4.0, delta);

        parallaxRoot.position.x = -currentPointerX * 0.32;
        parallaxRoot.position.y = currentPointerY * 0.22 + currentScrollRatio * 0.65;
        parallaxRoot.rotation.y = currentPointerX * 0.045;
      };

      const afterDraw = (cb: () => void) => {
        if (!renderer || disposed) return;
        try {
          const gl = renderer.getContext() as WebGL2RenderingContext;
          if (typeof gl.fenceSync === 'function') {
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
            return;
          }
        } catch {
          // Fallback pacing if sync fence unsupported
        }
        frameId = window.setTimeout(cb, 90);
      };

      // Render initial serene pose immediately
      stepScene(0.016, 0.8);
      renderer.render(scene, camera);

      const tick = () => {
        if (disposed || !renderer) return;
        if (document.hidden || reducedMotionRef.current) {
          clock.getDelta();
          if (!reducedMotionRef.current) {
            frameId = window.setTimeout(tick, 350);
          }
          return;
        }
        const delta = Math.min(clock.getDelta(), 0.05);
        elapsedAccum += delta;
        stepScene(delta, elapsedAccum);
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      if (!reducedMotionRef.current) {
        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = window.requestAnimationFrame(tick);
        }
      }

      const handleVisibilityChange = () => {
        if (!document.hidden && !reducedMotionRef.current && !disposed) {
          clock.getDelta();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateResponsiveFraming);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        for (const geo of disposableGeometries) geo.dispose();
        for (const mat of disposableMaterials) mat.dispose();
        envRenderTarget?.dispose();
        if (renderer) {
          renderer.domElement.remove();
          renderer.dispose();
        }
      };
    } catch {
      setWebglFallback(true);
      return undefined;
    }
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      data-testid="physics-ambient-backdrop"
      className="fixed inset-0 top-16 lg:left-64 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Luminous Warm Peach & Mint Studio Clay Gradient Washes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 88% 22%, rgba(252, 224, 193, 0.72) 0%, rgba(252, 224, 193, 0) 48%)',
            'radial-gradient(circle at 12% 82%, rgba(213, 243, 231, 0.52) 0%, rgba(213, 243, 231, 0) 45%)',
            'radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 52%)',
          ].join(', '),
        }}
      />

      {/* Dedicated Three.js WebGL Canvas Mount */}
      {!webglFallback && (
        <div
          ref={mountRef}
          className="absolute inset-0 opacity-85"
        />
      )}

      {/* Subtle SVG Atmospheric Physics Vector Fallback if WebGL unavailable */}
      {webglFallback && (
        <svg
          className="absolute inset-0 w-full h-full opacity-35"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <g transform="translate(1010, 150)">
            <circle cx="0" cy="0" r="14" fill="#F49A3C" opacity="0.6" />
            <ellipse
              cx="0"
              cy="0"
              rx="105"
              ry="38"
              transform="rotate(-24)"
              stroke="#F49A3C"
              strokeWidth="1.6"
              opacity="0.5"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="105"
              ry="38"
              transform="rotate(34)"
              stroke="#49AD8B"
              strokeWidth="1.6"
              opacity="0.48"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="105"
              ry="38"
              transform="rotate(86)"
              stroke="#6E85E8"
              strokeWidth="1.6"
              opacity="0.55"
            />
          </g>
          <path
            d="M0 710 Q 150 670 300 710 T 600 710 T 900 710 T 1200 710"
            stroke="#F49A3C"
            strokeWidth="1.5"
            opacity="0.28"
          />
          <path
            d="M0 732 Q 150 765 300 732 T 600 732 T 900 732 T 1200 732"
            stroke="#49AD8B"
            strokeWidth="1.3"
            opacity="0.24"
          />
        </svg>
      )}
    </div>
  );
};
