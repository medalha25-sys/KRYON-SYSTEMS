'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  installApp: () => Promise<boolean>;
  dismissInstall: () => void;
  showInstallBanner: boolean;
  setShowInstallBanner: (val: boolean) => void;
  showInstallModal: boolean;
  setShowInstallModal: (val: boolean) => void;
  openInstallFlow: () => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Registra o Service Worker com garantia de execução imediata
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            console.log('Service Worker VasiStore ativo no escopo:', reg.scope);
            reg.update();
          })
          .catch((err) => {
            console.warn('Erro ao registrar Service Worker:', err);
          });
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Detecta se já está rodando como PWA (Standalone / Tela cheia)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
    }

    // 3. Detecta iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Captura evento de instalação nativo (Chrome / Edge / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      const dismissed = localStorage.getItem('vasistore_pwa_dismissed');
      if (!dismissed && !isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setShowInstallModal(false);
      setDeferredPrompt(null);
      console.log('VasiStore PWA instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setShowInstallBanner(false);
          setShowInstallModal(false);
          setDeferredPrompt(null);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao acionar prompt nativo:', err);
      }
    }

    // Se não tiver prompt nativo (iOS Safari ou navegador Desktop sem prompt direto), abre o modal com instruções
    setShowInstallModal(true);
    return false;
  }, [deferredPrompt]);

  const openInstallFlow = useCallback(() => {
    if (deferredPrompt) {
      installApp();
    } else {
      setShowInstallModal(true);
    }
  }, [deferredPrompt, installApp]);

  const dismissInstall = useCallback(() => {
    setShowInstallBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vasistore_pwa_dismissed', 'true');
    }
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isStandalone,
        installApp,
        dismissInstall,
        showInstallBanner,
        setShowInstallBanner,
        showInstallModal,
        setShowInstallModal,
        openInstallFlow,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa deve ser utilizado dentro de um PwaProvider');
  }
  return context;
}

