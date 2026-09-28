import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// Cache for rapid repeated reads (<2ms)
const localCache = new Map<string, { data: any; time: number }>();
const CACHE_TTL = 3000;

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

      const user = matched.data();
      const isCorrect = verifyPassword(password, user.password);
      if (isCorrect) {
        const cleanUser = { ...user };
        delete cleanUser.password;
        return { status: 'success', user: cleanUser };
      }
      return { status: 'error', message: 'Username / NIPTK atau password salah' };
    }

    const user = snap.docs[0].data();
    const isCorrect = verifyPassword(password, user.password);
    if (isCorrect) {
      const cleanUser = { ...user };
      delete cleanUser.password;
      return { status: 'success', user: cleanUser };
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

    const users = usersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const students = studentsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const classes = classesSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const subjects = subjectsSnap.docs.map(d => ({ ...d.data(), id: d.id }));

    return { users, students, classes, subjects };
  },

  // 3. CRUD GET
  async getTable(table: string, id?: string): Promise<any> {
    if (id) {
      const snap = await getDoc(doc(db, table, String(id)));
      return snap.exists() ? { ...snap.data(), id: snap.id } : null;
    }

    const cacheKey = `table_${table}`;
    const cached = localCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }

    const snap = await getDocs(collection(db, table));
    const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    localCache.set(cacheKey, { data: list, time: Date.now() });
    return list;
  },

  // 4. CRUD POST (Insert or Replace)
  async insert(table: string, data: any): Promise<any> {
    localCache.delete(`table_${table}`);
    const id = String(data.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const docRef = doc(db, table, id);
    await setDoc(docRef, { ...data, id }, { merge: true });
    return { status: 'success', insertId: id, id };
  },

  // 5. CRUD PUT (Update)
  async update(table: string, id: string | number, data: any): Promise<any> {
    localCache.delete(`table_${table}`);
    const docRef = doc(db, table, String(id));
    await setDoc(docRef, data, { merge: true });
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
        all[d.id] = data.v;
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
      const r = d.data();
      return {
        ...r,
        id: d.id,
        title: r.title || '',
        content: r.content || '',
        category: r.category || 'Informasi',
        target: r.target || r.target_audience || 'Semua',
        date: r.date || r.created_at || new Date().toISOString().split('T')[0],
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
