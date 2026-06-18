'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import NotificationBanner from '@/components/NotificationBanner';
import authService, { User } from '@/utils/authService';
import { useProtectedRoute } from '@/utils/useAuth';

const freeFireImageUrl =
  'https://m.media-amazon.com/images/M/MV5BMTI3MTE3ZGQtNWJmMi00MTAzLWI2MzYtZTFiMDRkMzU0ZjE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg';

export default function HomePage() {
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Header title="Home" subtitle={`Welcome, ${user?.username || 'Gamer'}`} />
        <NotificationBanner />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-[#13162a] p-6 border border-[#00d4ff] border-opacity-10">
            <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-3">Game UID</p>
            <h2 className="text-3xl font-bold text-[#00d4ff]">{user?.uid || 'N/A'}</h2>
          </div>
          <div className="rounded-3xl bg-[#13162a] p-6 border border-[#ff006e] border-opacity-10">
            <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-3">Points</p>
            <h2 className="text-3xl font-bold text-[#00ff88]">{user?.points ?? 0}</h2>
          </div>
        </div>

        <div
          className="relative cursor-pointer overflow-hidden rounded-3xl border border-[#00d4ff] border-opacity-10 bg-[#1a1c36] shadow-xl transition hover:scale-[1.01]"
          onClick={() => router.push('/freefire')}
        >
          <div className="relative h-72 bg-[#101225] p-6">
            <img
              src={freeFireImageUrl}
              alt="Free Fire"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060713] via-[#06071399] to-[#06071322]"></div>
            <div className="relative h-full flex flex-col justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] bg-opacity-20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#00d4ff]">
                  <img src={freeFireImageUrl} alt="" className="h-6 w-6 rounded-lg object-cover" />
                  Free Fire
                </span>
                <h2 className="text-3xl font-bold text-[#ffffff]">Free Fire Tournament</h2>
                <p className="max-w-xl text-sm text-[#c4c4c4]">
                  Click the image to open the dedicated Free Fire room page.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-[#00000080] p-4 text-sm text-[#b0b0b0]">
                <span>Free Fire Arena</span>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00ff88] px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:bg-[#8cff9a]">
                  <img src={freeFireImageUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                  Open Free Fire
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#00d4ff] border-opacity-10 bg-[#13162a] p-6 text-center">
          <p className="text-[#b0b0b0] mb-3">Tap the Free Fire image above to open the main tournament room page.</p>
          <p className="text-sm text-[#7f9cb2]">On the new page you will see the room list and your tournament custom details.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
