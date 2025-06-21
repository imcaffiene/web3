import { AirdropRequest } from '@/components/models/AirdropRequest';
import Footer from '@/components/models/Footer';
import Headers from '@/components/models/Headers';
import WalletWrapper from '@/components/models/WalletWrapper';

export default function Home() {
  return (
    <WalletWrapper>
      <div className="min-h-screen w-full bg-[#020617] relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `radial-gradient(circle 500px at 50% 300px, rgba(16,185,129,0.35), transparent)`,
          }}
        />
        <Headers />
        <AirdropRequest />
        <Footer />
      </div>
    </WalletWrapper>
  );
}