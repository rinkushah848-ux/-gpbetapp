'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/utils/authService';
import { usePublicRoute } from '@/utils/useAuth';

const arenaBackgroundUrl =
  'https://png.pngtree.com/background/20250421/original/pngtree-a-vibrant-esports-gaming-arena-with-multiple-computer-stations-and-large-picture-image_16311784.jpg';

export default function RegisterPage() {
  const router = useRouter();
  usePublicRoute();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    uid: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.username.trim() || !formData.password.trim() || !formData.uid.trim()) {
        setError('Username, game UID, and password are required.');
        setIsLoading(false);
        return;
      }

      if (formData.username.trim().length < 3) {
        setError('Username must be at least 3 characters.');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      await authService.register({
        username: formData.username.trim().toLowerCase(),
        password: formData.password.trim(),
        uid: formData.uid.trim(),
      });

      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Register error:', err);
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
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">Create account</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#b0b0b0]">
                Register your player name and Free Fire UID so tournament rooms can match your account.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0f1225] p-4">
                <p className="text-2xl font-black text-[#00ff88]">0</p>
                <p className="mt-1 text-xs text-[#b0b0b0]">Start points</p>
              </div>
              <div className="rounded-xl bg-[#0f1225] p-4">
                <p className="text-2xl font-black text-[#ff6ba6]">UID</p>
                <p className="mt-1 text-xs text-[#b0b0b0]">Linked player</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#00d4ff]/20 bg-[#151832]/90 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8fe8ff]">New Player</p>
                <h2 className="mt-2 text-2xl font-black text-white">Setup your profile</h2>
              </div>
              <div className="rounded-xl bg-[#ff006e]/15 px-3 py-2 text-sm font-black text-[#ff6ba6]">Register</div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#eaeaea]">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="input-field h-12"
                    placeholder="Player name"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#eaeaea]">Game UID</label>
                  <input
                    type="text"
                    name="uid"
                    className="input-field h-12"
                    placeholder="Free Fire UID"
                    value={formData.uid}
                    onChange={handleChange}
                    disabled={isLoading}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#eaeaea]">Password</label>
                <input
                  type="password"
                  name="password"
                  className="input-field h-12"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#eaeaea]">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input-field h-12"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-[#00d4ff]/10 bg-[#0f1225] p-4 text-center">
              <p className="text-sm text-[#b0b0b0]">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="font-bold text-[#00d4ff] hover:text-[#8fe8ff]"
                >
                  Login
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
