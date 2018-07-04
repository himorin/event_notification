self.addEventListener('push', event => {
  return event.waitUntil(
    self.registration.shownotification(
      {
        icon: 'pfs.jpeg',
        body: 'TEST NOTIFICATION',
        tag: 'notification',
        vibrate: [200, 100, 200]
      }
    ));
}, false);

self.addEventListener('notificationclick', event => {
  event.notification.close();
}, false);

