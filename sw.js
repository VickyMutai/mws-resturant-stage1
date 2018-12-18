let cacheName='resturant-review-v1';
let urlsToCache=[
    '/',
    'css/',
    'data/',
    'img/',
    'js/',
    'restaurant.html',
];
function cacheAssets(){
    return caches.open(cacheName).then(cache => {
        return cache.addAll(urlsToCache);
    });
}
function updateCache(){
    return caches.keys().then(function(cacheName){
        return Promise.all(
            cacheName.map(function(cache){
                if (cacheName.indexOf(cache) === -1){
                    return caches.delete(cache);
                }
            })
        );
    });
}
