import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Building2, 
  Search, 
  Plus, 
  X, 
  Loader2, 
  Phone, 
  Mail, 
  Info,
  ChevronRight,
  TrendingUp,
  FileText,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FornecedoresProps {
  user: any;
}

const Fornecedores: React.FC<FornecedoresProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorDetalhe, setFornecedorDetalhe] = useState<any | null>(null);

  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    contato_nome: '',
    observacao: ''
  });

  useEffect(() => {
    fetchFornecedores();
  }, [user.loja_id]);

  const fetchFornecedores = async (query = '') => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from('fornecedores')
        .select('*')
        .eq('loja_id', user.loja_id);

      if (query) {
        supabaseQuery = supabaseQuery.or(`nome.ilike.%${query}%,cnpj.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;

      setFornecedores(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar fornecedores:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('fornecedores')
        .insert({
          loja_id: user.loja_id,
          nome: novoFornecedor.nome,
          cnpj: novoFornecedor.cnpj,
          email: novoFornecedor.email,
          telefone: novoFornecedor.telefone,
          contato_nome: novoFornecedor.contato_nome,
          observacao: novoFornecedor.observacao
        });

      if (error) throw error;

      setNovoFornecedor({ 
        nome: '', 
        cnpj: '', 
        email: '', 
        telefone: '', 
        contato_nome: '', 
        observacao: '' 
      });
      setModalAberto(false);
      fetchFornecedores();
      alert('Fornecedor cadastrado com sucesso!');
    } catch (err: any) {
      alert('Erro ao cadastrar fornecedor: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-black" style={{ fontSize: '1.75rem' }}>Gestão de Fornecedores</h2>
          <p className="text-secondary">Cadastre e gerencie seus parceiros e fornecedores.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-primary" style={{ width: 'auto', padding: '0 24px' }}>
          <Plus size={20} /> Novo Fornecedor
        </button>
      </header>

      <div className="glass-card p-4" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..." 
            className="input-field"
            style={{ paddingLeft: '48px' }}
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              fetchFornecedores(e.target.value);
            }}
          />
        </div>
        <div className="glass-card" style={{ padding: '8px 20px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Total Fornecedores</span>
          <div className="font-bold text-blue" style={{ fontSize: '1.25rem' }}>{fornecedores.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        <div className="glass-card" style={{ minHeight: '500px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>CNPJ</th>
                <th>Contato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '80px' }}><Loader2 className="animate-spin" /></td></tr>
              ) : fornecedores.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Nenhum fornecedor encontrado.</td></tr>
              ) : (
                fornecedores.map((f) => (
                  <tr key={f.id} className={fornecedorDetalhe?.id === f.id ? 'active-row' : ''} style={{ cursor: 'pointer' }} onClick={() => setFornecedorDetalhe(f)}>
                    <td>
                      <div className="font-bold">{f.nome}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{f.email || 'Sem e-mail'}</div>
                    </td>
                    <td className="text-secondary">{f.cnpj || 'Simples Nacional'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                        <Phone size={14} className="text-secondary" /> {f.telefone || 'N/A'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ChevronRight size={18} className="text-secondary" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-card p-6" style={{ position: 'sticky', top: '24px' }}>
          {fornecedorDetalhe ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 className="font-black" style={{ fontSize: '1.25rem' }}>{fornecedorDetalhe.nome}</h3>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>CNPJ: {fornecedorDetalhe.cnpj || 'N/A'}</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', color: 'var(--accent-blue)' }}>
                  <Building2 size={20} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                     <User size={14} className="text-secondary" />
                     <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Contato</span>
                   </div>
                   <div className="font-bold">{fornecedorDetalhe.contato_nome || 'Não informado'}</div>
                </div>
                
                <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                     <Mail size={14} className="text-secondary" />
                     <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Email</span>
                   </div>
                   <div className="font-bold">{fornecedorDetalhe.email || 'Não informado'}</div>
                </div>
              </div>

              {fornecedorDetalhe.observacao && (
                <div className="p-4" style={{ background: 'rgba(245,158,11,0.05)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <h4 className="font-bold text-warning mb-2" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} /> Notas Adicionais
                  </h4>
                  <p className="text-secondary" style={{ fontSize: '0.8125rem', lineHeight: '1.4' }}>{fornecedorDetalhe.observacao}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
              <Building2 size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <p>Selecione um fornecedor para ver detalhes completos.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8" style={{ width: '100%', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="font-black" style={{ fontSize: '1.5rem' }}>Cadastrar Fornecedor</h2>
                <button onClick={() => setModalAberto(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSalvar}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="mb-4" style={{ gridColumn: 'span 2' }}>
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Nome da Empresa / Razão Social *</label>
                    <input type="text" required value={novoFornecedor.nome} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })} className="input-field" placeholder="Ex: Distribuidora Alpha" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>CNPJ</label>
                    <input type="text" value={novoFornecedor.cnpj} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, cnpj: e.target.value })} className="input-field" placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Telefone</label>
                    <input type="text" value={novoFornecedor.telefone} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })} className="input-field" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Nome de Contato</label>
                    <input type="text" value={novoFornecedor.contato_nome} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contato_nome: e.target.value })} className="input-field" placeholder="Ex: Carlos Abreu" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>E-mail</label>
                    <input type="email" value={novoFornecedor.email} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })} className="input-field" placeholder="comercial@fornecedor.com" />
                  </div>
                  <div className="mb-4" style={{ gridColumn: 'span 2' }}>
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Observações / Produtos Fornecidos</label>
                    <textarea value={novoFornecedor.observacao} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, observacao: e.target.value })} className="input-field" style={{ height: '80px', resize: 'none' }} placeholder="O que este fornecedor vende?" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>Salvar Fornecedor</button>
                  <button type="button" onClick={() => setModalAberto(false)} className="nav-item" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .active-row { background: rgba(59,130,246,0.05) !important; position: relative; }
        .active-row::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent-blue); }
      `}</style>
    </div>
  );
};

export default Fornecedores;
