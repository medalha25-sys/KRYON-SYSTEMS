'use client';

import React, { useRef } from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { Sale, Store } from '../../lib/db/types';
import { ThermalReceipt } from './ThermalReceipt';
import { Button } from '../ui/Button';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  store: Store;
}

export function ReceiptModal({ isOpen, onClose, sale, store }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:m-0 print:absolute print:inset-0 print:bg-white">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-800 w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:w-full print:border-none print:shadow-none print:bg-white">
        {/* Header (hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Comprovante de Venda #{sale.sale_number}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Container */}
        <div className="p-4 overflow-y-auto flex justify-center print:p-0" ref={receiptRef}>
          <ThermalReceipt sale={sale} store={store} />
        </div>

        {/* Footer Actions (hidden on print) */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            autoFocus
          >
            Imprimir Cupom
          </Button>
        </div>
      </div>
    </div>
  );
}
