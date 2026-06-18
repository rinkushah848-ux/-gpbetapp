'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import authService, { User } from '@/utils/authService';
import apiService, { GameData, RoomData } from '@/utils/apiService';
import { useProtectedRoute } from '@/utils/useAuth';

const weapons = ['MP40', 'UMP', 'MP5', 'BIZON', 'Thompson', 'VECTOR', 'M1014', 'M1887', 'MAG7', 'SPAS12', 'M590', 'AWM', 'XM8', 'DESERT EAGLE', 'WOODPECKER', 'AC80'];
const armorItems = ['Vest lv2', 'Vest lv3', 'Vest lv4', 'Helmet lv2', 'Helmet lv3'];
const characters = ['Tatsuya', 'Alok', 'Iris', 'Xayne', 'Homer', 'Kenta', 'Dmitri', 'Skyler', 'Chrono', 'K', 'Clu', 'Steffie', 'A124', 'Wukong', 'Santino', 'Nero', 'Oscar', 'Koda', 'Kassie', 'Ignis', 'Orion', 'Ryden'];

const baseSelectedWeapons = ['M1887'];
const baseSelectedArmor = ['Vest lv2', 'Helmet lv2'];
const blockedSkillExceptions = ['Dmitri', 'Ryden', 'Orion'];

export default function FreeFirePage() {
  const { isLoading } = useProtectedRoute();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [myRoom, setMyRoom] = useState<RoomData | null>(null);
  const [reviewGames, setReviewGames] = useState<GameData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState(15);
  const [newType, setNewType] = useState('custom');
  const [newSize, setNewSize] = useState('1v1');
  const [newThrow, setNewThrow] = useState('yes');
  const [newCharAbility, setNewCharAbility] = useState('yes');
  const [newHS, setNewHS] = useState('yes');
  const [newRounds, setNewRounds] = useState('7');
  const [newCoin, setNewCoin] = useState('Default Coin');
  const [roomMaker, setRoomMaker] = useState('me');
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(baseSelectedWeapons);
  const [selectedArmor, setSelectedArmor] = useState<string[]>(baseSelectedArmor);
  const [allowedChars, setAllowedChars] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);

  const unallowedWeapons = useMemo(
    () => weapons.filter((item) => !selectedWeapons.includes(item)),
    [selectedWeapons],
  );
  const unallowedArmor = useMemo(
    () => armorItems.filter((item) => !selectedArmor.includes(item)),
    [selectedArmor],
  );
  const winnings = newFee > 0 ? newFee + 10 : 0;

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
    setNewFee(15);
    setNewType('custom');
    setNewSize('1v1');
    setNewThrow('yes');
    setNewCharAbility('yes');
    setNewHS('yes');
    setNewRounds('7');
    setNewCoin('Default Coin');
    setRoomMaker('me');
    setSelectedWeapons(baseSelectedWeapons);
    setSelectedArmor(baseSelectedArmor);
    setAllowedChars([]);
    setShowRules(false);
  };

  const handleCreate = async () => {
    setError('');
    try {
      const room = await apiService.createRoom({
        name: newName.trim() || `${user?.username || 'Player'} match`,
        fee: newFee,
        type: newType,
        size: newSize,
        headshot: newHS,
        rounds: newRounds,
        coin: newCoin,
        throwable: newThrow,
        charAbility: newCharAbility,
        character: newCharAbility === 'yes' ? allowedChars.join(', ') : '',
        gun: selectedWeapons.join(', '),
        unallowedGuns: unallowedWeapons,
        unallowedChars: newCharAbility === 'no' ? blockedSkillExceptions : allowedChars,
        unallowedArmor: unallowedArmor.join(', '),
        roomMaker,
      });
      setRooms((prev) => [room, ...prev]);
      setMyRoom(room);
      setShowCreate(false);
      resetCreateForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  const toggle = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef5f9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c7d5dd] border-t-[#0d3e5a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5f9] pb-28 text-[#111820]">
      <main className="mx-auto min-h-screen max-w-md border-x border-[#c7d5dd] bg-[#eef5f9]">
        <div className="sticky top-0 z-30 border-b border-[#cfd9df] bg-[#eef5f9]/95 backdrop-blur">
          <div className="grid grid-cols-3 items-end px-5 py-5">
            <TopAction icon="🔔" label="Notify me" tone="gold" />
            <TopAction icon="↻" label="Rematch" />
            <button
              onClick={() => setShowCreate(true)}
              disabled={Boolean(myRoom)}
              className="justify-self-end rounded-xl bg-[#123865] px-4 py-3 text-lg font-bold text-white shadow-sm disabled:bg-[#9ca8b0]"
            >
              + Create
            </button>
          </div>
        </div>

        <section className="space-y-4 px-5 py-6">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-3 text-2xl font-extrabold text-[#0d273b]">
              <span className="text-xl">🎮</span>
              Created Matches
            </h1>
            <button className="text-2xl leading-none text-black" aria-label="Filter matches">
              ≡
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-md border-2 border-[#101820] bg-[#f8fcff] px-4 py-8 text-center text-sm font-semibold text-[#5d6a72]">
              No created matches yet.
            </div>
          ) : (
            rooms.map((room) => (
              <RoomCard key={room._id} room={room} user={user} myRoom={myRoom} onRefresh={refreshRooms} />
            ))
          )}

          {user?.role === 'admin' && reviewGames.length > 0 && (
            <div className="rounded-md border border-[#b99123] bg-[#fff8dd] p-4">
              <p className="font-bold text-[#745100]">Pending Reviews ({reviewGames.length})</p>
            </div>
          )}
        </section>
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-[#eef5f9] px-5 pb-8 pt-3 shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-20 rounded-full bg-[#0d3e5a]" />
            <div className="mb-5 flex items-center justify-between">
              <div className="font-black tracking-tight">
                <span>FREE F</span>
                <span className="text-[#f27022]">I</span>
                <span>RE</span>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-full border border-[#8da7b5] px-3 py-1 text-sm font-bold">
                Close
              </button>
            </div>

            <p className="mb-5 border-b border-[#aebbc3] pb-5 text-xl font-extrabold leading-snug">
              Create your own match. This match will be shown to other players in this app.
            </p>
            {error && <p className="mb-3 rounded-md bg-[#ffe3e3] px-3 py-2 text-sm font-bold text-[#b81d24]">{error}</p>}

            <CreateGroup label="Room Type:">
              <ChoiceButton active={newType === 'custom'} onClick={() => setNewType('custom')}>Custom Room</ChoiceButton>
              <ChoiceButton active={newType === 'lonewolf'} onClick={() => setNewType('lonewolf')}>Lone Wolf</ChoiceButton>
            </CreateGroup>

            <CreateGroup label="Team:">
              {['1v1', '2v2', '3v3', '4v4'].map((value) => (
                <ChoiceButton key={value} active={newSize === value} onClick={() => setNewSize(value)}>{value}</ChoiceButton>
              ))}
            </CreateGroup>

            <ToggleGroup label="Throwable Limit:" value={newThrow} setValue={setNewThrow} />

            {newThrow === 'yes' && (
              <div className="mb-6 rounded-md border-2 border-[#111820] px-4 py-5">
                <h2 className="mb-5 text-center text-lg font-extrabold">Choose your game items:</h2>
                <ChipPicker title="Compulsory Weapons:" items={weapons} selected={selectedWeapons} onToggle={(item) => toggle(item, selectedWeapons, setSelectedWeapons)} />
                <ChipPicker title="Compulsory Armor:" items={armorItems} selected={selectedArmor} onToggle={(item) => toggle(item, selectedArmor, setSelectedArmor)} />
              </div>
            )}

            <ToggleGroup label="Character Skill:" value={newCharAbility} setValue={setNewCharAbility} />

            {newCharAbility === 'no' ? (
              <div className="mb-6 rounded-md border-2 border-[#111820] px-4 py-5">
                <div className="mb-5 rounded-xl border-2 border-[#3fb36b] bg-[#eefcf1] p-4 text-sm font-bold text-[#324039]">
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#3fb36b] text-white">✓</span>
                  All active character skills are allowed except: Dmitri, Ryden, Orion.
                </div>
                <div className="mb-5 flex items-center gap-4 text-center text-lg font-extrabold text-[#4b4b4b]">
                  <span className="h-px flex-1 bg-[#aebbc3]" /> OR <span className="h-px flex-1 bg-[#aebbc3]" />
                </div>
                <ChipPicker title="Select to allow these active characters:" items={characters} selected={allowedChars} onToggle={(item) => toggle(item, allowedChars, setAllowedChars)} />
              </div>
            ) : null}

            <ToggleGroup label="Headshot mode:" value={newHS} setValue={setNewHS} />

            <CreateGroup label="Rounds:">
              {['7', '13'].map((value) => (
                <ChoiceButton key={value} active={newRounds === value} onClick={() => setNewRounds(value)}>{value}</ChoiceButton>
              ))}
            </CreateGroup>

            <CreateGroup label="Coin:">
              {['Default Coin', '9950'].map((value) => (
                <ChoiceButton key={value} active={newCoin === value} onClick={() => setNewCoin(value)}>{value}</ChoiceButton>
              ))}
            </CreateGroup>

            <CreateGroup label="Room Maker:">
              <ChoiceButton active={roomMaker === 'me'} onClick={() => setRoomMaker('me')}>Me</ChoiceButton>
              <ChoiceButton active={roomMaker === 'opponent'} onClick={() => setRoomMaker('opponent')}>Opponent</ChoiceButton>
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
              <p className="mt-2 font-bold">Potential winnings: {winnings.toFixed(1)} Points</p>
              <p className="mt-4 font-semibold italic text-[#df3b3b]">Create your own match.</p>
            </div>

            <button onClick={() => setShowRules(!showRules)} className="flex w-full items-center justify-between px-4 py-4 text-xl font-extrabold text-[#21486d]">
              <span>☷ Please read all the rules</span>
              <span>{showRules ? '⌃' : '⌄'}</span>
            </button>
            {showRules && (
              <p className="px-4 pb-4 text-sm font-semibold leading-7 text-[#1b2730]">
                Match मा यी compulsory items हुनुपर्छ। जुन items opponent ले match create गर्ने बेलामा select गरेको छैन,
                ती items match मा राख्न पाइदैन। Unselected items राखेमा rule अनुसार refund गर्न सकिन्छ।
              </p>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function TopAction({ icon, label, tone }: { icon: string; label: string; tone?: 'gold' }) {
  return (
    <button className="flex flex-col items-center gap-2 text-base font-semibold text-[#15191d]">
      <span className={tone === 'gold' ? 'text-4xl text-[#b89a00]' : 'text-5xl text-[#1e252a]'}>{icon}</span>
      <span>{label}</span>
    </button>
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

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[58px] min-w-[132px] rounded-md border px-5 text-xl font-medium shadow-sm ${
        active ? 'border-[#0d3e5a] bg-white text-black' : 'border-[#9eadb5] bg-[#e5e5e5] text-[#8a6d6d]'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleGroup({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) {
  return (
    <CreateGroup label={label}>
      <ChoiceButton active={value === 'yes'} onClick={() => setValue('yes')}>Yes</ChoiceButton>
      <ChoiceButton active={value === 'no'} onClick={() => setValue('no')}>No</ChoiceButton>
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
  const charAbilityYes = room.charAbility === 'yes';
  const roomWeapons = charAbilityYes ? splitList(room.gun) : [];
  const blockedWeapons = charAbilityYes ? weapons.filter((weapon) => !roomWeapons.includes(weapon)) : room.unallowedGuns || [];
  const blockedArmor = splitList(room.unallowedArmor);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSS = async () => {
    if (!screenshot) return;
    await apiService.uploadScreenshot(room._id, screenshot, ssMsg);
    setShowSS(false);
    setScreenshot('');
    setSsMsg('');
    onRefresh();
  };

  const handleGiveIdPass = async () => {
    if (!roomIdInput) return;
    await apiService.giveIdPass(room._id, roomIdInput, roomPassInput);
    setRoomIdInput('');
    setRoomPassInput('');
    setShowIdPass(false);
    onRefresh();
  };

  return (
    <article className="overflow-hidden rounded-md border-2 border-[#111820] bg-[#f8fcff]">
      <div className="space-y-4 px-4 py-4">
        <p className="flex items-center gap-3 text-lg font-extrabold">
          <span className="h-8 w-8 rounded-full bg-[#111820]" />
          Free Fire, Throwable Limit: {titleCase(room.throwable)}
        </p>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>🔥 Character Skill: {titleCase(room.charAbility)}</span>
          <span>- Rounds: {room.rounds}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-bold">
          <span>Team: {room.size}</span>
          <span className="text-right">Coin: {room.coin}</span>
        </div>
      </div>

      <button onClick={() => setShowItems(!showItems)} className="flex w-full items-center justify-between border-t border-[#aebbc3] px-4 py-4 text-lg font-extrabold">
        <span>Compulsory items:</span>
        <span className="text-[#00856f]">{showItems ? '⌃' : '⌄'}</span>
      </button>

      {showItems && (
        <div className="border-t border-[#aebbc3] px-4 pb-5 pt-4">
          <p className="mb-3 text-xl font-extrabold underline">Compulsory Weapons:</p>
          <ChipList items={roomWeapons.length ? roomWeapons : ['M1887']} mode="check" />
          <p className="mb-3 mt-5 text-xl font-extrabold underline">Compulsory Armor:</p>
          <ChipList items={armorItems.filter((item) => !blockedArmor.includes(item))} mode="check" />
          <p className="my-5 text-lg font-bold leading-9">
            ( Match मा यी compulsory items हुनुपर्छ। जुन items opponent ले match create गर्ने बेलामा select गर्नुभएको थिएन,
            ती items लाई match मा राख्न पाइदैन। )
          </p>
          <p className="mb-4 text-xl font-extrabold">- Unallowed items are:</p>
          <p className="mb-4 text-xl font-bold text-[#1b2730]"><span className="text-[#df4343]">×</span> ( Grenade items and torrets. )</p>
          <p className="mb-3 text-xl font-extrabold underline">Unallowed weapons:</p>
          <ChipList items={blockedWeapons} mode="x" />
          <p className="mb-3 mt-5 text-xl font-extrabold underline">Unallowed armor:</p>
          <ChipList items={blockedArmor.length ? blockedArmor : ['Vest lv3', 'Vest lv4', 'Helmet lv3']} mode="x" />
        </div>
      )}

      {isActive && room.roomIdPass && (isCreator || isJoined) && (
        <div className="border-t border-[#aebbc3] px-4 py-3 text-sm font-bold text-[#0d3e5a]">
          Room ID: {room.roomIdPass}{room.roomPass ? ` | Pass: ${room.roomPass}` : ''}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[#aebbc3] px-4 py-4">
        {isActive && !isMyRoom && !isJoined && (
          <button
            onClick={async () => {
              await apiService.joinRoom(room._id);
              onRefresh();
            }}
            className="rounded-xl bg-[#45b84e] px-6 py-4 text-lg font-extrabold text-white"
          >
            Join: {room.fee} Points
          </button>
        )}
        {isActive && isCreator && room.joinedBy && !room.roomIdPass && (
          <button onClick={() => setShowIdPass(!showIdPass)} className="rounded-xl bg-[#123865] px-5 py-4 text-base font-bold text-white">
            Add ID/Pass
          </button>
        )}
        {isActive && room.roomIdPass && (isCreator || isJoined) && !showSS && (
          <button onClick={() => setShowSS(true)} className="rounded-xl bg-[#45b84e] px-5 py-4 text-base font-bold text-white">
            Result
          </button>
        )}
        <div className="rounded-xl border-2 border-[#0d3e5a] px-4 py-3 text-center text-base font-extrabold text-[#0d3e5a]">
          Winnings: {room.fee + 10} Points
        </div>
      </div>

      {showIdPass && isCreator && (
        <div className="space-y-3 border-t border-[#aebbc3] px-4 py-4">
          <input value={roomIdInput} onChange={(event) => setRoomIdInput(event.target.value)} placeholder="Room ID" className="w-full rounded-md border border-[#8da7b5] bg-white px-3 py-3 outline-none" />
          <input value={roomPassInput} onChange={(event) => setRoomPassInput(event.target.value)} placeholder="Room Password" className="w-full rounded-md border border-[#8da7b5] bg-white px-3 py-3 outline-none" />
          <button onClick={handleGiveIdPass} className="w-full rounded-md bg-[#123865] py-3 font-bold text-white">Done</button>
        </div>
      )}

      {showSS && (
        <div className="space-y-3 border-t border-[#aebbc3] px-4 py-4">
          <input type="file" accept="image/*" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) setScreenshot(await toBase64(file));
          }} />
          {screenshot && <img src={screenshot} alt="preview" className="max-h-28 rounded-md" />}
          <input value={ssMsg} onChange={(event) => setSsMsg(event.target.value)} placeholder="Add a message" className="w-full rounded-md border border-[#8da7b5] bg-white px-3 py-3 outline-none" />
          <button onClick={handleUploadSS} disabled={!screenshot || !ssMsg} className="w-full rounded-md bg-[#45b84e] py-3 font-bold text-white disabled:bg-[#9ca8b0]">Submit Result</button>
        </div>
      )}
    </article>
  );
}

function ChipList({ items, mode }: { items: string[]; mode: 'check' | 'x' }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <span key={item} className="rounded-md border border-[#8da7b5] bg-[#f3f8fb] px-4 py-2 text-lg text-[#243b48] shadow-sm">
          <span className={mode === 'check' ? 'text-[#0d3e5a]' : 'text-[#df4343]'}>{mode === 'check' ? '✓' : '×'}</span> {item}
        </span>
      ))}
    </div>
  );
}

function splitList(value?: string) {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function titleCase(value?: string) {
  if (!value) return 'No';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
