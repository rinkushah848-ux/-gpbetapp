'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import authService, { User } from '@/utils/authService';
import apiService from '@/utils/apiService';
import { useProtectedRoute } from '@/utils/useAuth';

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading } = useProtectedRoute();
  const [user, setUser] = useState<User | null>(null);
  const [redeemAmount, setRedeemAmount] = useState(30);
  const [esewaNumber, setEsewaNumber] = useState('');
  const [esewaScreenshot, setEsewaScreenshot] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

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

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRedeem = async () => {
    setRedeemError('');
    setRedeemMessage('');

    if (!esewaNumber.trim()) {
      setRedeemError('Enter your eSewa number.');
      return;
    }
    if (redeemAmount < 30 || redeemAmount > 1000) {
      setRedeemError('Redeem amount must be between 30 and 1000 points.');
      return;
    }

    setRedeemLoading(true);
    try {
      await apiService.requestWithdraw(redeemAmount, esewaNumber.trim(), esewaScreenshot);
      setRedeemMessage('Redeem request sent.');
      setEsewaNumber('');
      setEsewaScreenshot('');
      setRedeemAmount(30);
      const data = await authService.getMe();
      setUser(data);
    } catch (err: any) {
      setRedeemError(err.response?.data?.error || 'Failed to send redeem request.');
    } finally {
      setRedeemLoading(false);
    }
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

        <div className="card mt-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#b0b0b0]">Redeem Request</p>
              <h2 className="text-2xl font-bold text-[#eaeaea]">Redeem to eSewa</h2>
            </div>
            <div className="rounded-2xl border border-[#60bb46]/30 bg-[#60bb46]/15 px-4 py-3 text-center">
              <p className="text-xl font-black text-[#60bb46]">eSewa</p>
              <p className="text-[10px] font-semibold text-[#9fe58f]">Wallet</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-[#b0b0b0]">Enter your eSewa number</label>
              <input
                value={esewaNumber}
                onChange={(event) => setEsewaNumber(event.target.value)}
                inputMode="numeric"
                placeholder="98XXXXXXXX"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-[#b0b0b0]">Enter amount</label>
              <input
                type="number"
                min={30}
                max={1000}
                value={redeemAmount}
                onChange={(event) => setRedeemAmount(Number(event.target.value))}
                className="input-field"
              />
              <p className="mt-2 text-[11px] font-semibold text-[#7f9cb2]">Minimum 30 points, maximum 1000 points.</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-[#b0b0b0]">Enter your eSewa QR / add screenshot</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#00d4ff]/40 bg-[#13162a] px-4 py-5 text-center transition hover:border-[#00d4ff]">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) setEsewaScreenshot(await toBase64(file));
                  }}
                />
                <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#00d4ff]/40 text-[#00d4ff]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
                <span className="text-sm font-bold text-[#00d4ff]">Add Screenshot</span>
              </label>
              {esewaScreenshot && <img src={esewaScreenshot} alt="eSewa QR preview" className="mt-3 max-h-44 w-full rounded-xl object-cover" />}
            </div>

            {redeemError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300">{redeemError}</p>}
            {redeemMessage && <p className="rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/10 px-3 py-2 text-sm font-bold text-[#00ff88]">{redeemMessage}</p>}

            <button
              onClick={handleRedeem}
              disabled={redeemLoading}
              className="w-full rounded-xl bg-[#60bb46] px-4 py-3 text-sm font-extrabold text-[#061306] transition hover:bg-[#7fd166] disabled:bg-[#555] disabled:text-[#aaa]"
            >
              {redeemLoading ? 'Sending...' : 'Redeem Request'}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
