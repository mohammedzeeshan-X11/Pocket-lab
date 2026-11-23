import * as THREE from 'three';
import type {
  DynamicCanvasHitRegion,
  RegisteredSimulationComponent,
  SimulationComponentHit,
  SimulationComponentRegistryEntry,
} from './types';
import { MAGNET_SIMULATION_COMPONENTS } from './magnetComponents';
import { FUTURE_SIMULATION_ENTRIES } from './futureSimulationComponents';
import { MULTI_DOMAIN_SIMULATION_ENTRIES } from './multiDomainComponents';

const REGISTRY = new Map<string, SimulationComponentRegistryEntry>();

export function registerSimulationComponents(
  entry: SimulationComponentRegistryEntry
): void {
  REGISTRY.set(entry.simulationId, entry);
}

export function getSimulationEntry(
  simulationId: string
): SimulationComponentRegistryEntry | null {
  return REGISTRY.get(simulationId) || null;
}

export function getSimulationComponents(
  simulationId: string
): RegisteredSimulationComponent[] {
  return REGISTRY.get(simulationId)?.components || [];
}

export function getRegisteredComponent(
  simulationId: string,
  componentId: string | null | undefined
): RegisteredSimulationComponent | null {
  if (!componentId) return null;
  const raw = componentId.trim().toLowerCase();
  const aliasMap: Record<string, string> = {
    bar_magnet: 'magnet_body',
    connection_wire: 'wires',
    wire: 'wires',
    compass: 'compass_needle',
  };
  const normalized = aliasMap[raw] || raw;
  const list = getSimulationComponents(simulationId);
  return list.find((c) => c.id === normalized) || null;
}

// Seed built-in simulations on module load
registerSimulationComponents({
  simulationId: 'bar_magnet',
  experimentName: {
    en: 'Magnetic Field Around a Bar Magnet',
    kn: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ',
    hi: 'छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र',
  },
  components: MAGNET_SIMULATION_COMPONENTS,
});

for (const entry of FUTURE_SIMULATION_ENTRIES) {
  registerSimulationComponents(entry);
}

for (const entry of MULTI_DOMAIN_SIMULATION_ENTRIES) {
  registerSimulationComponents(entry);
}

// ---------------------------------------------------------------------------
// Reusable Canvas / Geometric Hit-Testing Engine
// ---------------------------------------------------------------------------

function distancePointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq <= 1e-6) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function hitTestGeometricRegions(
  point: { x: number; y: number },
  regions: DynamicCanvasHitRegion[]
): { componentId: string; hitPoint: { x: number; y: number } } | null {
  const sorted = [...regions].sort((a, b) => a.priority - b.priority);

  for (const region of sorted) {
    const shape = region.shape;
    if (shape.kind === 'circle') {
      if (Math.hypot(point.x - shape.cx, point.y - shape.cy) <= shape.radius) {
        return {
          componentId: region.componentId,
          hitPoint: { x: shape.cx, y: shape.cy },
        };
      }
    } else if (shape.kind === 'rotated_rect') {
      const dx = point.x - shape.cx;
      const dy = point.y - shape.cy;
      const cos = Math.cos(-shape.angleRad);
      const sin = Math.sin(-shape.angleRad);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      if (Math.abs(lx) <= shape.halfW && Math.abs(ly) <= shape.halfH) {
        return {
          componentId: region.componentId,
          hitPoint: { x: shape.cx, y: shape.cy },
        };
      }
    } else if (shape.kind === 'points') {
      let bestDist = Infinity;
      let bestPt: { x: number; y: number } | null = null;
      for (const p of shape.points) {
        const d = Math.hypot(point.x - p.x, point.y - p.y);
        if (d <= shape.tolerance && d < bestDist) {
          bestDist = d;
          bestPt = p;
        }
      }
      if (bestPt) {
        return { componentId: region.componentId, hitPoint: bestPt };
      }
    } else if (shape.kind === 'polylines') {
      let bestDist = Infinity;
      let bestPt: { x: number; y: number } | null = null;
      for (const line of shape.lines) {
        for (let i = 0; i < line.length - 1; i++) {
          const a = line[i];
          const b = line[i + 1];
          const d = distancePointToSegment(point.x, point.y, a.x, a.y, b.x, b.y);
          if (d <= shape.tolerance && d < bestDist) {
            bestDist = d;
            bestPt = { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
          }
        }
      }
      if (bestPt) {
        return { componentId: region.componentId, hitPoint: bestPt };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Reusable Three.js Raycast Picking + Screen Projection Helper
// ---------------------------------------------------------------------------

const _projVec = new THREE.Vector3();

export function projectWorldPointToViewport(
  worldPos: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  _projVec.copy(worldPos).project(camera);
  return {
    x: ((_projVec.x + 1) * 0.5) * width,
    y: ((-_projVec.y + 1) * 0.5) * height,
  };
}

export function pickThreeObjectComponent(
  raycaster: THREE.Raycaster,
  camera: THREE.Camera,
  clientX: number,
  clientY: number,
  domElement: HTMLElement,
  selectableObjects: THREE.Object3D[]
): SimulationComponentHit | null {
  const rect = domElement.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
  const hits = raycaster.intersectObjects(selectableObjects, false);

  for (const hit of hits) {
    const rawId =
      hit.object?.userData?.componentId || hit.object?.userData?.objectId;
    if (typeof rawId === 'string' && rawId.trim().length > 0) {
      const anchorPx = projectWorldPointToViewport(
        hit.point,
        camera,
        rect.width,
        rect.height
      );
      return {
        componentId: rawId,
        anchorPx,
        viewportSize: { width: rect.width, height: rect.height },
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Reusable SVG Element Hit-Testing Helper (for SVG-based simulations)
// ---------------------------------------------------------------------------

export function resolveSvgComponentHit(
  target: EventTarget | null,
  svgRoot: SVGSVGElement | null
): SimulationComponentHit | null {
  if (!(target instanceof Element) || !svgRoot) return null;
  const matched = target.closest('[data-component-id]');
  if (!matched || !svgRoot.contains(matched)) return null;
  const componentId = matched.getAttribute('data-component-id');
  if (!componentId) return null;

  const svgRect = svgRoot.getBoundingClientRect();
  const elRect = matched.getBoundingClientRect();
  return {
    componentId,
    anchorPx: {
      x: elRect.left - svgRect.left + elRect.width / 2,
      y: elRect.top - svgRect.top + elRect.height / 2,
    },
    viewportSize: { width: svgRect.width, height: svgRect.height },
  };
}
