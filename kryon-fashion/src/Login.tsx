import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC<{ onLoginSuccess: (user: any) => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase
        .from('usuarios')
        .select(`
          *,
          lojas (nome, status),
          perfis (
            id, 
            nome,
            perfil_permissoes (
              permissoes (chave)
            )
          )
        `)
        .eq('email', email)
        .eq('senha', password)
        .single();

      if (authError || !data) {
        throw new Error('Email ou senha inválidos');
      }

      // Validações de Segurança
      if (data.ativo === false) {
        throw new Error('Sua conta de usuário está desativada. Contate o administrador.');
      }

      if (data.lojas?.status === 'BLOQUEADA') {
        throw new Error('Acesso interrompido: Esta loja está bloqueada por pendências financeiras.');
      }

      // Processar permissões para um formato simples de array de strings
      const permissoes = data.perfis?.perfil_permissoes?.map((pp: any) => pp.permissoes.chave) || [];
      
      const sessionData = {
        ...data,
        permissoes
      };

      onLoginSuccess(sessionData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ position: 'relative', overflow: 'hidden', padding: '20px' }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-blue-glow)', borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(20, 184, 166, 0.15)', borderRadius: '50%', filter: 'blur(100px)' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
        style={{ width: '100%', maxWidth: '420px', padding: '48px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="logo-box" style={{ margin: '0 auto 24px' }}>S</div>
          <h1 className="font-black" style={{ fontSize: '2rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>Bem-vindo</h1>
          <p className="text-secondary">Acesse sua conta para gerenciar a loja</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-secondary font-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem' }}>
              <Mail size={16} /> E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label className="text-secondary font-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem' }}>
              <Lock size={16} /> Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: 'var(--status-error)', marginBottom: '24px', fontSize: '0.875rem', textAlign: 'center', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '12px' }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ padding: '18px', fontSize: '1.125rem' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Entrar no Sistema <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Problemas com acesso? <br/>
            <span className="text-blue font-bold" style={{ cursor: 'pointer' }}>Contate o suporte</span>
          </p>
        </div>
      </motion.div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
