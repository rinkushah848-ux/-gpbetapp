'use client';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-[#00d4ff] bg-opacity-15 flex items-center justify-center text-2xl">🎮</div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#eaeaea]">{title}</h1>
          {subtitle && <p className="text-[#b0b0b0] text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
