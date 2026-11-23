export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface FieldSample2D {
  bx: number;
  by: number;
  magnitude: number;
  angleRad: number;
}

/**
 * Computes the magnetic field vector at point (px, py) relative to a magnetic dipole
 * centered at (0, 0) using the dipole approximation:
 *   B(r) = (μ0 / 4πr³) [3(m · r̂)r̂ − m]
 *
 * Handles the r -> 0 singularity safely by clamping effective distance inside the magnet core
 * and smoothly aligning the interior core field along +m (from South to North).
 */
export function computeMagneticField2D(
  px: number,
  py: number,
  magnetAngleRad: number,
  strength: number,
  coreRadius = 28
): FieldSample2D {
  const mxHat = Math.cos(magnetAngleRad);
  const myHat = Math.sin(magnetAngleRad);

  // μ0 / (4π) scaled to millitesla (mT) for laboratory-scale pixel distances
  const mu0Over4PiScaled = 160000;
  const m = strength * mu0Over4PiScaled;
  const mx = m * mxHat;
  const my = m * myHat;

  const rSq = px * px + py * py;
  const r = Math.sqrt(rSq);

  if (r < 1e-4) {
    // At the exact dipole center, interior flux points from S to N along +m
    const rSafe = coreRadius;
    const invR3 = 1 / (rSafe * rSafe * rSafe);
    const bx = 2 * mx * invR3;
    const by = 2 * my * invR3;
    return {
      bx,
      by,
      magnitude: Math.hypot(bx, by),
      angleRad: magnetAngleRad,
    };
  }

  const rxHat = px / r;
  const ryHat = py / r;
  const rEff = Math.max(r, coreRadius);
  const invR3 = 1 / (rEff * rEff * rEff);

  const mDotR = mx * rxHat + my * ryHat;
  const bxDipole = invR3 * (3 * mDotR * rxHat - mx);
  const byDipole = invR3 * (3 * mDotR * ryHat - my);

  // Smoothly blend interior region (r < coreRadius) toward +m so compass never flips erratically on the magnet body
  if (r < coreRadius) {
    const t = r / coreRadius;
    const bxCore = invR3 * (2 * mx);
    const byCore = invR3 * (2 * my);
    const bx = bxCore * (1 - t) + bxDipole * t;
    const by = byCore * (1 - t) + byDipole * t;
    return {
      bx,
      by,
      magnitude: Math.hypot(bx, by),
      angleRad: Math.atan2(by, bx),
    };
  }

  return {
    bx: bxDipole,
    by: byDipole,
    magnitude: Math.hypot(bxDipole, byDipole),
    angleRad: Math.atan2(byDipole, bxDipole),
  };
}

/**
 * Traces a smooth dipole magnetic field streamline using 4th-order Runge-Kutta (RK4) integration.
 */
export function traceFieldLine2D(
  startX: number,
  startY: number,
  direction: 1 | -1,
  magnetAngleRad: number,
  stopRadius = 30,
  maxSteps = 220,
  stepSize = 6,
  boundsRadius = 620
): Vec2[] {
  const points: Vec2[] = [{ x: startX, y: startY }];
  let x = startX;
  let y = startY;

  const unitDir = (px: number, py: number): Vec2 | null => {
    const sample = computeMagneticField2D(px, py, magnetAngleRad, 1, 14);
    if (sample.magnitude < 1e-8) return null;
    return {
      x: (sample.bx / sample.magnitude) * direction,
      y: (sample.by / sample.magnitude) * direction,
    };
  };

  for (let i = 0; i < maxSteps; i++) {
    const k1 = unitDir(x, y);
    if (!k1) break;
    const k2 = unitDir(x + 0.5 * stepSize * k1.x, y + 0.5 * stepSize * k1.y);
    if (!k2) break;
    const k3 = unitDir(x + 0.5 * stepSize * k2.x, y + 0.5 * stepSize * k2.y);
    if (!k3) break;
    const k4 = unitDir(x + stepSize * k3.x, y + stepSize * k3.y);
    if (!k4) break;

    const nextX = x + (stepSize / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x);
    const nextY = y + (stepSize / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y);

    points.push({ x: nextX, y: nextY });
    x = nextX;
    y = nextY;

    const r = Math.hypot(x, y);
    if (r < stopRadius || r > boundsRadius) break;
  }

  return points;
}

/**
 * Computes a 3D dipole field in magnet-local space where the North pole is along +X and South pole along -X.
 */
export function computeLocalMagneticField3D(
  px: number,
  py: number,
  pz: number,
  strength: number,
  halfPoleDistance = 1.35,
  softening = 0.35
): Vec3 {
  const dxN = px - halfPoleDistance;
  const r2N = dxN * dxN + py * py + pz * pz + softening * softening;
  const invR3N = 1 / (r2N * Math.sqrt(r2N));

  const dxS = px + halfPoleDistance;
  const r2S = dxS * dxS + py * py + pz * pz + softening * softening;
  const invR3S = 1 / (r2S * Math.sqrt(r2S));

  const scale = strength * 1.5;
  return {
    x: scale * (dxN * invR3N - dxS * invR3S),
    y: scale * (py * invR3N - py * invR3S),
    z: scale * (pz * invR3N - pz * invR3S),
  };
}

/**
 * Traces a 3D magnetic field streamline in magnet-local space using RK4 from North pole to South pole.
 */
export function traceLocalFieldLine3D(
  start: Vec3,
  halfPoleDistance = 1.35,
  stepSize = 0.14,
  maxSteps = 150
): Vec3[] {
  const pts: Vec3[] = [{ ...start }];
  let x = start.x;
  let y = start.y;
  let z = start.z;

  const dirAt = (ax: number, ay: number, az: number): Vec3 | null => {
    const b = computeLocalMagneticField3D(ax, ay, az, 1, halfPoleDistance, 0.18);
    const mag = Math.hypot(b.x, b.y, b.z);
    if (mag < 1e-6) return null;
    return { x: b.x / mag, y: b.y / mag, z: b.z / mag };
  };

  for (let i = 0; i < maxSteps; i++) {
    const k1 = dirAt(x, y, z);
    if (!k1) break;
    const k2 = dirAt(x + 0.5 * stepSize * k1.x, y + 0.5 * stepSize * k1.y, z + 0.5 * stepSize * k1.z);
    if (!k2) break;
    const k3 = dirAt(x + 0.5 * stepSize * k2.x, y + 0.5 * stepSize * k2.y, z + 0.5 * stepSize * k2.z);
    if (!k3) break;
    const k4 = dirAt(x + stepSize * k3.x, y + stepSize * k3.y, z + stepSize * k3.z);
    if (!k4) break;

    x += (stepSize / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x);
    y += (stepSize / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y);
    z += (stepSize / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z);

    pts.push({ x, y, z });

    const distSouth = Math.hypot(x + halfPoleDistance, y, z);
    if (distSouth < 0.28) break;
    if (Math.hypot(x, y, z) > 8.5) break;
  }

  return pts;
}
