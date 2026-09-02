'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store as StoreIcon, Building, Mail, Phone, Lock, User, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/db';

export default function RegisterStorePage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const { success, error } = useToast();

  const [storeName, setStoreName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      // Simula fluxo de criação rápida com Google
      const newStoreId = `store-${Date.now()}`;
      const defaultEmail = 'usuario.google@gmail.com';
      const defaultName = 'Minha Loja de Utilidades';

      db.updateStore(newStoreId, {
        id: newStoreId,
        name: defaultName,
        trade_name: defaultName,
        email: defaultEmail,
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        active: true,
        created_at: new Date().toISOString(),
      });

      await loginWithGoogle({
        name: 'Administrador da Loja (Google)',
        email: defaultEmail
      });

      success('Loja criada com sucesso via Google!', 'Bem-vindo(a) ao Sistema VasiStore.');
      router.push('/dashboard');
    } catch {
      error('Erro ao conectar com o Google', 'Por favor, tente preencher o formulário.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !adminName || !adminEmail || !password) {
      error('Preencha os campos', 'Todos os campos com asterisco são obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const newStoreId = `store-${Date.now()}`;
      // Cria a loja
      db.updateStore(newStoreId, {
        id: newStoreId,
        name: storeName,
        trade_name: storeName,
        cnpj_cpf: cnpj,
        phone: phone,
        email: adminEmail,
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        active: true,
        created_at: new Date().toISOString(),
      });

      // Cria o perfil do admin
      db.createProfile({
        store_id: newStoreId,
        full_name: adminName,
        email: adminEmail,
        password: password,
        role: 'admin',
        active: true,
      });

      success('Loja cadastrada com sucesso!', 'Você já pode acessar o sistema com seu e-mail e senha.');
      router.push('/login');
    } catch {
      error('Erro', 'Não foi possível cadastrar a loja.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10">
        <div className="flex justify-center mb-3">
          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-emerald-950/40 border border-slate-100 max-w-[260px]">
            <img
              src="/logo.png"
              alt="Sistema VasiStore"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
          Cadastre sua Loja no VasiStore
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          30 Dias de Teste Grátis • Sem necessidade de cartão de crédito
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100/10">
          {/* Botão de Cadastro com Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="w-full mb-6 py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Criando com o Google...' : 'Cadastrar com a Conta Google'}</span>
          </button>

          {/* Divisor */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider relative">
              ou preencha os dados
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">1. Dados da Loja</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome da Loja *"
                placeholder="Ex: Utilidades & Cia"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
                required
              />
              <Input
                label="CNPJ ou CPF (Opcional)"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>

            <Input
              label="WhatsApp / Telefone Comercial"
              placeholder="(38) 98425-7511"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 pt-2 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">2. Dados do Administrador</h3>
            </div>

            <Input
              label="Nome Completo do Responsável *"
              placeholder="Ex: João da Silva"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="E-mail de Acesso *"
                type="email"
                placeholder="admin@sualoja.com.br"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Senha de Acesso *"
                type="password"
                placeholder="Crie uma senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 text-base font-bold shadow-emerald-600/30"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Criar Loja e Iniciar Teste de 30 Dias
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            >
              <ArrowLeft className="w-4 h-4" /> Já possui conta? Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
