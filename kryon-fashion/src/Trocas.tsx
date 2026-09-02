import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Search, 
  RotateCcw, 
  Trash2, 
  CheckCircle2,
  Package,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from './hooks/usePermissions';

interface TrocasProps {
  user: any;
}

const Trocas: React.FC<TrocasProps> = ({ user }) => {
  const [buscaVenda, setBuscaVenda] = useState('');
  const [venda, setVenda] = useState<any | null>(null);
  const [trocaItens, setTrocaItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermissions(user);
  const [valorTroca, setValorTroca] = useState(0);
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [carregandoTroca, setCarregandoTroca] = useState(false);

  useEffect(() => {
    const total = trocaItens.reduce((acc, item) => acc + (item.valor_unitario * item.qtdTroca), 0);
    setValorTroca(total);
  }, [trocaItens]);

  const buscarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buscaVenda) return;

    if (!hasPermission('PDV_VENDER')) {
      alert('Você não tem permissão para realizar trocas/devoluções.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          venda_itens (
            id,
            produto_id,
            variacao_id,
            quantidade,
            preco,
            produtos (nome),
            produto_variacoes (cor, tamanho)
          ),
          clientes (id, nome, credito)
        `)
        .eq('id', buscaVenda)
        .eq('loja_id', user.loja_id)
        .single();

      if (error) throw new Error('Venda não encontrada ou erro na busca.');
      
      setVenda(data);
      if (data.clientes) setClienteSelecionado(data.clientes);
    } catch (err: any) {
      alert(err.message);
      setVenda(null);
    } finally {
      setLoading(false);
    }
  };

  const buscarClientes = async (nome: string) => {
    setBuscaCliente(nome);
    if (nome.length < 2) {
      setClientes([]);
      return;
    }
    setBuscandoCliente(true);
    try {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', `%${nome}%`)
        .eq('loja_id', user.loja_id)
        .limit(5);
      setClientes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const selecionarItemParaTroca = (item: any) => {
    const jaExiste = trocaItens.find(ti => ti.variacao_id === item.variacao_id);
    if (jaExiste) return;

    setTrocaItens([...trocaItens, {
      ...item,
      qtdTroca: 1,
      valor_unitario: item.preco
    }]);
  };

  const removerItemTroca = (variacao_id: string) => {
    setTrocaItens(trocaItens.filter(i => i.variacao_id !== variacao_id));
  };

  const finalizarTroca = async () => {
    if (trocaItens.length === 0 || !clienteSelecionado) {
      alert('Selecione os itens e o cliente para gerar o crédito.');
      return;
    }

    const confirmacao = window.confirm(`Deseja finalizar a troca? Será gerado um crédito de R$ ${valorTroca.toLocaleString('pt-BR')} para ${clienteSelecionado.nome}.`);
    if (!confirmacao) return;

    setCarregandoTroca(true);
    try {
      // 1. Criar registro na tabela trocas
      const { data: troca, error: tError } = await supabase
        .from('trocas')
        .insert({
          loja_id: user.loja_id,
          venda_origem_id: venda.id,
          cliente_id: clienteSelecionado.id,
          valor_total: valorTroca
        })
        .select()
        .single();

      if (tError) throw tError;

      // 2. Inserir Itens da Troca
      for (const item of trocaItens) {
        await supabase.from('troca_itens').insert({
          troca_id: troca.id,
          produto_id: item.produto_id,
          variacao_id: item.variacao_id,
          quantidade: item.qtdTroca,
          valor: item.valor_unitario
        });

        // 3. Devolver ao estoque
        await supabase.rpc('incrementar_estoque', {
          p_variacao_id: item.variacao_id,
          p_quantidade: item.qtdTroca
        });
      }

      // 4. Atualizar Crédito do Cliente
      const { error: cError } = await supabase
        .from('clientes')
        .update({ credito: (clienteSelecionado.credito || 0) + valorTroca })
        .eq('id', clienteSelecionado.id);

      if (cError) throw cError;

      alert('Troca realizada e crédito gerado!');
      setVenda(null);
      setTrocaItens([]);
      setValorTroca(0);
      setClienteSelecionado(null);
      setBuscaVenda('');
    } catch (err: any) {
      alert('Erro ao processar troca: ' + err.message);
    } finally {
      setCarregandoTroca(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header>
        <h2 className="font-black" style={{ fontSize: '1.75rem' }}>Trocas e Devoluções</h2>
        <p className="text-secondary">Selecione uma venda original para iniciar o processo de troca.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Busca de Venda */}
          <div className="glass-card p-6">
            <form onSubmit={buscarVenda} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={buscaVenda}
                  onChange={(e) => setBuscaVenda(e.target.value)}
                  placeholder="ID da Venda (Ex: 8859178e...)" 
                  className="input-field" 
                  style={{ paddingLeft: '48px' }}
                />
              </div>
              <button disabled={loading} className="btn-primary" style={{ width: 'auto', padding: '0 24px' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar Venda'}
              </button>
            </form>
          </div>

          {venda && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
              <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-bold">Itens da Venda: #{venda.id.slice(-8)}</span>
                <span className="text-secondary">{new Date(venda.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Cor/Tam</th>
                    <th>Vendido</th>
                    <th>Preço</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {venda.venda_itens.map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-bold">{item.produtos.nome}</td>
                      <td>{item.produto_variacoes.cor} / {item.produto_variacoes.tamanho}</td>
                      <td>{item.quantidade} un.</td>
                      <td>R$ {item.preco.toLocaleString('pt-BR')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => selecionarItemParaTroca(item)}
                          className="nav-item" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: 'none' }}
                        >
                          Trocar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {trocaItens.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6" style={{ border: '1px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <RotateCcw size={20} className="text-blue" />
                <h3 className="font-bold">Itens para Devolução</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trocaItens.map((item) => (
                  <div key={item.variacao_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                    <div>
                      <div className="font-bold">{item.produtos.nome}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{item.produto_variacoes.cor} / {item.produto_variacoes.tamanho}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div className="text-blue font-bold">R$ {item.valor_unitario.toLocaleString('pt-BR')}</div>
                      <button onClick={() => removerItemTroca(item.variacao_id)} style={{ color: 'var(--status-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="pdv-sidebar" style={{ position: 'sticky', top: '24px' }}>
          <div className="glass-card p-6">
            <h3 className="font-bold mb-6">Resumo do Crédito</h3>
            
            <div className="mb-8 p-4" style={{ background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
              <p className="text-secondary mb-1">Valor a ser Devolvido</p>
              <h2 className="text-blue font-black" style={{ fontSize: '2.5rem' }}>R$ {valorTroca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>

            <div className="mb-8">
              <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Cliente Beneficiário</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={buscaCliente}
                  onChange={(e) => buscarClientes(e.target.value)}
                  className="input-field" 
                  placeholder="Nome do cliente..." 
                  style={{ fontSize: '0.875rem' }}
                />
                {buscandoCliente && <Loader2 className="animate-spin" size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
                
                <AnimatePresence>
                  {clientes.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1d24', borderRadius: '12px', overflow: 'hidden', zIndex: 100, border: '1px solid var(--glass-border)', marginTop: '4px' }}>
                      {clientes.map(c => (
                        <div key={c.id} onClick={() => { setClienteSelecionado(c); setClientes([]); setBuscaCliente(c.nome); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover-bg">
                          <div className="font-bold" style={{ fontSize: '0.875rem' }}>{c.nome}</div>
                          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Tel: {c.telefone}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {clienteSelecionado && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)' }}>
                    <CheckCircle2 size={16} />
                    <span className="font-bold" style={{ fontSize: '0.875rem' }}>{clienteSelecionado.nome}</span>
                  </div>
                  <button onClick={() => { setClienteSelecionado(null); setBuscaCliente(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}><X size={16} /></button>
                </div>
              )}
            </div>

            <button 
              onClick={finalizarTroca}
              disabled={trocaItens.length === 0 || !clienteSelecionado || carregandoTroca}
              className="btn-primary" 
              style={{ fontSize: '1.125rem', padding: '20px' }}
            >
              {carregandoTroca ? <Loader2 className="animate-spin" /> : 'Confirmar e Gerar Crédito'}
            </button>
            <p className="text-secondary" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '16px' }}>
              * Os itens selecionados retornarão ao estoque automaticamente após a confirmação.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .hover-bg:hover { background: rgba(255,255,255,0.05) !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Trocas;
