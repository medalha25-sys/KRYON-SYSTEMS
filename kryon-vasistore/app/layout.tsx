import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { StoreProvider } from '../contexts/StoreContext';
import { CashProvider } from '../contexts/CashContext';
import { CartProvider } from '../contexts/CartContext';
import { ToastProvider } from '../contexts/ToastContext';
import { PwaProvider } from '../contexts/PwaContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { InstallPrompt } from '../components/pwa/InstallPrompt';

export const metadata: Metadata = {
  title: 'VasiStore ERP & PDV — Gestão de Utilidades do Lar, Potes e Vasilhas',
  description: 'Sistema completo de gestão comercial, controle de estoque, frente de caixa (PDV), vendas e relatórios para lojas de utilidades domésticas.',
  manifest: '/manifest.json',
  applicationName: 'VasiStore',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VasiStore PDV',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="VasiStore" />
        <meta name="apple-mobile-web-app-title" content="VasiStore" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#059669" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('DOMContentLoaded', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('SW registrado com sucesso:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('Falha no registro do SW:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <PwaProvider>
            <ToastProvider>
              <AuthProvider>
                <StoreProvider>
                  <CashProvider>
                    <CartProvider>
                      <SidebarProvider>
                        {children}
                        <InstallPrompt />
                      </SidebarProvider>
                    </CartProvider>
                  </CashProvider>
                </StoreProvider>
              </AuthProvider>
            </ToastProvider>
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
