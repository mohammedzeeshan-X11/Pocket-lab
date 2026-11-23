import type { DynamicExperimentSpec } from '../types/dynamicExperiment';
import { validateAndSanitizeDynamicExperimentSpec } from '../utils/dynamicPhysicsValidator';
import {
  deleteLocalGeneratedExperiment,
  fetchLocalGeneratedExperiments,
  saveLocalGeneratedExperiment,
} from './localAuthDb';

const GUEST_STORAGE_KEY = 'physix_ai_generated_experiments_v1';

function readGuestCache(): DynamicExperimentSpec[] {
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => validateAndSanitizeDynamicExperimentSpec(item));
  } catch {
    return [];
  }
}

function writeGuestCache(items: DynamicExperimentSpec[]): void {
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items.slice(0, 24)));
  } catch {
    // ignore storage quota errors cleanly
  }
}

export async function loadSavedDynamicExperiments(
  ownerUid?: string | null
): Promise<DynamicExperimentSpec[]> {
  const guestItems = readGuestCache();
  try {
    const idbItems = await fetchLocalGeneratedExperiments(ownerUid);
    const mergedMap = new Map<string, DynamicExperimentSpec>();
    for (const item of [...guestItems, ...idbItems]) {
      mergedMap.set(item.id, item);
    }
    return Array.from(mergedMap.values()).sort(
      (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
    );
  } catch {
    return guestItems;
  }
}

export async function saveGeneratedExperimentToLibrary(
  spec: DynamicExperimentSpec,
  ownerUid?: string | null
): Promise<DynamicExperimentSpec> {
  const safeSpec = validateAndSanitizeDynamicExperimentSpec(
    spec as unknown as Record<string, unknown>,
    {
      studentClass: spec.studentClass,
      chapterNumber: spec.chapterNumber,
      chapterTitle: spec.chapterTitle,
      conceptId: spec.conceptId,
      conceptName: spec.conceptName,
      sourceScanTopic: spec.sourceScanTopic,
      sourceImagePreviewUrl: spec.sourceImagePreviewUrl,
      ownerUid: ownerUid || spec.ownerUid || 'guest',
    }
  );
  // Keep original validated ID stable when saving
  const stableSpec: DynamicExperimentSpec = {
    ...safeSpec,
    id: spec.id,
    createdAt: spec.createdAt,
    updatedAt: Date.now(),
  };

  const guestList = readGuestCache().filter((item) => item.id !== stableSpec.id);
  writeGuestCache([stableSpec, ...guestList]);

  try {
    await saveLocalGeneratedExperiment(stableSpec, ownerUid || 'guest');
  } catch {
    // Guest cache already updated cleanly
  }
  return stableSpec;
}

export async function removeSavedDynamicExperiment(experimentId: string): Promise<void> {
  const guestList = readGuestCache().filter((item) => item.id !== experimentId);
  writeGuestCache(guestList);
  try {
    await deleteLocalGeneratedExperiment(experimentId);
  } catch {
    // ignore
  }
}
