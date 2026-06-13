// public/sw.js
self.addEventListener('push', function (event) {
    console.log('Push message received.');

    let notificationData = {};
    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData = {
                title: 'New Update',
                body: event.data.text()
            };
        }
    } else {
        notificationData = {
            title: 'YUGA Study Reminder',
            body: 'Time for your daily micro-learning session!'
        };
    }

    const title = notificationData.title || 'YUGA Study Reminder';
    const options = {
        body: notificationData.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
            url: notificationData.url || '/'
        },
        actions: [
            { action: 'explore', title: 'Start Learning', icon: '/icon-192x192.png' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

    // Check if there is already a window/tab open with the target URL
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    })
        .then((windowClients) => {
            let matchingClient = null;

            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                if (windowClient.url === urlToOpen) {
                    matchingClient = windowClient;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        });

    event.waitUntil(promiseChain);
});
