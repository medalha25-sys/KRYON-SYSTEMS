import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kryon Systems",
  description: "Plataforma de gestão integrada Kryon Systems.",
  manifest: "/manifest.json",
  themeColor: "#1e293b",
  icons: {
    icon: "/logo-clinica.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    title: "Kryon ERP",
    statusBarStyle: "default",
    capable: true,
  },
};

import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeContext';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ImpersonationBanner />
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
