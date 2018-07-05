self.addEventListener('push', function(evdat) {
  if (! evdat.data) return ;
  var show_dat = evdat.data.json();
  show_dat.data = evdat.data.json();
  return evdat.waitUntil(
    self.registration.showNotification(show_dat.title, show_dat));
}, false);

self.addEventListener('notificationclick', function(evdat) {
  evdat.notification.close();
  var show_dat = evdat.notification.data;
  if (show_dat) {
    evdat.waitUntil(clients.openWindow(show_dat.url));
    console.log(show_dat.url);
  }
}, false);

