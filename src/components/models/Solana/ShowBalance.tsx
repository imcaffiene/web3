'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const ShowBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);

    try {
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
      toast.success('Balance updated');
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, fetchBalance]);

  if (!connected) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
          <Wallet className="w-5 h-5 text-white/90" />
        </div>
        <div>
          <span className="text-white/90 font-semibold text-lg">
            {isLoading ? 'Loading...' : `Balance: ${balance?.toFixed(4) || '0.0000'} SOL`}
          </span>
        </div>
      </div>
      <button
        onClick={fetchBalance}
        disabled={isLoading}
        className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/10 px-3 py-2 rounded-lg text-white flex items-center justify-center transition">
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
