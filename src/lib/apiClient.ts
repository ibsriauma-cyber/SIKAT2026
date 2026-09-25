import { User } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}, retries = 3): Promise<any> => {
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
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API error: ${response.status} ${response.statusText} ${errText}`);
    }
    
    const contentType = response.headers.get("content-type");
    let result;
    if (contentType && contentType.includes("application/json")) {
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
    if (retries > 0) {
      // Exponential backoff or just wait 1s for transient errors like server restarts
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient(endpoint, options, retries - 1);
    }
    console.error("API fetch failed:", url, error);
    throw error;
  }
}

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

