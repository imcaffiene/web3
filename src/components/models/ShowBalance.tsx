'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';

export const ShowBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fetchBalance = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
      setError(null);
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">Connect wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Wallet Balance</h3>
        <button
          onClick={fetchBalance}
          disabled={isLoading}
          style={{
            backgroundColor: '#374151',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="space-y-2">
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">SOL Balance:</span>
            <span className="text-white text-xl font-bold">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                `${balance?.toFixed(4) || '0.0000'} SOL`
              )}
            </span>
          </div>
        )}


      </div>
    </div>
  );
};

