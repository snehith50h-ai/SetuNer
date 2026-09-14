import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SETU-ROUTE | Smart Logistics & Accessibility Intelligence",
  description: "SETU-ROUTE: AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (MDoNER)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <Providers>
          <ToastProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </ToastProvider>
        </Providers>
        {/* Transitions.dev Refine Injector (Dev Only) */}
        {process.env.NODE_ENV === "development" && (
          <Script strategy="beforeInteractive" type="module" src="http://localhost:7331/inject.js" />
        )}
      </body>
    </html>
  );
}
