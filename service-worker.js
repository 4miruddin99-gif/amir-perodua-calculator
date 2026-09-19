const CACHE_NAME = "amir-perodua-pwa-v4";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./axia.png",
  "./bezza.png",
  "./myvi.png",
  "./ativa.png",
  "./alza.png",
  "./aruz.png",
  "./traz.png",
  "./amir-perodua-header.png"
];

self.addEventListener("install", function(event) {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ASSETS);
      })
  );

  self.skipWaiting();

});


self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches.keys().then(function(names) {

      return Promise.all(

        names.map(function(name) {

          if(name !== CACHE_NAME) {
            return caches.delete(name);
          }

        })

      );

    })

  );

  self.clients.claim();

});


self.addEventListener("fetch", function(event) {

  if(event.request.mode === "navigate") {

    event.respondWith(

      fetch(event.request)
        .then(function(response) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put("./index.html", copy);
            });

          return response;

        })
        .catch(function() {

          return caches.match("./index.html");

        })

    );

    return;

  }


  event.respondWith(

    caches.match(event.request)
      .then(function(cached) {

        return cached || fetch(event.request);

      })

  );

});