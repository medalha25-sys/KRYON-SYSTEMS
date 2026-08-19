'use client';

import React, { useState } from 'react';
import { 
  Download, X, Smartphone, Monitor, Apple, 
  Sparkles, Share, PlusSquare, CheckCircle2, Info, Laptop
} from 'lucide-react';
import { usePwa } from '../../contexts/PwaContext';
import { Button } from '../ui/Button';

export function InstallPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isStandalone, 
    installApp, 
    dismissInstall, 
    showInstallBanner,
    showInstallModal,
    setShowInstallModal,
  } = usePwa();

  const [activePlatformTab, setActivePlatformTab] = useState<'auto' | 'android' | 'ios' | 'desktop'>('auto');
  const [installing, setInstalling] = useState(false);

  // Se já estiver rodando em tela cheia como PWA instalado e modal fechado, não exibe nada
  if (isStandalone && !showInstallModal) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING INSTALL BANNER (Mobile / Desktop) */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex-shrink-0 shadow-md flex items-center justify-center">
                  <img src="/logo.png" alt="VasiStore App" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white">Instalar VasiStore App</h4>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                      PWA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    Acesse direto da sua tela inicial ou área de trabalho, rápido e em tela cheia.
                  </p>
                </div>
              </div>
              <button
                onClick={dismissInstall}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-700 hover:bg-slate-800"
                onClick={dismissInstall}
              >
                Depois
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={installing}
                leftIcon={<Download className="w-4 h-4" />}
                onClick={async () => {
                  setInstalling(true);
                  await installApp();
                  setInstalling(false);
                }}
                className="shadow-emerald-600/40"
              >
                Instalar Aplicativo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. UNIVERSAL INSTALL INSTRUCTIONS MODAL */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Instalar VasiStore no seu Dispositivo</h3>
                  <p className="text-xs text-slate-400">Funciona como aplicativo nativo no celular e computador</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActivePlatformTab('auto')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activePlatformTab === 'auto'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Direto (1 Clique)
              </button>
              <button
                onClick={() => setActivePlatformTab('android')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePlatformTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Android
              </button>
              <button
                onClick={() => setActivePlatformTab('ios')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePlatformTab === 'ios'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Apple className="w-3.5 h-3.5" /> iPhone / iPad
              </button>
              <button
                onClick={() => setActivePlatformTab('desktop')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePlatformTab === 'desktop'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Computador
              </button>
            </div>

            {/* Modal Body with Instructions */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {/* TAB 1: AUTO / 1-CLIQUE */}
              {activePlatformTab === 'auto' && (
                <div className="space-y-4">
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl">
                    <p className="font-semibold text-emerald-300 mb-1">⚡ Instalação Automática</p>
                    <p className="text-slate-300 leading-relaxed">
                      Clique no botão abaixo para adicionar o VasiStore diretamente à tela inicial ou área de trabalho do seu aparelho.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    isLoading={installing}
                    leftIcon={<Download className="w-5 h-5" />}
                    onClick={async () => {
                      setInstalling(true);
                      await installApp();
                      setInstalling(false);
                    }}
                    className="w-full font-bold shadow-emerald-600/40 py-3 text-sm"
                  >
                    Instalar Agora
                  </Button>

                  <div className="text-[11px] text-slate-400 text-center">
                    Se o navegador não exibir o aviso automático, selecione a aba correspondente ao seu aparelho acima.
                  </div>
                </div>
              )}

              {/* TAB 2: ANDROID / CHROME */}
              {activePlatformTab === 'android' && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-200">Como instalar no Google Chrome (Android):</p>
                  <ol className="space-y-2.5">
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        1
                      </span>
                      <span>Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        2
                      </span>
                      <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        3
                      </span>
                      <span>Confirme em <strong>"Instalar"</strong>. O ícone aparecerá junto aos seus outros apps.</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* TAB 3: IPHONE / IPAD */}
              {activePlatformTab === 'ios' && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-200">Como instalar no Safari (iPhone / iPad):</p>
                  <ol className="space-y-2.5">
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        1
                      </span>
                      <span>Toque no botão <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> na barra inferior do Safari.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        2
                      </span>
                      <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-300" />.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        3
                      </span>
                      <span>Toque em <strong>Adicionar</strong> no topo da tela. O app abrirá em tela cheia!</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* TAB 4: COMPUTADOR (WINDOWS / MAC) */}
              {activePlatformTab === 'desktop' && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-200">Como instalar no Computador (Chrome / Edge / Opera):</p>
                  <ol className="space-y-2.5">
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        1
                      </span>
                      <span>No topo do navegador, ao lado da barra de endereço URL, clique no ícone de <strong>Instalar Aplicativo (⊕ ou 📥)</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        2
                      </span>
                      <span>Ou clique no menu do navegador (três pontinhos) e escolha <strong>"Instalar VasiStore"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                        3
                      </span>
                      <span>O sistema funcionará em janela independente e criará um atalho na sua Área de Trabalho!</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInstallModal(false)}
                className="text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

