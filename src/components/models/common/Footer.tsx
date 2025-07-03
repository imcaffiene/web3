import { Zap } from 'lucide-react';
import React from 'react';


const Footer = () => {
  return (
    <div>
      <footer className="container mx-auto px-6 py-16 border-t border-gray-800">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-white">
              SolanaAirdrop
            </span>
          </div>
          <p className="text-gray-400 mb-2">&copy; 2024 SolanaAirdrop. Built on Solana blockchain.</p>
          <p className="text-gray-500 text-sm">This is a demo interface. Always verify airdrop legitimacy before connecting real wallets.</p>
        </div>
      </footer>
    </div >
  );
};



export default Footer;