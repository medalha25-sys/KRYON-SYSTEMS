'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../lib/db/types';
import { db } from '../lib/db';
import { INITIAL_PROFILES } from '../lib/seed-data';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSeller: boolean;
  isCashier: boolean;
  storeId: string;
  login: (emailOrName: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchUserWithPassword: (userId: string, password: string) => { success: boolean; message?: string };
  refreshUsers: () => void;
  availableUsers: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>(INITIAL_PROFILES);
  const [mounted, setMounted] = useState(false);

  const refreshUsers = () => {
    const users = db.getProfiles('store-1');
    setAvailableUsers(users);
  };

  useEffect(() => {
    setMounted(true);
    const users = db.getProfiles('store-1');
    setAvailableUsers(users);

    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('utillar_active_user_id') : null;
    if (savedUserId) {
      const activeUser = users.find(u => u.id === savedUserId && u.active);
      if (activeUser) {
        setUser(activeUser);
      } else {
        setUser(null);
        if (typeof window !== 'undefined') localStorage.removeItem('utillar_active_user_id');
      }
    } else {
      setUser(null);
    }
  }, []);

  const login = async (emailOrName: string, password = ''): Promise<{ success: boolean; message?: string }> => {
    const users = db.getProfiles('store-1');
    const term = emailOrName.trim().toLowerCase();

    if (!term) {
      return { success: false, message: 'Informe seu e-mail ou nome de usuário.' };
    }

    if (!password) {
      return { success: false, message: 'Digite sua senha para acessar.' };
    }

    const target = users.find(u => 
      u.email.toLowerCase() === term || 
      u.full_name.toLowerCase() === term ||
      u.email.toLowerCase().startsWith(term) ||
      u.full_name.toLowerCase().includes(term)
    );

    if (!target) {
      return { success: false, message: 'Usuário não cadastrado no sistema.' };
    }

    if (!target.active) {
      return { success: false, message: 'Este usuário está inativo. Contate o administrador.' };
    }

    // Validação estrita da senha
    const expectedPassword = target.password || '123';
    if (password.trim() !== expectedPassword.trim()) {
      return { success: false, message: 'Senha incorreta. Verifique os dados digitados.' };
    }

    // Sucesso na autenticação
    setUser(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('utillar_active_user_id', target.id);
      localStorage.setItem('utillar_active_store_id', target.store_id);
    }
    return { success: true };
  };

  const switchUser = (userId: string) => {
    const target = availableUsers.find(u => u.id === userId && u.active);
    if (target) {
      setUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('utillar_active_user_id', target.id);
      }
    }
  };

  const switchUserWithPassword = (userId: string, password = ''): { success: boolean; message?: string } => {
    const users = db.getProfiles('store-1');
    const target = users.find(u => u.id === userId);

    if (!target) {
      return { success: false, message: 'Usuário não encontrado no sistema.' };
    }

    if (!target.active) {
      return { success: false, message: 'Este usuário está inativo no momento.' };
    }

    if (!password.trim()) {
      return { success: false, message: 'Digite a senha do usuário para confirmar a troca.' };
    }

    const expectedPassword = target.password || '123';
    if (password.trim() !== expectedPassword.trim()) {
      return { success: false, message: 'Senha incorreta para este usuário! Verifique e tente novamente.' };
    }

    setUser(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('utillar_active_user_id', target.id);
      localStorage.setItem('utillar_active_store_id', target.store_id);
    }
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('utillar_active_user_id');
    }
  };

  const role: UserRole = user?.role || 'caixa';
  const isAdmin = role === 'admin';
  const isManager = role === 'admin' || role === 'gerente';
  const isSeller = role === 'admin' || role === 'gerente' || role === 'vendedor';
  const isCashier = role === 'admin' || role === 'gerente' || role === 'vendedor' || role === 'caixa';
  const storeId = user?.store_id || 'store-1';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin,
        isManager,
        isSeller,
        isCashier,
        storeId,
        login,
        logout,
        switchUser,
        switchUserWithPassword,
        refreshUsers,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
