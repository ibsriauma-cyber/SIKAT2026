import { User } from '../types';
import { firestoreClient } from './firestoreClient';

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

  // 3. Keyval
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

  // 4. Crud
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

  // 5. Announcements
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

  // 6. Stats
  if (clean.startsWith('/stats')) {
    return firestoreClient.getStats();
  }

  // 7. General collection get/post
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
      // If server failed (e.g. 500 FUNCTION_INVOCATION_FAILED, 404, 405), fallback to Realtime Firestore Database!
      console.warn(`[API] Server responded with ${response.status}, falling back to Realtime Firestore Database...`);
      return await executeViaFirestore(endpoint, options);
    }

    const contentType = response.headers.get("content-type") || "";
    let result;
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    // Trigger global Realtime updates (SSE + Firestore)
    const originalMethod = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(originalMethod) && !targetUrl.includes('trigger-update') && !targetUrl.includes('kinerja_staf')) {
      const sseTriggerUrl = `${getBaseApiUrl()}/trigger-update`;
      fetch(sseTriggerUrl, { method: 'POST' }).catch(() => {});

      // Broadcast to Firebase Firestore Realtime Database
      try {
        import('./firebase').then(({ db }) => {
          import('firebase/firestore').then(({ doc, setDoc }) => {
            setDoc(doc(db, 'system_test', 'ping'), { updatedAt: new Date().toISOString() }).catch(() => {});
          });
        }).catch(() => {});
      } catch (_) {}
    }

    return result;

  } catch (error: any) {
    // If fetch failed completely (e.g. CORS, network offline, or serverless invocation error), fallback to Firestore!
    console.warn(`[API] Network or invocation failure (${error?.message}), executing via Realtime Firestore Database...`);
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
