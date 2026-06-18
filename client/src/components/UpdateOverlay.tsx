"use client";

import { useEffect, useState } from "react";
import { APP_VERSION, checkForUpdate } from "@/utils/version";

export default function UpdateOverlay() {
  const [updateInfo, setUpdateInfo] = useState<{
    show: boolean;
    downloadUrl: string;
  }>({ show: false, downloadUrl: "" });

  useEffect(() => {
    checkForUpdate().then((result) => {
      if (result.needsUpdate) {
        setUpdateInfo({ show: true, downloadUrl: result.downloadUrl });
      }
    });
  }, []);

  if (!updateInfo.show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f0f1e] p-6">
      <div className="w-full max-w-sm rounded-3xl border border-[#00d4ff]/30 bg-[#13162a] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00d4ff]/10 text-4xl">
          📥
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Update Available</h2>
        <p className="text-sm text-[#b0b0b0] mb-2">
          Version <span className="text-[#ffcc00] font-bold">{APP_VERSION}</span> →{" "}
          <span className="text-[#00ff88] font-bold">latest</span>
        </p>
        <p className="text-xs text-[#b0b0b0] mb-6">
          A new version is available. Please download the latest APK to continue.
        </p>
        <a
          href={updateInfo.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-[#00d4ff] px-6 py-4 text-sm font-black text-[#0f0f1e] transition hover:bg-[#69e8ff]"
        >
          Download Update
        </a>
        <button
          onClick={() =>
            (window.location.href =
              "https://gpbetapp.vercel.app")
          }
          className="mt-3 w-full rounded-xl border border-[#00d4ff]/20 px-6 py-3 text-xs font-bold text-[#b0b0b0] transition hover:text-white"
        >
          Visit Website
        </button>
      </div>
    </div>
  );
}
