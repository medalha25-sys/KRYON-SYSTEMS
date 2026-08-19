'use client';

import React from 'react';
import { Sale, Store } from '../../lib/db/types';
import { formatCurrency, formatDateTime, formatCpfCnpj, formatPhone } from '../../lib/formatters';

interface ThermalReceiptProps {
  sale: Sale;
  store: Store;
}

export function ThermalReceipt({ sale, store }: ThermalReceiptProps) {
  return (
    <div className="thermal-receipt bg-white text-black p-4 font-mono text-[11px] leading-relaxed max-w-[80mm] mx-auto border border-dashed border-slate-300 rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="flex justify-center items-center mb-1.5">
          <img 
            src={store.logo_url || '/logo.png'} 
            alt={store.name} 
            style={{ width: '2cm', height: '1cm', objectFit: 'contain' }}
            className="w-[2cm] h-[1cm] object-contain mx-auto filter drop-shadow-sm" 
          />
        </div>
        <h2 className="font-extrabold text-sm uppercase">{store.name}</h2>
        {store.trade_name && <p className="text-[10px] uppercase">{store.trade_name}</p>}
        {store.cnpj_cpf && <p className="text-[10px]">CNPJ/CPF: {formatCpfCnpj(store.cnpj_cpf)}</p>}
        {store.address && (
          <p className="text-[10px]">
            {store.address}, {store.number || 'S/N'} - {store.city}/{store.state}
          </p>
        )}
        {store.phone && <p className="text-[10px]">Tel/WhatsApp: {formatPhone(store.phone)}</p>}
      </div>

      {/* Sale Info */}
      <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>CUPOM NÃO FISCAL</span>
          <span className="font-bold">Nº {sale.sale_number}</span>
        </div>
        <div className="flex justify-between">
          <span>DATA / HORA:</span>
          <span>{formatDateTime(sale.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>OPERADOR(A):</span>
          <span>{sale.cashier_name}</span>
        </div>
        <div className="flex justify-between">
          <span>CLIENTE:</span>
          <span className="font-semibold">{sale.customer_name || 'CONSUMIDOR FINAL'}</span>
        </div>
        {sale.customer_document && (
          <div className="flex justify-between font-bold">
            <span>CPF NA NOTA:</span>
            <span>{formatCpfCnpj(sale.customer_document)}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px]">
          <span className="w-1/2">DESCRIÇÃO</span>
          <span className="w-1/6 text-center">QTD</span>
          <span className="w-1/6 text-right">UNIT</span>
          <span className="w-1/6 text-right">TOTAL</span>
        </div>
        <div className="space-y-1">
          {sale.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-[10px]">
              <div className="w-1/2 pr-1">
                <p className="truncate font-semibold">{item.product_name}</p>
                <p className="text-[9px] text-slate-600">SKU: {item.sku}</p>
              </div>
              <span className="w-1/6 text-center">{item.quantity}</span>
              <span className="w-1/6 text-right">{item.unit_price.toFixed(2)}</span>
              <span className="w-1/6 text-right font-bold">{item.total_price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-rose-700">
            <span>DESCONTO:</span>
            <span>- {formatCurrency(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
          <span>TOTAL A PAGAR:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      {/* Payments */}
      <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
        <p className="font-bold mb-1">FORMA(S) DE PAGAMENTO:</p>
        {sale.payments.map((p, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="capitalize">
              {p.method}
              {p.installments && p.installments > 1 ? ` (${p.installments}x)` : ''}:
            </span>
            <span className="font-semibold">{formatCurrency(p.amount)}</span>
          </div>
        ))}
        {sale.payments.some((p) => (p.change_amount || 0) > 0) && (
          <div className="flex justify-between font-bold pt-1 text-[11px]">
            <span>TROCO:</span>
            <span>
              {formatCurrency(
                sale.payments.reduce((acc, p) => acc + (p.change_amount || 0), 0)
              )}
            </span>
          </div>
        )}
      </div>

      {/* Footer Message */}
      <div className="pt-3 text-center text-[10px]">
        <p className="font-bold">{store.receipt_message || 'Obrigado pela preferência! Volte sempre.'}</p>
        <p className="text-[8px] text-slate-500 mt-1">SISTEMA UTILLAR ERP & PDV</p>
      </div>
    </div>
  );
}
