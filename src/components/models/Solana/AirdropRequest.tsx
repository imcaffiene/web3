'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShowBalance } from './ShowBalance';
import { useDebounce } from '@/hooks/useDebounce';

export const AirdropRequest = () => {
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [airdropCount, setAirdropCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const COOLDOWN_DURATION = 5 * 60 * 1000;
  const MAX_AIRDROPS = 2;
  const MIN_AMOUNT = 0.1;
  const MAX_AMOUNT = 2;

  useEffect(() => {
    if (publicKey) {
      const walletAddress = publicKey.toBase58();
      const storedCount = localStorage.getItem(`airdrop_count_${walletAddress}`);
      const storedCooldown = localStorage.getItem(`airdrop_cooldown_${walletAddress}`);

      if (storedCount) setAirdropCount(parseInt(storedCount));

      if (storedCooldown) {
        const cooldownEnd = parseInt(storedCooldown);
        const now = Date.now();

        if (now < cooldownEnd) {
          setIsOnCooldown(true);
          setCooldownTime(cooldownEnd - now);
        } else {
          localStorage.removeItem(`airdrop_count_${walletAddress}`);
          localStorage.removeItem(`airdrop_cooldown_${walletAddress}`);
          setAirdropCount(0);
          setIsOnCooldown(false);
        }
      }
    }
  }, [publicKey]);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1000) {
            setIsOnCooldown(false);
            if (publicKey) {
              const walletAddress = publicKey.toBase58();
              localStorage.removeItem(`airdrop_count_${walletAddress}`);
              localStorage.removeItem(`airdrop_cooldown_${walletAddress}`);
              setAirdropCount(0);
            }
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime, publicKey]);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      await connection.getBalance(publicKey);
    } catch (err) {
      console.error('Failed to refresh balance', err);
    }
  }, [connection, publicKey]);

  const claimAirdrop = async () => {
    if (!publicKey) return toast.error('Please connect your wallet first');
    if (isOnCooldown) return toast.error(`Wait ${Math.ceil(cooldownTime / 60000)} min`);
    if (airdropCount >= MAX_AIRDROPS) return toast.error('Max airdrops reached. Wait cooldown.');

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return toast.error(`Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT} SOL`);
    }

    if (connection.rpcEndpoint.includes('mainnet')) {
      return toast.error('Airdrop only works on devnet or testnet');
    }

    setIsLoading(true);
    try {
      const lamports = amount * LAMPORTS_PER_SOL;
      const signature = await connection.requestAirdrop(publicKey, lamports);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) throw new Error('Transaction failed');

      const newCount = airdropCount + 1;
      const walletAddress = publicKey.toBase58();

      setAirdropCount(newCount);
      localStorage.setItem(`airdrop_count_${walletAddress}`, newCount.toString());

      if (newCount >= MAX_AIRDROPS) {
        const cooldownEnd = Date.now() + COOLDOWN_DURATION;
        setCooldownTime(COOLDOWN_DURATION);
        setIsOnCooldown(true);
        localStorage.setItem(`airdrop_cooldown_${walletAddress}`, cooldownEnd.toString());
        toast.success(`Airdropped ${amount} SOL! Cooldown started.`);
      } else {
        toast.success(`Airdropped ${amount} SOL! ${MAX_AIRDROPS - newCount} remaining.`);
      }

      await refreshBalance();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Airdrop failed';
      toast.error(msg.includes('429') ? 'Too many requests. Please wait.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedClaim = useDebounce(claimAirdrop, 500);

  const formatTime = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const canAirdrop = !!publicKey && !isOnCooldown && airdropCount < MAX_AIRDROPS && !isLoading;

  return (
    <section className="px-4 py-12 flex justify-center">
      <div className="w-full max-w-2xl">

        <div className="group">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl border-2 border-secondary/20 dark:border-secondary/50">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-30 group-hover:opacity-50 transition z-5" />
            <div className="absolute inset-0 rounded-inherit border-2 border-primary/10 group-hover:border-primary/20 transition z-5" />

            <Card className="bg-white/5 border-0 backdrop-blur-md relative z-10">
              <div className="relative z-20">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/10"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}>
                    <Gift className="w-8 h-8 text-white/90" />
                  </motion.div>

                  <CardTitle className="text-white/90 text-2xl font-bold mb-2">Claim Your Airdrop</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ShowBalance />

                  {publicKey ? (
                    <>
                      <div>
                        <label className="text-white/70 font-medium">Amount (SOL)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setAmount(Math.min(Math.max(value, MIN_AMOUNT), MAX_AMOUNT));
                            }
                          }}
                          min={MIN_AMOUNT} max={MAX_AMOUNT} step="0.1"
                          disabled={!canAirdrop}
                          className={`w-full px-4 py-3 rounded-lg border text-white/90 bg-white/5 placeholder-white/40 focus:outline-none ${!canAirdrop ? 'cursor-not-allowed' : 'focus:border-white/20 hover:border-white/20'}`}
                        />
                      </div>

                      <div>
                        <label className="text-white/70 font-medium">Your Wallet Address</label>
                        <input
                          value={`${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border bg-white/5 border-white/10 text-white/90"
                        />
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between mb-2">
                          <span className="text-white/70 text-sm">Airdrops Used:</span>
                          <span className="text-white/90 font-medium">{airdropCount}/{MAX_AIRDROPS}</span>
                        </div>
                        {isOnCooldown && (
                          <div className="flex justify-between">
                            <span className="text-white/70 text-sm">Cooldown:</span>
                            <span className="text-red-300 font-mono">{formatTime(cooldownTime)}</span>
                          </div>
                        )}
                      </div>

                      <motion.button
                        onClick={() => debouncedClaim()}
                        disabled={!canAirdrop}
                        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition ${canAirdrop ? 'bg-white/90 text-black hover:bg-white' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
                        whileHover={canAirdrop ? { scale: 1.02 } : {}}
                        whileTap={canAirdrop ? { scale: 0.98 } : {}}
                        animate={{ scale: isLoading ? [1, 1.02, 1] : 1 }}
                        transition={{ scale: isLoading ? { repeat: Infinity, duration: 1 } : { type: 'spring' } }}>
                        <Gift className="w-5 h-5" />
                        {isOnCooldown ? `Wait ${formatTime(cooldownTime)}` : isLoading ? 'Processing...' : `Claim ${amount} SOL Tokens`}
                      </motion.button>
                    </>
                  ) : (
                    <div className="text-center text-white/70">Connect your wallet to claim airdrop.</div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </section>
  );
};
