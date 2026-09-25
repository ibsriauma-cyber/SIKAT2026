import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from './firebase';

// In-memory cache for client-side queries to maximize performance & reduce Firestore reads
const cache: Record<string, any[]> = {};
let kvCache: Record<string, string> | null = null;

function encodeKey(k: string): string {
  return encodeURIComponent(k).replace(/\./g, '%2E').replace(/\//g, '%2F');
}

export async function clientLogin(username: string, password: string): Promise<any> {
  try {
    const users = await clientGetCollection('users');
    const search = String(username || '').trim().toLowerCase();
    const user = users.find((u: any) =>
      (u.username && String(u.username).toLowerCase() === search) ||
      (u.nuptk && String(u.nuptk).toLowerCase() === search) ||
      (u.nip && String(u.nip).toLowerCase() === search) ||
      (String(u.id) === search)
    );

    if (user) {
      let isPasswordCorrect = false;
      try {
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
          isPasswordCorrect = bcrypt.compareSync(password, user.password);
        } else {
          isPasswordCorrect = (user.password === password);
        }
      } catch (e) {
        isPasswordCorrect = (user.password === password);
      }

      if (isPasswordCorrect) {
        return { status: 'success', user };
      }
    }
    return { status: 'error', message: 'Username / NIPTK atau password salah' };
  } catch (err: any) {
    console.error('[clientFirestore] Login error:', err);
    return { status: 'error', message: err.message || 'Terjadi kesalahan pada login' };
  }
}

export async function clientSync(): Promise<any> {
  const [users, students, classes, subjects] = await Promise.all([
    clientGetCollection('users'),
    clientGetCollection('students'),
    clientGetCollection('classes'),
    clientGetCollection('subjects')
  ]);
  return { users, students, classes, subjects };
}

export async function clientGetCollection(tableName: string, forceRefresh = false): Promise<any[]> {
  if (!forceRefresh && cache[tableName] && cache[tableName].length > 0) {
    return cache[tableName];
  }
  try {
    const snap = await getDocs(collection(db, tableName));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cache[tableName] = items;
    return items;
  } catch (err: any) {
    console.error(`[clientFirestore] getCollection error for ${tableName}:`, err);
    return cache[tableName] || [];
  }
}

export async function clientSaveDoc(tableName: string, id: string | number, data: any): Promise<any> {
  const strId = String(id);
  const cleanData = { ...data, id: isNaN(Number(id)) ? strId : Number(id) };

  if (!cache[tableName]) cache[tableName] = [];
  const idx = cache[tableName].findIndex((item: any) => String(item.id) === strId);
  if (idx >= 0) {
    cache[tableName][idx] = { ...cache[tableName][idx], ...cleanData };
  } else {
    cache[tableName].push(cleanData);
  }

  try {
    await setDoc(doc(db, tableName, strId), cleanData, { merge: true });
    return { insertId: id, id };
  } catch (err: any) {
    console.warn(`[clientFirestore] SaveDoc to Firestore delayed or failed:`, err.message);
    return { insertId: id, id };
  }
}

export async function clientDeleteDoc(tableName: string, id: string | number): Promise<any> {
  const strId = String(id);
  if (cache[tableName]) {
    cache[tableName] = cache[tableName].filter((item: any) => String(item.id) !== strId);
  }
  try {
    await deleteDoc(doc(db, tableName, strId));
    return { affectedRows: 1 };
  } catch (err: any) {
    console.warn(`[clientFirestore] DeleteDoc from Firestore error:`, err.message);
    return { affectedRows: 1 };
  }
}

export async function clientGetKV(key?: string): Promise<any> {
  if (key) {
    if (kvCache && kvCache[key] !== undefined) {
      return { value: kvCache[key] };
    }
    try {
      const snap = await getDoc(doc(db, 'key_value_store', encodeKey(key)));
      const val = snap.exists() ? snap.data()?.v || null : null;
      if (!kvCache) kvCache = {};
      kvCache[key] = val;
      return { value: val };
    } catch (err) {
      return { value: kvCache ? kvCache[key] || null : null };
    }
  }

  if (kvCache && Object.keys(kvCache).length > 0) {
    return kvCache;
  }
  try {
    const snap = await getDocs(collection(db, 'key_value_store'));
    const all: Record<string, string> = {};
    snap.docs.forEach(d => {
      const data = d.data();
      if (data.k) all[data.k] = data.v;
    });
    kvCache = all;
    return all;
  } catch (err) {
    return kvCache || {};
  }
}

export async function clientSetKV(key: string, value: string): Promise<any> {
  if (!kvCache) kvCache = {};
  kvCache[key] = value;
  try {
    await setDoc(doc(db, 'key_value_store', encodeKey(key)), { k: key, v: value });
  } catch (err: any) {
    console.warn('[clientFirestore] SetKV error:', err.message);
  }
  return { status: 'success' };
}

export async function clientDeleteKV(key?: string): Promise<any> {
  if (key) {
    if (kvCache) delete kvCache[key];
    try {
      await deleteDoc(doc(db, 'key_value_store', encodeKey(key)));
    } catch (err) {}
  } else {
    kvCache = {};
  }
  return { status: 'success' };
}

export async function clientHandleQuery(sqlQuery: string): Promise<any> {
  if (typeof sqlQuery === 'string') {
    const trimmed = sqlQuery.trim();
    if (/^delete\s+from\s+/i.test(trimmed)) {
      const match = trimmed.match(/^delete\s+from\s+(\w+)\s*(where\s+(.*))?$/i);
      if (match) {
        const table = match[1];
        const docs = await clientGetCollection(table);
        const whereClause = match[3];
        if (whereClause) {
          const conds = whereClause.split(/\s+and\s+/i);
          for (const docItem of [...docs]) {
            let matches = true;
            for (const cond of conds) {
              const m = cond.match(/(\w+)\s*=\s*'([^']*)'/);
              if (m) {
                const col = m[1];
                const val = m[2];
                if (String(docItem[col]) !== val) {
                  matches = false;
                  break;
                }
              }
            }
            if (matches && docItem.id) {
              await clientDeleteDoc(table, docItem.id);
            }
          }
        }
      }
    }
  }
  return { status: 'success', affectedRows: 1 };
}

export async function clientGetMateri(): Promise<any> {
  const [materi, users, objectives] = await Promise.all([
    clientGetCollection('materi_ajar'),
    clientGetCollection('users'),
    clientGetCollection('materi_objectives')
  ]);
  const userMap = new Map(users.map((u: any) => [String(u.id), u]));
  const objMap = new Map<string, string[]>();
  objectives.forEach((o: any) => {
    const mId = String(o.materi_id);
    if (!objMap.has(mId)) objMap.set(mId, []);
    objMap.get(mId)!.push(o.objective);
  });
  const data = materi.map((m: any) => ({
    ...m,
    name: userMap.get(String(m.user_id))?.name || m.name || '',
    role: userMap.get(String(m.user_id))?.role || m.role || '',
    class: m.class_name || m.class || '',
    objectives: objMap.get(String(m.id)) || m.objectives || []
  }));
  return { status: 'success', data };
}

export async function clientSaveMateri(payload: any): Promise<any> {
  const { id, user_id, subject, class_name, title, description, file_name, status, date, objectives } = payload;
  const materiId = id || Date.now();
  await clientSaveDoc('materi_ajar', materiId, {
    id: materiId,
    user_id,
    subject,
    class_name,
    title,
    description,
    file_name,
    status,
    date
  });
  if (objectives && Array.isArray(objectives)) {
    for (let i = 0; i < objectives.length; i++) {
      const objId = `${materiId}_${i}`;
      await clientSaveDoc('materi_objectives', objId, {
        id: objId,
        materi_id: materiId,
        objective: objectives[i]
      });
    }
  }
  return { status: 'success', id: materiId };
}

export async function clientDeleteMateri(id: string | number): Promise<any> {
  await clientDeleteDoc('materi_ajar', id);
  return { status: 'success' };
}
