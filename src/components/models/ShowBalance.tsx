'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const ShowBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fetchBalance = async () => {
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
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

  if (!connected) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Wallet className="w-4 h-4 text-gray-400" />
        <div>
          <span className="text-white text-lg font-bold">
            {isLoading ? 'Loading...' : `Wallet Balance - ${balance?.toFixed(2) || '0.00'} SOL`}
          </span>
          {/* <div className="text-xs text-gray-400">
            ~${((balance || 0) * 100).toFixed(0)}
          </div> */}
        </div>
      </div>

      <button
        onClick={fetchBalance}
        disabled={isLoading}
        style={{
          backgroundColor: '#374151',
          border: 'none',
          padding: '6px',
          borderRadius: '4px',
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          pointerEvents: 'auto',
          zIndex: 9999,
          position: 'relative'
        }}
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

