'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { label: 'Home', href: '/home', icon: 'home' },
  { label: 'Profile', href: '/profile', icon: 'profile' },
];

function NavIcon({ name }: { name: string }) {
  if (name === 'profile') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

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
              <NavIcon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
