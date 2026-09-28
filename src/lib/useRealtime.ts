import { useState, useEffect } from 'react';
import { API_URL } from './apiClient';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

let listeners: Function[] = [];
let es: EventSource | null = null;
let firestoreUnsub: (() => void) | null = null;

export const initRealtime = () => {
  if (typeof window === 'undefined') return;

  // 1. Firebase Firestore Realtime Listener (Global Realtime Signal)
  if (!firestoreUnsub) {
    try {
      firestoreUnsub = onSnapshot(doc(db, 'system_test', 'ping'), () => {
        listeners.forEach(l => l());
      }, (err) => {
        console.warn('Firestore realtime listener error:', err.message);
      });
    } catch (e) {
      console.warn('Failed to attach Firestore realtime listener:', e);
    }
  }

  // 2. Server-Sent Events (SSE) Fallback/Companion
  if (!es) {
    try {
      es = new EventSource(API_URL + '/events');
      es.onmessage = () => {
        listeners.forEach(l => l());
      };
      es.onerror = () => {
        // SSE reconnect will happen automatically
      };
    } catch (e) {
      // ignore
    }
  }
};

export const useRealtime = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    initRealtime();

    const handler = () => setTick(t => t + 1);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter(l => l !== handler);
    };
  }, []);
  return tick;
};
