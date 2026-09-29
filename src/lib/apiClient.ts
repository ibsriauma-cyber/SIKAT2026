import { User } from '../types';
import { firestoreClient } from './firestoreClient';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const getBaseApiUrl = (): string => {
  let envUrl = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      envUrl = String(import.meta.env.VITE_API_URL).trim();
    } else if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
      envUrl = String(process.env.VITE_API_URL).trim();
    }
  } catch (_) {}
  if (!envUrl) {
    return '/api';
  }
  envUrl = envUrl.replace(/\/+$/, '');
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl;
};

export const API_URL = getBaseApiUrl();

const normalizeUrl = (endpoint: string): string => {
  const base = getBaseApiUrl();
  let clean = endpoint.trim();
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }
  if (clean === '/sync') {
    clean = '/sync.php';
  }
  return `${base}${clean}`;
};

async function executeViaFirestore(endpoint: string, options: RequestInit = {}): Promise<any> {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  // 1. Sync
  if (clean.startsWith('/sync')) {
    return firestoreClient.sync();
  }

  // 2. Login
  if (clean.startsWith('/login')) {
    return firestoreClient.login(body.username, body.password);
  }

  // 3. User & Auth
  if (clean.startsWith('/get_user')) {
    const urlObj = new URL(`http://dummy${clean}`);
    const id = urlObj.searchParams.get('id');
    if (id) {
      const u = await firestoreClient.getTable('users', id);
      if (u) return { status: 'success', user: u };
    }
    return { status: 'error', message: 'User not found' };
  }

  if (clean.startsWith('/update_avatar')) {
    if (body.id && body.avatar) {
      await firestoreClient.update('users', body.id, { avatar: body.avatar });
      return { status: 'success', avatar: body.avatar };
    }
  }

  if (clean.startsWith('/request_reset')) {
    return { status: 'success', message: 'Permintaan reset berhasil dikirim' };
  }

  // 4. Keyval
  if (clean.startsWith('/keyval')) {
    const urlObj = new URL(`http://dummy${clean}`);
    const key = urlObj.searchParams.get('key') || body.key;
    if (method === 'GET') {
      return firestoreClient.keyvalGet(key || undefined);
    } else if (method === 'POST') {
      return firestoreClient.keyvalSet(key, body.value);
    } else if (method === 'DELETE') {
      return firestoreClient.keyvalDelete(key || undefined);
    }
  }

  // 4b. SQL Query emulation (DELETE FROM ...)
  if (clean.startsWith('/query')) {
    const querySql = body.query || body.q || '';
    return firestoreClient.executeQuery(querySql);
  }

  // 5. Crud
  if (clean.startsWith('/crud')) {
    const urlObj = new URL(`http://dummy${clean}`);
    const table = urlObj.searchParams.get('table');
    const id = urlObj.searchParams.get('id') || body.id;
    if (!table) throw new Error('Missing table param for crud');

    if (method === 'GET') {
      return firestoreClient.getTable(table, id || undefined);
    } else if (method === 'POST') {
      return firestoreClient.insert(table, body);
    } else if (method === 'PUT') {
      return firestoreClient.update(table, id, body);
    } else if (method === 'DELETE') {
      return firestoreClient.delete(table, id);
    }
  }

  // 6. Announcements
  if (clean.startsWith('/announcements')) {
    if (method === 'GET') {
      return firestoreClient.getAnnouncements();
    } else if (method === 'POST') {
      return firestoreClient.insert('announcements', body);
    } else if (method === 'PUT') {
      return firestoreClient.update('announcements', body.id, body);
    } else if (method === 'DELETE') {
      const urlObj = new URL(`http://dummy${clean}`);
      const id = urlObj.searchParams.get('id') || body.id;
      return firestoreClient.delete('announcements', id);
    }
  }

  // 7. Stats
  if (clean.startsWith('/stats')) {
    return firestoreClient.getStats();
  }

  // 8. Materi
  if (clean.startsWith('/get_materi')) {
    return firestoreClient.getMateri();
  }
  if (clean.startsWith('/save_materi')) {
    return firestoreClient.saveMateri(body);
  }
  if (clean.startsWith('/delete_materi')) {
    const urlObj = new URL(`http://dummy${clean}`);
    const id = urlObj.searchParams.get('id') || body.id;
    return firestoreClient.deleteMateri(id);
  }

  // 9. Sarpras
  if (clean.startsWith('/sarpras')) {
    return firestoreClient.getTable('sarpras');
  }

  // 10. Kinerja
  if (clean.startsWith('/kinerja_bundle')) {
    return firestoreClient.getTable('kinerja_staf');
  }

  // 11. Notifications
  if (clean.startsWith('/notifications')) {
    if (clean.includes('read') || method === 'POST') {
      const urlObj = new URL(`http://dummy${clean}`);
      const id = urlObj.searchParams.get('id') || body.id;
      if (id) {
        return firestoreClient.update('notifications', id, { is_read: 1 });
      }
    }
    return firestoreClient.getTable('notifications');
  }

  // 12. General collection get/post
  const route = clean.replace(/^\/(api\/)?/, '').split('?')[0].replace('.php', '');
  if (route) {
    if (method === 'GET') {
      return firestoreClient.getTable(route);
    } else if (method === 'POST') {
      return firestoreClient.insert(route, body);
    }
  }

  return { status: 'success' };
}

export const apiClient = async (endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> => {
  // If deployed on Vercel, Netlify, or any static hosting WITHOUT an external backend,
  // run DIRECTLY on Firebase Firestore Realtime Database for instant speed and 100% reliability!
  const isVercelOrStatic = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    (!import.meta.env.VITE_API_URL &&
     window.location.hostname !== 'localhost' &&
     window.location.hostname !== '127.0.0.1' &&
     !window.location.hostname.includes('.run.app') &&
     !window.location.hostname.includes(':3000'))
  );

  if (isVercelOrStatic) {
    return await executeViaFirestore(endpoint, options);
  }

  let targetUrl = normalizeUrl(endpoint);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  let method = (options.method || 'GET').toUpperCase();

  // Avoid HTTP 405 Method Not Allowed on shared hosting by tunneling PUT/DELETE through POST
  if (method === 'PUT' || method === 'DELETE') {
    headers['X-HTTP-Method-Override'] = method;
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${separator}_method=${method}`;
    method = 'POST';
  }

  const fetchOptions: RequestInit = {
    cache: 'no-store',
    ...options,
    method,
    headers,
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
      console.warn(`[API] Server responded with ${response.status}, executing via Realtime Firestore Database...`);
      return await executeViaFirestore(endpoint, options);
    }

    const contentType = response.headers.get("content-type") || "";
    let result;
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    // CRITICAL: If the response is HTML (e.g. index.html SPA fallback), it's NOT a valid API response!
    if (contentType.includes("text/html") || (typeof result === "string" && (result.trim().startsWith("<!") || result.trim().startsWith("<html")))) {
      console.warn(`[API] Server returned HTML (SPA fallback), executing via Realtime Firestore Database...`);
      return await executeViaFirestore(endpoint, options);
    }

    // Trigger global Realtime updates (SSE + Firestore)
    const originalMethod = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(originalMethod) && !targetUrl.includes('trigger-update') && !targetUrl.includes('kinerja_staf')) {
      const sseTriggerUrl = `${getBaseApiUrl()}/trigger-update`;
      fetch(sseTriggerUrl, { method: 'POST' }).catch(() => {});

      // Broadcast to Firebase Firestore Realtime Database
      try {
        setDoc(doc(db, 'system_test', 'ping'), { updatedAt: new Date().toISOString() }).catch(() => {});
      } catch (_) {}
    }

    return result;

  } catch (error: any) {
    // If fetch failed completely (e.g. CORS, network offline, or serverless invocation error), fallback to Firestore!
    console.warn(`[API] Network failure (${error?.message}), executing via Realtime Firestore Database...`);
    try {
      return await executeViaFirestore(endpoint, options);
    } catch (firestoreErr: any) {
      console.error("Firestore fallback failed:", firestoreErr);
      throw firestoreErr;
    }
  }
};

export const logKinerja = async (userId: number, task: string) => {
  try {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    await apiClient('/crud.php?table=kinerja_staf', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        task: task,
        status: 'Selesai',
        created_at: formattedNow
      })
    });
  } catch (err) {
    console.error('Failed to log kinerja:', err);
  }
};
