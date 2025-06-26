'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Gift, Wallet, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';

export const AirdropRequest = () => {
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [airdropCount, setAirdropCount] = useState<number>(0);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const COOLDOWN_DURATION = 5 * 60 * 1000;

  // Load airdrop count from localStorage when wallet changes
  useEffect(() => {
    if (publicKey) {
      const walletAddress = publicKey.toBase58();
      const storedCount = localStorage.getItem(`airdrop_count_${walletAddress}`);
      const storedCooldown = localStorage.getItem(`airdrop_cooldown_${walletAddress}`);

      if (storedCount) {
        setAirdropCount(parseInt(storedCount));
      }

      if (storedCooldown) {
        const cooldownEnd = parseInt(storedCooldown);
        const now = Date.now();

        if (now < cooldownEnd) {
          setIsOnCooldown(true);
          setCooldownTime(cooldownEnd - now);
        } else {
          // Cooldown expired, reset count
          localStorage.removeItem(`airdrop_count_${walletAddress}`);
          localStorage.removeItem(`airdrop_cooldown_${walletAddress}`);
          setAirdropCount(0);
          setIsOnCooldown(false);
        }
      }
    }
  }, [publicKey]);

  // Countdown timer effect
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

  const handleClaimAirdrop = async () => {
    console.log('Claim button clicked!');

    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isOnCooldown) {
      toast.error(`Please wait ${Math.ceil(cooldownTime / 60000)} minutes before next airdrop`);
      return;
    }

    if (airdropCount >= 2) {
      toast.error('Maximum airdrops reached. Please wait for cooldown.');
      return;
    }

    setIsLoading(true);
    try {
      // Convert amount to lamports
      const lamports = amount * LAMPORTS_PER_SOL;

      // Request airdrop using PublicKey object, not string
      const signature = await connection.requestAirdrop(publicKey, lamports);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Update airdrop count
      const newCount = airdropCount + 1;
      const walletAddress = publicKey.toBase58();

      setAirdropCount(newCount);
      localStorage.setItem(`airdrop_count_${walletAddress}`, newCount.toString());

      // If reached limit, start 5-minute cooldown
      if (newCount >= 2) {
        const cooldownEnd = Date.now() + COOLDOWN_DURATION; // 5 minutes
        setCooldownTime(COOLDOWN_DURATION);
        setIsOnCooldown(true);
        localStorage.setItem(`airdrop_cooldown_${walletAddress}`, cooldownEnd.toString());
        toast.success(`Successfully airdropped ${amount} SOL! 5-minute cooldown started.`);
      } else {
        toast.success(`Successfully airdropped ${amount} SOL! ${2 - newCount} airdrops remaining.`);
      }

      console.log('Airdrop signature:', signature);

    } catch (error) {
      console.error('Airdrop failed:', error);
      toast.error('Airdrop failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getProgressPercentage = () => {
    if (!isOnCooldown) return 0;
    return ((COOLDOWN_DURATION - cooldownTime) / COOLDOWN_DURATION) * 100;
  };

  const canAirdrop = !isOnCooldown && airdropCount < 2 && !isLoading;

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="max-w-2xl mx-auto">
        {publicKey ? (
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Gift className="w-8 h-8 text-white" />
              </div>

              <CardTitle className="text-white text-2xl font-bold mb-4">
                Claim Your Airdrop
              </CardTitle>

              {/* Enhanced Status Section - 2 Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Airdrop Progress */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-xs font-medium">Progress</span>
                    <span className="text-white text-sm font-bold">{airdropCount}/2</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(airdropCount / 2) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {airdropCount < 2 ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">
                          {2 - airdropCount} remaining
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400 text-xs">
                          Max reached
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Card */}
                <div className={`rounded-lg p-4 border ${isOnCooldown
                  ? 'bg-orange-900/20 border-orange-700/50'
                  : 'bg-green-900/20 border-green-700/50'
                  }`}>
                  {isOnCooldown ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <span className="text-orange-400 text-xs font-medium">Cooldown</span>
                        </div>
                        <span className="text-orange-300 text-sm font-mono font-bold">
                          {formatTime(cooldownTime)}
                        </span>
                      </div>

                      {/* Cooldown Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>

                      <p className="text-gray-400 text-xs">
                        Wait to request more SOL
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                      <span className="text-green-400 text-sm font-medium text-center">
                        Ready to claim!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium">Amount (SOL)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="0.1"
                  max="2"
                  step="0.1"
                  placeholder="Enter amount (max 2 SOL)"
                  disabled={!canAirdrop}
                  style={{
                    width: '100%',
                    backgroundColor: !canAirdrop ? '#111827' : '#1F2937',
                    border: '1px solid #374151',
                    color: !canAirdrop ? '#6B7280' : 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    position: 'relative',
                    cursor: !canAirdrop ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => canAirdrop && (e.target.style.borderColor = '#10B981')}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium">Your Wallet Address</label>
                <input
                  value={publicKey.toBase58()}
                  readOnly
                  style={{
                    width: '100%',
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    position: 'relative'
                  }}
                />
              </div>

              <button
                onClick={handleClaimAirdrop}
                disabled={!canAirdrop}
                style={{
                  width: '100%',
                  backgroundColor: !canAirdrop ? '#4B5563' : isLoading ? '#4B5563' : '#10B981',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: !canAirdrop ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s',
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  position: 'relative',
                  opacity: !canAirdrop ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (canAirdrop) e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  if (canAirdrop) e.currentTarget.style.backgroundColor = '#10B981';
                }}
              >
                {isOnCooldown ? (
                  <>
                    <Clock style={{ width: '20px', height: '20px' }} />
                    Wait {formatTime(cooldownTime)}
                  </>
                ) : (
                  <>
                    <Gift style={{ width: '20px', height: '20px' }} />
                    {isLoading ? 'Processing...' : `Claim ${amount} SOL Tokens`}
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border border-gray-800">
            <CardContent className="text-center py-20">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to claim SOL tokens</p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

