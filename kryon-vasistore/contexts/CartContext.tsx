'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product, SaleItem, Customer, PaymentEntry, Sale } from '../lib/db/types';
import { db } from '../lib/db';
import { useAuth } from './AuthContext';
import { useCash } from './CashContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: SaleItem[];
  customer: Customer | null;
  customerDocument: string;
  discount: number;
  discountType: 'value' | 'percent';
  notes: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  totalItemsCount: number;
  addItem: (product: Product, quantity?: number) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  removeItem: (productId: string) => void;
  setCustomer: (customer: Customer | null) => void;
  setCustomerDocument: (doc: string) => void;
  applyDiscount: (value: number, type: 'value' | 'percent') => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  checkout: (payments: PaymentEntry[]) => Sale;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, storeId } = useAuth();
  const { refreshCash } = useCash();
  const { success, error } = useToast();

  const [items, setItems] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerDocument, setCustomerDocument] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'value' | 'percent'>('value');
  const [notes, setNotes] = useState<string>('');

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.total_price, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return (subtotal * discount) / 100;
    }
    return Math.min(subtotal, discount);
  }, [subtotal, discount, discountType]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    if (!product.active) {
      error('Produto inativo', 'Este item não pode ser vendido no momento.');
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === product.id);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          total_price: (existing.unit_price * newQty) - existing.discount,
        };
        return updated;
      } else {
        const newItem: SaleItem = {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price: product.sale_price,
          cost_price: product.cost_price,
          quantity: quantity,
          discount: 0,
          total_price: product.sale_price * quantity,
        };
        return [newItem, ...prev];
      }
    });
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity: quantity,
            total_price: item.unit_price * quantity - item.discount,
          };
        }
        return item;
      })
    );
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          const validDiscount = Math.min(item.unit_price * item.quantity, Math.max(0, discount));
          return {
            ...item,
            discount: validDiscount,
            total_price: item.unit_price * item.quantity - validDiscount,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const applyDiscount = (value: number, type: 'value' | 'percent') => {
    setDiscount(Math.max(0, value));
    setDiscountType(type);
  };

  const clearCart = () => {
    setItems([]);
    setCustomer(null);
    setCustomerDocument('');
    setDiscount(0);
    setDiscountType('value');
    setNotes('');
  };

  const checkout = (payments: PaymentEntry[]): Sale => {
    if (items.length === 0) {
      throw new Error('O carrinho está vazio');
    }
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const sale = db.createSale({
      store_id: storeId,
      customer_id: customer?.id,
      customer_name: customer?.name || 'Cliente Balcão',
      customer_document: customerDocument || customer?.cpf_cnpj,
      cashier_id: user.id,
      cashier_name: user.full_name,
      items: items,
      discount: discount,
      discount_type: discountType,
      payments: payments,
      notes: notes,
    });

    clearCart();
    refreshCash();
    success(`Venda ${sale.sale_number} concluída!`, `Total: R$ ${sale.total.toFixed(2)}`);
    return sale;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        customer,
        customerDocument,
        discount,
        discountType,
        notes,
        subtotal,
        discountAmount,
        total,
        totalItemsCount,
        addItem,
        updateItemQuantity,
        updateItemDiscount,
        removeItem,
        setCustomer,
        setCustomerDocument,
        applyDiscount,
        setNotes,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
}
