self.addEventListener('install',function(event){
    event.waitUntil(
        caches.open('restaurant-review-v1').then(function(cache){
            return cache.addAll( [
                './',
                './index.html',
                './restaurant.html',
                './sw.js',
                './css/styles.css',
                './img/1.jpg',
                './img/2.jpg',
                './img/3.jpg',
                './img/4.jpg',
                './img/5.jpg',
                './img/6.jpg',
                './img/7.jpg',
                './img/8.jpg',
                './img/9.jpg',
                './img/10.jpg',
                // './img/marker-icon-2x-red.png',
                // './img/marker-shadow.png',
                // './js/idb.js',
                './js/dbhelper.js',
                './js/indexController.js',
                // './js/bouncemarker.js',
                './js/main.js',
                './js/restaurant_info.js',
                'http://localhost:1337/restaurants/',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
                'https://fonts.googleapis.com/css?family=Open+Sans:300,400',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
            ]
            );
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
                    return cacheName.startsWith('restaurant-')&& cacheName != 'restaurant-review-v1';
                }).map(function(cacheName){
                    return cache.delete(cacheName);
                })
            );

        })
    );
});