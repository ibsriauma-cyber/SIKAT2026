import { apiClient } from './apiClient';

export const dbClient = {
  get: async (table: string) => {
    return apiClient(`/crud.php?table=${table}`);
  },
  insert: async (table: string, data: any) => {
    return apiClient(`/crud.php?table=${table}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  update: async (table: string, id: string | number, data: any) => {
    return apiClient(`/crud.php?table=${table}&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  delete: async (table: string, id: string | number) => {
    return apiClient(`/crud.php?table=${table}&id=${id}`, {
      method: 'DELETE'
    });
  }
};
