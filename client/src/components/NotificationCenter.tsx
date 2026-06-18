"use client";

import { useEffect, useState, useCallback } from "react";

interface UserNotif {
  _id: string;
  type: string;
  title: string;
  message: string;
  relatedId: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<UserNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.userNotifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  const markAllRead = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "game_win":
        return "🏆";
      case "points_credit":
        return "💰";
      case "points_debit":
        return "💸";
      case "join_accepted":
        return "✅";
      default:
        return "📢";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-[#00d4ff]/20 bg-[#16213e] px-3 py-2 text-sm transition hover:bg-[#00d4ff]/20"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff006e] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[#00d4ff]/20 bg-[#111429] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#00d4ff]/10 px-4 py-3">
              <p className="text-xs font-bold text-[#eaeaea]">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[#00d4ff] underline hover:text-[#69e8ff]"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-xs text-[#b0b0b0]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`border-b border-[#00d4ff]/5 px-4 py-3 transition hover:bg-[#1a1c36] ${
                      !n.read ? "border-l-2 border-l-[#00d4ff]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-lg">{typeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#eaeaea] truncate">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-[#b0b0b0] mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-[#555] mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
