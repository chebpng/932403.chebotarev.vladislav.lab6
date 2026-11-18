const CACHE_NAME = "lab6-cache-v4";

const PRECACHE_URLS = [
    "/",
    "/about",
    "/style.css",
    "/catalog.js",
    "/dom.js",
    "/script.js",
    "/pwa.js",
    "/manifest.json",
    "/images/avatar.jpg",
    "/images/cover-1.svg",
    "/images/cover-2.svg",
    "/images/cover-3.svg",
    "/images/cover-4.svg",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

self.addEventListener("install", function (event) {

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function () {

            return self.skipWaiting();
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (key === CACHE_NAME) {
                    return Promise.resolve(false);
                }
                return caches.delete(key);
            }));
        }).then(function () {

            return self.clients.claim();
        })
    );
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);

        await cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response(JSON.stringify({ error: "Офлайн: данные недоступны" }), {
            status: 503,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    }
}

async function navigationFirst(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || await caches.match("/");
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
    }
    return response;
}

self.addEventListener("fetch", function (event) {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(navigationFirst(request));
        return;
    }

    event.respondWith(cacheFirst(request));
});
