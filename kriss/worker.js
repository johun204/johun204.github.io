const expectedCaches = ['static-v1'],
   resources = [
  'sticky-footer-navbar.css',
  'js/bootstrap.bundle.min.js',
  'js/bootstrap.bundle.min.js.map',
  'js/darkmode-js.min.js',
  'js/jquery-3.6.0.min.js',
  'js/restore.js',
  'offline.html',
  'index.html',
  'js/index.js',
  'input.html',
  'js/input.js',
  'paragraph.html',
  'js/paragraph.js',
  'text.html',
  'js/text.js',
  'js/word.js',
  'qna.html',
  'js/qna.js',
  'num-remove.html',
  'js/num-remove.js',
  'css/bootstrap.min.css',
  'css/bootstrap.min.css.map',
  'css/bootstrap.rtl.min.css',
  'css/bootstrap.rtl.min.css.map',
  '/kriss',
  '/kriss/'
 ];
self.addEventListener('install', event => {
 console.log('installing..');
event.waitUntil(
  caches.open(expectedCaches[0]).then(cache => cache.addAll(resources))
 )
});
self.addEventListener('foreignfetch', event => {
 event.respondWith(fetch(event.request).then(response => {
  return {
   response: response,
   origin: event.origin,
   headers: ['Content-Type']
  }
 }));
});
self.addEventListener('activate', function(e) {
  var expectedCacheNames = expectedCaches[0];
e.waitUntil(
    caches.keys().then(function(keyList) {
          return Promise.all(
   keyList.map(function(key) {
            if (expectedCacheNames.indexOf(key) == -1) {
       return caches.delete(key);
      }
   })
  );
    })
  );
});
self.addEventListener('fetch', function(event) {
 event.respondWith(
  caches.open(expectedCaches[0]).then(function(cache) {
   if (event.request.clone().method == "GET") {
      return cache.match(event.request).then(function(response) {
      var fetchPromise = fetch(event.request).then(function(networkResponse) {
       cache.put(event.request, networkResponse.clone());
       return networkResponse;
      });
      return response || fetchPromise;
      });
   }
  })
 );
});