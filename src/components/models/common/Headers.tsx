'use client';

import React from 'react';
import { Copy, LogOut } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CoinIcon from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';


// Dynamically import WalletMultiButton with no SSR
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const Headers = () => {
  const { publicKey, disconnect } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';

  const copyAddress = () => {
    try {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      toast.success('Wallet disconnected');
    } catch (err) {
      toast.error('Failed to disconnect wallet');
    }
  };

  return (
    <header className="relative z-10 w-full">
      <nav className="flex justify-between items-center px-8 py-6 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 font-libre-caslon text-xl">
          <CoinIcon className="w-7 h-7" />
          <Link href="/" className="font-bold tracking-wide hover:opacity-80 transition-opacity">
            PIECE OF EIGHT
          </Link>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-8 font-manrope text-base">

          <Link href="/solana" className="hover:opacity-70 transition-opacity font-semibold">
            Solana
          </Link>
          <Link href="/eth" className="hover:opacity-70 transition-opacity font-semibold">
            Eth
          </Link>
          <Link href="/resources" className="hover:opacity-70 transition-opacity font-semibold">
            Resources
          </Link>
        </div>

        {/* <div>
          <ModeToggle />
        </div> */}

        {/* Wallet Section */}
        <div>
          {publicKey ? (
            <div className="flex items-center space-x-3 bg-black/70 backdrop-blur-xl rounded-xl px-5 py-2 border border-white/10 shadow-2xl">
              <span className="font-mono text-sm tracking-tight">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-white/10 text-white transition"
                onClick={copyAddress}
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-500/20 text-red-400 transition"
                onClick={handleDisconnect}
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <WalletMultiButton className="!bg-black/70 !backdrop-blur-xl !rounded-xl !px-6 !py-2 !text-white !border !border-white/10 hover:!bg-white/10 !shadow-2xl transition-all" />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Headers;