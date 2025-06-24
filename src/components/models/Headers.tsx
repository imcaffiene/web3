'use client';

import React from 'react';
import { Copy, LogOut, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { ShowBalance } from './ShowBalance';

// Dynamically import WalletMultiButton with no SSR
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const Headers = () => {
  const { publicKey, disconnect } = useWallet();

  const walletAddress = publicKey?.toBase58() || '';

  const copyAddress = (e: React.MouseEvent) => {
    console.log('Copy button clicked - handler called');
    try {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy address');
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    console.log('Disconnect button clicked - handler called');
    try {
      disconnect();
      toast.success('Wallet disconnected');
    } catch (err) {
      console.error('Failed to disconnect:', err);
      toast.error('Failed to disconnect wallet');
    }
  };

  return (
    <>
      <header className="container mx-auto px-6 py-6"
        style={{ position: 'relative', zIndex: 9999 }}>
        <nav className="flex items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-800" style={{ position: 'relative', zIndex: 9999 }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-white">
              SolanaAirdrop
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {publicKey ? (
              <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700" style={{ position: 'relative', zIndex: 9999 }}>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                </span>

                <button
                  onClick={copyAddress}
                  style={{
                    background: '#374151',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    minWidth: '32px',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4B5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
                >
                  <Copy style={{ width: '12px', height: '12px' }} />
                </button>

                <button
                  onClick={handleDisconnect}
                  style={{
                    background: '#374151',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    color: '#F87171',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    minWidth: '32px',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#7F1D1D'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
                >
                  <LogOut style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', zIndex: 9999 }}>
                <WalletMultiButton />
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Render ShowBalance component below header */}
      {publicKey && (
        <section className="container mx-auto px-6 pb-4">
          <ShowBalance />
        </section>
      )}
    </>
  );
};

export default Headers;


