import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function hasValidFirebaseConfig(): boolean {
  const cfg = firebaseConfig as Record<string, unknown>;
  if (!cfg || typeof cfg !== 'object') return false;
  const projectId = String(cfg.projectId || '').trim();
  const apiKey = String(cfg.apiKey || '').trim();
  const appId = String(cfg.appId || '').trim();
  const dbId = String(cfg.firestoreDatabaseId || '').trim();
  if (!projectId || projectId === 'remixed-project-id') return false;
  if (!apiKey || !appId || !dbId) return false;
  return true;
}

export const isFirebaseConfigured = hasValidFirebaseConfig();
export const firebaseProjectId = String(
  (firebaseConfig as Record<string, unknown>).projectId || ''
);
export const firestoreDatabaseId = String(
  (firebaseConfig as Record<string, unknown>).firestoreDatabaseId || ''
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = dbInstance;

export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  offline: boolean;
  message?: string;
}> {
  if (!dbInstance || !isFirebaseConfigured) {
    return {
      connected: false,
      offline: false,
      message: 'Firebase configuration is missing or incomplete.',
    };
  }
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return { connected: true, offline: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.', msg);
      return {
        connected: false,
        offline: true,
        message: 'Unable to reach Firestore (the client is offline). Check Firebase configuration.',
      };
    }
    // Permission denied on /test/connection simply confirms the server responded
    return { connected: true, offline: false };
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid,
      email: authInstance?.currentUser?.email,
      emailVerified: authInstance?.currentUser?.emailVerified,
      isAnonymous: authInstance?.currentUser?.isAnonymous,
      tenantId: authInstance?.currentUser?.tenantId,
      providerInfo:
        authInstance?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
