import type { LanguageCode } from '../../types/physics';

export type InteractionStage = 'idle' | 'identify' | 'explain';

export type SimulationDomainId =
  | 'bar_magnet'
  | 'projectile_motion'
  | 'optics'
  | 'electric_circuits'
  | 'sound';

export type HitRegionDescriptor =
  | {
      kind: 'circle';
      x: number;
      y: number;
      radius: number;
    }
  | {
      kind: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      angleRad?: number;
    }
  | {
      kind: 'polyline';
      points: Array<{ x: number; y: number }>;
      tolerance: number;
    }
  | {
      kind: 'svg_element';
      selector: string;
    }
  | {
      kind: 'three_object';
      userDataKey: string;
      userDataValue: string;
    }
  | {
      kind: 'canvas_custom';
      description: string;
    };

export interface ComponentHighlightStyle {
  strokeColor: string;
  glowColor: string;
  strokeWidth: number;
  emissiveHex: number;
  emissiveIntensity: number;
  scaleBoost?: number;
}

export type ComponentIconKey =
  | 'magnet'
  | 'north_pole'
  | 'south_pole'
  | 'field_lines'
  | 'arrows'
  | 'compass'
  | 'pivot'
  | 'generic';

export interface ComponentExplanationContent {
  name: string;
  definition: string;
  characteristics: string;
  functionDescription: string;
  scientificProperties: string;
  behaviour: string;
  relationshipWithOthers: string;
  realWorldExample: string;
  whyItMatters: string;
  currentStateSummary?: string;
  source: 'curated' | 'ai_enhanced';
}

export interface RegisteredSimulationComponent {
  id: string;
  simulationId: SimulationDomainId | string;
  iconKey?: ComponentIconKey;
  displayName: Record<LanguageCode, string>;
  identificationText: Record<LanguageCode, string>;
  hitRegion: HitRegionDescriptor;
  highlight: ComponentHighlightStyle;
  explanationContext: string;
  buildDefaultExplanation: (
    language: LanguageCode,
    simulationState: Record<string, unknown>
  ) => ComponentExplanationContent;
  describeCurrentState: (
    language: LanguageCode,
    simulationState: Record<string, unknown>
  ) => string;
}

export interface SimulationComponentRegistryEntry {
  simulationId: string;
  experimentName: Record<LanguageCode, string>;
  components: RegisteredSimulationComponent[];
}

export interface DynamicCanvasHitRegion {
  componentId: string;
  priority: number;
  shape:
    | { kind: 'circle'; cx: number; cy: number; radius: number }
    | {
        kind: 'rotated_rect';
        cx: number;
        cy: number;
        halfW: number;
        halfH: number;
        angleRad: number;
      }
    | { kind: 'points'; points: Array<{ x: number; y: number }>; tolerance: number }
    | { kind: 'polylines'; lines: Array<Array<{ x: number; y: number }>>; tolerance: number };
}

export interface SimulationComponentHit {
  componentId: string;
  anchorPx: { x: number; y: number };
  viewportSize: { width: number; height: number };
}
