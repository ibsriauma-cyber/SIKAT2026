import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  limit
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import fallbackMasterData from './fallbackMasterData.json';

// In-memory cache
const memoryCache = new Map<string, { data: any; time: number }>();
const STATIC_TTL = 10 * 60 * 1000; // 10 minutes for master tables
const DYNAMIC_TTL = 30 * 1000;      // 30 seconds for dynamic tables

const STATIC_TABLES = new Set([
  'users',
  'students',
  'classes',
  'subjects',
  'academic_terms',
  'schedules',
  'teaching_assignments',
  'school_profile',
  'settings'
]);

function getLocalStorageTable(table: string): any[] {
  if (typeof window === 'undefined') {
    return (fallbackMasterData as any)[table] || [];
  }
  try {
    const raw = localStorage.getItem(`fb_table_${table}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}

  const fallback = (fallbackMasterData as any)[table];
  if (Array.isArray(fallback) && fallback.length > 0) {
    try {
      localStorage.setItem(`fb_table_${table}`, JSON.stringify(fallback));
    } catch (_) {}
    return fallback;
  }
  return [];
}

function setLocalStorageTable(table: string, data: any[]) {
  memoryCache.set(`table_${table}`, { data, time: Date.now() });
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`fb_table_${table}`, JSON.stringify(data));
    } catch (_) {}
  }
}

export function sanitizeFirestoreData<T = any>(val: T): T {
  if (val === null || val === undefined) return val;

  // 1. If it's a Firestore Timestamp instance with toDate()
  if (typeof val === 'object' && typeof (val as any).toDate === 'function') {
    try {
      const d = (val as any).toDate();
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` as any;
    } catch (_) {
      return new Date((val as any).seconds * 1000).toISOString() as any;
    }
  }

  // 2. If it's an object with { seconds, nanoseconds }
  if (
    typeof val === 'object' &&
    typeof (val as any).seconds === 'number' &&
    typeof (val as any).nanoseconds === 'number'
  ) {
    const d = new Date((val as any).seconds * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` as any;
  }

  // 3. Arrays
  if (Array.isArray(val)) {
    return val.map(item => sanitizeFirestoreData(item)) as any;
  }

  // 4. Plain Objects
  if (typeof val === 'object' && (val.constructor === Object || !val.constructor)) {
    const out: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      out[k] = sanitizeFirestoreData((val as any)[k]);
    }
    return out as any;
  }

  return val;
}

export const firestoreClient = {
  // 1. Login Authentication
  async login(username: string, password: string): Promise<any> {
    const search = String(username || '').trim().toLowerCase();
    
    // First, check local/fallback snapshot to avoid burning Firestore read quota on login!
    const localUsers = getLocalStorageTable('users');
    const localMatch = localUsers.find((u: any) => {
      return (
        (u.username && String(u.username).toLowerCase() === search) ||
        (u.nuptk && String(u.nuptk).toLowerCase() === search) ||
        (u.nip && String(u.nip).toLowerCase() === search) ||
        String(u.id) === search
      );
    });

    if (localMatch) {
      const isCorrect = verifyPassword(password, localMatch.password);
      if (isCorrect) {
        const cleanUser = { ...localMatch };
        delete cleanUser.password;
        return { status: 'success', user: sanitizeFirestoreData(cleanUser) };
      }
    }

    // Try Firestore if not matched locally
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(query(usersRef, where('username', '==', search), limit(1)));
      
      if (!snap.empty) {
        const user = sanitizeFirestoreData(snap.docs[0].data());
        const isCorrect = verifyPassword(password, user.password);
        if (isCorrect) {
          const cleanUser = { ...user };
          delete cleanUser.password;
          return { status: 'success', user: sanitizeFirestoreData(cleanUser) };
        }
      }
    } catch (err: any) {
      console.warn('[Firestore] Auth query skipped (quota/network):', err.message);
    }

    if (localMatch) {
      return { status: 'error', message: 'Username / NIPTK atau password salah' };
    }

    return { status: 'error', message: 'Username / NIPTK atau password salah' };
  },

  // 2. Data Sync
  async sync(): Promise<any> {
    const [users, students, classes, subjects] = await Promise.all([
      this.getTable('users'),
      this.getTable('students'),
      this.getTable('classes'),
      this.getTable('subjects')
    ]);

    return { users, students, classes, subjects };
  },

  // 3. CRUD GET
  async getTable(table: string, id?: string): Promise<any> {
    const localList = getLocalStorageTable(table);

    if (id) {
      const found = localList.find((item: any) => String(item.id) === String(id));
      if (found) return found;

      try {
        const snap = await getDoc(doc(db, table, String(id)));
        if (snap.exists()) {
          return sanitizeFirestoreData({ ...snap.data(), id: snap.id });
        }
      } catch (err: any) {
        console.warn(`[Firestore] getDoc for ${table}/${id} failed:`, err.message);
      }
      return null;
    }

    const cacheKey = `table_${table}`;
    const cached = memoryCache.get(cacheKey);
    const ttl = STATIC_TABLES.has(table) ? STATIC_TTL : DYNAMIC_TTL;

    if (cached && Date.now() - cached.time < ttl) {
      return cached.data;
    }

    // If we have local cached data, return it and optionally refresh in background if quota permits
    try {
      const snap = await getDocs(collection(db, table));
      const list = snap.docs.map(d => sanitizeFirestoreData({ ...d.data(), id: d.id }));
      if (list.length > 0 || !STATIC_TABLES.has(table)) {
        setLocalStorageTable(table, list);
        return list;
      }
    } catch (err: any) {
      console.warn(`[Firestore] Quota or network notice for table '${table}': ${err.message}. Serving from persistent cache.`);
    }

    // Return stored/fallback data safely
    memoryCache.set(cacheKey, { data: localList, time: Date.now() });
    return localList;
  },

  // 4. CRUD POST (Insert or Replace)
  async insert(table: string, data: any): Promise<any> {
    const localList = [...getLocalStorageTable(table)];

    // Batch insertion
    if (Array.isArray(data)) {
      if (data.length === 0) return { status: 'success', count: 0 };

      const batches: Promise<void>[] = [];
      let currentBatch = writeBatch(db);
      let countInBatch = 0;

      for (const item of data) {
        let id = item.id ? String(item.id) : '';
        if (!id) {
          if (table === 'student_attendance' && item.student_id && item.date) {
            id = `att_${item.student_id}_${item.class_name || ''}_${item.subject_name || ''}_${item.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          } else if (table === 'ibadah_siswa' && item.student_id && item.date && item.type) {
            id = `ibs_${item.student_id}_${item.class_name || ''}_${item.type}_${item.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          } else if (table === 'ibadah_guru' && item.user_id && item.date) {
            id = `ibg_${item.user_id}_${item.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          } else if (table === 'pemantauan_pagi' && item.student_id && item.tanggal) {
            id = `pmp_${item.student_id}_${item.tanggal}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          } else if (table === 'nilai_sikap' && item.student_id && item.tanggal) {
            id = `nsk_${item.student_id}_${item.tanggal}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          } else if (table === 'grades' && item.student_id && item.subject_name && item.type) {
            id = `grd_${item.student_id}_${item.subject_name}_${item.type}_${item.semester || '1'}_${item.class_name || ''}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          } else {
            id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
        }
        const cleanData = sanitizeFirestoreData({ ...item, id });
        
        // Update local list
        const existingIdx = localList.findIndex((x: any) => String(x.id) === String(id));
        if (existingIdx >= 0) {
          localList[existingIdx] = { ...localList[existingIdx], ...cleanData };
        } else {
          localList.push(cleanData);
        }

        const docRef = doc(db, table, id);
        currentBatch.set(docRef, cleanData, { merge: true });
        countInBatch++;

        if (countInBatch >= 400) {
          batches.push(currentBatch.commit().catch(e => console.warn('[Firestore] Batch commit notice:', e.message)));
          currentBatch = writeBatch(db);
          countInBatch = 0;
        }
      }

      if (countInBatch > 0) {
        batches.push(currentBatch.commit().catch(e => console.warn('[Firestore] Final batch commit notice:', e.message)));
      }

      setLocalStorageTable(table, localList);
      Promise.all(batches).catch(() => {});
      return { status: 'success', count: data.length };
    }

    // Single item insertion
    let id = data.id ? String(data.id) : '';
    if (!id) {
      if (table === 'student_attendance' && data.student_id && data.date) {
        id = `att_${data.student_id}_${data.class_name || ''}_${data.subject_name || ''}_${data.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (table === 'ibadah_siswa' && data.student_id && data.date && data.type) {
        id = `ibs_${data.student_id}_${data.class_name || ''}_${data.type}_${data.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (table === 'ibadah_guru' && data.user_id && data.date) {
        id = `ibg_${data.user_id}_${data.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (table === 'pemantauan_pagi' && data.student_id && data.tanggal) {
        id = `pmp_${data.student_id}_${data.tanggal}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (table === 'nilai_sikap' && data.student_id && data.tanggal) {
        id = `nsk_${data.student_id}_${data.tanggal}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (table === 'grades' && data.student_id && data.subject_name && data.type) {
        id = `grd_${data.student_id}_${data.subject_name}_${data.type}_${data.semester || '1'}_${data.class_name || ''}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else {
        id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    const cleanData = sanitizeFirestoreData({ ...data, id });
    const existingIdx = localList.findIndex((x: any) => String(x.id) === String(id));
    if (existingIdx >= 0) {
      localList[existingIdx] = { ...localList[existingIdx], ...cleanData };
    } else {
      localList.push(cleanData);
    }
    setLocalStorageTable(table, localList);

    // Save to Firestore in background
    try {
      const docRef = doc(db, table, id);
      await setDoc(docRef, cleanData, { merge: true });
    } catch (err: any) {
      console.warn(`[Firestore] Write notice for ${table}/${id}:`, err.message);
    }

    return { status: 'success', insertId: id, id };
  },

  // 4b. Execute SQL-like DELETE query on Firestore & Local Storage
  async executeQuery(querySql: string): Promise<any> {
    if (!querySql) return { status: 'success', affectedRows: 0 };
    const q = querySql.trim();
    const deleteMatch = q.match(/^DELETE\s+FROM\s+[`]?([a-zA-Z0-9_]+)[`]?\s+WHERE\s+(.+)$/i);
    
    if (deleteMatch) {
      const table = deleteMatch[1];
      const whereClause = deleteMatch[2];

      const condRegex = /([a-zA-Z0-9_]+)\s*(=|!=)\s*'([^']*)'/g;
      let match;
      const conditions: { col: string; op: string; val: string }[] = [];
      while ((match = condRegex.exec(whereClause)) !== null) {
        conditions.push({ col: match[1], op: match[2], val: match[3] });
      }

      if (conditions.length > 0) {
        // 1. Immediately delete from local storage
        const localList = getLocalStorageTable(table);
        const filteredLocal = localList.filter((data: any) => {
          const matchesAll = conditions.every(c => {
            const rowVal = String(data[c.col] || '');
            if (c.op === '=') return rowVal === c.val;
            if (c.op === '!=') return rowVal !== c.val;
            return true;
          });
          return !matchesAll;
        });
        setLocalStorageTable(table, filteredLocal);

        // 2. Delete from Firestore in background
        try {
          const snap = await getDocs(collection(db, table));
          const toDelete: any[] = [];
          snap.forEach(d => {
            const data = d.data();
            const matches = conditions.every(c => {
              const rowVal = String(data[c.col] || '');
              if (c.op === '=') return rowVal === c.val;
              if (c.op === '!=') return rowVal !== c.val;
              return true;
            });
            if (matches) toDelete.push(d.ref);
          });

          for (let i = 0; i < toDelete.length; i += 400) {
            const batch = writeBatch(db);
            toDelete.slice(i, i + 400).forEach(ref => batch.delete(ref));
            await batch.commit();
          }
          return { status: 'success', affectedRows: toDelete.length };
        } catch (err: any) {
          console.warn(`[Firestore] Delete notice for ${table}:`, err.message);
        }

        return { status: 'success', affectedRows: localList.length - filteredLocal.length };
      }
    }
    return { status: 'success', affectedRows: 0 };
  },

  // 5. CRUD PUT (Update)
  async update(table: string, id: string | number, data: any): Promise<any> {
    const localList = [...getLocalStorageTable(table)];
    const cleanData = sanitizeFirestoreData({ ...data, id: String(id) });
    const idx = localList.findIndex((x: any) => String(x.id) === String(id));
    if (idx >= 0) {
      localList[idx] = { ...localList[idx], ...cleanData };
    } else {
      localList.push(cleanData);
    }
    setLocalStorageTable(table, localList);

    try {
      const docRef = doc(db, table, String(id));
      await setDoc(docRef, cleanData, { merge: true });
    } catch (err: any) {
      console.warn(`[Firestore] Update notice for ${table}/${id}:`, err.message);
    }

    return { status: 'success', affectedRows: 1 };
  },

  // 6. CRUD DELETE
  async delete(table: string, id: string | number): Promise<any> {
    const localList = getLocalStorageTable(table);
    const filtered = localList.filter((x: any) => String(x.id) !== String(id));
    setLocalStorageTable(table, filtered);

    try {
      const docRef = doc(db, table, String(id));
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn(`[Firestore] Delete notice for ${table}/${id}:`, err.message);
    }

    return { status: 'success', affectedRows: 1 };
  },

  // 7. Key-Value Store
  async keyvalGet(key?: string): Promise<any> {
    const localKvList = getLocalStorageTable('key_value_store');
    const storeMap: Record<string, string> = {};

    // 1. Populate from persistent database/snapshot key_value_store table
    if (Array.isArray(localKvList)) {
      localKvList.forEach((item: any) => {
        if (item && item.k) {
          storeMap[String(item.k)] = String(item.v !== undefined ? item.v : '');
        }
      });
    }

    // 2. Overlay any active localStorage edits
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('kv_')) {
            const actualKey = k.substring(3);
            const val = localStorage.getItem(k);
            if (val !== null) storeMap[actualKey] = val;
          }
        }
      } catch (_) {}
    }

    if (key) {
      if (storeMap[key] !== undefined) {
        return { value: storeMap[key] };
      }
      try {
        const snap = await getDoc(doc(db, 'key_value_store', key));
        if (snap.exists()) {
          const val = String(snap.data()?.v || '');
          storeMap[key] = val;
          return { value: val };
        }
      } catch (_) {}
      return { value: null };
    }

    return storeMap;
  },

  async keyvalSet(key: string, value: string): Promise<any> {
    const valStr = String(value !== undefined && value !== null ? value : '');
    
    // 1. Save to localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`kv_${key}`, valStr);
      } catch (_) {}
    }

    // 2. Update key_value_store table
    const localKvList = [...getLocalStorageTable('key_value_store')];
    const idx = localKvList.findIndex((item: any) => String(item.k) === String(key));
    if (idx >= 0) {
      localKvList[idx] = { k: key, v: valStr };
    } else {
      localKvList.push({ k: key, v: valStr });
    }
    setLocalStorageTable('key_value_store', localKvList);

    // 3. Save to Firestore in background
    try {
      await setDoc(doc(db, 'key_value_store', key), { k: key, v: valStr });
    } catch (_) {}

    return { status: 'success' };
  },

  async keyvalDelete(key?: string): Promise<any> {
    const localKvList = getLocalStorageTable('key_value_store');

    if (key) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(`kv_${key}`);
        } catch (_) {}
      }
      const filtered = localKvList.filter((item: any) => String(item.k) !== String(key));
      setLocalStorageTable('key_value_store', filtered);
      try {
        await deleteDoc(doc(db, 'key_value_store', key));
      } catch (_) {}
    } else {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('kv_')) keysToRemove.push(k);
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (_) {}
      }
      setLocalStorageTable('key_value_store', []);
    }

    return { status: 'success' };
  },

  // 8. Announcements
  async getAnnouncements(): Promise<any[]> {
    const rawList = await this.getTable('announcements');
    return (rawList || []).map((raw: any) => {
      const rawDate = raw.date || raw.created_at;
      let finalDate = new Date().toISOString().split('T')[0];

      if (typeof rawDate === 'string' && rawDate) {
        finalDate = rawDate.split(' ')[0].split('T')[0];
      }

      return {
        ...raw,
        id: String(raw.id || ''),
        title: String(raw.title || ''),
        content: String(raw.content || ''),
        category: String(raw.category || 'Informasi'),
        target: String(raw.target || raw.target_audience || 'Semua'),
        date: finalDate,
        isPublished: true
      };
    });
  },

  // 9. Stats
  async getStats(): Promise<any> {
    const [u, s, c] = await Promise.all([
      this.getTable('users'),
      this.getTable('students'),
      this.getTable('classes')
    ]);
    const uCount = Array.isArray(u) ? u.length : 0;
    const sCount = Array.isArray(s) ? s.length : 0;
    const cCount = Array.isArray(c) ? c.length : 0;
    return {
      totalUsers: uCount,
      totalStudents: sCount,
      activeClasses: cCount,
      attendanceRate: 98,
      users: uCount,
      students: sCount,
      classes: cCount
    };
  },

  // 10. Materi Ajar
  async getMateri(): Promise<any> {
    const [materi, users, objectives] = await Promise.all([
      this.getTable('materi_ajar'),
      this.getTable('users'),
      this.getTable('materi_objectives')
    ]);

    const userList = Array.isArray(users) ? users : [];
    const userMap = new Map(userList.map((u: any) => [String(u.id), u]));

    const objList = Array.isArray(objectives) ? objectives : [];
    const objMap = new Map<string, string[]>();
    objList.forEach((o: any) => {
      const mId = String(o.materi_id);
      if (!objMap.has(mId)) objMap.set(mId, []);
      objMap.get(mId)!.push(o.objective);
    });

    const materiList = Array.isArray(materi) ? materi : [];
    const formatted = materiList.map((m: any) => {
      const author = userMap.get(String(m.user_id));
      const subj = String(m.subject || '');
      const isQuran = subj.toLowerCase().includes('quran') || subj.toLowerCase().includes('tahfizh');
      const authorRole = author?.role || m.role || (isQuran ? 'guru_quran' : 'guru');
      let category = 'guru_mapel';
      if (authorRole === 'guru_quran' || isQuran) category = 'guru_quran';
      else if (authorRole === 'walas') category = 'wali_kelas';

      const rawDate = m.date || m.created_at;
      let dateStr = '-';
      if (typeof rawDate === 'string' && rawDate) {
        dateStr = rawDate.split(' ')[0].split('T')[0];
      }

      return {
        ...m,
        id: String(m.id),
        name: author?.name || m.name || m.teacherName || 'Guru',
        teacherName: author?.name || m.name || m.teacherName || 'Guru',
        role: authorRole,
        category,
        class: m.class_name || m.class || m.className || '-',
        className: m.class_name || m.class || m.className || '-',
        date: dateStr,
        file_name: m.file_name || m.driveUrl || '',
        driveUrl: m.file_name || m.driveUrl || '',
        objectives: objMap.get(String(m.id)) || (Array.isArray(m.objectives) ? m.objectives : [])
      };
    });

    return { status: 'success', data: formatted };
  },

  async saveMateri(body: any): Promise<any> {
    const id = String(body.id || `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const objectives = Array.isArray(body.objectives) ? body.objectives : [];
    const cleanDoc = {
      ...body,
      id,
      class_name: body.class_name || body.class || body.className || '',
      date: body.date ? String(body.date).slice(0, 10) : new Date().toISOString().split('T')[0]
    };
    await this.insert('materi_ajar', cleanDoc);

    // Save objectives
    if (objectives.length > 0) {
      for (let i = 0; i < objectives.length; i++) {
        const objId = `obj_${id}_${i}`;
        await this.insert('materi_objectives', {
          id: objId,
          materi_id: id,
          objective: objectives[i]
        });
      }
    }
    return { status: 'success', id };
  },

  async deleteMateri(id: string | number): Promise<any> {
    await this.delete('materi_ajar', String(id));
    return { status: 'success' };
  }
};

function verifyPassword(inputPassword: string, storedPassword?: string): boolean {
  if (!storedPassword) return false;
  try {
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
      return bcrypt.compareSync(inputPassword, storedPassword);
    }
  } catch (_) {}
  return inputPassword === storedPassword;
}
