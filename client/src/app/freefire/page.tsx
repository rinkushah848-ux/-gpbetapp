'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import NotificationBanner from '@/components/NotificationBanner';
import authService, { User } from '@/utils/authService';
import apiService, { RoomData, GameData } from '@/utils/apiService';
import { useProtectedRoute } from '@/utils/useAuth';

const ffChars = ['Alok', 'Hayato', 'Kla', 'Moco', 'Paloma', 'Sonia', 'Andrew', 'Caroline', 'Olivia', 'Wukong', 'Dimitri', 'Wolfrahh', 'Steffie', 'Nairi', 'Jota', 'Lila'];
const ffGuns = ['M1014', 'MP40', 'AK47', 'SCAR', 'M14', 'AWM', 'SVD', 'M82B', 'M4A1', 'MP5', 'UMP', 'Vector', 'P90', 'FAMAS', 'AN94', 'GROZA', 'X8', 'AC80'];

export default function FreeFirePage() {
  const { isLoading } = useProtectedRoute();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'main' | 'tournament' | 'room'>('main');
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [myRoom, setMyRoom] = useState<RoomData | null>(null);
  const [reviewGames, setReviewGames] = useState<GameData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const data = await authService.getMe();
        setUser(data);
        const rms = await apiService.getRooms();
        setRooms(rms);
        const mine = await apiService.getMyRoom();
        setMyRoom(mine);
      } catch (err) { console.error(err); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const rms = await apiService.getRooms();
        setRooms(rms);
        const mine = await apiService.getMyRoom();
        setMyRoom(mine);
      } catch (err) { console.error(err); }
    };
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    apiService.getPendingReviews().then(setReviewGames).catch(() => {});
  }, [user]);

  const refreshRooms = async () => {
    try {
      const rms = await apiService.getRooms();
      setRooms(rms);
      const mine = await apiService.getMyRoom();
      setMyRoom(mine);
    } catch (err) { console.error(err); }
  };

  // ---- Room creation form state ----
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState(10);
  const [newType, setNewType] = useState('lonewolf');
  const [newSize, setNewSize] = useState('1v1');
  const [newCharAbility, setNewCharAbility] = useState('yes');
  const [newChar, setNewChar] = useState('');
  const [newGun, setNewGun] = useState('');
  const [newHS, setNewHS] = useState('yes');
  const [newRounds, setNewRounds] = useState('7');
  const [newCoin, setNewCoin] = useState('Default');
  const [newThrow, setNewThrow] = useState('yes');
  const [newUnGuns, setNewUnGuns] = useState<string[]>([]);
  const [newUnChars, setNewUnChars] = useState<string[]>([]);
  const [newUnArmor, setNewUnArmor] = useState('Vest Lv3, Helmet Lv3');

  const handleCreate = async () => {
    setError('');
    try {
      const room = await apiService.createRoom({
        name: newName.trim() || `${user?.username}'s room`, fee: newFee, type: newType, size: newSize,
        headshot: newHS, rounds: newRounds, coin: newCoin, throwable: newThrow,
        charAbility: newCharAbility, character: newCharAbility === 'yes' ? newChar : '',
        gun: newCharAbility === 'yes' ? newGun : '',
        unallowedGuns: newCharAbility === 'no' ? newUnGuns : [],
        unallowedChars: newCharAbility === 'no' ? newUnChars : [],
        unallowedArmor: newUnArmor,
      });
      setRooms(prev => [room, ...prev]);
      setMyRoom(room);
      setShowCreate(false);
      resetCreateForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  const resetCreateForm = () => {
    setNewName(''); setNewFee(10); setNewType('lonewolf'); setNewSize('1v1');
    setNewCharAbility('yes'); setNewChar(''); setNewGun('');
    setNewHS('yes'); setNewRounds('7'); setNewCoin('Default'); setNewThrow('yes');
    setNewUnGuns([]); setNewUnChars([]); setNewUnArmor('Vest Lv3, Helmet Lv3');
  };

  const canCreate = !myRoom;

  const tabs = [
    { key: 'main' as const, label: 'Main', icon: '🏠' },
    { key: 'tournament' as const, label: 'Tournament', icon: '🏆' },
    { key: 'room' as const, label: 'Room', icon: '🚪' },
  ];

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
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-4">
          <Header title="Free Fire" subtitle="Custom rooms" />
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-2xl border border-[#00ff88]/20 bg-[#10251f] px-4 py-3 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8fe8bd]">Points</p>
              <p className="text-2xl font-bold text-[#00ff88]">{user?.points ?? 0}</p>
            </div>
          </div>
        </div>
        <NotificationBanner />

        <div className="flex gap-3">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === t.key ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0] hover:bg-[#00d4ff] hover:text-[#0f0f1e]'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'main' && (
          <section className="space-y-4">
            {rooms.length === 0 ? (
              <div className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-8 text-center">
                <p className="text-[#b0b0b0] text-sm">No rooms yet. Switch to Room tab to create one.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  user={user}
                  myRoom={myRoom}
                  onRefresh={refreshRooms}
                />
              ))
            )}
          </section>
        )}

        {tab === 'tournament' && <TournamentSection />}

        {tab === 'room' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#eaeaea]">Custom Rooms</h2>
              <button onClick={() => setShowCreate(true)} disabled={!canCreate}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${canCreate ? 'bg-[#00ff88]/15 text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0f0f1e]' : 'bg-[#16213e] text-[#555] cursor-not-allowed'}`}>
                + Create
              </button>
            </div>
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} user={user} myRoom={myRoom} onRefresh={refreshRooms} />
            ))}
          </section>
        )}

        {/* Admin review panel */}
        {user?.role === 'admin' && reviewGames.length > 0 && (
          <section className="rounded-3xl border border-[#ffcc00]/30 bg-[#1a1c36] p-4">
            <h3 className="text-sm font-bold text-[#ffcc00] mb-3">📋 Pending Reviews ({reviewGames.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {reviewGames.map(g => (
                <div key={g._id} className="bg-[#13162a] rounded-xl p-3 text-xs border border-[#ffcc00]/10">
                  <p className="text-[#eaeaea]">{g.player1?.username} vs {g.player2?.username}</p>
                  <p className="text-[#b0b0b0]">SS: {g.screenshot1 ? '✅' : '❌'} p1 | {g.screenshot2 ? '✅' : '❌'} p2</p>
                  <span className="text-[#ffcc00] text-[10px]">Waiting for review</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Create Room Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 pt-10">
            <div className="mx-auto max-w-md rounded-3xl bg-[#12142c] border border-[#00d4ff]/30 p-6 shadow-2xl">
              <div className="bg-red-600/20 border border-red-500/40 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs font-bold text-red-400">⚠ WARNING</p>
                <p className="text-[11px] text-red-300 mt-1">Any kind of hack or panel user will be permanently banned.</p>
              </div>
              <h3 className="text-lg font-bold text-[#eaeaea] mb-4">Create Room</h3>
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <div className="space-y-3">
                <div className="bg-[#1a1c36] rounded-xl px-3 py-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-[#00d4ff]">{user?.username}</p>
                  <button onClick={() => { navigator.clipboard.writeText(user?.uid || ''); }} className="text-[10px] text-[#b0b0b0] hover:text-[#00ff88] underline">copy</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#b0b0b0] mb-1 block">Team</label>
                    <select value={newSize} onChange={(e) => setNewSize(e.target.value)} className="w-full bg-[#16213e] rounded-lg px-3 py-2 text-xs text-[#eaeaea] outline-none">
                      <option value="1v1">1v1</option>
                      <option value="2v2">2v2</option>
                      <option value="3v3">3v3</option>
                      <option value="4v4">4v4</option>
                    </select>
                  </div>
                </div>

                {/* Character Ability Toggle */}
                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-2">
                  <label className="text-[10px] font-semibold text-[#b0b0b0]">👤 Character Ability</label>
                  <div className="flex gap-2 mb-2">
                    {['yes', 'no'].map((v) => (
                      <button key={v} onClick={() => setNewCharAbility(v)}
                        className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${newCharAbility === v ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0]'}`}>
                        {v === 'yes' ? 'YES (Allowed)' : 'NO (Unallowed)'}
                      </button>
                    ))}
                  </div>
                  {newCharAbility === 'yes' ? (
                    <input type="text" value={newChar} onChange={(e) => setNewChar(e.target.value)} className="w-full bg-[#16213e] rounded-lg px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Type any character name..." />
                  ) : (
                    <select multiple value={newUnChars} onChange={(e) => setNewUnChars(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full bg-[#16213e] rounded-lg px-2 py-1 text-[10px] text-[#eaeaea] outline-none h-16">
                      {ffChars.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>

                {/* Gun Selection */}
                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-2">
                  <label className="text-[10px] font-semibold text-[#b0b0b0]">🔫 Gun</label>
                  {newCharAbility === 'yes' ? (
                    <select value={newGun} onChange={(e) => setNewGun(e.target.value)} className="w-full bg-[#16213e] rounded-lg px-3 py-2 text-xs text-[#eaeaea] outline-none">
                      <option value="">-- Select Gun --</option>
                      {ffGuns.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  ) : (
                    <select multiple value={newUnGuns} onChange={(e) => setNewUnGuns(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full bg-[#16213e] rounded-lg px-2 py-1 text-[10px] text-[#eaeaea] outline-none h-16">
                      {ffGuns.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#b0b0b0] mb-1 block">Throw</label>
                    <div className="flex gap-1">
                      {['yes', 'no'].map((v) => (
                        <button key={v} onClick={() => setNewThrow(v)}
                          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${newThrow === v ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0]'}`}>{v.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#b0b0b0] mb-1 block">Headshot</label>
                    <div className="flex gap-1">
                      {['yes', 'no'].map((v) => (
                        <button key={v} onClick={() => setNewHS(v)}
                          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${newHS === v ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0]'}`}>{v.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#b0b0b0] mb-1 block">Rounds</label>
                    <div className="flex gap-1">
                      {['7', '13'].map((v) => (
                        <button key={v} onClick={() => setNewRounds(v)}
                          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${newRounds === v ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0]'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#b0b0b0] mb-1 block">Coin</label>
                    <select value={newCoin} onChange={(e) => setNewCoin(e.target.value)} className="w-full bg-[#16213e] rounded-lg px-2 py-2 text-xs text-[#eaeaea] outline-none">
                      <option value="Default">Default</option>
                      <option value="9950">9950</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[#b0b0b0]">🚫 Armor Restriction</p>
                  <input type="text" value={newUnArmor} onChange={(e) => setNewUnArmor(e.target.value)} className="w-full bg-[#16213e] rounded-lg px-2 py-1 text-[10px] text-[#eaeaea] outline-none" placeholder="e.g. Vest, Helmet" />
                </div>

                <div>
                  <label className="text-[10px] text-[#b0b0b0] mb-1 block">Entry Fee (pts)</label>
                  <input type="number" value={newFee} onChange={(e) => setNewFee(Math.max(1, Number(e.target.value)))} className="input-field text-sm" min={1} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowCreate(false); setError(''); }} className="w-full btn-secondary text-sm">Cancel</button>
                <button onClick={handleCreate} className="w-full btn-primary text-sm">Create - {newFee} pts</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

/* ───────── Room Card ───────── */
function RoomCard({ room, user, myRoom, onRefresh }: {
  room: RoomData; user: User | null; myRoom: RoomData | null; onRefresh: () => void;
}) {
  const [showItems, setShowItems] = useState(false);
  const [showSS, setShowSS] = useState(false);
  const [screenshot, setScreenshot] = useState('');
  const [ssMsg, setSsMsg] = useState('');
  const [showIdPass, setShowIdPass] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');
  const [gameReview, setGameReview] = useState<GameData | null>(null);
  const [reviewLoaded, setReviewLoaded] = useState(false);

  const isMyRoom = myRoom?._id === room._id;
  const isJoined = room.joinedBy?._id === user?.id;
  const isCreator = room.creator?._id === user?.id;
  const isFinished = room.status === 'finished';
  const isCancelled = room.status === 'cancelled';
  const isActive = room.status === 'active';
  const isPending = room.joinStatus === 'pending';
  const charAbilityYes = room.charAbility === 'yes';

  useEffect(() => {
    if ((isFinished || isCancelled) && !reviewLoaded) {
      apiService.getGameReview(room._id).then(g => { setGameReview(g); setReviewLoaded(true); }).catch(() => {});
    }
  }, [room._id, isFinished, isCancelled, reviewLoaded]);

  // Upload screenshot
  const handleUploadSS = async () => {
    if (!screenshot) return;
    try {
      await apiService.uploadScreenshot(room._id, screenshot, ssMsg);
      setShowSS(false);
      setScreenshot('');
      setSsMsg('');
      onRefresh();
    } catch (err) { console.error(err); }
  };

  // Give ID/Pass
  const handleGiveIdPass = async () => {
    if (!roomIdInput) return;
    try {
      await apiService.giveIdPass(room._id, roomIdInput, roomPassInput);
      setRoomIdInput('');
      setRoomPassInput('');
      setShowIdPass(false);
      onRefresh();
    } catch (err) { console.error(err); }
  };

  // Convert image to base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  };

  const roomColor = isCancelled ? 'border-[#ff4444]/30 opacity-60' : isFinished ? 'border-[#555]/30 opacity-60' : 'border-[#00d4ff]/20';

  return (
    <div className={`rounded-3xl border ${roomColor} bg-[#13162a] overflow-hidden relative`}>
      {/* Top bar - creator controls / status */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-[#0f0f1e]/80 rounded-xl px-3 py-1.5">
        {isCancelled && <span className="text-sm">❌</span>}
        {isFinished && <span className="text-[10px] text-[#555]">✅ Finished</span>}
        {isActive && !isPending && <span className="text-[10px] text-[#00ff88]">● Active</span>}
        {isPending && <span className="text-[10px] text-[#ffcc00]">⏳ Pending</span>}
        <span className="text-[10px] text-[#00d4ff]">Fee: {room.fee}pts</span>
        {isCreator && isActive && (
          <button onClick={async () => {
            try {
              await apiService.cancelRoom(room._id);
              onRefresh();
            } catch (err: any) {
              alert(err.response?.data?.error || 'Failed to cancel');
            }
          }} className="ml-1 text-sm text-[#ff6b6b] hover:text-[#ff0000] transition" title="Cancel Room">✕</button>
        )}
      </div>

      <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#ff006e]/10 p-4 border-b border-[#00d4ff]/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[#ff6600]/20 flex items-center justify-center text-lg">🔥</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#ff6600]">FREE FIRE</p>
              {isCancelled && <span className="text-[10px] text-[#ff4444] bg-[#ff4444]/10 px-2 py-0.5 rounded">❌ Cancelled</span>}
            </div>
            {room.joinedByName && <p className="text-[10px] text-[#00ff88]">Joined by: {room.joinedByName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="space-y-1">
            <p className="text-[10px]">
              <span className="text-[#b0b0b0]">Character Skill:</span>
              <span className="text-[#eaeaea] font-bold"> {charAbilityYes ? 'YES' : 'NO'}</span>
            </p>
            <p className="text-[10px]"><span className="text-[#b0b0b0]">Gun:</span> <span className="text-[#eaeaea] font-bold">{charAbilityYes ? (room.gun || 'Any') : 'NOT ALLOWED'}</span></p>
            <p className="text-[10px]"><span className="text-[#b0b0b0]">Head Shot Mode:</span> <span className="text-[#eaeaea] font-bold">{room.headshot?.toUpperCase()}</span></p>
            <p className="text-[10px]"><span className="text-[#b0b0b0]">Throwable Limit:</span> <span className="text-[#eaeaea] font-bold">{room.throwable?.toUpperCase()}</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-[#b0b0b0]">Rounds:</span> <span className="text-[#eaeaea] font-semibold">{room.rounds}</span></p>
            <p><span className="text-[#b0b0b0]">Coin:</span> <span className="text-[#eaeaea] font-semibold">{room.coin}</span></p>
          </div>
        </div>
      </div>

      {/* Winner Prize & Entry Fee */}
      <div className="grid grid-cols-2 gap-3 px-4 py-3 border-b border-[#00d4ff]/10">
        <div className="bg-[#1a1c36] rounded-xl p-3 text-center">
          <p className="text-[9px] text-[#b0b0b0] mb-1">            🏆 WINNINGS</p>
          <p className="text-lg font-bold text-[#ffcc00]">{room.fee * 2} pts</p>
        </div>
        <div className="bg-[#1a1c36] rounded-xl p-3 text-center">
          <p className="text-[9px] text-[#b0b0b0] mb-1">ENTRY FEE</p>
          <p className="text-lg font-bold text-[#00ff88]">{room.fee} pts</p>
        </div>
      </div>

      {/* Room name & size */}
      <div className="p-4 text-center border-b border-[#00d4ff]/10">
        <p className="text-xs text-[#b0b0b0]">Create by</p>
        <p className="text-lg font-bold text-[#ffffff]">{room.creator?.username} <button onClick={() => { navigator.clipboard.writeText(room.creator?.uid || ''); }} className="text-[10px] text-[#00d4ff] hover:text-[#00ff88] underline ml-1">copy</button></p>
        <p className="text-xs text-[#b0b0b0] mt-1">{room.type === 'lonewolf' ? 'Lone Wolf' : 'Team'} {room.size}</p>
      </div>

      {/* ID/Pass Display (only after added) */}
      {isActive && room.roomIdPass && (isCreator || isJoined) && (
        <div className="px-4 py-2 border-b border-[#00d4ff]/10 bg-[#0f1a2e]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#00d4ff] font-semibold">🔑 Room ID & Pass</p>
            <div className="text-right">
              <p className="text-[10px] text-[#00ff88]">ID: {room.roomIdPass}</p>
              {room.roomPass && <p className="text-[10px] text-[#00ff88]">Pass: {room.roomPass}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Join message area */}
      <div className="px-4 py-3 border-b border-[#00d4ff]/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-full bg-[#16213e] border border-[#00d4ff]/30 flex items-center justify-center text-sm">👤</div>
          <div className="flex-1">
            {!room.joinedBy && isActive && !isMyRoom && (
              <>
                <p className="text-xs text-[#b0b0b0]">No player has joined yet.</p>
                <p className="text-[10px] text-[#00d4ff]">Be the first to join!</p>
              </>
            )}
            {room.joinedBy && isActive && (
              <div>
                {isCreator && room.joinStatus === 'pending' && (
                  <>
                    <p className="text-xs text-[#ffcc00]">{room.joinedByName} wants to join</p>
                    <div className="flex gap-2 mt-1">
                      <button onClick={async () => { try { await apiService.acceptJoin(room._id); onRefresh(); } catch (err: any) { alert(err.response?.data?.error || 'Failed to accept'); } }}
                        className="text-[10px] bg-[#00ff88] text-[#0f0f1e] px-2 py-0.5 rounded font-bold">Accept</button>
                      <button onClick={async () => { try { await apiService.rejectJoin(room._id); onRefresh(); } catch (err: any) { alert(err.response?.data?.error || 'Failed to reject'); } }}
                        className="text-[10px] bg-[#ff6b6b] text-white px-2 py-0.5 rounded font-bold">Reject</button>
                    </div>
                  </>
                )}
                {isJoined && room.joinStatus === 'pending' && (
                  <>
                    <p className="text-xs text-[#ffcc00]">⏳ Waiting for creator to accept...</p>
                    <button onClick={async () => { try { await apiService.cancelJoin(room._id); onRefresh(); } catch (err: any) { alert(err.response?.data?.error || 'Failed to cancel'); } }}
                      className="text-[10px] bg-[#ff6b6b] text-white px-2 py-0.5 rounded font-bold mt-1">Cancel Join</button>
                  </>
                )}
                {room.joinStatus === 'accepted' && <p className="text-[10px] text-[#00ff88]">✅ Accepted</p>}
                {room.joinStatus === 'rejected' && <p className="text-[10px] text-[#ff6b6b]">❌ Rejected</p>}
              </div>
            )}
            {isMyRoom && isActive && !room.joinedBy && (
              <p className="text-xs text-[#b0b0b0]">Waiting for someone to join...</p>
            )}
            {(isFinished || isCancelled) && (
              <p className="text-xs text-[#555]">{isFinished ? 'Room finished' : 'Room cancelled ❌'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Compulsory Items */}
      <div className="border-b border-[#00d4ff]/10">
        <button onClick={() => setShowItems(!showItems)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[#b0b0b0] hover:text-[#eaeaea] transition">
          <span>📋 Compulsory Items</span>
          <span className={`transition-transform ${showItems ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showItems && (
          <div className="px-4 pb-3 text-[10px] text-[#b0b0b0] space-y-2">
            <div className="bg-[#1a1c36] rounded-xl p-3 text-center text-[11px] text-[#ffcc00] font-semibold border border-[#ffcc00]/20">
              ⚠️ This all compulsory items selected by creator. Follow that item rule. If not followed, in 2 rounds you get your money back.
            </div>
            {charAbilityYes ? (
              <>
                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-1">
                  <p className="text-[#00d4ff] font-semibold">🔫 Weapon</p>
                  <p>Allowed: <span className="text-[#eaeaea]">{room.gun || 'Any'}</span></p>
                  <p className="text-[#ff6b6b]">🚫 Grenades, Turrets not allowed</p>
                </div>
                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-1">
                  <p className="text-[#00d4ff] font-semibold">👤 Character</p>
                  <p>Allowed: <span className="text-[#eaeaea]">{room.character || 'Any'}</span></p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-1">
                  <p className="text-[#ff6b6b] font-semibold">🚫 Unallowed Weapons</p>
                  <p className="text-[#eaeaea]">{room.unallowedGuns?.length > 0 ? room.unallowedGuns.join(', ') : 'All guns unallowed (skill disabled)'}</p>
                </div>
                <div className="bg-[#1a1c36] rounded-xl p-3 space-y-1">
                  <p className="text-[#ff6b6b] font-semibold">🚫 Unallowed Characters</p>
                  <p className="text-[#eaeaea]">{room.unallowedChars?.length > 0 ? room.unallowedChars.join(', ') : 'All characters unallowed'}</p>
                </div>
              </>
            )}
            <div className="bg-[#1a1c36] rounded-xl p-3 space-y-1">
              <p className="text-[#00d4ff] font-semibold">🛡️ Armor</p>
              <p>Allowed: <span className="text-[#eaeaea]">{room.unallowedArmor}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Review Embed - when screenshots uploaded */}
      {gameReview && gameReview.status === 'review' && (
        <div className="px-4 py-3 border-b border-[#ffcc00]/20 bg-[#1a1c36]">
          <p className="text-[10px] font-bold text-[#ffcc00] mb-2">📋 Review Pending</p>
          <div className="flex gap-2 text-[10px]">
            <div className="flex-1 bg-[#13162a] rounded-lg p-2">
              <p className="text-[#00d4ff]">{gameReview.player1?.username}</p>
              {gameReview.screenshot1 ? <span className="text-[#00ff88]">✅ SS</span> : <span className="text-[#ff6b6b]">❌ No SS</span>}
              {gameReview.message1 && <p className="text-[#b0b0b0] mt-1">"{gameReview.message1}"</p>}
            </div>
            <div className="flex-1 bg-[#13162a] rounded-lg p-2">
              <p className="text-[#ff6600]">{gameReview.player2?.username}</p>
              {gameReview.screenshot2 ? <span className="text-[#00ff88]">✅ SS</span> : <span className="text-[#ff6b6b]">❌ No SS</span>}
              {gameReview.message2 && <p className="text-[#b0b0b0] mt-1">"{gameReview.message2}"</p>}
            </div>
          </div>
          <p className="text-[10px] text-[#ffcc00] mt-2 text-center">Waiting for admin review...</p>
        </div>
      )}

      {gameReview && gameReview.status === 'completed' && (
        <div className="px-4 py-3 border-b border-[#00ff88]/20 bg-[#10251f]">
          <p className="text-[10px] font-bold text-[#00ff88] text-center">
            ✅ Winner: {gameReview.winner?.username} | +{gameReview.pointsAwarded} pts
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 p-4">
        {isActive && !isMyRoom && !isJoined && (
          <button onClick={async () => {
            try {
              await apiService.joinRoom(room._id);
              onRefresh();
            } catch (err: any) {
              alert(err.response?.data?.error || 'Failed to join');
            }
          }} className="flex-1 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0f0f1e] transition hover:bg-[#00d4ff]/80">
            Join : {room.fee} pts
          </button>
        )}
        {isActive && isJoined && (
          <span className="flex-1 rounded-xl bg-[#00d4ff]/10 px-4 py-3 text-sm font-bold text-[#00d4ff]/60 text-center">
            Entry {room.fee} pts
          </span>
        )}
        {isActive && isCreator && (
          <span className="flex-1 rounded-xl bg-[#00d4ff]/10 px-4 py-3 text-sm font-bold text-[#00d4ff]/60 text-center">
            Entry {room.fee} pts
          </span>
        )}
        {isCreator && isActive && room.joinedBy && !room.roomIdPass && (
          <button onClick={() => setShowIdPass(!showIdPass)} className="flex-1 rounded-xl bg-[#ffcc00]/20 px-4 py-3 text-sm font-bold text-[#ffcc00] transition hover:bg-[#ffcc00] hover:text-[#0f0f1e]">
            🔑 Add ID/Pass
          </button>
        )}
        {isActive && room.roomIdPass && (isCreator || isJoined) && !showSS && (
          <button onClick={() => setShowSS(true)} className="flex-1 rounded-xl bg-[#00ff88]/15 px-4 py-3 text-sm font-bold text-[#00ff88] transition hover:bg-[#00ff88] hover:text-[#0f0f1e]">
            📸 Result
          </button>
        )}
        {isActive && isJoined && room.joinStatus === 'accepted' && (
          <button onClick={async () => { try { await apiService.cancelJoin(room._id); onRefresh(); } catch (err: any) { alert(err.response?.data?.error || 'Failed to leave'); } }} className="rounded-xl bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ff6b6b]/80">
            Leave
          </button>
        )}
      </div>
      {showIdPass && isCreator && (
        <div className="px-4 pb-4 space-y-2 border-t border-[#ffcc00]/20 pt-3">
          <input type="text" value={roomIdInput} onChange={e => setRoomIdInput(e.target.value)}
            className="w-full bg-[#16213e] rounded-lg px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Room ID" />
          <input type="text" value={roomPassInput} onChange={e => setRoomPassInput(e.target.value)}
            className="w-full bg-[#16213e] rounded-lg px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Room Password (optional)" />
          <button onClick={handleGiveIdPass} className="w-full bg-[#00d4ff] text-[#0f0f1e] rounded-lg py-2 text-xs font-bold">Done</button>
        </div>
      )}
      {showSS && (
        <div className="px-4 pb-4 space-y-2 border-t border-[#00d4ff]/10 pt-3">
          <input type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setScreenshot(await toBase64(f));
          }} className="text-[10px] text-[#b0b0b0]" />
          {screenshot && <img src={screenshot} alt="preview" className="max-h-28 rounded-lg" />}
          <input type="text" value={ssMsg} onChange={e => setSsMsg(e.target.value)} placeholder="Add a message..." className="w-full bg-[#16213e] rounded-lg px-3 py-2 text-xs text-[#eaeaea] outline-none" />
          {screenshot && ssMsg ? (
            <button onClick={handleUploadSS} className="w-full bg-[#00ff88] text-[#0f0f1e] rounded-lg py-2 text-xs font-bold">
              → Submit Result
            </button>
          ) : (
            <div className="w-full bg-[#555]/20 text-[#555] rounded-lg py-2 text-xs font-bold text-center">
              {screenshot ? 'Add a message...' : ssMsg ? 'Add a screenshot...' : 'Select screenshot & add message'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────── Tournament Section ───────── */
function TournamentSection() {
  const [tourFilter, setTourFilter] = useState<'ALL' | 'CS' | 'BR'>('ALL');
  const tournamentRooms = [
    { id: 'room-1', name: 'Neon Strike', fee: 10, mode: 'CS' as const },
    { id: 'room-2', name: 'Cyber Royale', fee: 15, mode: 'BR' as const },
    { id: 'room-3', name: 'Dark Squad', fee: 12, mode: 'CS' as const },
    { id: 'room-4', name: 'Phantom Run', fee: 20, mode: 'BR' as const },
  ];
  const filtered = useMemo(() => {
    return tourFilter === 'ALL' ? tournamentRooms : tournamentRooms.filter((r) => r.mode === tourFilter);
  }, [tourFilter]);

  return (
    <section className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-5">
      <h2 className="text-xl font-bold text-[#eaeaea] mb-4">Tournament Rooms</h2>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['ALL', 'CS', 'BR'] as const).map((f) => (
          <button key={f} onClick={() => setTourFilter(f)}
            className={`min-w-[70px] rounded-xl px-3 py-2 text-sm font-semibold transition ${tourFilter === f ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0] hover:bg-[#00d4ff] hover:text-[#0f0f1e]'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((room) => (
          <div key={room.id} className="flex items-center justify-between rounded-2xl border border-[#00d4ff]/10 bg-[#1a1c36] p-4">
            <div>
              <span className="rounded-full bg-[#00d4ff]/20 px-3 py-1 text-xs font-bold text-[#00d4ff]">{room.mode}</span>
              <h3 className="mt-2 text-lg font-bold text-[#ffffff]">{room.name}</h3>
            </div>
            <span className="text-sm font-bold text-[#00ff88]">{room.fee} pts</span>
          </div>
        ))}
      </div>
    </section>
  );
}
