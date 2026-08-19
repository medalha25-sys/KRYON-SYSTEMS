'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store as StoreIcon, Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, User, KeyRound, HelpCircle, Eye, EyeOff,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function LoginPage() {
  const router = useRouter();
  const { login, availableUsers } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim()) {
      error('Campo obrigatório', 'Por favor, informe seu e-mail de acesso.');
      return;
    }
    if (!password) {
      error('Campo obrigatório', 'Por favor, digite sua senha de acesso.');
      passwordInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        success('Autenticado com sucesso!', 'Bem-vindo(a) ao sistema.');
        router.push('/dashboard');
      } else {
        const errorMsg = res.message || 'Senha incorreta ou usuário não encontrado.';
        setLoginError(errorMsg);
        error('Acesso Negado', errorMsg);
        setPassword('');
        passwordInputRef.current?.focus();
      }
    } catch {
      setLoginError('Ocorreu uma falha no servidor de autenticação.');
      error('Erro', 'Ocorreu um erro ao tentar realizar o login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userEmail: string, userName: string) => {
    setEmail(userEmail);
    setPassword('');
    setLoginError(null);
    info(`Usuário: ${userName}`, 'Digite a senha cadastrada para entrar no sistema.');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      error('Atenção', 'Informe o e-mail cadastrado para recuperação.');
      return;
    }
    setRecoverySent(true);
    info('E-mail enviado', 'As instruções de recuperação foram enviadas para o seu e-mail.');
    setTimeout(() => {
      setShowForgotModal(false);
      setRecoverySent(false);
      setRecoveryEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Logo & Headline */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-emerald-950/40 border border-slate-100 max-w-[300px] sm:max-w-[320px] transform hover:scale-[1.02] transition-transform">
            <img
              src="/logo.png"
              alt="Sistema VasiStore — Gestão para Lojas de Utilidades"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
          Sistema VasiStore
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Acesso Seguro • Gestão de Lojas de Utilidades do Lar
        </p>
      </div>

      {/* Main Login Box */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100/10 backdrop-blur-md">
          {loginError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Falha de Autenticação</p>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail de Acesso"
              type="email"
              placeholder="seuemail@empresa.com.br"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError(null);
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              autoFocus
            />

            <div>
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Senha de Acesso *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError(null);
                    }}
                    autoComplete="current-password"
                    className="w-full bg-white dark:bg-slate-900 border rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 pl-10 pr-10 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-emerald-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 text-base font-bold shadow-emerald-600/30"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Entrar no Sistema
            </Button>
          </form>

          {/* Quick Select User Badge */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-1">
              Selecione o Usuário
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-3">
              Clique no usuário para preencher o e-mail e depois digite a senha correspondente
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleSelectUser('weslley@donalar.com.br', 'Weslley (ADM Suporte)')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all text-xs font-semibold flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white flex items-center justify-center transition-colors font-bold">
                  🛡️
                </div>
                <span className="font-bold">Weslley</span>
                <span className="text-[10px] text-slate-400 font-normal">ADM Suporte</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectUser('suriel@donalar.com.br', 'Suriel')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-300 transition-all text-xs font-semibold flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 group-hover:bg-purple-600 text-purple-700 dark:text-purple-300 group-hover:text-white flex items-center justify-center transition-colors font-bold">
                  👑
                </div>
                <span className="font-bold">Suriel</span>
                <span className="text-[10px] text-slate-400 font-normal">ADM</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectUser('joel@donalar.com.br', 'Joel')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 transition-all text-xs font-semibold flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 group-hover:bg-blue-600 text-blue-700 dark:text-blue-300 group-hover:text-white flex items-center justify-center transition-colors font-bold">
                  👔
                </div>
                <span className="font-bold">Joel</span>
                <span className="text-[10px] text-slate-400 font-normal">Gerente</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectUser('elizangela@donalar.com.br', 'Elizangela')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all text-xs font-semibold flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 group-hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 group-hover:text-white flex items-center justify-center transition-colors font-bold">
                  💼
                </div>
                <span className="font-bold">Elizangela</span>
                <span className="text-[10px] text-slate-400 font-normal">Vendedora</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectUser('caixa@donalar.com.br', 'Caixa')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 transition-all text-xs font-semibold flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 group-hover:bg-amber-600 text-amber-700 dark:text-amber-300 group-hover:text-white flex items-center justify-center transition-colors font-bold">
                  🛒
                </div>
                <span className="font-bold">Caixa</span>
                <span className="text-[10px] text-slate-400 font-normal">Op. Caixa</span>
              </button>
            </div>
          </div>

          {/* New Store SaaS link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Quer usar o sistema em outra loja?{' '}
              <Link href="/registro" className="font-bold text-emerald-600 hover:text-emerald-700">
                Criar Nova Loja (SaaS)
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Recuperação de Senha"
        subtitle="Informe seu e-mail cadastrado para redefinir o acesso"
        maxWidth="md"
      >
        {recoverySent ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">E-mail de Recuperação Enviado!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendRecovery} className="space-y-4">
            <Input
              label="E-mail Cadastrado"
              type="email"
              placeholder="seuemail@empresa.com.br"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForgotModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Enviar Instruções
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
