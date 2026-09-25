import { User } from '../types';
import {
  clientLogin,
  clientSync,
  clientGetCollection,
  clientSaveDoc,
  clientDeleteDoc,
  clientGetKV,
  clientSetKV,
  clientDeleteKV,
  clientHandleQuery,
  clientGetMateri,
  clientSaveMateri,
  clientDeleteMateri
} from './clientFirestore';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

async function handleFirestoreFallback(endpoint: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  // 1. Login
  if (endpoint.includes('login')) {
    return clientLogin(body.username, body.password);
  }

  // 2. Sync
  if (endpoint.includes('sync')) {
    return clientSync();
  }

  // 3. KeyVal Store
  if (endpoint.includes('keyval')) {
    const urlObj = new URL(endpoint, 'http://localhost');
    const key = urlObj.searchParams.get('key') || body.key;
    if (method === 'GET') {
      return clientGetKV(key || undefined);
    } else if (method === 'POST') {
      return clientSetKV(body.key, body.value);
    } else if (method === 'DELETE') {
      return clientDeleteKV(key || undefined);
    }
  }

  // 4. Data / CRUD
  // Matches: /data/users, /data/users/12, /crud.php?table=users
  const dataMatch = endpoint.match(/\/data\/([^/?]+)(?:\/([^/?]+))?/);
  const crudMatch = endpoint.match(/crud\.php\?table=([^&]+)(?:&id=([^&]+))?/);
  const table = dataMatch ? dataMatch[1] : (crudMatch ? crudMatch[1] : null);
  const id = dataMatch ? dataMatch[2] : (crudMatch ? crudMatch[2] : null);

  if (table) {
    if (method === 'GET') {
      const items = await clientGetCollection(table);
      if (id) {
        return items.find((x: any) => String(x.id) === String(id)) || null;
      }
      return items;
    } else if (method === 'POST') {
      const docId = body.id || Date.now();
      return clientSaveDoc(table, docId, body);
    } else if (method === 'PUT') {
      const docId = id || body.id;
      return clientSaveDoc(table, docId, body);
    } else if (method === 'DELETE') {
      const docId = id || body.id;
      return clientDeleteDoc(table, docId);
    }
  }

  // 5. Query execution (e.g. DELETE FROM table WHERE ...)
  if (endpoint.includes('query')) {
    return clientHandleQuery(body.query);
  }

  // 6. Materi ajar
  if (endpoint.includes('get_materi')) {
    return clientGetMateri();
  }
  if (endpoint.includes('save_materi')) {
    return clientSaveMateri(body);
  }
  if (endpoint.includes('delete_materi')) {
    return clientDeleteMateri(body.id);
  }

  // 7. Announcements
  if (endpoint.includes('announcements')) {
    if (method === 'GET') {
      return clientGetCollection('announcements');
    } else if (method === 'POST') {
      const docId = body.id || Date.now().toString();
      return clientSaveDoc('announcements', docId, body);
    } else if (method === 'DELETE') {
      return clientDeleteDoc('announcements', body.id || id);
    }
  }

  // 8. User details & Avatar
  if (endpoint.includes('get_user')) {
    const urlObj = new URL(endpoint, 'http://localhost');
    const uId = urlObj.searchParams.get('id');
    const users = await clientGetCollection('users');
    const user = users.find((x: any) => String(x.id) === String(uId));
    return user ? { status: 'success', user } : { status: 'error', message: 'User not found' };
  }
  if (endpoint.includes('update_avatar')) {
    await clientSaveDoc('users', body.user_id, { avatar: body.avatar_base64 });
    return { status: 'success', avatar_url: body.avatar_base64 };
  }

  // 9. Notifications
  if (endpoint.includes('notifications')) {
    return clientGetCollection('notifications');
  }

  // 10. Sarpras
  if (endpoint.includes('sarpras')) {
    return clientGetCollection('sarpras');
  }

  // 11. Stats
  if (endpoint.includes('stats')) {
    const [u, s, c] = await Promise.all([
      clientGetCollection('users'),
      clientGetCollection('students'),
      clientGetCollection('classes')
    ]);
    return {
      totalUsers: u.length,
      totalStudents: s.length,
      activeClasses: c.length,
      users: u.length,
      students: s.length,
      classes: c.length
    };
  }

  return [];
}

export const apiClient = async (endpoint: string, options: RequestInit = {}, retries = 1): Promise<any> => {
  let url = endpoint === '/sync' ? `${API_URL}/sync.php` : `${API_URL}${endpoint}`;
  
  // Anti-adblock: rewrite crud.php to clean endpoints
  if (url.includes('crud.php?table=')) {
    const tableMatch = url.match(/table=([^&]+)/);
    const idMatch = url.match(/id=([^&]+)/);
    if (tableMatch) {
       if (idMatch) {
          url = `${API_URL}/data/${tableMatch[1]}/${idMatch[1]}`;
       } else {
          url = `${API_URL}/data/${tableMatch[1]}`;
       }
    }
  }

  const defaultHeaders = { 'Content-Type': 'application/json' };
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";

    // On Vercel SPA rewrites, non-API endpoints or missing backend returns index.html (text/html)
    // If we receive HTML or 404 on an API route, seamlessly fallback to Firebase Firestore!
    if (!response.ok || contentType.includes("text/html")) {
      return await handleFirestoreFallback(endpoint, options);
    }
    
    let result;
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    // Trigger global SSE update if it was a mutation
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase()) && !url.includes('trigger-update') && !url.includes('kinerja_staf')) {
      fetch(`${API_URL}/trigger-update`, { method: 'POST' }).catch(() => {});
    }
    
    return result;
  
  } catch (error) {
    // If network failed (e.g. backend server is not running on Vercel), fall back to client Firestore!
    try {
      return await handleFirestoreFallback(endpoint, options);
    } catch (fallbackError) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return apiClient(endpoint, options, retries - 1);
      }
      console.error("API fetch and fallback failed:", url, error);
      throw error;
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

