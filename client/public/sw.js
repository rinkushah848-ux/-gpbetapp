self.addEventListener("push", function (event) {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || "GPBET Tournament";
    const body = data.body || "";
    const url = data.url || "/";
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: "/icon.png",
        badge: "/icon.png",
        data: { url: url },
      })
    );
  } catch (e) {
    console.error("Push notification error:", e);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
