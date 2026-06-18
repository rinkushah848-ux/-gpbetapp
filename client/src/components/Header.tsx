'use client';

type HeaderIcon = 'game' | 'profile' | 'home' | 'wallet' | 'default';

function iconForTitle(title: string): HeaderIcon {
  const normalized = title.toLowerCase();
  if (normalized.includes('free fire')) return 'game';
  if (normalized.includes('profile')) return 'profile';
  if (normalized.includes('deposit')) return 'wallet';
  if (normalized.includes('home')) return 'home';
  // Treat main tournament/home style titles as “tournament/emoji” icon
  if (normalized.includes('tournament')) return 'game';
  return 'default';
}


function HeaderGlyph({ icon }: { icon: HeaderIcon }) {
  if (icon === 'profile') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    );
  }

  if (icon === 'home') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (icon === 'wallet') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16v13H4z" />
        <path d="M4 7l3-4h13v4" />
        <path d="M16 14h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="9" width="18" height="10" rx="4" />
      <path d="M8 13v2" />
      <path d="M7 14h2" />
      <path d="M15.5 14h.01" />
      <path d="M18 13h.01" />
      <path d="M8 9V6h8v3" />
    </svg>
  );
}

export default function Header({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: HeaderIcon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff]">
          <HeaderGlyph icon={icon || iconForTitle(title)} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#eaeaea] md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#b0b0b0]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
