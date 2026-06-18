'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/utils/authService';
import { usePublicRoute } from '@/utils/useAuth';

const arenaBackgroundUrl =
  'https://png.pngtree.com/background/20250421/original/pngtree-a-vibrant-esports-gaming-arena-with-multiple-computer-stations-and-large-picture-image_16311784.jpg';

export default function LoginPage() {
  const router = useRouter();
  usePublicRoute();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        setError('Enter your username and password.');
        setIsLoading(false);
        return;
      }

      await authService.login({
        username: username.trim(),
        password: password.trim(),
      });

      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your details and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-[#0f0f1e] bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${arenaBackgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-[#050711]/80"></div>
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between rounded-2xl border border-[#00d4ff]/20 bg-[#111429]/90 p-6 backdrop-blur-sm sm:p-8">
            <div>
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="mb-8 rounded-xl border border-[#00d4ff]/25 px-4 py-2 text-sm font-bold text-[#00d4ff] transition hover:bg-[#00d4ff] hover:text-[#07111f]"
              >
                Back
              </button>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#00d4ff]">GPBET</p>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">Welcome back</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#b0b0b0]">
                Login to manage your points, join Free Fire rooms, and continue your tournament run.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0f1225] p-4">
                <p className="text-2xl font-black text-[#00ff88]">24/7</p>
                <p className="mt-1 text-xs text-[#b0b0b0]">Room access</p>
              </div>
              <div className="rounded-xl bg-[#0f1225] p-4">
                <p className="text-2xl font-black text-[#ff6ba6]">Live</p>
                <p className="mt-1 text-xs text-[#b0b0b0]">Custom matches</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#00d4ff]/20 bg-[#151832]/90 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8fe8ff]">Account Login</p>
                <h2 className="mt-2 text-2xl font-black text-white">Enter your details</h2>
              </div>
              <div className="rounded-xl bg-[#00ff88]/15 px-3 py-2 text-sm font-black text-[#00ff88]">Login</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#eaeaea]">Username</label>
                <input
                  type="text"
                  className="input-field h-12"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#eaeaea]">Password</label>
                <input
                  type="password"
                  className="input-field h-12"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4">
                  <p className="text-sm font-semibold text-[#ff8a8a]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="min-h-12 w-full rounded-xl bg-[#00d4ff] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#07111f] transition hover:bg-[#69e8ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-[#00d4ff]/10 bg-[#0f1225] p-4 text-center">
              <p className="text-sm text-[#b0b0b0]">
                New player?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="font-bold text-[#00d4ff] hover:text-[#8fe8ff]"
                >
                  Create account
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
