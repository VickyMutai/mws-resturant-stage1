let staticCacheName = 'restaurant-review-v1';
let URLsToCache = [
    'index.html',
    'restaurant.html',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
    'js/main.js',
    'data/',
    'js/restaurant_info.js',
    'js/dbhelper.js',
    'js/A11yhelper.js',
    'js/indexController.js',
    'css/styles.css',
];

self.addEventListener('install',function(event){
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache){
            return cache.add(URLsToCache);
            console.log("working")
        })
    );
});
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request).then(function(response){
          if(response) return response;
          return fetch(event.request);  
        })
    );   
});
self.addEventListener('activate',function(event){
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.filter(function(cacheName){
                    return cacheName.startsWith('restaurant-')&& cacheName != staticCacheName;
                }).map(function(cacheName){
                    return cache.delete(cacheName);
                })
            );

        })
    );
});