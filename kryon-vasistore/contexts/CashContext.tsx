'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CashRegister, CashMovement, CashMovementType } from '../lib/db/types';
import { db } from '../lib/db';
import { useAuth } from './AuthContext';

interface CashContextType {
  openRegister: CashRegister | null;
  isOpen: boolean;
  cashBalance: number;
  movements: CashMovement[];
  openCash: (initialFloat: number, notes?: string) => CashRegister;
  closeCash: (closingCashCounted: number, notes?: string) => CashRegister;
  addMovement: (type: CashMovementType, amount: number, paymentMethod: string, description: string) => CashMovement;
  refreshCash: () => void;
}

const CashContext = createContext<CashContextType | undefined>(undefined);

export function CashProvider({ children }: { children: React.ReactNode }) {
  const { user, storeId } = useAuth();
  const [openRegister, setOpenRegister] = useState<CashRegister | null>(null);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [movements, setMovements] = useState<CashMovement[]>([]);

  const refreshCash = useCallback(() => {
    const reg = db.getOpenCashRegister(storeId);
    setOpenRegister(reg);

    if (reg) {
      const movs = db.getCashMovements(reg.id);
      setMovements(movs);

      let bal = reg.initial_float;
      movs.forEach(m => {
        if (m.payment_method.toLowerCase() === 'dinheiro') {
          if (m.type === 'suprimento' || m.type === 'venda' || m.type === 'recebimento') {
            bal += m.amount;
          } else if (m.type === 'sangria' || m.type === 'despesa' || m.type === 'estorno') {
            bal -= m.amount;
          }
        }
      });
      setCashBalance(bal);
    } else {
      setMovements([]);
      setCashBalance(0);
    }
  }, [storeId]);

  useEffect(() => {
    refreshCash();
  }, [refreshCash]);

  const openCash = (initialFloat: number, notes?: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    const newReg = db.openCashRegister({
      store_id: storeId,
      user_id: user.id,
      user_name: user.full_name,
      initial_float: initialFloat,
      notes: notes
    });
    refreshCash();
    return newReg;
  };

  const closeCash = (closingCashCounted: number, notes?: string) => {
    if (!openRegister) throw new Error('Nenhum caixa aberto');
    const closed = db.closeCashRegister({
      cash_register_id: openRegister.id,
      closing_cash_counted: closingCashCounted,
      notes: notes
    });
    refreshCash();
    return closed;
  };

  const addMovement = (type: CashMovementType, amount: number, paymentMethod: string, description: string) => {
    if (!openRegister) throw new Error('Nenhum caixa aberto');
    if (!user) throw new Error('Usuário não autenticado');

    const mov = db.addCashMovement({
      cash_register_id: openRegister.id,
      store_id: storeId,
      user_id: user.id,
      user_name: user.full_name,
      type,
      amount,
      payment_method: paymentMethod,
      description
    });
    refreshCash();
    return mov;
  };

  return (
    <CashContext.Provider
      value={{
        openRegister,
        isOpen: !!openRegister,
        cashBalance,
        movements,
        openCash,
        closeCash,
        addMovement,
        refreshCash
      }}
    >
      {children}
    </CashContext.Provider>
  );
}

export function useCash() {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error('useCash deve ser utilizado dentro de um CashProvider');
  }
  return context;
}
