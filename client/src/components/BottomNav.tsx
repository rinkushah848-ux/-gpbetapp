'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { label: 'Home', href: '/home', icon: 'Home' },
  { label: 'Profile', href: '/profile', icon: 'User' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#00d4ff]/10 bg-[#0f0f1e] px-5 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        {tabs.map((tab) => {
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
