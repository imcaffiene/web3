'use client';

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Send, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const SendSol = () => {
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const validateAddress = (address: string): boolean => {
    if (!address || address.trim().length === 0) return false;
    try {
      new PublicKey(address.trim());
      return true;
    } catch (error) {
      console.error('Invalid address:', error);
      return false;
    }
  };

  // Check if user is trying to send to themselves
  const isSelfTransfer = (): boolean => {
    if (!publicKey || !recipientAddress.trim()) return false;
    return recipientAddress.trim() === publicKey.toBase58();
  };

  const handleSendSol = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!recipientAddress.trim()) {
      toast.error('Please enter recipient address');
      return;
    }

    if (!validateAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check for self-transfer BEFORE setting loading state
    if (isSelfTransfer()) {
      toast.error('Cannot send SOL to yourself');
      return;
    }

    setIsLoading(true);

    try {
      // Check sender's balance
      const balance = await connection.getBalance(publicKey);
      const balanceInSOL = balance / LAMPORTS_PER_SOL;

      if (balanceInSOL < amount) {
        toast.error(`Insufficient balance. You have ${balanceInSOL.toFixed(4)} SOL`);
        setIsLoading(false);
        return;
      }

      // Create recipient public key
      const recipientPublicKey = new PublicKey(recipientAddress.trim());

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      // Create transaction
      const transaction = new Transaction().add(transferInstruction);

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      toast.success(`Successfully sent ${amount} SOL!`);

      // Reset form
      setRecipientAddress('');
      setAmount(0);

      console.log('Transaction signature:', signature);

    } catch (error: unknown) {
      console.error('Send transaction failed:', error);

      // Type-safe error handling
      if (error instanceof Error) {
        if (error.message?.includes('insufficient funds')) {
          toast.error('Insufficient funds for transaction');
        } else if (error.message?.includes('User rejected')) {
          toast.error('Transaction cancelled by user');
        } else {
          toast.error('Transaction failed. Please try again.');
        }
      } else {
        // Handle non-Error objects
        toast.error('Transaction failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasValidAddress = recipientAddress.trim().length > 0 && validateAddress(recipientAddress.trim());
  const hasValidAmount = amount > 0;
  const notSelfTransfer = !isSelfTransfer(); // Add this validation
  const isValidForm = hasValidAddress && hasValidAmount && notSelfTransfer && !isLoading;

  if (!publicKey) {
    return (
      <section className="container mx-auto px-6 py-10 relative z-[1]">
        <Card className="bg-gray-900 border border-gray-800 max-w-md mx-auto">
          <CardContent className="text-center py-10">
            <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h2 className="text-white text-lg font-bold mb-1">Connect Wallet</h2>
            <p className="text-gray-400 text-sm">Connect to send SOL tokens</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-10 relative z-[1]">
      <Card className="bg-gray-900 border border-gray-800 max-w-md mx-auto relative z-[2]">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
            <Send className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-white text-xl font-bold mb-2">
            Send SOL
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Transfer SOL tokens to another wallet
          </p>
        </CardHeader>

        <CardContent className="space-y-4 relative z-[3]">
          {/* Recipient Address */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
              }}
              placeholder="Enter wallet address (e.g., 7xKX...)"
              disabled={isLoading}
              className={`
                w-full p-3 rounded-lg text-sm outline-none transition-colors relative z-10
                ${isLoading
                  ? 'bg-gray-900 text-gray-500 cursor-not-allowed pointer-events-none'
                  : 'bg-gray-800 text-white cursor-text'
                }
                ${recipientAddress.trim() && !validateAddress(recipientAddress.trim())
                  ? 'border border-red-500'
                  : 'border border-gray-700 focus:border-green-500'
                }
                ${isSelfTransfer()
                  ? 'border-yellow-500'
                  : ''
                }
              `}
            />
            {recipientAddress.trim() && !validateAddress(recipientAddress.trim()) && (
              <p className="text-red-400 text-xs">Invalid wallet address</p>
            )}
            {isSelfTransfer() && (
              <p className="text-yellow-400 text-xs">Cannot send SOL to your own wallet</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => {
                const newAmount = Number(e.target.value);
                setAmount(newAmount);
              }}
              min="0"
              step="0.001"
              placeholder="0.00"
              disabled={isLoading}
              className={`
                w-full p-3 rounded-lg text-sm outline-none transition-colors relative z-10
                border border-gray-700 focus:border-green-500
                ${isLoading
                  ? 'bg-gray-900 text-gray-500 cursor-not-allowed pointer-events-none'
                  : 'bg-gray-800 text-white cursor-text'
                }
              `}
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendSol}
            disabled={!isValidForm}
            className={`
              w-full p-3 rounded-lg border-none text-white font-semibold text-base
              flex items-center justify-center gap-2 transition-all duration-200
              relative z-[100]
              ${!isValidForm
                ? 'bg-gray-600 cursor-not-allowed opacity-60'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
              }
            `}
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : `Send ${amount || 0} SOL`}
          </button>
        </CardContent>
      </Card>
    </section>
  );
};

export default SendSol;
