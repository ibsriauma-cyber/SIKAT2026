import { useState, useEffect } from 'react';
import { API_URL } from './apiClient';

let listeners: Function[] = [];
let es: EventSource | null = null;

export const initRealtime = () => {
  if (es || typeof window === 'undefined') return;
  
  // Connect to SSE
  es = new EventSource(API_URL + '/events');
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      // Notify all connected components to re-fetch
      listeners.forEach(l => l());
    } catch (err) {}
  };
  
  es.onerror = () => {
    // Reconnect will happen automatically by the browser, but we can log it
    console.log('SSE connection lost, reconnecting...');
  };
};

export const useRealtime = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // Only init once globally
    initRealtime();
    
    const handler = () => setTick(t => t + 1);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter(l => l !== handler);
    };
  }, []);
  return tick;
};
