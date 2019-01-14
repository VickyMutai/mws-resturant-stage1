self.addEventListener('install',function(event){
    event.waitUntil(
        caches.open('restaurant-review-v1').then(function(cache){
            return cache.addAll( [
                '/',
                'index.html',
                'restaurant.html',
                'sw.js',
                'css/styles.css',
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
                'img/favicon.png',
                // './img/marker-icon-2x-red.png',
                //'img/marker-shadow.png',
                // './js/idb.js',
                'js/dbhelper.js',
                'js/indexController.js',
                // './js/bouncemarker.js',
                'js/main.js',
                'js/restaurant_info.js',
                'http://localhost:1337/restaurants/',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
                'https://fonts.googleapis.com/css?family=Open+Sans:300,400',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
                'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1204/1540.jpg70?access_token=pk.eyJ1Ijoidmlja3l2aWNreSIsImEiOiJjanFmbHVpMnEwMWh5M3htb2F5dnI1YWg3In0.ig7hJr8q7FKNkS_KIFXPT',
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