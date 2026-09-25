import { apiClient } from './apiClient';

class RemoteStorage implements Storage {
  private cache: Record<string, string> = {};

  async init() {
    try {
      const data = await apiClient('/keyval.php');
      this.cache = data || {};
    } catch (e) {
      console.error('Failed to load remote storage', e);
    }
  }

  getItem(key: string): string | null {
    return this.cache[key] !== undefined ? this.cache[key] : null;
  }

  setItem(key: string, value: string) {
    this.cache[key] = value;
    apiClient('/keyval.php', {
      method: 'POST',
      body: JSON.stringify({ key, value })
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
