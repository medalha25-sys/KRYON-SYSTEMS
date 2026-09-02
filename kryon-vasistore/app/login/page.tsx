'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store as StoreIcon, Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, User, KeyRound, HelpCircle, Eye, EyeOff,
  ShieldAlert, UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../lib/db';
import { Profile } from '../../lib/db/types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, user: currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Usuários para troca rápida (aparecem apenas se o usuário já tiver logado nesta loja anteriormente)
  const [savedStoreUsers, setSavedStoreUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeStoreId = localStorage.getItem('utillar_active_store_id');
      const hasLoggedInBefore = localStorage.getItem('utillar_active_user_id');
      
      // Só exibe os atalhos de operadores se o cliente já acessou o sistema e possui equipe cadastrada
      if (hasLoggedInBefore && activeStoreId) {
        const users = db.getProfiles(activeStoreId);
        if (users && users.length > 1) {
          setSavedStoreUsers(users);
        }
      }
    }
  }, []);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLoginError(null);
    try {
      const res = await loginWithGoogle({
        name: 'Wesley Medalha (Super Administrador)',
        email: 'medalha25@gmail.com'
      });
      if (res.success) {
        success('Autenticado com o Google!', 'Bem-vindo(a) ao Sistema VasiStore.');
        router.push('/dashboard');
      } else {
        setLoginError(res.message || 'Falha ao autenticar com o Google.');
        error('Acesso Negado', res.message || 'Falha ao autenticar com o Google.');
      }
    } catch {
      setLoginError('Ocorreu um erro ao conectar com os servidores do Google.');
      error('Erro Google', 'Não foi possível conectar à conta Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
          {/* Botão Oficial de Login com o Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full mb-5 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
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
            <span>{isGoogleLoading ? 'Conectando ao Google...' : 'Entrar com a Conta Google'}</span>
          </button>

          {/* Divisor */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider relative">
              ou com e-mail
            </span>
          </div>

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

          {/* Troca Rápida de Operador (Exibido apenas para clientes que já cadastraram equipe na sua loja) */}
          {savedStoreUsers.length > 1 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-1">
                Troca Rápida de Operador
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-3">
                Selecione o operador da sua equipe para preencher o acesso
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {savedStoreUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u.email, u.full_name)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all text-xs font-semibold flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 group-hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 group-hover:text-white flex items-center justify-center transition-colors font-bold text-xs">
                      {u.role === 'super_admin' ? '⭐' : u.full_name.charAt(0)}
                    </div>
                    <span className="font-bold truncate max-w-[80px]">{u.full_name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-normal capitalize">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Link para Criar Conta / Nova Loja */}
          <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-xs text-slate-400">
              Não tem uma conta?{' '}
              <Link
                href="/registro"
                className="font-bold text-emerald-500 hover:text-emerald-400 hover:underline"
              >
                Cadastrar Loja Grátis (30 Dias)
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Esqueci a Senha */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Recuperação de Senha"
        subtitle="Informe seu e-mail cadastrado para redefinir sua senha"
      >
        {recoverySent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">E-mail de recuperação enviado!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifique sua caixa de entrada e spam para redefinir seu acesso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendRecovery} className="space-y-4">
            <Input
              label="Seu E-mail Cadastrado"
              type="email"
              placeholder="seuemail@empresa.com.br"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForgotModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Enviar Instruções
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
