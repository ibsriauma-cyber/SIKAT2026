import { User } from '../types';

export const getBaseApiUrl = (): string => {
  let envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  // Remove trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');
  
  // If user provided a domain without /api (e.g. "https://domain.com"), append /api
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

export const apiClient = async (endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> => {
  let targetUrl = normalizeUrl(endpoint);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  let method = (options.method || 'GET').toUpperCase();

  // Avoid HTTP 405 Method Not Allowed on shared hosting (Hostinger/cPanel/Apache)
  // which often disables PUT or DELETE requests. Tunnel PUT/DELETE through POST.
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
      // If 405 Method Not Allowed occurs:
      // It can happen if:
      // 1. Hostinger/Apache redirected a route to index.html or rejected .php
      // 2. Node/Vercel serverless rejected .php extension or vice versa
      if (response.status === 405) {
        let alternateUrl = '';
        if (targetUrl.includes('.php')) {
          // Try without .php extension (e.g. /api/login instead of /api/login.php)
          alternateUrl = targetUrl.replace(/\.php(\?|$)/, '$1');
        } else {
          // Try with .php extension (e.g. /api/login.php instead of /api/login)
          const qIndex = targetUrl.indexOf('?');
          if (qIndex !== -1) {
            alternateUrl = `${targetUrl.slice(0, qIndex)}.php${targetUrl.slice(qIndex)}`;
          } else {
            alternateUrl = `${targetUrl}.php`;
          }
        }

        if (alternateUrl && alternateUrl !== targetUrl) {
          try {
            const retryRes = await fetch(alternateUrl, fetchOptions);
            if (retryRes.ok) {
              const ct = retryRes.headers.get("content-type") || "";
              return ct.includes("application/json") ? await retryRes.json() : await retryRes.text();
            }
          } catch (_) {
            // proceed to error throw below
          }
        }
      }

      const errText = await response.text().catch(() => '');
      throw new Error(`API error [${response.status}]: ${errText || response.statusText || 'Method Not Allowed'}`);
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
    if (retries > 0 && !error?.message?.includes('405') && !error?.message?.includes('403') && !error?.message?.includes('401')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return apiClient(endpoint, options, retries - 1);
    }
    console.error("API fetch failed:", targetUrl, error?.message || error);
    throw error;
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
