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

// Cache for rapid repeated reads (<2ms)
const localCache = new Map<string, { data: any; time: number }>();
const CACHE_TTL = 3000;

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
    const usersRef = collection(db, 'users');

    // Query by username
    let snap = await getDocs(query(usersRef, where('username', '==', search), limit(1)));
    if (snap.empty && search) {
      // Try by exact id
      const byIdSnap = await getDoc(doc(db, 'users', search));
      if (byIdSnap.exists()) {
        snap = { docs: [byIdSnap], empty: false } as any;
      }
    }

    if (snap.empty) {
      // Query all users to match case-insensitively or by nuptk / nip
      const allUsersSnap = await getDocs(usersRef);
      const matched = allUsersSnap.docs.find(d => {
        const u = d.data();
        return (
          (u.username && String(u.username).toLowerCase() === search) ||
          (u.nuptk && String(u.nuptk).toLowerCase() === search) ||
          (u.nip && String(u.nip).toLowerCase() === search) ||
          String(u.id) === search
        );
      });

      if (!matched) {
        return { status: 'error', message: 'Username / NIPTK atau password salah' };
      }

      const user = sanitizeFirestoreData(matched.data());
      const isCorrect = verifyPassword(password, user.password);
      if (isCorrect) {
        const cleanUser = { ...user };
        delete cleanUser.password;
        return { status: 'success', user: sanitizeFirestoreData(cleanUser) };
      }
      return { status: 'error', message: 'Username / NIPTK atau password salah' };
    }

    const user = sanitizeFirestoreData(snap.docs[0].data());
    const isCorrect = verifyPassword(password, user.password);
    if (isCorrect) {
      const cleanUser = { ...user };
      delete cleanUser.password;
      return { status: 'success', user: sanitizeFirestoreData(cleanUser) };
    }
    return { status: 'error', message: 'Username / NIPTK atau password salah' };
  },

  // 2. Data Sync
  async sync(): Promise<any> {
    const [usersSnap, studentsSnap, classesSnap, subjectsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'classes')),
      getDocs(collection(db, 'subjects')),
    ]);

    const users = usersSnap.docs.map(d => sanitizeFirestoreData({ ...d.data(), id: d.id }));
    const students = studentsSnap.docs.map(d => sanitizeFirestoreData({ ...d.data(), id: d.id }));
    const classes = classesSnap.docs.map(d => sanitizeFirestoreData({ ...d.data(), id: d.id }));
    const subjects = subjectsSnap.docs.map(d => sanitizeFirestoreData({ ...d.data(), id: d.id }));

    return { users, students, classes, subjects };
  },

  // 3. CRUD GET
  async getTable(table: string, id?: string): Promise<any> {
    if (id) {
      const snap = await getDoc(doc(db, table, String(id)));
      return snap.exists() ? sanitizeFirestoreData({ ...snap.data(), id: snap.id }) : null;
    }

    const cacheKey = `table_${table}`;
    const cached = localCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }

    const snap = await getDocs(collection(db, table));
    const list = snap.docs.map(d => sanitizeFirestoreData({ ...d.data(), id: d.id }));
    localCache.set(cacheKey, { data: list, time: Date.now() });
    return list;
  },

  // 4. CRUD POST (Insert or Replace)
  async insert(table: string, data: any): Promise<any> {
    localCache.delete(`table_${table}`);
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
    const docRef = doc(db, table, id);
    await setDoc(docRef, cleanData, { merge: true });
    return { status: 'success', insertId: id, id };
  },

  // 4b. Execute SQL-like DELETE query on Firestore
  async executeQuery(querySql: string): Promise<any> {
    if (!querySql) return { status: 'success', affectedRows: 0 };
    const q = querySql.trim();
    const deleteMatch = q.match(/^DELETE\s+FROM\s+[`]?([a-zA-Z0-9_]+)[`]?\s+WHERE\s+(.+)$/i);
    if (deleteMatch) {
      const table = deleteMatch[1];
      const whereClause = deleteMatch[2];
      localCache.delete(`table_${table}`);

      const condRegex = /([a-zA-Z0-9_]+)\s*(=|!=)\s*'([^']*)'/g;
      let match;
      const conditions: { col: string; op: string; val: string }[] = [];
      while ((match = condRegex.exec(whereClause)) !== null) {
        conditions.push({ col: match[1], op: match[2], val: match[3] });
      }

      if (conditions.length > 0) {
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
      }
    }
    return { status: 'success', affectedRows: 0 };
  },

  // 5. CRUD PUT (Update)
  async update(table: string, id: string | number, data: any): Promise<any> {
    localCache.delete(`table_${table}`);
    const cleanData = sanitizeFirestoreData(data);
    const docRef = doc(db, table, String(id));
    await setDoc(docRef, cleanData, { merge: true });
    return { status: 'success', affectedRows: 1 };
  },

  // 6. CRUD DELETE
  async delete(table: string, id: string | number): Promise<any> {
    localCache.delete(`table_${table}`);
    const docRef = doc(db, table, String(id));
    await deleteDoc(docRef);
    return { status: 'success', affectedRows: 1 };
  },

  // 7. Key-Value Store
  async keyvalGet(key?: string): Promise<any> {
    if (key) {
      const snap = await getDoc(doc(db, 'key_value_store', key));
      return { value: snap.exists() ? snap.data()?.v : null };
    }
    const snap = await getDocs(collection(db, 'key_value_store'));
    const all: Record<string, string> = {};
    snap.docs.forEach(d => {
      const data = d.data();
      if (data && data.v !== undefined) {
        all[d.id] = String(data.v);
      }
    });
    return all;
  },

  async keyvalSet(key: string, value: string): Promise<any> {
    await setDoc(doc(db, 'key_value_store', key), { k: key, v: String(value) });
    return { status: 'success' };
  },

  async keyvalDelete(key?: string): Promise<any> {
    if (key) {
      await deleteDoc(doc(db, 'key_value_store', key));
    } else {
      const snap = await getDocs(collection(db, 'key_value_store'));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
    return { status: 'success' };
  },

  // 8. Announcements
  async getAnnouncements(): Promise<any[]> {
    const snap = await getDocs(collection(db, 'announcements'));
    return snap.docs.map(d => {
      const raw = sanitizeFirestoreData(d.data());
      const rawDate = raw.date || raw.created_at;
      let finalDate = new Date().toISOString().split('T')[0];

      if (typeof rawDate === 'string' && rawDate) {
        finalDate = rawDate.split(' ')[0].split('T')[0];
      }

      return {
        ...raw,
        id: d.id,
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
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'classes'))
    ]);
    return {
      totalUsers: u.size,
      totalStudents: s.size,
      activeClasses: c.size,
      attendanceRate: 98,
      users: u.size,
      students: s.size,
      classes: c.size
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
