const CACHE_NAME = "kisanmitraai-offline-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./offline-data.js",
    "./offline.html"
];

// INSTALL: Website ki important files save karo
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            await Promise.all(
                APP_FILES.map(async (file) => {
                    try {
                        await cache.add(file);
                        console.log("Cached:", file);
                    } catch (error) {
                        console.log("Cache failed:", file, error);
                    }
                })
            );

            await self.skipWaiting();
        })()
    );
});

// ACTIVATE: Purana cache remove karo
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );

            await self.clients.claim();
        })()
    );
});

// FETCH: Offline aur online requests handle karo
self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Sirf GET requests handle karo
    if (request.method !== "GET") return;

    // External APIs ko intercept mat karo
    if (url.origin !== self.location.origin) return;

    // Website pages: Network first, cache fallback
    if (request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    const response = await fetch(request);

                    if (response.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(request, response.clone());
                    }

                    return response;

                } catch (error) {
                    return (
                        await caches.match(request) ||
                        await caches.match("./index.html") ||
                        await caches.match("./offline.html") ||
                        new Response("Internet unavailable", {
                            status: 503
                        })
                    );
                }
            })()
        );

        return;
    }

    // CSS, JavaScript aur images: Cache first
    event.respondWith(
        (async () => {
            const cached = await caches.match(request);

            if (cached) return cached;

            try {
                const response = await fetch(request);

                if (response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, response.clone());
                }

                return response;

            } catch (error) {
                return new Response(
                    "Internet connection unavailable.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    }
                );
            }
        })()
    );
});