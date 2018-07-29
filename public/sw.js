const CACHE_NAME="VIVA_CACHE";
const urlToCache= [
  '/',
  '/stylesheets/style.css',
  '/javascripts/predicts.js',
  '/javascripts/mobilenet.js'
];

self.addEventListener('install', function (event){
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Open cache ' + CACHE_NAME);
        cache.addAll(urlToCache);
      })
  )
});

self.addEventListener('fetch', function (event){
  event.respondWith(
    caches.match(event.request)
      .then(function (response){
        if(response){
          return response;
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then(function(response) {
            if(!response || response.status != 200 ) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache)
              });
            return response;
          })
      })
  );
});

self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
