import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import {
  Users,
  Search,
  Plus,
  X,
  Loader2,
  Phone,
  History,
  CreditCard,
  Cake,
  MessageCircle,
  Award,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientesProps {
  user: any;
}

const Clientes: React.FC<ClientesProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteDetalhe, setClienteDetalhe] = useState<any | null>(null);
  const [historicoVendas, setHistoricoVendas] = useState<any[]>([]);
  const [contasReceber, setContasReceber] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    data_nascimento: '',
    credito: '0',
    limite_credito: '0',
    pontos: '0',
    observacao: ''
  });

  useEffect(() => {
    fetchClientes();
  }, [user.loja_id]);

  const fetchClientes = async (query = '') => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from('clientes')
        .select(`
          *,
          *,
          vendas (total, created_at),
          contas_receber (valor, status)
        `)
        .eq('loja_id', user.loja_id);

      if (query) {
        supabaseQuery = supabaseQuery.or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      // Processar inteligência do cliente (total gasto e última compra)
      const clientesProcessados = data?.map((c: any) => {
        const totalGasto = c.vendas?.reduce((acc: number, v: any) => acc + (v.total || 0), 0) || 0;
        const ultimaCompra = c.vendas?.length > 0 
          ? new Date(Math.max(...c.vendas.map((v: any) => new Date(v.created_at).getTime()))).toISOString()
          : null;
        
        const totalPendente = c.contas_receber?.filter((cr: any) => cr.status !== 'PAGO').reduce((acc: number, cr: any) => acc + (cr.valor || 0), 0) || 0;
        
        return { ...c, totalGasto, ultimaCompra, totalPendente };
      });

      // Ordenar por total gasto (Top Clients)
      clientesProcessados?.sort((a, b) => b.totalGasto - a.totalGasto);

      setClientes(clientesProcessados || []);
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('clientes')
        .insert({
          loja_id: user.loja_id,
          nome: novoCliente.nome,
          telefone: novoCliente.telefone,
          email: novoCliente.email,
          cpf: novoCliente.cpf,
          data_nascimento: novoCliente.data_nascimento || null,
          credito: parseFloat(novoCliente.credito) || 0,
          limite_credito: parseFloat(novoCliente.limite_credito) || 0,
          pontos: parseInt(novoCliente.pontos) || 0,
          observacao: novoCliente.observacao
        });

      if (error) throw error;

      setNovoCliente({ nome: '', telefone: '', email: '', cpf: '', data_nascimento: '', credito: '0', limite_credito: '0', pontos: '0', observacao: '' });
      setModalAberto(false);
      fetchClientes();
      alert('Cliente cadastrado com sucesso!');
    } catch (err: any) {
      alert('Erro ao cadastrar cliente: ' + err.message);
    }
  };

  const verDetalhes = async (cliente: any) => {
    setClienteDetalhe(cliente);
    setLoadingHistorico(true);
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          id, 
          total, 
          created_at,
          venda_itens (
            quantidade,
            produtos (nome)
          )
        `)
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (error) throw error;
      setHistoricoVendas(data || []);

      // Fetch Carnês (Contas a Receber)
      const { data: contas } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('data_vencimento', { ascending: true });
      
      setContasReceber(contas || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorico(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-black" style={{ fontSize: '1.75rem' }}>Gestão de Clientes</h2>
          <p className="text-secondary">Visualize e gerencie a base de clientes da sua loja.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-primary" style={{ width: 'auto', padding: '12px 28px', fontSize: '1rem', fontWeight: 'bold' }}>
          <Plus size={22} /> Novo Cliente
        </button>
      </header>

      {/* Busca e Resumo */}
      <div className="glass-card p-4" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="input-field"
            style={{ paddingLeft: '48px' }}
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              fetchClientes(e.target.value);
            }}
          />
        </div>
        <div className="glass-card" style={{ padding: '8px 20px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Total de Clientes</span>
          <div className="font-bold text-blue" style={{ fontSize: '1.25rem' }}>{clientes.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        {/* Tabela de Clientes */}
        <div className="glass-card" style={{ minHeight: '500px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Total Gasto</th>
                <th>Última Compra</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '80px' }}><Loader2 className="animate-spin" /></td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Nenhum cliente encontrado.</td></tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className={clienteDetalhe?.id === c.id ? 'active-row' : ''} style={{ cursor: 'pointer' }} onClick={() => verDetalhes(c)}>
                    <td>
                      <div className="font-bold">{c.nome}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{c.email || 'Sem e-mail'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                          <Phone size={14} className="text-secondary" /> {c.telefone || 'N/A'}
                        </div>
                        {c.telefone && (
                          <a 
                            href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#25D366' }}
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-teal font-bold">R$ {c.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                      {c.ultimaCompra ? new Date(c.ultimaCompra).toLocaleDateString('pt-BR') : 'Nunca comprou'}
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

        {/* Painel Detalhado (Inteligência do Cliente) */}
        <div className="glass-card p-6" style={{ position: 'sticky', top: '24px' }}>
          {clienteDetalhe ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 className="font-black" style={{ fontSize: '1.25rem' }}>{clienteDetalhe.nome}</h3>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>ID: ...{clienteDetalhe.id.slice(-6)}</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(20,184,166,0.1)', borderRadius: '10px', color: 'var(--accent-teal)' }}>
                  <TrendingUp size={20} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="p-4" style={{ background: 'rgba(20,184,166,0.03)', borderRadius: '16px', border: '1px solid rgba(20,184,166,0.2)' }}>
                  <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={12} /> Pontos
                  </div>
                  <div className="font-bold text-teal">{clienteDetalhe.pontos || 0} pts</div>
                </div>
                <div className="p-4" style={{ background: 'rgba(59,130,246,0.03)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Cake size={12} /> Aniversário
                  </div>
                  <div className="font-bold text-blue">
                    {clienteDetalhe.data_nascimento 
                      ? new Date(clienteDetalhe.data_nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                      : '--/--'
                    }
                  </div>
                </div>
              </div>

              <div className="p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <CreditCard size={18} className="text-secondary" />
                     <span className="font-bold">Situação Financeira</span>
                   </div>
                   <div className={`badge ${clienteDetalhe.totalPendente > 0 ? 'badge-warning' : 'badge-success'}`}>
                     {clienteDetalhe.totalPendente > 0 ? 'Possui Débitos' : 'Tudo OK'}
                   </div>
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                   <div>
                     <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Em Aberto (Carnê)</div>
                     <div className="font-bold text-error">R$ {clienteDetalhe.totalPendente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                   </div>
                   <div>
                     <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Limite Disponível</div>
                     <div className="font-bold text-success">
                       R$ {Math.max(0, (clienteDetalhe.limite_credito || 0) - (clienteDetalhe.totalPendente || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </div>
                     <div className="text-secondary" style={{ fontSize: '0.65rem' }}>de R$ {(clienteDetalhe.limite_credito || 0).toLocaleString('pt-BR')}</div>
                   </div>
                 </div>

                 {contasReceber.length > 0 && (
                   <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                     <h5 className="font-bold text-secondary mb-2" style={{ fontSize: '0.75rem' }}>Próximos Vencimentos</h5>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {contasReceber.filter(c => c.status !== 'PAGO').slice(0, 3).map(c => (
                         <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                           <span>{new Date(c.data_vencimento).toLocaleDateString('pt-BR')} - Parc. {c.numero_parcela}/{c.total_parcelas}</span>
                           <span className="font-bold">R$ {c.valor.toLocaleString('pt-BR')}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} /> Histórico de Compras
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {loadingHistorico ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" size={20} /></div>
                  ) : historicoVendas.length === 0 ? (
                    <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Nenhum histórico.</p>
                  ) : (
                    historicoVendas.map(v => (
                      <div key={v.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.8125rem', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className="text-secondary">{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                          <span className="font-bold text-blue">R$ {v.total.toLocaleString('pt-BR')}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {v.venda_itens?.map((it: any) => `${it.quantidade}x ${it.produtos?.nome}`).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {clienteDetalhe.observacao && (
                <div className="p-4" style={{ background: 'rgba(245,158,11,0.05)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <h4 className="font-bold text-warning mb-2" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} /> Observações
                  </h4>
                  <p className="text-secondary" style={{ fontSize: '0.8125rem', lineHeight: '1.4' }}>{clienteDetalhe.observacao}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
              <Users size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <p>Selecione um cliente para ver a inteligência de dados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Cliente */}
      <AnimatePresence>
        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8" style={{ width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="font-black" style={{ fontSize: '1.5rem' }}>Cadastrar Cliente</h2>
                <button onClick={() => setModalAberto(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSalvar}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="mb-4" style={{ gridColumn: 'span 2' }}>
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Nome Completo *</label>
                    <input type="text" required value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} className="input-field" placeholder="Ex: João Silva" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>CPF</label>
                    <input type="text" value={novoCliente.cpf} onChange={(e) => setNovoCliente({ ...novoCliente, cpf: e.target.value })} className="input-field" placeholder="000.000.000-00" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Nascimento</label>
                    <input type="date" value={novoCliente.data_nascimento} onChange={(e) => setNovoCliente({ ...novoCliente, data_nascimento: e.target.value })} className="input-field" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Telefone (WhatsApp)</label>
                    <input type="text" value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} className="input-field" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Limite de Crédito (Carnê)</label>
                    <input type="number" value={novoCliente.limite_credito} onChange={(e) => setNovoCliente({ ...novoCliente, limite_credito: e.target.value })} className="input-field" placeholder="0.00" />
                  </div>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Pontos Iniciais</label>
                    <input type="number" value={novoCliente.pontos} onChange={(e) => setNovoCliente({ ...novoCliente, pontos: e.target.value })} className="input-field" />
                  </div>
                  <div className="mb-4" style={{ gridColumn: 'span 2' }}>
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>E-mail</label>
                    <input type="email" value={novoCliente.email} onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })} className="input-field" placeholder="exemplo@email.com" />
                  </div>
                  <div className="mb-4" style={{ gridColumn: 'span 2' }}>
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Observações</label>
                    <textarea value={novoCliente.observacao} onChange={(e) => setNovoCliente({ ...novoCliente, observacao: e.target.value })} className="input-field" style={{ height: '80px', resize: 'none' }} placeholder="Preferências, notas, etc..." />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>Salvar Cliente</button>
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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--glass-border); borderRadius: 10px; }
      `}</style>
    </div>
  );
};

export default Clientes;
