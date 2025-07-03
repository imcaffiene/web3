'use client';

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Wallet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const ShowBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fetchBalance = async () => {
    if (!publicKey) return toast.error('Wallet not connected');

    setIsLoading(true);
    try {
      const balanceLamports = await connection.getBalance(publicKey);
      setBalance(balanceLamports / LAMPORTS_PER_SOL);
      toast.success('Balance updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

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

const SendSol = () => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const validateAddress = (address: string) => {
    try {
      new PublicKey(address.trim());
      return true;
    } catch {
      return false;
    }
  };

  const isSelfTransfer = recipientAddress.trim() === publicKey?.toBase58().trim();

  const handleSendSol = async () => {
    if (!publicKey) return toast.error('Connect your wallet first');
    if (!validateAddress(recipientAddress)) return toast.error('Invalid recipient address');
    if (amount <= 0) return toast.error('Enter valid amount');
    if (isSelfTransfer) return toast.error('Cannot send to yourself');

    setIsLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      if (balance / LAMPORTS_PER_SOL < amount) throw new Error('Insufficient funds');

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress.trim()),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      toast.success(`${amount} SOL sent successfully!`);
      setRecipientAddress('');
      setAmount(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = validateAddress(recipientAddress) && amount > 0 && !isSelfTransfer && !isLoading;

  return (
    <section className="px-4 py-12 flex justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <ShowBalance />

        {publicKey ? (
          <div className="group">
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:rounded-[1.5rem] border-2 border-secondary/20 dark:border-secondary/50">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-300 z-[5]" />
              <div className="absolute inset-0 rounded-inherit border-2 border-primary/10 group-hover:border-primary/20 transition-all duration-700 z-[5]" />

              <Card className="bg-white/5 border-0 backdrop-blur-md relative overflow-hidden z-10">
                <div className="relative z-20">
                  <CardHeader className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/10"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}>
                      <Send className="w-8 h-8 text-white/90" />
                    </motion.div>

                    <CardTitle className="text-white/90 text-2xl font-bold mb-2">Send SOL</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-white/70 font-medium">Recipient Address</label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter wallet address"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-lg border text-white/90 placeholder-white/40 focus:outline-none transition-all duration-200 ${isLoading
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 focus:border-white/20 hover:border-white/20'
                          }`}
                      />
                      {isSelfTransfer && (
                        <p className="text-red-500 text-sm">Cannot send to yourself</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/70 font-medium">Amount (SOL)</label>
                      <input
                        type="number"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min="0"
                        step="0.001"
                        placeholder="0.00"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-lg border text-white/90 placeholder-white/40 focus:outline-none transition-all duration-200 ${isLoading
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 focus:border-white/20 hover:border-white/20'
                          }`}
                      />
                    </div>

                    <motion.button
                      onClick={handleSendSol}
                      disabled={!canSend}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-700 ${canSend
                          ? 'bg-white/90 text-black/90 hover:bg-white shadow-lg hover:shadow-primary/10'
                          : 'bg-white/10 text-white/50 cursor-not-allowed'
                        }`}
                      whileHover={canSend ? { scale: 1.02 } : {}}
                      whileTap={canSend ? { scale: 0.98 } : {}}
                      animate={{ scale: isLoading ? [1, 1.02, 1] : 1 }}
                      transition={{ scale: isLoading ? { repeat: Infinity, duration: 1 } : { type: 'spring' } }}>
                      <Send className="w-5 h-5" />
                      {isLoading ? 'Sending...' : `Send ${amount || 0} SOL`}
                    </motion.button>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="group">
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:rounded-[1.5rem] border-2 border-secondary/20 dark:border-secondary/50">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-300 z-[5]" />
              <div className="absolute inset-0 rounded-inherit border-2 border-primary/10 group-hover:border-primary/20 transition-all duration-700 z-[5]" />

              <Card className="bg-white/5 border-0 backdrop-blur-md relative overflow-hidden z-10">
                <div className="relative z-20">
                  <CardContent className="text-center py-20">
                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/10">
                      <Wallet className="w-8 h-8 text-white/90" />
                    </div>
                    <h2 className="text-white/90 text-xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-white/70">Please connect your wallet to send SOL</p>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SendSol;
