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

// eSewa QR image for owner (paste latest link here if you update QR)
const DEPOSIT_QR_URL = 'https://cdn.discordapp.com/attachments/1516081649907929341/1517167945258762240/eSewa_My_QR_9764880598_1781791407317_2026-06-18_19_48_27.jpg?ex=6a354c41&is=6a33fac1&hm=344725c797af773bba9fa6b603059cdae02e2fb5d7ba3918ed5e3e380858b502';


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

          {/* eSewa QR for owner payment */}
          <div className="mb-5 rounded-2xl border border-[#00d4ff]/10 bg-[#13162a] p-4">
            <p className="text-[#b0b0b0] text-xs uppercase tracking-[0.3em] mb-3">Owner eSewa QR</p>
            <div className="rounded-xl bg-[#0f0f1e] p-3 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DEPOSIT_QR_URL} alt="eSewa QR" className="max-w-[240px] rounded-lg" />
              <p className="mt-3 text-[11px] text-[#b0b0b0] text-center">Pay from your app using this QR, then submit UTR in eSewa success flow.</p>
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


      </div>
      <BottomNav />
    </div>
  );
}
