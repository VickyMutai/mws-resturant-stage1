importScripts('/js/idb.js');

let staticCacheName = 'rreview-1.1.0';
let DBName = 'rreview';
let DBVersion = 1;
let dbPromise;


self.addEventListener('activate',  event => {
  event.waitUntil((function(){
    self.clients.claim();
    initDB();
  })());
});


self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf('localhost:1337') >= 0){
    event.respondWith(
      dbPromise.then(function (db) {
        var tx = db.transaction('restaurants', 'readonly');
        var store = tx.objectStore('restaurants');
        return store.getAll();
      }).then(function (items) {
        if (!items.length) {
          return fetch(event.request).then(function (response) {
            return response.clone().json().then(json => {
              console.log('event respond fetch from net');
              addAllData(json);
              return response;
            })
          });
        } else {
          console.log('event respond read from DB');
          let response = new Response(JSON.stringify(items), {
            headers: new Headers({
              'Content-type': 'application/json',
              'Access-Control-Allow-Credentials': 'true'
            }),
            type: 'cors',
            status: 200
          });
          return response;
        }
      })
    );

    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {

      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      return fetch(event.request)
        .then(function(response) {
          return caches.open(staticCacheName).then(function(cache) {
            if (event.request.url.indexOf('maps') < 0) { 
              cache.put(event.request.url, response.clone());
            }
            return response;
          });
        });

    }).catch(function(error) {
      console.log('offline');
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Activating new service worker...');

  let cacheWhitelist = [staticCacheName];

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



function initDB() {
  dbPromise = idb.open(DBName, DBVersion, function (upgradeDb) {
    console.log('making DB Store');
    if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
    }
  });
}

function addAllData(rlist) {
  let tx;
  dbPromise.then(function(db) {
    tx = db.transaction('restaurants', 'readwrite');
    var store = tx.objectStore('restaurants');
    rlist.forEach(function(res) {
      console.log('adding', res);
      store.put(res);
    });
    return tx.complete;
  }).then(function() {
    console.log('All data added to DB successfully');
  }).catch(function(err) {
    tx.abort();
    console.log('error in DB adding', err);
    return false;
  });
}

self.addEventListener('sync', function (event) {
    if (event.tag === 'sync') {
      event.waitUntil(
        sendReviews().then(() => {
          console.log('synced');
        }).catch(err => {
          console.log(err, 'error syncing');
        })
      );
    } else if (event.tag === 'favorite') {
      event.waitUntil(
        sendFavorites().then(() => {
          console.log('favorites synced');
        }).catch(err => {
          console.log(err, 'error syncing favorites');
        })
      );
    }
  });
  
  function sendFavorites() {
    return idb.open('favorite', 1).then(db => {
      let tx = db.transaction('reviewsnfavs', 'readonly');
      return tx.objectStore('reviewsnfavs').getAll();
    }).then(items => {
      return Promise.all(items.map(item => {
        let id = item.id;
        // delete review.id;
        console.log("sending favorite", item);
        // POST review
        return fetch(`http://localhost:1337/restaurants/${item.resId}/?is_favorite=${item.favorite}`, {
          method: 'PUT'
        }).then(response => {
          console.log(response);
          return response.json();
        }).then(data => {
          console.log('added favorite', data);
          if (data) {
            // delete from db
            idb.open('favorite', 1).then(db => {
              let tx = db.transaction('reviewsnfavs', 'readwrite');
              return tx.objectStore('reviewsnfavs').delete(id);
            });
          }
        });
      }));
    });
  }
  
  function sendReviews() {
    return idb.open('review', 1).then(db => {
      let tx = db.transaction('reviewsnfavs', 'readonly');
      return tx.objectStore('reviewsnfavs').getAll();
    }).then(reviews => {
      return Promise.all(reviews.map(review => {
        let reviewID = review.id;
        delete review.id;
        console.log("sending review", review);
        // POST review
        return fetch('http://localhost:1337/reviews', {
          method: 'POST',
          body: JSON.stringify(review),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(response => {
          console.log(response);
          return response.json();
        }).then(data => {
          console.log('added review', data);
          if (data) {
            // delete from db
            idb.open('review', 1).then(db => {
              let tx = db.transaction('reviewsnfavs', 'readwrite');
              return tx.objectStore('reviewsnfavs').delete(reviewID);
            });
          }
        });
      }));
    });
  }
  