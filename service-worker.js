const CACHE_NAME = "v1";

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                './assets/flappy-sprite.png',
                './assets/icons/icon-72x72.png',
                './assets/icons/icon-96x96.png',
                './assets/icons/icon-128x128.png',
                './assets/icons/icon-144x144.png',
                './assets/icons/icon-152x152.png',
                './assets/icons/icon-192x192.png',
                './assets/icons/icon-384x384.png',
                './assets/icons/icon-512x512.png',
                './modules/constants.mjs',
                './favicon.png',
                './index.html',
                './script.js',
                './style.css'
            ])
        })
    )
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(resp => {
            return resp || fetch(event.request).then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
        })
    )
});


self.addEventListener('activate', event => {
    const whiteList = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if(whiteList.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    )
});