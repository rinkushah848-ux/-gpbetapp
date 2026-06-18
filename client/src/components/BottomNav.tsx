'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import authService, { User } from '@/utils/authService';

const tabs = [
  { label: 'Home', href: '/home', icon: '🏠' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getMe().then(setUser).catch(() => {});
  }, []);

  const allTabs = tabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f1e] border-t border-[#00d4ff] border-opacity-10 backdrop-blur-md py-3 px-5 shadow-[0_-12px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {allTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                isActive ? 'text-[#00ff88]' : 'text-[#b0b0b0] hover:text-[#00d4ff]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
