'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { label: 'Home', href: '/home', icon: '⌂' },
  { label: 'Profile', href: '/profile', icon: '◉' },
];

const freeFireTabs = [
  { label: 'Games', href: '/home', icon: '🎮' },
  { label: 'Clash Squad -\nFree Fire', href: '/freefire', icon: '✣' },
  { label: 'Redeem', href: '/profile', icon: '▰' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isFreeFire = pathname === '/freefire';
  const allTabs = isFreeFire ? freeFireTabs : tabs;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 border-t px-5 py-3 backdrop-blur-md shadow-[0_-12px_30px_rgba(0,0,0,0.12)] ${
      isFreeFire ? 'border-[#d7e1e6] bg-[#eef5f9]' : 'border-[#00d4ff]/10 bg-[#0f0f1e]'
    }`}>
      <div className="mx-auto flex max-w-md items-center justify-between">
        {allTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`flex min-w-20 flex-col items-center gap-1 whitespace-pre-line text-center text-xs font-semibold transition-colors ${
                isFreeFire
                  ? isActive ? 'text-[#111820]' : 'text-[#8a9398] hover:text-[#111820]'
                  : isActive ? 'text-[#00ff88]' : 'text-[#b0b0b0] hover:text-[#00d4ff]'
              }`}
            >
              <span className="text-2xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
