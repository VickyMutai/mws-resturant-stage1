let restaurant;
var newMap;
let reviews;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoidmlja3l2aWNreSIsImEiOiJjanFmbHVpMnEwMWh5M3htb2F5dnI1YWg3In0.ig7hJr8q7FKNkS_KIFXPTg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/*
 * fetch reviews
 */
fetchReviews = () => {
  const id = getParameterByName('id');
  if (!id) {
    console.log('No ID in URL');
    return;
  }
  DBHelper.fetchReviewsForRestaurant(id, (err, reviews) => {
    self.reviews = reviews;
    if (err || !reviews) {
      console.log('reviews fetch error', err);
      return;
    }
    fillReviewsHTML();
  });
}


/*
 * set favorite button
 */
setFavoriteButton = (status) => {
  const favorite = document.getElementById('favorite');
  if (status === 'true') {
    favorite.title = 'Restaurant is Favorite';
    favorite.innerHTML = 'Unfavorite';
  } else {
    favorite.title = 'Restaurant is not Favorite';
    favorite.innerHTML = 'Favorite';
  }
}
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  setFavoriteButton(restaurant.is_favorite);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('role', 'listitem');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  //date.innerHTML = getHumanDate(review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/* Managing favorites */
navigator.serviceWorker.ready.then(function (swRegistration) {
  let btn = document.getElementById('favorite');
  // listen to click event
  btn.addEventListener('click', e => {
    const opposite = (self.restaurant.is_favorite === 'true') ? 'false' : 'true';
    console.log('clicked');
    let res = {
      resId: getParameterByName('id'),
      favorite: opposite
    };
    // save to DB
    idb.open('favorite', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('reviewsnfavs', { autoIncrement: true, keyPath: 'id' });
    }).then(function (db) {
      var transaction = db.transaction('reviewsnfavs', 'readwrite');
      return transaction.objectStore('reviewsnfavs').put(res);
    }).then(function () {
      setFavoriteButton(opposite);
      self.restaurant.is_favorite = opposite;
      // register for sync and clean up the form
      return swRegistration.sync.register('favorite').then(() => {
        console.log('Favorite Sync registered');
      });
    });
    // finish
  });
});
navigator.serviceWorker.ready.then(function (swRegistration) {
  let form = document.querySelector('#write-review');
  // listen to submit event
  form.addEventListener('submit', e => {
    e.preventDefault();
    let rating = form.querySelector('#rating');
    let review = {
      restaurant_id: getParameterByName('id'),
      name: form.querySelector('#name').value,
      rating: rating.options[rating.selectedIndex].value,
      comments: form.querySelector('#comment').value
    };
    console.log(review);
    // save to DB
    idb.open('review', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('reviewsnfavs', { autoIncrement: true, keyPath: 'id' });
    }).then(function (db) {
      var transaction = db.transaction('reviewsnfavs', 'readwrite');
      return transaction.objectStore('reviewsnfavs').put(review);
    }).then(function () {
      // register for sync and clean up the form
      return swRegistration.sync.register('sync').then(() => {
        console.log('Sync registered');
        // add review to view (for better UX)
        const ul = document.getElementById('reviews-list');
        // review.createdAt = new Date();
        ul.appendChild(createReviewHTML(review));
      });
    });
    // finish
  });
});

