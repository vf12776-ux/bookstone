// ВАЖНО: При любых серьезных изменениях в сайте меняем версию здесь (например, на 'bookstone-v3')
const CACHE_NAME = 'bookstone-v4'; 

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// 1. Установка: кэшируем файлы
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
    self.skipWaiting(); // Заставляем новый Service Worker активироваться сразу
});

// 2. Активация: удаляем старый кэш, чтобы не занимать место и не показывать старые файлы
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim(); // Новый SW сразу берет под контроль все открытые вкладки
});

// 3. Перехват запросов: отдаем из кэша, а если там нет — качаем из сети
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});