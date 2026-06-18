'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePublicRoute } from '@/utils/useAuth';

const arenaBackgroundUrl =
  'https://png.pngtree.com/background/20250421/original/pngtree-a-vibrant-esports-gaming-arena-with-multiple-computer-stations-and-large-picture-image_16311784.jpg';

export default function AuthPage() {
  const router = useRouter();
  usePublicRoute();

  return (
    <div
      className="relative min-h-screen bg-[#0f0f1e] bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${arenaBackgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-[#050711]/80"></div>
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-2xl border border-[#00d4ff]/20 bg-[#111429]/90 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#00d4ff]">GPBET</p>
            <h1 className="text-4xl font-black text-white sm:text-5xl">Tournament System</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#b0b0b0]">
              Join Free Fire custom rooms, track points, and enter admin-created tournaments from one account.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => router.push('/register')}
              className="group rounded-2xl border border-[#00d4ff]/15 bg-[#151832] p-6 text-left transition hover:border-[#00ff88]/60 hover:bg-[#172039]"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ff88]/15 text-lg font-black text-[#00ff88]">
                +
              </div>
              <h2 className="text-2xl font-black text-white">Create Account</h2>
              <p className="mt-3 text-sm leading-6 text-[#b0b0b0]">
                New player setup with username, Free Fire UID, and starting points.
              </p>
              <span className="mt-6 inline-flex rounded-xl bg-[#00ff88] px-4 py-2 text-sm font-black text-[#07111f] transition group-hover:bg-[#8cffb8]">
                Start
              </span>
            </button>

            <button
              onClick={() => router.push('/login')}
              className="group rounded-2xl border border-[#00d4ff]/15 bg-[#151832] p-6 text-left transition hover:border-[#00d4ff]/60 hover:bg-[#172039]"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00d4ff]/15 text-lg font-black text-[#00d4ff]">
                in
              </div>
              <h2 className="text-2xl font-black text-white">Login</h2>
              <p className="mt-3 text-sm leading-6 text-[#b0b0b0]">
                Continue to your dashboard, point balance, and tournament rooms.
              </p>
              <span className="mt-6 inline-flex rounded-xl bg-[#00d4ff] px-4 py-2 text-sm font-black text-[#07111f] transition group-hover:bg-[#69e8ff]">
                Continue
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
