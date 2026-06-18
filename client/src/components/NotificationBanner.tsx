"use client";

import { useEffect, useState, useCallback } from "react";

interface InactivityData {
  daysInactive: number;
  showMessage: boolean;
  message: string | null;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
}

export default function NotificationBanner() {
  const [inactivity, setInactivity] = useState<InactivityData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInactivity(data.inactivity);
      setNotifications(data.announcements || []);
    } catch {
      // ignore errors
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (dismissed) return null;

  const hasInactivity = inactivity?.showMessage;
  const hasNotifications = notifications.length > 0;

  if (!hasInactivity && !hasNotifications) return null;

  return (
    <div className="space-y-2 mb-4">
      {hasInactivity && (
        <div className="rounded-2xl border border-[#ffcc00]/30 bg-[#1a1c36] p-4 text-center">
          <p className="text-sm font-bold text-[#ffcc00]">👋 {inactivity?.message}</p>
          <p className="text-[10px] text-[#b0b0b0] mt-1">Come back, rooms are waiting for you!</p>
          <button
            onClick={() => setDismissed(true)}
            className="mt-2 text-[10px] text-[#b0b0b0] underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
      {hasNotifications && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`rounded-2xl border p-4 ${
                n.type === "tournament"
                  ? "border-[#ff6600]/30 bg-[#2a1a0e]"
                  : "border-[#00d4ff]/20 bg-[#13162a]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#00d4ff]">{n.title}</p>
                  <p className="text-sm text-[#eaeaea] mt-1">{n.message}</p>
                </div>
                {n.type === "tournament" && (
                  <span className="shrink-0 rounded-lg bg-[#ff6600]/20 px-2 py-1 text-[10px] font-bold text-[#ff6600]">
                    🏆 LIVE
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
