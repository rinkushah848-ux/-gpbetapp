'use client';

interface TournamentCardProps {
  roomName: string;
  entryFee: number;
  mode: 'CS' | 'BR';
  onJoin: () => void;
}

export default function TournamentCard({ roomName, entryFee, mode, onJoin }: TournamentCardProps) {
  return (
    <div className="card border-[#00d4ff] border-opacity-10 p-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00d4ff] via-[#ff006e] to-[#00ff88]"></div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">{mode} MODE</p>
          <h3 className="text-xl font-bold text-[#eaeaea]">{roomName}</h3>
        </div>
        <div className="text-right">
          <p className="text-[#00ff88] text-sm font-semibold">{entryFee} pts</p>
          <p className="text-[#b0b0b0] text-xs">Entry fee</p>
        </div>
      </div>
      <button
        onClick={onJoin}
        className="w-full btn-primary mt-3"
      >
        Join Room
      </button>
    </div>
  );
}
