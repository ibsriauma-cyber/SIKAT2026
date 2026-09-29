import { apiClient } from './apiClient';

class RemoteStorage implements Storage {
  private cache: Record<string, string> = {};
  private initPromise: Promise<Record<string, string>> | null = null;
  private listeners: (() => void)[] = [];

  async init(): Promise<Record<string, string>> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      try {
        const data = await apiClient('/keyval.php');
        if (data && typeof data === 'object') {
          this.cache = { ...this.cache, ...data };
        }
        this.listeners.forEach(fn => fn());
      } catch (e) {
        console.error('Failed to load remote storage', e);
      }
      return this.cache;
    })();
    return this.initPromise;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getItem(key: string): string | null {
    return this.cache[key] !== undefined ? this.cache[key] : null;
  }

  getAll(): Record<string, string> {
    return { ...this.cache };
  }

  setItem(key: string, value: string) {
    this.cache[key] = String(value);
    apiClient('/keyval.php', {
      method: 'POST',
      body: JSON.stringify({ key, value: String(value) })
    }).catch(e => console.error('Failed to save to remote storage', e));
  }

  removeItem(key: string) {
    delete this.cache[key];
    apiClient(`/keyval.php?key=${encodeURIComponent(key)}`, {
      method: 'DELETE'
    }).catch(e => console.error('Failed to delete from remote storage', e));
  }
  
  clear() {
    this.cache = {};
    apiClient('/keyval.php', { method: 'DELETE' }).catch(e => console.error('Failed to clear remote storage', e));
  }

  get length() {
    return Object.keys(this.cache).length;
  }

  key(index: number) {
    return Object.keys(this.cache)[index] || null;
  }
}

export const remoteStorage = new RemoteStorage();
