import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { NetworkProvider } from "@/providers/network-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import { Header } from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Movement Network Explorer",
  description: "Explore blocks, transactions, accounts, and validators on the Movement blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <Suspense fallback={null}>
            <NetworkProvider>
              <WalletProvider>
                <div className="min-h-screen bg-background">
                  <Header />
                  <main className="container mx-auto px-4 py-6 max-w-7xl">
                    {children}
                  </main>
                  <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
                    <p>Movement Network Explorer - Powered by Movement Network</p>
                  </footer>
                </div>
              </WalletProvider>
            </NetworkProvider>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
