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

    if (recipientAddress.trim() === publicKey.toBase58()) {
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
  const isValidForm = hasValidAddress && hasValidAmount && !isLoading;

  if (!publicKey) {
    return (
      <section
        className="container mx-auto px-6 py-10"
        style={{ position: 'relative', zIndex: 1 }}
      >
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
    <section
      className="container mx-auto px-6 py-10"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <Card
        className="bg-gray-900 border border-gray-800 max-w-md mx-auto"
        style={{ position: 'relative', zIndex: 2 }}
      >
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

        <CardContent
          className="space-y-4"
          style={{ position: 'relative', zIndex: 3 }}
        >
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
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#111827' : '#1F2937',
                border: `1px solid ${recipientAddress.trim() && !validateAddress(recipientAddress.trim()) ? '#EF4444' : '#374151'}`,
                color: isLoading ? '#6B7280' : 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: isLoading ? 'not-allowed' : 'text',
                zIndex: 10,
                position: 'relative',
                pointerEvents: isLoading ? 'none' : 'auto'
              }}
              onFocus={(e) => {
                if (!isLoading) e.target.style.borderColor = '#10B981';
              }}
              onBlur={(e) => {
                if (recipientAddress.trim() && !validateAddress(recipientAddress.trim())) {
                  e.target.style.borderColor = '#EF4444';
                } else {
                  e.target.style.borderColor = '#374151';
                }
              }}
            />
            {recipientAddress.trim() && !validateAddress(recipientAddress.trim()) && (
              <p className="text-red-400 text-xs">Invalid wallet address</p>
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
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#111827' : '#1F2937',
                border: '1px solid #374151',
                color: isLoading ? '#6B7280' : 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: isLoading ? 'not-allowed' : 'text',
                zIndex: 10,
                position: 'relative',
                pointerEvents: isLoading ? 'none' : 'auto'
              }}
              onFocus={(e) => { if (!isLoading) e.target.style.borderColor = '#10B981'; }}
              onBlur={(e) => { e.target.style.borderColor = '#374151'; }}
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendSol();
            }}
            disabled={!isValidForm}
            style={{
              width: '100%',
              backgroundColor: !isValidForm ? '#4B5563' : '#10B981',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: !isValidForm ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: !isValidForm ? 0.6 : 1,
              transition: 'all 0.2s ease',
              zIndex: 100,
              position: 'relative',
              pointerEvents: 'auto'
            }}
          >
            <Send style={{ width: '16px', height: '16px' }} />
            {isLoading ? 'Sending...' : `Send ${amount || 0} SOL`}
          </button>
        </CardContent>
      </Card>
    </section>
  );
};

export default SendSol;