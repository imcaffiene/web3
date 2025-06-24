import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Headers from "@/components/models/Headers";
import WalletWrapper from "@/components/models/WalletWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Airdrop",
  description: "Claim and send SOL tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletWrapper>
          <div className="min-h-screen w-full bg-[#020617] relative">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `radial-gradient(circle 500px at 50% 300px, rgba(16,185,129,0.35), transparent)`,
              }}
            />
            <Headers />
            {children}
          </div>
        </WalletWrapper>
      </body>
    </html>
  );
}
