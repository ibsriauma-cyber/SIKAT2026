import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { Toaster, toast } from 'react-hot-toast';

// Override window.alert globally
const originalAlert = window.alert;
window.alert = (msg) => {
  if (!msg) return;
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('berhasil') || lowerMsg.includes('sukses')) {
    toast.success(msg, { duration: 3000 });
  } else if (lowerMsg.includes('gagal') || lowerMsg.includes('error') || lowerMsg.includes('peringatan') || lowerMsg.includes('mohon') || lowerMsg.includes('tidak')) {
    toast.error(msg, { duration: 4000 });
  } else {
    toast(msg, { duration: 3000 });
  }
};

import './index.css';


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}




if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  }).catch(function(err) {
    console.log('Service Worker registration failed: ', err);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" reverseOrder={false} toastOptions={{ className: 'font-medium text-sm rounded-xl shadow-lg border border-slate-100', style: { padding: '12px 16px', background: '#fff', color: '#334155' }, success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
  </StrictMode>,
);
