'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import authService, { User } from '@/utils/authService';
import { useProtectedRoute } from '@/utils/useAuth';

const PRESET_AMOUNTS = [30, 50, 100, 200, 500, 1000];
const MIN_DEPOSIT = 30;
const MAX_DEPOSIT = 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DepositRecord {
  _id: string;
  amount: number;
  status: string;
  utrNumber?: string;
  uuid?: string;
  createdAt: string;
}

interface DepositResponse {
  deposits: DepositRecord[];
}

export default function DepositPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useProtectedRoute();
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<number>(30);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

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

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/api/finance/my-deposits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: DepositResponse = await res.json();
      setDeposits(data.deposits || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePresetClick = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    setError('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) setAmount(parsed);
    }
    setError('');
  };

  const handlePay = async () => {
    if (amount < MIN_DEPOSIT || amount > MAX_DEPOSIT) {
      setError(`Amount must be between NPR ${MIN_DEPOSIT} and NPR ${MAX_DEPOSIT}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/api/esewa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to initiate payment');
        setLoading(false);
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.gatewayUrl;

      for (const [key, value] of Object.entries(data.formData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <Header title="Deposit" subtitle="Add funds to your account" />

        {successMsg && (
          <div className="mb-6 p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl text-[#00ff88] text-sm">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#ff006e]/10 border border-[#ff006e]/30 rounded-xl text-[#ff006e] text-sm">
            {error}
          </div>
        )}

        <div className="card mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div className="bg-[#13162a] rounded-3xl p-5 border border-[#00d4ff] border-opacity-10">
              <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Points Balance</p>
              <p className="text-3xl font-bold text-[#00ff88]">{user?.points ?? 0}</p>
            </div>
            <div className="bg-[#13162a] rounded-3xl p-5 border border-[#ffcc00] border-opacity-10">
              <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Exchange Rate</p>
              <p className="text-xl font-bold text-[#ffcc00]">10 NPR = 10 Points</p>
            </div>
          </div>

          <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-4">Select Amount</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => handlePresetClick(val)}
                className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                  amount === val && !customAmount
                    ? 'bg-[#00d4ff] text-[#0f0f1e] border-[#00d4ff]'
                    : 'bg-[#13162a] text-[#b0b0b0] border-[#00d4ff] border-opacity-20 hover:border-opacity-60'
                }`}
              >
                NPR {val}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-2">Custom Amount</p>
            <input
              type="number"
              min={MIN_DEPOSIT}
              max={MAX_DEPOSIT}
              value={customAmount}
              onChange={handleCustomChange}
              placeholder={`Min NPR ${MIN_DEPOSIT} - Max NPR ${MAX_DEPOSIT}`}
              className="input-field"
            />
          </div>

          <div className="bg-[#13162a] rounded-2xl p-4 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-[#b0b0b0] text-sm">You will receive</span>
              <span className="text-[#00ff88] font-bold text-xl">{amount || 0} Points</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all bg-[#00d4ff] text-[#0f0f1e] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay with eSewa'}
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em]">Deposit History</p>
            <button onClick={fetchDeposits} className="text-[#00d4ff] text-xs font-semibold hover:underline">
              Refresh
            </button>
          </div>

          {deposits.length === 0 ? (
            <p className="text-[#b0b0b0] text-sm py-6 text-center">No deposits yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#b0b0b0] text-xs uppercase border-b border-[#00d4ff] border-opacity-10">
                    <th className="text-left py-3 pr-3">Date</th>
                    <th className="text-right pr-3">Amount (NPR)</th>
                    <th className="text-right pr-3">Points</th>
                    <th className="text-right pr-3">Status</th>
                    <th className="text-right">UTR</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d._id} className="border-b border-[#00d4ff] border-opacity-5">
                      <td className="py-3 pr-3 text-[#eaeaea] whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-3 text-right text-[#eaeaea]">{d.amount}</td>
                      <td className="py-3 pr-3 text-right text-[#00ff88]">{d.amount}</td>
                      <td className="py-3 pr-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            d.status === 'approved'
                              ? 'text-[#00ff88] bg-[#00ff88]/10'
                              : d.status === 'rejected'
                              ? 'text-[#ff006e] bg-[#ff006e]/10'
                              : 'text-[#ffcc00] bg-[#ffcc00]/10'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[#b0b0b0] text-[10px] max-w-[80px] truncate">
                        {d.utrNumber || d.uuid || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
