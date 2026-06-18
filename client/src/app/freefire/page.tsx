'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import NotificationBanner from '@/components/NotificationBanner';
import authService, { User } from '@/utils/authService';
import apiService, { GameData, RoomData } from '@/utils/apiService';
import { useProtectedRoute } from '@/utils/useAuth';

const ffChars = ['Tatsuya', 'Alok', 'Iris', 'Xayne', 'Homer', 'Kenta', 'Dmitri', 'Skyler', 'Chrono', 'K', 'Clu', 'Steffie', 'A124', 'Wukong', 'Santino', 'Nero', 'Oscar', 'Koda', 'Kassie', 'Ignis', 'Orion', 'Ryden'];
const ffGuns = ['MP40', 'UMP', 'MP5', 'BIZON', 'Thompson', 'VECTOR', 'M1014', 'M1887', 'MAG7', 'SPAS12', 'M590', 'AWM', 'XM8', 'DESERT EAGLE', 'WOODPECKER', 'AC80'];
const ffArmor = ['Vest lv2', 'Vest lv3', 'Vest lv4', 'Helmet lv2', 'Helmet lv3'];

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
  const [showRules, setShowRules] = useState(false);

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
    setShowRules(false);
  };

  const toggleList = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const restrictedArmor = newUnArmor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const selectedArmor = ffArmor.filter((item) => !restrictedArmor.includes(item));
  const toggleArmor = (value: string) => {
    const nextSelected = selectedArmor.includes(value)
      ? selectedArmor.filter((item) => item !== value)
      : [...selectedArmor, value];
    setNewUnArmor(ffArmor.filter((item) => !nextSelected.includes(item)).join(', '));
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
        unallowedChars: newCharAbility === 'no' ? (newUnChars.length ? ffChars.filter((char) => !newUnChars.includes(char)) : ['Dmitri', 'Ryden', 'Orion']) : [],
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
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
            <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-[#eef5f9] px-5 pb-8 pt-3 text-[#111820] shadow-2xl">
              <div className="mx-auto mb-5 h-1 w-20 rounded-full bg-[#0d3e5a]" />
              <div className="mb-5 flex items-center justify-between">
                <div className="text-lg font-black tracking-tight">
                  <span>FREE F</span>
                  <span className="text-[#f27022]">I</span>
                  <span>RE</span>
                </div>
                <button onClick={() => { setShowCreate(false); setError(''); }} className="rounded-full border border-[#8da7b5] px-3 py-1 text-sm font-bold">
                  Close
                </button>
              </div>

              <p className="mb-5 border-b border-[#aebbc3] pb-5 text-xl font-extrabold leading-snug">
                Create your own match. This match will be shown to other players in this app.
              </p>
              {error && <p className="mb-3 rounded-md bg-[#ffe3e3] px-3 py-2 text-sm font-bold text-[#b81d24]">{error}</p>}

              <CreateGroup label="Room Type:">
                <CreateChoice active={newType === 'custom'} onClick={() => setNewType('custom')}>Custom Room</CreateChoice>
                <CreateChoice active={newType === 'lonewolf'} onClick={() => setNewType('lonewolf')}>Lone Wolf</CreateChoice>
              </CreateGroup>

              <CreateGroup label="Team:">
                {['1v1', '2v2', '3v3', '4v4'].map((value) => (
                  <CreateChoice key={value} active={newSize === value} onClick={() => setNewSize(value)}>{value}</CreateChoice>
                ))}
              </CreateGroup>

              <CreateToggle label="Throwable Limit:" value={newThrow} onChange={setNewThrow} />

              {newThrow === 'yes' && (
                <div className="mb-6 rounded-md border-2 border-[#111820] px-4 py-5">
                  <h2 className="mb-5 text-center text-lg font-extrabold">Choose your game items:</h2>
                  <ChipPicker
                    title="Compulsory Weapons:"
                    items={ffGuns}
                    selected={newGun ? [newGun] : []}
                    onToggle={(item) => setNewGun(newGun === item ? '' : item)}
                  />
                  <ChipPicker
                    title="Compulsory Armor:"
                    items={ffArmor}
                    selected={selectedArmor}
                    onToggle={toggleArmor}
                  />
                </div>
              )}

              <CreateToggle label="Character Skill:" value={newCharAbility} onChange={setNewCharAbility} />

              {newCharAbility === 'no' && (
                <div className="mb-6 rounded-md border-2 border-[#111820] px-4 py-5">
                  <div className="mb-5 rounded-xl border-2 border-[#3fb36b] bg-[#eefcf1] p-4 text-sm font-bold text-[#324039]">
                    <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#3fb36b] text-white">✓</span>
                    All active character skills are allowed except: Dmitri, Ryden, Orion.
                  </div>
                  <div className="mb-5 flex items-center gap-4 text-center text-lg font-extrabold text-[#4b4b4b]">
                    <span className="h-px flex-1 bg-[#aebbc3]" /> OR <span className="h-px flex-1 bg-[#aebbc3]" />
                  </div>
                  <ChipPicker
                    title="Select to allow these active characters:"
                    items={ffChars}
                    selected={newUnChars}
                    onToggle={(item) => toggleList(item, newUnChars, setNewUnChars)}
                  />
                </div>
              )}

              <CreateToggle label="Headshot mode:" value={newHS} onChange={setNewHS} />

              <CreateGroup label="Rounds:">
                {['7', '13'].map((value) => (
                  <CreateChoice key={value} active={newRounds === value} onClick={() => setNewRounds(value)}>{value}</CreateChoice>
                ))}
              </CreateGroup>

              <CreateGroup label="Coin:">
                {['Default', '9950'].map((value) => (
                  <CreateChoice key={value} active={newCoin === value} onClick={() => setNewCoin(value)}>{value === 'Default' ? 'Default Coin' : value}</CreateChoice>
                ))}
              </CreateGroup>

              <CreateGroup label="Room Maker:">
                <CreateChoice active>Me</CreateChoice>
                <CreateChoice active={false}>Opponent</CreateChoice>
              </CreateGroup>

              <div className="mb-5 rounded-md bg-[#f3f3f3] px-4 py-4 text-center">
                <p className="mb-4 font-extrabold text-[#c92b2b] underline">ⓘ Please enter your Free Fire name here.</p>
                <p className="font-extrabold text-[#c92b2b]">⚠ Any kinds of hackers and panel users will be banned permanently from this app.</p>
              </div>

              <div className="mb-5 rounded-md bg-white px-3 py-4 shadow-sm">
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3">
                  <input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="0"
                    className="min-w-0 border-b border-[#9aa9b1] bg-transparent py-2 text-lg outline-none"
                  />
                  <button onClick={() => setNewFee(Math.max(1, newFee - 5))} className="h-12 w-12 rounded-full border-2 border-black text-3xl leading-none">−</button>
                  <button onClick={() => setNewFee(newFee + 5)} className="h-12 w-12 rounded-full border-2 border-black text-3xl leading-none">+</button>
                  <button onClick={handleCreate} className="rounded-full bg-[#45b84e] px-6 py-3 text-lg font-extrabold text-white shadow">
                    Create
                  </button>
                </div>
                <p className="mt-2 font-bold">Potential winnings: {(newFee + 10).toFixed(1)} Points</p>
                <p className="mt-4 font-semibold italic text-[#df3b3b]">Create your own match.</p>
              </div>

              <button onClick={() => setShowRules(!showRules)} className="flex w-full items-center justify-between px-4 py-4 text-xl font-extrabold text-[#21486d]">
                <span>☷ Please read all the rules</span>
                <span>{showRules ? '⌃' : '⌄'}</span>
              </button>
              {showRules && (
                <p className="px-4 pb-4 text-sm font-semibold leading-7 text-[#1b2730]">
                  Match मा compulsory items creator ले select गरेको rule अनुसार प्रयोग गर्नुपर्छ। Unselected items राखेमा refund rule apply हुन सक्छ।
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function CreateGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-base font-extrabold">{label}</p>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

function CreateChoice({ active, onClick, children }: { active: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[58px] min-w-[132px] rounded-md border px-5 text-xl font-medium shadow-sm ${
        active ? 'border-[#0d3e5a] bg-white text-black' : 'border-[#9eadb5] bg-[#e5e5e5] text-[#8a6d6d]'
      }`}
    >
      {children}
    </button>
  );
}

function CreateToggle({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <CreateGroup label={label}>
      <CreateChoice active={value === 'yes'} onClick={() => onChange('yes')}>Yes</CreateChoice>
      <CreateChoice active={value === 'no'} onClick={() => onChange('no')}>No</CreateChoice>
    </CreateGroup>
  );
}

function ChipPicker({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-lg font-extrabold underline">{title}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`rounded-md border px-5 py-3 text-lg shadow-sm ${
                isSelected ? 'border-[#1e5b6d] bg-white text-black' : 'border-[#9eadb5] bg-[#f3f8fb] text-[#243b48]'
              }`}
            >
              {isSelected ? '✓ ' : ''}{item}
            </button>
          );
        })}
      </div>
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

      {isActive && room.roomIdPass && isCreator && (
        <div className="border-b border-[#00d4ff]/10 bg-[#0f1a2e] px-4 py-2">
          <p className="text-[10px] text-[#00ff88]">ID: {room.roomIdPass}{room.roomPass ? ` | Pass: ${room.roomPass}` : ''}</p>
          {!showSS && (
            <button onClick={() => setShowSS(true)} className="mt-2 w-full rounded-lg bg-[#00ff88]/15 px-4 py-2 text-xs font-bold text-[#00ff88] transition hover:bg-[#00ff88] hover:text-[#0f0f1e]">
              Result
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 p-4">
        {isActive && !isMyRoom && !isJoined && (
          <button onClick={async () => { await apiService.joinRoom(room._id); onRefresh(); }} className="flex-1 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0f0f1e]">
            Join : {room.fee} points
          </button>
        )}
        {isActive && (isJoined || isCreator) && (
          <>
            <span className="flex-1 rounded-xl bg-[#00d4ff]/10 px-4 py-3 text-center text-sm font-bold text-[#00d4ff]/60">
              Entry {room.fee} points
            </span>
            <span className="flex-1 rounded-xl bg-[#ffcc00]/10 px-4 py-3 text-center text-sm font-bold text-[#ffcc00]/80">
              Winning {room.fee * 2} points
            </span>
          </>
        )}
        {isActive && isJoined && room.joinStatus === 'pending' && (
          <button onClick={async () => { await apiService.cancelJoin(room._id); onRefresh(); }} className="flex-1 rounded-xl bg-[#ff6b6b]/20 px-4 py-3 text-sm font-bold text-[#ff6b6b]">
            Cancel Request
          </button>
        )}
        {isCreator && isActive && room.joinStatus === 'pending' && (
          <>
            <button onClick={async () => { await apiService.acceptJoin(room._id); onRefresh(); }} className="flex-1 rounded-xl bg-[#00ff88]/20 px-4 py-3 text-sm font-bold text-[#00ff88]">
              Accept
            </button>
            <button onClick={async () => { await apiService.rejectJoin(room._id); onRefresh(); }} className="flex-1 rounded-xl bg-[#ff6b6b]/20 px-4 py-3 text-sm font-bold text-[#ff6b6b]">
              Reject
            </button>
          </>
        )}
        {isJoined && isActive && room.joinStatus === 'accepted' && (
          <button onClick={async () => { await apiService.cancelJoin(room._id); onRefresh(); }} className="flex-1 rounded-xl bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-white">
            Leave
          </button>
        )}
        {isCreator && isActive && room.joinedBy && room.joinStatus === 'accepted' && !room.roomIdPass && (
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
          <input value={ssMsg} onChange={(e) => setSsMsg(e.target.value)} placeholder="Add a message (optional)..." className="w-full rounded-lg bg-[#16213e] px-3 py-2 text-xs text-[#eaeaea] outline-none" />
          <div className="flex gap-2">
            <button onClick={() => { setShowSS(false); setScreenshot(''); setSsMsg(''); }} className="flex-1 rounded-lg bg-[#ff6b6b]/20 py-2 text-xs font-bold text-[#ff6b6b]">
              Cancel
            </button>
            <button onClick={async () => {
              await apiService.uploadScreenshot(room._id, screenshot, ssMsg);
              await apiService.closeRoom(room._id);
              setShowSS(false);
              setScreenshot('');
              setSsMsg('');
              onRefresh();
            }} disabled={!screenshot} className="flex-1 rounded-lg bg-[#00ff88] py-2 text-xs font-bold text-[#0f0f1e] disabled:bg-[#555] disabled:text-[#999]">
              Submit Result
            </button>
          </div>
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
