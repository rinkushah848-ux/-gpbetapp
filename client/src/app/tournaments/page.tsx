'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import TournamentCard from '@/components/TournamentCard';
import { useProtectedRoute } from '@/utils/useAuth';

const tournamentRooms = [
  { id: 'room-1', name: 'Neon Strike', fee: 10, mode: 'CS' as const },
  { id: 'room-2', name: 'Cyber Royale', fee: 15, mode: 'BR' as const },
  { id: 'room-3', name: 'Dark Squad', fee: 12, mode: 'CS' as const },
  { id: 'room-4', name: 'Phantom Run', fee: 20, mode: 'BR' as const },
];

export default function TournamentsPage() {
  const { isLoading } = useProtectedRoute();
  const [modeFilter, setModeFilter] = useState<'ALL' | 'CS' | 'BR'>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'CS' || mode === 'BR') {
      setModeFilter(mode);
    }
  }, []);

  const filteredRooms = useMemo(() => {
    return modeFilter === 'ALL'
      ? tournamentRooms
      : tournamentRooms.filter((room) => room.mode === modeFilter);
  }, [modeFilter]);

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
        <Header title="Tournaments" subtitle="Choose your battle room" />

        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['ALL', 'CS', 'BR'].map((filter) => (
            <button
              key={filter}
              onClick={() => setModeFilter(filter as 'ALL' | 'CS' | 'BR')}
              className={`min-w-[90px] rounded-xl px-4 py-3 text-sm font-semibold transition ${
                modeFilter === filter
                  ? 'bg-[#00d4ff] text-[#0f0f1e]'
                  : 'bg-[#16213e] text-[#b0b0b0] hover:bg-[#00d4ff] hover:text-[#0f0f1e]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          {filteredRooms.map((room) => (
            <TournamentCard
              key={room.id}
              roomName={room.name}
              entryFee={room.fee}
              mode={room.mode}
              onJoin={() => setSelectedRoom(room.id)}
            />
          ))}
        </div>

        {selectedRoom && (() => {
          const room = tournamentRooms.find((r) => r.id === selectedRoom);
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center md:p-8">
              <div className="w-full max-w-md rounded-3xl bg-[#12142c] border border-[#00d4ff] border-opacity-20 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-[#eaeaea] mb-3">Confirm Join</h3>
                <p className="text-[#b0b0b0] mb-6">Join <span className="text-[#00d4ff] font-semibold">{room?.name}</span> for <span className="text-[#00ff88] font-semibold">{room?.fee} points</span>?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="w-full btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoom(null);
                    }}
                    className="w-full btn-primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      <BottomNav />
    </div>
  );
}
