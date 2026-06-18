'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import NotificationBanner from '@/components/NotificationBanner';
import authService, { User } from '@/utils/authService';
import apiService, { GameData, RoomData } from '@/utils/apiService';
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

  useEffect(() => {
    const init = async () => {
      try {
        const data = await authService.getMe();
        setUser(data);
        const rms = await apiService.getRooms();
        setRooms(rms);
        const mine = await apiService.getMyRoom();
        setMyRoom(mine);
      } catch (err) {
        console.error(err);
      }
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
      } catch (err) {
        console.error(err);
      }
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
    } catch (err) {
      console.error(err);
    }
  };

  const resetCreateForm = () => {
    setNewName('');
    setNewFee(10);
    setNewType('lonewolf');
    setNewSize('1v1');
    setNewCharAbility('yes');
    setNewChar('');
    setNewGun('');
    setNewHS('yes');
    setNewRounds('7');
    setNewCoin('Default');
    setNewThrow('yes');
    setNewUnGuns([]);
    setNewUnChars([]);
    setNewUnArmor('Vest Lv3, Helmet Lv3');
  };

  const handleCreate = async () => {
    setError('');
    try {
      const room = await apiService.createRoom({
        name: newName.trim() || `${user?.username || 'Player'}'s room`,
        fee: newFee,
        type: newType,
        size: newSize,
        headshot: newHS,
        rounds: newRounds,
        coin: newCoin,
        throwable: newThrow,
        charAbility: newCharAbility,
        character: newCharAbility === 'yes' ? newChar : '',
        gun: newCharAbility === 'yes' ? newGun : '',
        unallowedGuns: newCharAbility === 'no' ? newUnGuns : [],
        unallowedChars: newCharAbility === 'no' ? newUnChars : [],
        unallowedArmor: newUnArmor,
      });
      setRooms((prev) => [room, ...prev]);
      setMyRoom(room);
      setShowCreate(false);
      resetCreateForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  const tabs = [
    { key: 'main' as const, label: 'Main', icon: 'Home' },
    { key: 'tournament' as const, label: 'Tournament', icon: 'Cup' },
    { key: 'room' as const, label: 'Room', icon: 'Door' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f1e]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#00d4ff]/30 border-t-[#00d4ff]" />
          <p className="text-[#b0b0b0]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e] px-4 pb-28 pt-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <Header title="Free Fire" subtitle="Custom rooms" />
          <div className="shrink-0 rounded-2xl border border-[#00ff88]/20 bg-[#10251f] px-4 py-3 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8fe8bd]">Points</p>
            <p className="text-2xl font-bold text-[#00ff88]">{user?.points ?? 0}</p>
          </div>
        </div>
        <NotificationBanner />

        <div className="flex gap-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === t.key ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0] hover:bg-[#00d4ff] hover:text-[#0f0f1e]'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'main' && (
          <section className="space-y-4">
            {rooms.length === 0 ? (
              <div className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-8 text-center">
                <p className="text-sm text-[#b0b0b0]">No rooms yet. Switch to Room tab to create one.</p>
              </div>
            ) : (
              rooms.map((room) => <RoomCard key={room._id} room={room} user={user} myRoom={myRoom} onRefresh={refreshRooms} />)
            )}
          </section>
        )}

        {tab === 'tournament' && <TournamentSection />}

        {tab === 'room' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#eaeaea]">Custom Rooms</h2>
              <button
                onClick={() => setShowCreate(true)}
                disabled={Boolean(myRoom)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  !myRoom ? 'bg-[#00ff88]/15 text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0f0f1e]' : 'cursor-not-allowed bg-[#16213e] text-[#555]'
                }`}
              >
                + Create
              </button>
            </div>
            {rooms.map((room) => <RoomCard key={room._id} room={room} user={user} myRoom={myRoom} onRefresh={refreshRooms} />)}
          </section>
        )}

        {user?.role === 'admin' && reviewGames.length > 0 && (
          <section className="rounded-3xl border border-[#ffcc00]/30 bg-[#1a1c36] p-4">
            <h3 className="mb-3 text-sm font-bold text-[#ffcc00]">Pending Reviews ({reviewGames.length})</h3>
          </section>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 pt-10">
            <div className="mx-auto max-w-md rounded-3xl border border-[#00d4ff]/30 bg-[#12142c] p-6 shadow-2xl">
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-600/20 p-3 text-center">
                <p className="text-xs font-bold text-red-400">WARNING</p>
                <p className="mt-1 text-[11px] text-red-300">Any kind of hack or panel user will be permanently banned.</p>
              </div>
              <h3 className="mb-4 text-lg font-bold text-[#eaeaea]">Create Room</h3>
              {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#1a1c36] px-3 py-2">
                  <p className="text-xs font-bold text-[#00d4ff]">{user?.username}</p>
                  <button onClick={() => navigator.clipboard.writeText(user?.uid || '')} className="text-[10px] text-[#b0b0b0] underline hover:text-[#00ff88]">copy</button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select label="Type" value={newType} onChange={setNewType} options={['custom', 'lonewolf']} />
                  <Select label="Team" value={newSize} onChange={setNewSize} options={['1v1', '2v2', '3v3', '4v4']} />
                </div>

                <ToggleBlock label="Character Ability" value={newCharAbility} onChange={setNewCharAbility}>
                  {newCharAbility === 'yes' ? (
                    <input value={newChar} onChange={(e) => setNewChar(e.target.value)} className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Type character name..." />
                  ) : (
                    <select multiple value={newUnChars} onChange={(e) => setNewUnChars(Array.from(e.target.selectedOptions, (o) => o.value))} className="h-16 w-full rounded-lg bg-[#16213e] px-2 py-1 text-[10px] text-[#eaeaea] outline-none">
                      {ffChars.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </ToggleBlock>

                <div className="rounded-xl bg-[#1a1c36] p-3">
                  <label className="mb-2 block text-[10px] font-semibold text-[#b0b0b0]">Gun</label>
                  {newCharAbility === 'yes' ? (
                    <select value={newGun} onChange={(e) => setNewGun(e.target.value)} className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none">
                      <option value="">-- Select Gun --</option>
                      {ffGuns.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  ) : (
                    <select multiple value={newUnGuns} onChange={(e) => setNewUnGuns(Array.from(e.target.selectedOptions, (o) => o.value))} className="h-16 w-full rounded-lg bg-[#16213e] px-2 py-1 text-[10px] text-[#eaeaea] outline-none">
                      {ffGuns.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <ToggleSmall label="Throw" value={newThrow} onChange={setNewThrow} />
                  <ToggleSmall label="Headshot" value={newHS} onChange={setNewHS} />
                  <Select label="Rounds" value={newRounds} onChange={setNewRounds} options={['7', '13']} />
                  <Select label="Coin" value={newCoin} onChange={setNewCoin} options={['Default', '9950']} />
                </div>

                <input value={newUnArmor} onChange={(e) => setNewUnArmor(e.target.value)} className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Armor restrictions" />
                <input type="number" value={newFee} onChange={(e) => setNewFee(Math.max(1, Number(e.target.value)))} className="input-field text-sm" min={1} />
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={() => { setShowCreate(false); setError(''); }} className="btn-secondary w-full text-sm">Cancel</button>
                <button onClick={handleCreate} className="btn-primary w-full text-sm">Create - {newFee} points</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-[#b0b0b0]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function ToggleBlock({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl bg-[#1a1c36] p-3">
      <label className="text-[10px] font-semibold text-[#b0b0b0]">{label}</label>
      <ToggleButtons value={value} onChange={onChange} />
      {children}
    </div>
  );
}

function ToggleSmall({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-[#b0b0b0]">{label}</label>
      <ToggleButtons value={value} onChange={onChange} />
    </div>
  );
}

function ToggleButtons({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-1">
      {['yes', 'no'].map((v) => (
        <button key={v} onClick={() => onChange(v)} className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${value === v ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0]'}`}>
          {v.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function RoomCard({ room, user, myRoom, onRefresh }: { room: RoomData; user: User | null; myRoom: RoomData | null; onRefresh: () => void }) {
  const [showItems, setShowItems] = useState(false);
  const [showSS, setShowSS] = useState(false);
  const [screenshot, setScreenshot] = useState('');
  const [ssMsg, setSsMsg] = useState('');
  const [showIdPass, setShowIdPass] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');

  const isMyRoom = myRoom?._id === room._id;
  const isJoined = room.joinedBy?._id === user?.id;
  const isCreator = room.creator?._id === user?.id;
  const isActive = room.status === 'active';
  const isPending = room.joinStatus === 'pending';
  const charAbilityYes = room.charAbility === 'yes';

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#00d4ff]/20 bg-[#13162a]">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-xl bg-[#0f0f1e]/80 px-3 py-1.5">
        {isActive && !isPending && <span className="text-[10px] text-[#00ff88]">Active</span>}
        {isPending && <span className="text-[10px] text-[#ffcc00]">Pending</span>}
        <span className="text-[10px] text-[#00d4ff]">Fee: {room.fee}pts</span>
      </div>

      <div className="border-b border-[#00d4ff]/10 bg-gradient-to-r from-[#00d4ff]/10 to-[#ff006e]/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6600]/20 text-lg">FF</div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#ff6600]">FREE FIRE</p>
            {room.joinedByName && <p className="text-[10px] text-[#00ff88]">Joined by: {room.joinedByName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="space-y-1">
            <p><span className="text-[#b0b0b0]">Character Skill:</span> <span className="font-bold text-[#eaeaea]">{charAbilityYes ? 'YES' : 'NO'}</span></p>
            <p><span className="text-[#b0b0b0]">Gun:</span> <span className="font-bold text-[#eaeaea]">{charAbilityYes ? (room.gun || 'Any') : 'NOT ALLOWED'}</span></p>
            <p><span className="text-[#b0b0b0]">Head Shot Mode:</span> <span className="font-bold text-[#eaeaea]">{room.headshot?.toUpperCase()}</span></p>
            <p><span className="text-[#b0b0b0]">Throwable Limit:</span> <span className="font-bold text-[#eaeaea]">{room.throwable?.toUpperCase()}</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-[#b0b0b0]">Rounds:</span> <span className="font-semibold text-[#eaeaea]">{room.rounds}</span></p>
            <p><span className="text-[#b0b0b0]">Coin:</span> <span className="font-semibold text-[#eaeaea]">{room.coin}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-[#00d4ff]/10 px-4 py-3">
        <div className="rounded-xl bg-[#1a1c36] p-3 text-center">
          <p className="mb-1 text-[9px] text-[#b0b0b0]">WINNINGS</p>
          <p className="text-lg font-bold text-[#ffcc00]">{room.fee * 2} points</p>
        </div>
        <div className="rounded-xl bg-[#1a1c36] p-3 text-center">
          <p className="mb-1 text-[9px] text-[#b0b0b0]">ENTRY FEE</p>
          <p className="text-lg font-bold text-[#00ff88]">{room.fee} points</p>
        </div>
      </div>

      <div className="border-b border-[#00d4ff]/10 p-4 text-center">
        <p className="text-xs text-[#b0b0b0]">Create by</p>
        <p className="text-lg font-bold text-white">{room.creator?.username}</p>
        <p className="mt-1 text-xs text-[#b0b0b0]">{room.type === 'lonewolf' ? 'Lone Wolf' : 'Team'} {room.size}</p>
      </div>

      <button onClick={() => setShowItems(!showItems)} className="flex w-full items-center justify-between border-b border-[#00d4ff]/10 px-4 py-3 text-xs font-semibold text-[#b0b0b0] transition hover:text-[#eaeaea]">
        <span>Compulsory Items</span>
        <span className={`transition-transform ${showItems ? 'rotate-180' : ''}`}>v</span>
      </button>

      {showItems && (
        <div className="space-y-2 px-4 pb-3 text-[10px] text-[#b0b0b0]">
          <div className="rounded-xl border border-[#ffcc00]/20 bg-[#1a1c36] p-3 text-center text-[11px] font-semibold text-[#ffcc00]">
            This all compulsory items selected by creator. Follow that item rule.
          </div>
          <div className="rounded-xl bg-[#1a1c36] p-3">
            <p className="font-semibold text-[#00d4ff]">Weapon</p>
            <p>Allowed: <span className="text-[#eaeaea]">{room.gun || 'Any'}</span></p>
            <p className="text-[#ff6b6b]">Grenades, Turrets not allowed</p>
          </div>
          <div className="rounded-xl bg-[#1a1c36] p-3">
            <p className="font-semibold text-[#00d4ff]">Armor</p>
            <p>Restricted: <span className="text-[#eaeaea]">{room.unallowedArmor}</span></p>
          </div>
        </div>
      )}

      {isActive && room.roomIdPass && (isCreator || isJoined) && (
        <div className="border-b border-[#00d4ff]/10 bg-[#0f1a2e] px-4 py-2">
          <p className="text-[10px] text-[#00ff88]">ID: {room.roomIdPass}{room.roomPass ? ` | Pass: ${room.roomPass}` : ''}</p>
          {!showSS && (
            <button onClick={() => setShowSS(true)} className="mt-2 w-full rounded-lg bg-[#00ff88]/15 px-4 py-2 text-xs font-bold text-[#00ff88] transition hover:bg-[#00ff88] hover:text-[#0f0f1e]">
              📸 Result
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 p-4">
        {isActive && !isMyRoom && !isJoined && (
          <button onClick={async () => { await apiService.joinRoom(room._id); onRefresh(); }} className="flex-1 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0f0f1e]">
            Join : {room.fee} points
          </button>
        )}
        {isActive && (isJoined || isCreator) && (
          <span className="flex-1 rounded-xl bg-[#00d4ff]/10 px-4 py-3 text-center text-sm font-bold text-[#00d4ff]/60">
            Entry {room.fee} points
          </span>
        )}
        {isCreator && isActive && room.joinedBy && !room.roomIdPass && (
          <button onClick={() => setShowIdPass(!showIdPass)} className="flex-1 rounded-xl bg-[#ffcc00]/20 px-4 py-3 text-sm font-bold text-[#ffcc00]">
            Add ID/Pass
          </button>
        )}
      </div>

      {showIdPass && isCreator && (
        <div className="space-y-2 border-t border-[#ffcc00]/20 px-4 pb-4 pt-3">
          <input value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Room ID" />
          <input value={roomPassInput} onChange={(e) => setRoomPassInput(e.target.value)} className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none" placeholder="Room Password (optional)" />
          <button onClick={async () => { await apiService.giveIdPass(room._id, roomIdInput, roomPassInput); setShowIdPass(false); onRefresh(); }} className="w-full rounded-lg bg-[#00d4ff] py-2 text-xs font-bold text-[#0f0f1e]">Done</button>
        </div>
      )}

      {showSS && (
        <div className="space-y-2 border-t border-[#00d4ff]/10 px-4 pb-4 pt-3">
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) setScreenshot(await toBase64(file));
          }} className="text-[10px] text-[#b0b0b0]" />
          {screenshot && <img src={screenshot} alt="preview" className="max-h-28 rounded-lg" />}
          <input value={ssMsg} onChange={(e) => setSsMsg(e.target.value)} placeholder="Add a message..." className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none" />
          <button onClick={async () => { await apiService.uploadScreenshot(room._id, screenshot, ssMsg); setShowSS(false); onRefresh(); }} disabled={!screenshot || !ssMsg} className="w-full rounded-lg bg-[#00ff88] py-2 text-xs font-bold text-[#0f0f1e] disabled:bg-[#555]">
            Submit Result
          </button>
        </div>
      )}
    </div>
  );
}

function TournamentSection() {
  const [tourFilter, setTourFilter] = useState<'ALL' | 'CS' | 'BR'>('ALL');
  const tournamentRooms = [
    { id: 'room-1', name: 'Neon Strike', fee: 10, mode: 'CS' as const },
    { id: 'room-2', name: 'Cyber Royale', fee: 15, mode: 'BR' as const },
    { id: 'room-3', name: 'Dark Squad', fee: 12, mode: 'CS' as const },
    { id: 'room-4', name: 'Phantom Run', fee: 20, mode: 'BR' as const },
  ];
  const filtered = useMemo(() => tourFilter === 'ALL' ? tournamentRooms : tournamentRooms.filter((room) => room.mode === tourFilter), [tourFilter]);

  return (
    <section className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-5">
      <h2 className="mb-4 text-xl font-bold text-[#eaeaea]">Tournament Rooms</h2>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(['ALL', 'CS', 'BR'] as const).map((filter) => (
          <button key={filter} onClick={() => setTourFilter(filter)} className={`min-w-[70px] rounded-xl px-3 py-2 text-sm font-semibold transition ${tourFilter === filter ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0] hover:bg-[#00d4ff] hover:text-[#0f0f1e]'}`}>
            {filter}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((room) => (
          <div key={room.id} className="flex items-center justify-between rounded-2xl border border-[#00d4ff]/10 bg-[#1a1c36] p-4">
            <div>
              <span className="rounded-full bg-[#00d4ff]/20 px-3 py-1 text-xs font-bold text-[#00d4ff]">{room.mode}</span>
              <h3 className="mt-2 text-lg font-bold text-white">{room.name}</h3>
            </div>
            <span className="text-sm font-bold text-[#00ff88]">{room.fee} points</span>
          </div>
        ))}
      </div>
    </section>
  );
}
