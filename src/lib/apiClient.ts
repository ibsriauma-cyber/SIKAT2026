import { User } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint === '/sync' ? `${API_URL}/sync.php` : `${API_URL}${cleanEndpoint}`;

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

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API error [${response.status}]: ${errText || response.statusText}`);
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
  
  } catch (error: any) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return apiClient(endpoint, options, retries - 1);
    }
    console.error("API fetch failed:", url, error?.message || error);
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
