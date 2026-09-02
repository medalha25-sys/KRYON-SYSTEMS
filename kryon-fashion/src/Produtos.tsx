import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Package,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProdutosProps {
  user: any;
}

const Produtos: React.FC<ProdutosProps> = ({ user }) => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  // Estado do Novo Produto
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    categoria: '',
    marca: '',
    preco: '',
    custo: ''
  });
  
  const [variacoes, setVariacoes] = useState([{ tamanho: '', cor: '', estoque: '0', sku: '' }]);
  const [inputCores, setInputCores] = useState('');
  const [inputTamanhos, setInputTamanhos] = useState('');
  const [gradeMatrix, setGradeMatrix] = useState<any[]>([]); // { cor, tamanhos: { [tamanho]: estoque } }
  const [usarMatriz, setUsarMatriz] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, [user.loja_id]);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          produto_variacoes(*)
        `)
        .eq('loja_id', user.loja_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const logicGerarVariacoes = () => {
    if (!inputCores || !inputTamanhos) {
      alert('Preencha as cores e tamanhos para gerar');
      return;
    }

    const cores = inputCores.split(',').map(c => c.trim()).filter(c => c);
    const tamanhos = inputTamanhos.split(',').map(t => t.trim()).filter(t => t);
    
    // Preparar Matriz
    const novaGrade = cores.map(cor => ({
      cor,
      tamanhos: tamanhos.reduce((acc, tam) => ({ ...acc, [tam]: '0' }), {})
    }));

    setGradeMatrix(novaGrade);
    setUsarMatriz(true);
  };

  const handleMatrixChange = (corIndex: number, tamanho: string, value: string) => {
    const novaGrade = [...gradeMatrix];
    novaGrade[corIndex].tamanhos[tamanho] = value;
    setGradeMatrix(novaGrade);
  };

  const addVariacao = () => {
    setVariacoes([...variacoes, { tamanho: '', cor: '', estoque: '0', sku: '' }]);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setNovoProduto({ nome: '', categoria: '', marca: '', preco: '', custo: '' });
    setVariacoes([{ tamanho: '', cor: '', estoque: '0', sku: '' }]);
    setInputCores('');
    setInputTamanhos('');
  };

  const removeVariacao = (index: number) => {
    if (variacoes.length > 1) {
      setVariacoes(variacoes.filter((_, i) => i !== index));
    }
  };

  const handleVariacaoChange = (index: number, field: string, value: string) => {
    const novasVariacoes = [...variacoes];
    novasVariacoes[index] = { ...novasVariacoes[index], [field]: value };
    setVariacoes(novasVariacoes);
  };

  const salvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    try {
      // 1. Inserir Produto
      const { data: produto, error: pError } = await supabase
        .from('produtos')
        .insert({
          loja_id: user.loja_id,
          nome: novoProduto.nome,
          categoria: novoProduto.categoria,
          marca: novoProduto.marca,
          preco: parseFloat(novoProduto.preco),
          custo: parseFloat(novoProduto.custo) || 0
        })
        .select()
        .single();

      if (pError) throw pError;

      // 2. Inserir Variações
      let variacoesToInsert: any[] = [];

      if (usarMatriz) {
        gradeMatrix.forEach(row => {
          Object.entries(row.tamanhos).forEach(([tam, est]: [string, any]) => {
            variacoesToInsert.push({
              produto_id: produto.id,
              tamanho: tam,
              cor: row.cor,
              sku: `${row.cor.substring(0,3).toUpperCase()}-${tam.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
              estoque: parseInt(est) || 0
            });
          });
        });
      } else {
        variacoesToInsert = variacoes.map(v => ({
          produto_id: produto.id,
          tamanho: v.tamanho,
          cor: v.cor,
          sku: v.sku,
          estoque: parseInt(v.estoque) || 0
        }));
      }

      const { error: vError } = await supabase
        .from('produto_variacoes')
        .insert(variacoesToInsert);

      if (vError) throw vError;

      // Reset e Refresh
      setModalAberto(false);
      setNovoProduto({ nome: '', categoria: '', marca: '', preco: '', custo: '' });
      setVariacoes([{ tamanho: '', cor: '', estoque: '0', sku: '' }]);
      setInputCores('');
      setInputTamanhos('');
      fetchProdutos();
      alert('Produto cadastrado com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header e Busca */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search 
            size={20} 
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
          />
          <input 
            type="text" 
            placeholder="Pesquisar produtos..." 
            className="input-field"
            style={{ paddingLeft: '48px' }}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !busca) {
                fetchProdutos();
              }
            }}
          />
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setModalAberto(true)}>
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* Tabela de Produtos */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                  <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-blue)', margin: '0 auto' }} />
                </td>
              </tr>
            ) : produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Package size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>Nenhum produto encontrado.</p>
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((p) => {
                const estoqueTotal = p.produto_variacoes?.reduce((acc: number, v: any) => acc + (v.estoque || 0), 0) || 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="font-bold">{p.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.marca || 'Sem Marca'}</div>
                    </td>
                    <td><span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>{p.categoria || 'Geral'}</span></td>
                    <td className="text-blue font-bold">R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={14} className="text-secondary" />
                        <span className={
                          estoqueTotal === 0 ? 'text-error font-bold' : 
                          estoqueTotal <= 5 ? 'text-yellow-500 font-bold' : 
                          'text-teal font-bold'
                        }>
                          {estoqueTotal} un.
                        </span>
                        {estoqueTotal > 0 && estoqueTotal <= 5 && (
                          <span title="Estoque Baixo" className="text-yellow-500 bg-yellow-500/10 p-1 rounded">
                             ⚠️
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)', border: 'none', color: 'var(--status-error)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      <AnimatePresence>
        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="font-black" style={{ fontSize: '1.75rem' }}>Cadastrar Produto</h2>
                <button onClick={fecharModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
              </div>

              <form onSubmit={salvarProduto}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="text-secondary font-bold mb-1" style={{ display: 'block' }}>Nome do Produto</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Camiseta Original Cotton" 
                      value={novoProduto.nome}
                      onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-secondary font-bold mb-1" style={{ display: 'block' }}>Categoria</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Vestuário" 
                      value={novoProduto.categoria}
                      onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-secondary font-bold mb-1" style={{ display: 'block' }}>Marca</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Nike" 
                      value={novoProduto.marca}
                      onChange={e => setNovoProduto({...novoProduto, marca: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-secondary font-bold mb-1" style={{ display: 'block' }}>Preço de Venda (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="input-field" 
                      placeholder="0,00" 
                      value={novoProduto.preco}
                      onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-secondary font-bold mb-1" style={{ display: 'block' }}>Preço de Custo (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="input-field" 
                      placeholder="0,00" 
                      value={novoProduto.custo}
                      onChange={e => setNovoProduto({...novoProduto, custo: e.target.value})}
                    />
                  </div>
                </div>

                {/* Seção de Geração Automática */}
                <div style={{ padding: '24px', background: 'rgba(59,130,246,0.03)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)', marginBottom: '32px' }}>
                  <h3 className="font-bold text-blue mb-4" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} /> Gerador de Variações Rápido
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '16px', alignItems: 'flex-end' }}>
                    <div>
                      <label className="text-secondary mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>Cores (separadas por vírgula)</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Ex: Azul, Preto, Branco"
                        value={inputCores}
                        onChange={e => setInputCores(e.target.value)}
                        style={{ height: '44px' }}
                      />
                    </div>
                    <div>
                      <label className="text-secondary mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>Tamanhos (separados por vírgula)</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Ex: P, M, G, GG"
                        value={inputTamanhos}
                        onChange={e => setInputTamanhos(e.target.value)}
                        style={{ height: '44px' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={logicGerarVariacoes}
                      className="btn-primary" 
                      style={{ height: '44px', fontSize: '0.875rem' }}
                    >
                      Gerar Lista
                    </button>
                  </div>
                </div>

                {/* Seção de Variações */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="font-bold text-teal">{usarMatriz ? 'Matriz de Grade' : 'Lista de Variações'}</h3>
                    {!usarMatriz && (
                      <button type="button" onClick={addVariacao} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(20,184,166,0.1)', border: 'none', color: 'var(--accent-teal)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <Plus size={14} /> Adicionar Manual
                      </button>
                    )}
                    {usarMatriz && (
                      <button type="button" onClick={() => setUsarMatriz(false)} style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Voltar para lista manual
                      </button>
                    )}
                  </div>

                  {usarMatriz ? (
                    <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
                      <table className="custom-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ background: 'rgba(255,255,255,0.02)', position: 'sticky', left: 0, zIndex: 10 }}>COR / TAM</th>
                            {inputTamanhos.split(',').map(tam => (
                              <th key={tam.trim()} style={{ textAlign: 'center' }}>{tam.trim()}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {gradeMatrix.map((row, corIdx) => (
                            <tr key={row.cor}>
                              <td style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.01)', position: 'sticky', left: 0, zIndex: 5 }}>{row.cor}</td>
                              {Object.keys(row.tamanhos).map(tam => (
                                <td key={tam} style={{ padding: '8px' }}>
                                  <input 
                                    type="number" 
                                    className="input-field" 
                                    style={{ textAlign: 'center', padding: '8px', height: '36px' }}
                                    value={row.tamanhos[tam]}
                                    onChange={e => handleMatrixChange(corIdx, tam, e.target.value)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {variacoes.map((v, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr 40px', gap: '12px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tamanho (ex: G)</label>
                            <input type="text" className="input-field" style={{ padding: '8px' }} value={v.tamanho} onChange={e => handleVariacaoChange(i, 'tamanho', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cor (ex: Azul)</label>
                            <input type="text" className="input-field" style={{ padding: '8px' }} value={v.cor} onChange={e => handleVariacaoChange(i, 'cor', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qtd Estoque</label>
                            <input type="number" className="input-field" style={{ padding: '8px' }} value={v.estoque} onChange={e => handleVariacaoChange(i, 'estoque', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU / Código</label>
                            <input type="text" className="input-field" style={{ padding: '8px' }} value={v.sku} onChange={e => handleVariacaoChange(i, 'sku', e.target.value)} />
                          </div>
                          <button type="button" onClick={() => removeVariacao(i)} style={{ background: 'transparent', border: 'none', color: 'var(--status-error)', padding: '8px', cursor: 'pointer' }}>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="submit" disabled={salvando} className="btn-primary" style={{ flex: 2 }}>
                    {salvando ? <Loader2 className="animate-spin" /> : 'Salvar Produto'}
                  </button>
                  <button type="button" onClick={fecharModal} className="nav-item" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Produtos;
