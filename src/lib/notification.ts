export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendLocalNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      // In a real PWA with a service worker, we would use:
      // navigator.serviceWorker.ready.then(registration => {
      //   registration.showNotification(title, options);
      // });
      
      // Fallback for immediate visual feedback in browser
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });

      notification.onclick = function () {
        window.focus();
        this.close();
      };
    } catch (error) {
      console.error('Error showing notification', error);
    }
  }
};
