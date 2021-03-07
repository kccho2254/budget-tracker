const FILES_TO_CACHE = [
    '/',
    '/styles.css',
    '/index.html',
    '/index.js',
    '/db.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/dist/index.bundle.js',
    '/dist/db.bundle.js',
    '/dist/manifest.json',
    '/dist/bundle.js',
    '/dist/icon-192x192.png',
    '/dist/icon-512x512.png',
  ];
  
  // const STATIC_CACHE = "static-cache-v1";
  // const RUNTIME_CACHE = "runtime-cache";
  
  // self.addEventListener("install", event => {

  //   console.log("install");
  //   event.waitUntil(
  //     caches
  //       .open(STATIC_CACHE)
  //       .then(cache => cache.addAll(FILES_TO_CACHE))
  //       .then(() => self.skipWaiting())
  //   );

  //   console.log("Your files were pre-cached successfully!");
  // });
  
  // // The activate handler takes care of cleaning up old caches.
  // // this code does nothing right now
  // self.addEventListener("activate", event => {

  //   console.log("activate");

  //   const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  //   event.waitUntil(
  //     caches
  //       .keys()
  //       .then(cacheNames => {
  //         // return array of cache names that are old to delete
  //         return cacheNames.filter(
  //           cacheName => !currentCaches.includes(cacheName)
  //         );
  //       })
  //       .then(cachesToDelete => {
  //         return Promise.all(
  //           cachesToDelete.map(cacheToDelete => {
  //             return caches.delete(cacheToDelete);
  //           })
  //         );
  //       })
  //       .then(() => self.clients.claim())
  //   );
  // });

  
  // self.addEventListener("fetch", event => {
  //   // non GET requests are not cached and requests to other origins are not cached
  //   console.log("fetch")
  //   if (
  //     event.request.method !== "GET" ||
  //     !event.request.url.startsWith(self.location.origin)
  //   ) {
  //     event.respondWith(fetch(event.request));
  //     return;
  //   }
  
  //   // handle runtime GET requests for data from /api routes
  //   if (event.request.url.includes("/")) {
  //     // make network request and fallback to cache if network request fails (offline)
  //     event.respondWith(
  //       caches.open(RUNTIME_CACHE).then(cache => {
  //         return fetch(event.request)
  //           .then(response => {
  //             cache.put(event.request, response.clone());
  //             return response;
  //           })
  //           .catch(() => caches.match(event.request));
  //       })
  //     );
  //     return;
  //   }
  
  //   // use cache first for all other requests for performance
  //   event.respondWith(
  //     caches.match(event.request).then(cachedResponse => {
  //       if (cachedResponse) {
  //         return cachedResponse;
  //       }
  
  //       // request is not in cache. make network request and cache the response
  //       return caches.open(RUNTIME_CACHE).then(cache => {
  //         return fetch(event.request).then(response => {
  //           return cache.put(event.request, response.clone()).then(() => {
  //             return response;
  //           });
  //         });
  //       });
  //     })
  //   );
  // });
  

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";


// install
self.addEventListener("install", function(event) {

  console.log("install");

  const cacheResources = async () => {
    const resourceCache = await caches.open(CACHE_NAME);
    return resourceCache.addAll(FILES_TO_CACHE);
  }
  // More info: https://developer.mozilla.org/en-US/docs/Web/API/Cache/addAll

  self.skipWaiting(); // Any previous service worker running on this site. Override now!
  // More info: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting

  event.waitUntil(cacheResources()); // Hey browser! Do not stop me. I am adding resources (such as pages and images) to the cache API.
  // More info: https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil

  console.log("Your files were pre-cached successfully!");
});

// activate
self.addEventListener("activate", function(event) {

  console.log("activate");

  const removeOldCache = async () => {
    const cacheKeyArray = await caches.keys();
  
    const cacheResultPromiseArray = cacheKeyArray.map(key => {
      if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
        console.log("Removing old cache data", key);
        return caches.delete(key);
      }
    });
    // More info: https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete
  
    return Promise.all(cacheResultPromiseArray);
  }

  event.waitUntil(removeOldCache());  // Hey browser! Do not stop me. I am now deleting old caches from the cache API.
  // More info: https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil


  self.clients.claim();
  // More info: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
});

// fetch
self.addEventListener("fetch", function(event) {

  console.log("fetch", event.request.url);

  const handleAPIDataRequest = async (event) => {
    try {
      const response = await fetch(event.request);
      // If the response was good, clone it and store it in the cache.
      if (response.status === 200) {
        console.log(`Adding API request to cache now: ${event.request.url}`);

        const apiCache = await caches.open(DATA_CACHE_NAME);
        await apiCache.put(event.request.url, response.clone());

        return response;
      }
    } catch(error) {
      // Network request failed, try to get it from the cache.
      console.log(`Network error occurred with API request. Now retrieving it from the cache: ${event.request.url}`)
      return await caches.match(event.request);
    }
  }
  
  const handleResourceRequest = async (event) => {
    const matchedCache = await caches.match(event.request);
    return matchedCache ||  await fetch(event.request);
  }
  
  // cache successful requests to the API
  if (event.request.url.includes("/api/")) {
    event.respondWith(handleAPIDataRequest(event));
  } else {
    // if the request is not for the API, serve static assets using "offline-first" approach.
    // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
    event.respondWith(handleResourceRequest(event));
  }

});