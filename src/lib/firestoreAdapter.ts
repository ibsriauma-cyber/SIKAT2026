import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let firebaseConfig: any;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e: any) {
  console.error('[FirebaseAdapter] Error loading firebase-applet-config.json:', e.message);
}

const firebaseApp = firebaseConfig
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const firestoreDb = firebaseApp && firebaseConfig?.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : null;

console.log('[FirebaseAdapter] Initialized with DB:', firebaseConfig?.firestoreDatabaseId || 'None');

// In-memory cache for fast, resilient reads & fallback when quotas are reached
const tableCache: Record<string, any[]> = {};
const kvCache: Record<string, string> = {};

export async function getCollectionDocs(tableName: string): Promise<any[]> {
  if (tableCache[tableName] && tableCache[tableName].length > 0) {
    return tableCache[tableName];
  }
  if (!firestoreDb) return tableCache[tableName] || [];
  try {
    const snap = await getDocs(collection(firestoreDb, tableName));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    tableCache[tableName] = items;
    return items;
  } catch (err: any) {
    console.error(`[FirebaseAdapter] getCollectionDocs error for ${tableName}:`, err.message);
    return tableCache[tableName] || [];
  }
}

export async function getDocById(tableName: string, id: string | number): Promise<any | null> {
  const strId = String(id);
  if (tableCache[tableName]) {
    const found = tableCache[tableName].find((item: any) => String(item.id) === strId);
    if (found) return found;
  }
  if (!firestoreDb) return null;
  try {
    const snap = await getDoc(doc(firestoreDb, tableName, strId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err: any) {
    console.error(`[FirebaseAdapter] getDocById error for ${tableName}/${id}:`, err.message);
    return null;
  }
}

export async function saveDoc(tableName: string, id: string | number, data: any): Promise<void> {
  const strId = String(id);
  const cleanData = { ...data, id: isNaN(Number(id)) ? strId : Number(id) };
  
  // Update cache immediately
  if (!tableCache[tableName]) tableCache[tableName] = [];
  const idx = tableCache[tableName].findIndex((item: any) => String(item.id) === strId);
  if (idx >= 0) {
    tableCache[tableName][idx] = { ...tableCache[tableName][idx], ...cleanData };
  } else {
    tableCache[tableName].push(cleanData);
  }

  if (!firestoreDb) return;
  try {
    await setDoc(doc(firestoreDb, tableName, strId), cleanData, { merge: true });
  } catch (err: any) {
    console.error(`[FirebaseAdapter] saveDoc write failed (cached locally):`, err.message);
  }
}

export async function removeDoc(tableName: string, id: string | number): Promise<void> {
  const strId = String(id);
  if (tableCache[tableName]) {
    tableCache[tableName] = tableCache[tableName].filter((item: any) => String(item.id) !== strId);
  }
  if (!firestoreDb) return;
  try {
    await deleteDoc(doc(firestoreDb, tableName, strId));
  } catch (err: any) {
    console.error(`[FirebaseAdapter] removeDoc error for ${tableName}/${id}:`, err.message);
  }
}

// Key-Value Store Helpers
function encodeKey(k: string): string {
  return encodeURIComponent(k).replace(/\./g, '%2E').replace(/\//g, '%2F');
}

export async function getKV(key: string): Promise<string | null> {
  if (kvCache[key] !== undefined) return kvCache[key];
  if (!firestoreDb) return null;
  try {
    const docRef = doc(firestoreDb, 'key_value_store', encodeKey(key));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const val = snap.data()?.v || null;
      kvCache[key] = val;
      return val;
    }
    return null;
  } catch (err: any) {
    console.error(`[FirebaseAdapter] getKV error for ${key}:`, err.message);
    return kvCache[key] || null;
  }
}

export async function getAllKV(): Promise<Record<string, string>> {
  if (Object.keys(kvCache).length > 0) return kvCache;
  if (!firestoreDb) return kvCache;
  try {
    const snap = await getDocs(collection(firestoreDb, 'key_value_store'));
    snap.docs.forEach(d => {
      const data = d.data();
      if (data.k) kvCache[data.k] = data.v;
    });
    return kvCache;
  } catch (err: any) {
    console.error('[FirebaseAdapter] getAllKV error:', err.message);
    return kvCache;
  }
}

export async function setKV(key: string, value: string): Promise<void> {
  kvCache[key] = value;
  if (!firestoreDb) return;
  try {
    await setDoc(doc(firestoreDb, 'key_value_store', encodeKey(key)), { k: key, v: value });
  } catch (err: any) {
    console.error(`[FirebaseAdapter] setKV error for ${key}:`, err.message);
  }
}

export async function deleteKV(key?: string): Promise<void> {
  if (key) {
    delete kvCache[key];
    if (!firestoreDb) return;
    try {
      await deleteDoc(doc(firestoreDb, 'key_value_store', encodeKey(key)));
    } catch (err: any) {}
  } else {
    Object.keys(kvCache).forEach(k => delete kvCache[k]);
  }
}
