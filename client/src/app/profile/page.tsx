'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import authService, { User } from '@/utils/authService';
import { useProtectedRoute } from '@/utils/useAuth';

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading } = useProtectedRoute();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00d4ff] border-opacity-30 border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#b0b0b0]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e] pb-28 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        <Header title="Profile" subtitle="Manage your account" />

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Username</p>
              <h2 className="text-2xl font-bold text-[#eaeaea]">{user?.username}</h2>
              {user?.role === 'admin' && <span className="text-[10px] text-[#ffcc00] font-bold bg-[#ffcc00]/10 px-2 py-0.5 rounded mt-1 inline-block">ADMIN</span>}
            </div>
            <div className="rounded-3xl bg-[#00d4ff] bg-opacity-10 px-4 py-3 text-[#00d4ff] font-semibold">{user?.uid}</div>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => router.push('/admin')} className="w-full mb-4 rounded-xl bg-[#ffcc00]/20 text-[#ffcc00] px-4 py-3 text-sm font-bold hover:bg-[#ffcc00] hover:text-[#0f0f1e] transition">
              ⚙️ Admin Panel
            </button>
          )}
          <p className="text-[#b0b0b0] mb-6">Your profile information and tournament balance.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-[#13162a] rounded-3xl p-5 border border-[#00d4ff] border-opacity-10">
              <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Points Balance</p>
              <p className="text-3xl font-bold text-[#00ff88]">{user?.points ?? 0}</p>
              <button
                onClick={() => router.push('/deposit')}
                className="mt-3 w-full rounded-xl bg-[#00d4ff] bg-opacity-20 text-[#00d4ff] px-4 py-2 text-sm font-bold hover:bg-[#00d4ff] hover:text-[#0f0f1e] transition"
              >
                + Deposit
              </button>
            </div>
            <div className="bg-[#13162a] rounded-3xl p-5 border border-[#ff006e] border-opacity-10">
              <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Game UID</p>
              <p className="text-xl font-semibold text-[#00d4ff]">{user?.uid}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4">
            <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Account Details</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-[#00d4ff] border-opacity-10 pb-3">
                <span className="text-[#b0b0b0]">Username</span>
                <span className="text-[#eaeaea] font-semibold">{user?.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#00d4ff] border-opacity-10 pb-3">
                <span className="text-[#b0b0b0]">Game UID</span>
                <span className="text-[#eaeaea] font-semibold">{user?.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#b0b0b0]">Status</span>
                <span className="text-[#00ff88] font-semibold">Online</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-primary">
            Logout
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
