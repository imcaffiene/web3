import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Headers from "@/components/models/common/Headers";
import WalletWrapper from "@/components/models/common/WalletWrapper";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/lib/theme-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Piece of Eight",
  description: "Claim and send SOL tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >

          <WalletWrapper>
            <div className="min-h-screen w-full bg-black relative">
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: "#000000",
                  backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.2) 1px, transparent 0),
                  radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.18) 1px, transparent 0),
                  radial-gradient(circle at 1px 1px, rgba(236, 72, 153, 0.15) 1px, transparent 0)
                 `,
                  backgroundSize: "20px 20px, 30px 30px, 25px 25px",
                  backgroundPosition: "0 0, 10px 10px, 15px 5px",
                }}
              />

              <Headers />
              {children}
            </div>
            {/* <Analytics /> */}

            <Toaster
              richColors
              theme="dark"
            />
          </WalletWrapper>
        </ThemeProvider>

      </body>
    </html>
  );
}


