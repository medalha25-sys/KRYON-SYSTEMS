'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../lib/db/types';
import { db } from '../lib/db';
import { INITIAL_STORE } from '../lib/seed-data';

interface StoreContextType {
  store: Store;
  updateStoreSettings: (data: Partial<Store>) => void;
  refreshStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(INITIAL_STORE);

  const refreshStore = useCallback(() => {
    const currentStore = db.getStore('store-1');
    setStore(currentStore);
  }, []);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  const updateStoreSettings = (data: Partial<Store>) => {
    const updated = db.updateStore(store.id, data);
    setStore(updated);
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        updateStoreSettings,
        refreshStore
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser utilizado dentro de um StoreProvider');
  }
  return context;
}
