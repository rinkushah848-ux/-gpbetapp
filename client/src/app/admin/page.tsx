'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import authService, { User } from '@/utils/authService';
import apiService, { GameData } from '@/utils/apiService';
import { useProtectedRoute } from '@/utils/useAuth';

export default function AdminPage() {
  const { isLoading } = useProtectedRoute();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'reviews' | 'users' | 'transactions'>('reviews');
  const [pendingGames, setPendingGames] = useState<GameData[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<{ [gameId: string]: string }>({});
  const [creditModal, setCreditModal] = useState<{ userId: string; username: string } | null>(null);
  const [creditAmt, setCreditAmt] = useState(0);
  const [creditDesc, setCreditDesc] = useState('');

  useEffect(() => {
    authService.getMe().then(setUser).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    apiService.getPendingReviews().then(setPendingGames).catch(console.error);
    apiService.getAdminUsers().then(setUsers).catch(console.error);
    apiService.getTransactions().then(setTransactions).catch(console.error);
  }, [user]);

  const handleApprove = async (gameId: string) => {
    const winnerId = selectedWinner[gameId];
    if (!winnerId) return alert('Select a winner first');
    try {
      await apiService.approveGame(gameId, winnerId);
      setPendingGames(prev => prev.filter(g => g._id !== gameId));
      alert('Winner approved! Points awarded.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleCredit = async () => {
    if (!creditModal || creditAmt <= 0) return;
    try {
      await apiService.adminCredit(creditModal.userId, creditAmt, creditDesc);
      alert(`Credited ${creditAmt} pts to ${creditModal.username}`);
      setCreditModal(null);
      setCreditAmt(0);
      setCreditDesc('');
      const u = await apiService.getAdminUsers();
      setUsers(u);
      const t = await apiService.getTransactions();
      setTransactions(t);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full"></div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-[#eaeaea] mb-2">Access Denied</h2>
          <p className="text-sm text-[#b0b0b0]">Only admins can access this panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'reviews' as const, label: `Reviews (${pendingGames.length})`, icon: '📋' },
    { key: 'users' as const, label: 'Users', icon: '👥' },
    { key: 'transactions' as const, label: 'Transactions', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1e] pb-28 px-4 pt-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Header title="Admin Panel" subtitle="Manage reviews & points" />
          <div className="rounded-2xl border border-[#ffcc00]/20 bg-[#1a1c36] px-4 py-3 text-right">
            <p className="text-[10px] text-[#ffcc00]">Admin</p>
            <p className="text-lg font-bold text-[#ffcc00]">{user?.username}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 rounded-xl px-3 py-3 text-xs font-bold transition ${tab === t.key ? 'bg-[#ffcc00] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0] hover:bg-[#ffcc00] hover:text-[#0f0f1e]'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Reviews Tab */}
        {tab === 'reviews' && (
          <section className="space-y-4">
            {pendingGames.length === 0 ? (
              <div className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-8 text-center">
                <p className="text-[#b0b0b0] text-sm">No pending reviews.</p>
              </div>
            ) : (
              pendingGames.map(game => (
                <div key={game._id} className="rounded-3xl border border-[#ffcc00]/20 bg-[#13162a] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#eaeaea]">Review Match</h3>
                    <span className="text-[10px] bg-[#ffcc00]/20 text-[#ffcc00] px-2 py-0.5 rounded">PENDING</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#1a1c36] rounded-xl p-3">
                      <p className="text-xs font-bold text-[#00d4ff]">{game.player1?.username}</p>
                      <p className="text-[10px] text-[#b0b0b0]">UID: {game.player1?.uid}</p>
                      {game.screenshot1 ? (
                        <img src={game.screenshot1} alt="SS1" className="mt-2 rounded-lg max-h-32 w-full object-cover" />
                      ) : <p className="text-[10px] text-[#ff6b6b] mt-2">No screenshot</p>}
                      {game.message1 && <p className="text-[10px] text-[#b0b0b0] mt-1">"{game.message1}"</p>}
                    </div>
                    <div className="bg-[#1a1c36] rounded-xl p-3">
                      <p className="text-xs font-bold text-[#ff6600]">{game.player2?.username}</p>
                      <p className="text-[10px] text-[#b0b0b0]">UID: {game.player2?.uid}</p>
                      {game.screenshot2 ? (
                        <img src={game.screenshot2} alt="SS2" className="mt-2 rounded-lg max-h-32 w-full object-cover" />
                      ) : <p className="text-[10px] text-[#ff6b6b] mt-2">No screenshot</p>}
                      {game.message2 && <p className="text-[10px] text-[#b0b0b0] mt-1">"{game.message2}"</p>}
                    </div>
                  </div>
                  <div className="bg-[#0f1a2e] rounded-xl p-3 mb-3">
                    <p className="text-[10px] text-[#b0b0b0] mb-2">Select Winner:</p>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedWinner(prev => ({ ...prev, [game._id]: game.player1?._id }))}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${selectedWinner[game._id] === game.player1?._id ? 'bg-[#00d4ff] text-[#0f0f1e]' : 'bg-[#16213e] text-[#b0b0b0]'}`}>
                        {game.player1?.username}
                      </button>
                      <button onClick={() => setSelectedWinner(prev => ({ ...prev, [game._id]: game.player2?._id }))}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${selectedWinner[game._id] === game.player2?._id ? 'bg-[#ff6600] text-white' : 'bg-[#16213e] text-[#b0b0b0]'}`}>
                        {game.player2?.username}
                      </button>
                    </div>
                  </div>
                  <button onClick={() => handleApprove(game._id)}
                    disabled={!selectedWinner[game._id]}
                    className={`w-full rounded-xl py-3 text-sm font-bold transition ${selectedWinner[game._id] ? 'bg-[#00ff88] text-[#0f0f1e] hover:bg-[#00ff88]/80' : 'bg-[#555]/20 text-[#555] cursor-not-allowed'}`}>
                    ✅ Approve & Award Points
                  </button>
                </div>
              ))
            )}
          </section>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <section className="space-y-3">
            {users.map(u => (
              <div key={u._id} className="rounded-2xl border border-[#00d4ff]/10 bg-[#13162a] p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#eaeaea]">{u.username}</p>
                  <p className="text-[10px] text-[#b0b0b0]">UID: {u.uid} | Role: {u.role}</p>
                  <p className="text-xs text-[#00ff88] font-bold">{u.points} pts</p>
                </div>
                <button onClick={() => setCreditModal({ userId: u._id, username: u.username })}
                  className="bg-[#ffcc00]/20 text-[#ffcc00] rounded-xl px-3 py-2 text-xs font-bold hover:bg-[#ffcc00] hover:text-[#0f0f1e] transition">
                  💰 Credit
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <div className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-8 text-center">
                <p className="text-[#b0b0b0] text-sm">No users found.</p>
              </div>
            )}
          </section>
        )}

        {/* Transactions Tab */}
        {tab === 'transactions' && (
          <section className="space-y-2">
            {transactions.length === 0 ? (
              <div className="rounded-3xl border border-[#00d4ff]/10 bg-[#13162a] p-8 text-center">
                <p className="text-[#b0b0b0] text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#00d4ff]/10 bg-[#13162a] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#16213e] text-[#b0b0b0]">
                        <th className="px-3 py-2 text-left">User</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                        <th className="px-3 py-2 text-left hidden md:table-cell">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx: any) => (
                        <tr key={tx._id} className="border-t border-[#00d4ff]/5 text-[#eaeaea]">
                          <td className="px-3 py-2">{tx.user?.username || 'N/A'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${tx.type === 'game_win' ? 'bg-[#00ff88]/20 text-[#00ff88]' : tx.type === 'room_create' ? 'bg-[#ff6b6b]/20 text-[#ff6b6b]' : 'bg-[#00d4ff]/20 text-[#00d4ff]'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`px-3 py-2 text-right font-bold ${tx.amount > 0 ? 'text-[#00ff88]' : 'text-[#ff6b6b]'}`}>{tx.amount}</td>
                          <td className="px-3 py-2 text-right text-[#b0b0b0]">{tx.balanceAfter}</td>
                          <td className="px-3 py-2 text-[#b0b0b0] hidden md:table-cell">{tx.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Credit Modal */}
        {creditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#12142c] border border-[#ffcc00]/30 rounded-3xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-[#eaeaea] mb-2">Credit Points</h3>
              <p className="text-xs text-[#b0b0b0] mb-4">To: <span className="text-[#ffcc00] font-bold">{creditModal.username}</span></p>
              <div className="space-y-3">
                <input type="number" value={creditAmt} onChange={e => setCreditAmt(Math.max(1, Number(e.target.value)))}
                  className="input-field text-sm" placeholder="Amount" min={1} />
                <input type="text" value={creditDesc} onChange={e => setCreditDesc(e.target.value)}
                  className="input-field text-sm" placeholder="Description (optional)" />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setCreditModal(null)} className="w-full btn-secondary text-sm">Cancel</button>
                <button onClick={handleCredit} className="w-full btn-primary text-sm">Credit</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
