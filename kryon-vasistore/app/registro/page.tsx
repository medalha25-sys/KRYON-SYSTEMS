'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store as StoreIcon, Building, Mail, Phone, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../lib/db';

export default function RegisterStorePage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [storeName, setStoreName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        role: 'admin',
        active: true,
      });

      success('Loja cadastrada com sucesso!', 'Você já pode acessar o sistema com seu e-mail.');
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
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Cadastre sua Loja no VasiStore
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Plataforma SaaS completa de gestão para utilidades, potes e vasilhas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Dados da Loja</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome da Loja *"
                placeholder="Ex: Bazar & Utilidades Central"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
                required
              />
              <Input
                label="CNPJ ou CPF"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>

            <Input
              label="WhatsApp / Telefone Comercial"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="border-b border-slate-100 pb-3 pt-2 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Dados do Administrador da Loja</h3>
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
                label="Criar Senha *"
                type="password"
                placeholder="••••••••"
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
              Criar Loja e Começar
            </Button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-3.5 h-3.5" />
              Já tem uma conta? Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
