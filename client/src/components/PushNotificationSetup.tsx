"use client";

import { useEffect } from "react";

const publicVapidKey =
  process.env.NEXT_PUBLIC_VAPID_KEY ||
  "BCqY9FxHK-7k68m0NvEEJh8jFst9TwEizT3552w_W2nYrnoZCsDG9KNzfAQ-bc3ORVlYStOT6Uuakzm6nl32hZg";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationSetup() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const register = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const registration = await navigator.serviceWorker.register("/sw.js");
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${API_URL}/api/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sub.toJSON()),
        });
      } catch {
        // user denied or not supported
      }
    };

    register();
  }, []);

  return null;
}
