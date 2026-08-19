'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }: { type?: ToastType; title: string; message?: string; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bgClass = 'bg-white border-slate-200 text-slate-900 shadow-xl';
          let icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;

          if (t.type === 'success') {
            bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xl shadow-emerald-500/10';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-rose-50 border-rose-300 text-rose-950 shadow-xl shadow-rose-500/10';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-amber-50 border-amber-300 text-amber-950 shadow-xl shadow-amber-500/10';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all transform animate-in slide-in-from-right duration-300 ${bgClass}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                <p className="font-semibold">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs opacity-90">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
}
