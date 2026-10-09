import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, AdviceRequest, SiteSettings } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Requirements from SKILL.md
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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

// Connection check required by SKILL.md
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline.');
    }
  }
}

// ---------------------- Firestore Operations ----------------------

// PRODUCTS
export async function getFirestoreProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snapshot = await getDocs(collection(db, path));
    const items: Product[] = [];
    snapshot.forEach((d) => {
      items.push({ ...(d.data() as Product), id: d.id });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function setFirestoreProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ORDERS
export async function createFirestoreOrder(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getFirestoreOrders(): Promise<Order[]> {
  const path = 'orders';
  try {
    const snapshot = await getDocs(collection(db, path));
    const items: Order[] = [];
    snapshot.forEach((d) => {
      items.push({ ...(d.data() as Order), id: d.id });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateFirestoreOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreOrder(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ADVICE REQUESTS
export async function createFirestoreAdviceRequest(req: AdviceRequest): Promise<void> {
  const path = `advice_requests/${req.id}`;
  try {
    await setDoc(doc(db, 'advice_requests', req.id), req);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getFirestoreAdviceRequests(): Promise<AdviceRequest[]> {
  const path = 'advice_requests';
  try {
    const snapshot = await getDocs(collection(db, path));
    const items: AdviceRequest[] = [];
    snapshot.forEach((d) => {
      items.push({ ...(d.data() as AdviceRequest), id: d.id });
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateFirestoreAdviceRequest(requestId: string, updates: Partial<AdviceRequest>): Promise<void> {
  const path = `advice_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'advice_requests', requestId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreAdviceRequest(requestId: string): Promise<void> {
  const path = `advice_requests/${requestId}`;
  try {
    await deleteDoc(doc(db, 'advice_requests', requestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// SETTINGS
export async function getFirestoreSettings(): Promise<SiteSettings | null> {
  const path = 'settings/general';
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveFirestoreSettings(settings: SiteSettings): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// REALTIME LISTENERS with mandatory handleFirestoreError callbacks
// Note: Per SKILL.md, only attach onSnapshot listeners if auth is ready and user is authenticated for private collections.
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  if (!auth.currentUser) {
    return () => {};
  }
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Order), id: d.id });
      });
      // Sort newest first
      items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToProducts(onUpdate: (products: Product[]) => void) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Product[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as Product), id: d.id });
        });
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToAdviceRequests(onUpdate: (requests: AdviceRequest[]) => void) {
  if (!auth.currentUser) {
    return () => {};
  }
  const path = 'advice_requests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: AdviceRequest[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as AdviceRequest), id: d.id });
      });
      items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToSettings(onUpdate: (settings: SiteSettings) => void) {
  const path = 'settings/general';
  return onSnapshot(
    doc(db, 'settings', 'general'),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as SiteSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Google Auth for Admin
export async function signInAdminWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signOutAdmin() {
  return await signOut(auth);
}

export function subscribeToAdminAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
