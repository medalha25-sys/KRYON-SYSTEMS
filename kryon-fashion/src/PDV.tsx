import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Trash2, 
  Search, 
  DollarSign, 
  CreditCard, 
  X, 
  Loader2, 
  AlertCircle,
  ShoppingBag,
  RefreshCcw,
  Users,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PDVProps {
  user: any;
}

const PDV: React.FC<PDVProps> = ({ user }) => {
  // Estados de Caixa
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [caixaId, setCaixaId] = useState<string | null>(null);
  const [loadingCaixa, setLoadingCaixa] = useState(false);
  const [vendasSessao, setVendasSessao] = useState(0);
  const [valorAbertura, setValorAbertura] = useState('');
  
  // Estados para Sangria/Suprimento
  const [mostrarMovimentacao, setMostrarMovimentacao] = useState<'SANGRIA' | 'SUPRIMENTO' | null>(null);
  const [valorMovimentacao, setValorMovimentacao] = useState('');
  const [descricaoMovimentacao, setDescricaoMovimentacao] = useState('');

  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [variacoes, setVariacoes] = useState<any[]>([]);
  const [mostrarVariacoes, setMostrarVariacoes] = useState(false);
  const [mostrarPagamento, setMostrarPagamento] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<string | null>(null);
  const [valorRecebido, setValorRecebido] = useState('');
  const [troco, setTroco] = useState(0);
  const [parcelas, setParcelas] = useState(1);

  // Estados de Venda
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [totalVenda, setTotalVenda] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [buscandoProduto, setBuscandoProduto] = useState(false);
  const [valorCreditoUsado, setValorCreditoUsado] = useState(0);
  const [valorPontosUsado, setValorPontosUsado] = useState(0);
  const [inputCredito, setInputCredito] = useState('');

  // Estados de Cliente no PDV
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [clientesBusca, setClientesBusca] = useState<any[]>([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  
  // Refs para Atalhos
  const buscaProdutoRef = useRef<HTMLInputElement>(null);
  const buscaClienteRef = useRef<HTMLInputElement>(null);

  

  // Verificar se há caixa aberto ao montar
  useEffect(() => {
    checkActiveCaixa();
  }, [user.id, user.loja_id]);

  useEffect(() => {
    calcularTotal();
  }, [carrinho, desconto]);

  const calcularTotal = () => {
    const sub = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    setTotalVenda(sub - desconto);
  };

  const checkActiveCaixa = async () => {
    const { data } = await supabase
      .from('caixas')
      .select('id')
      .eq('loja_id', user.loja_id)
      .eq('usuario_id', user.id)
      .eq('aberto', true)
      .single();

    if (data) {
      setCaixaId(data.id);
      setCaixaAberto(true);
      fetchVendasSessao(data.id);
    }
  };

  const fetchVendasSessao = async (caixaId: string) => {
    const { data, error } = await supabase
      .from('vendas')
      .select('total')
      .eq('caixa_id', caixaId);

    if (error) {
      console.error('Erro ao buscar vendas da sessão:', error);
      return;
    }

    const total = data.reduce((acc, venda) => acc + venda.total, 0);
    setVendasSessao(total);
  };

  const handleBusca = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setBusca(query);
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 1) {
      setResultados([]);
      return;
    }

    setBuscandoProduto(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco, categoria')
        .eq('loja_id', user.loja_id)
        .or(`nome.ilike.%${trimmedQuery}%,categoria.ilike.%${trimmedQuery}%`)
        .limit(10);

      if (error) throw error;
      setResultados(data || []);
    } catch (err) {
      console.error(err);
      setResultados([]);
    } finally {
      setBuscandoProduto(false);
    }
  };

  const handleBuscaCliente = async (nome: string) => {
    if (nome.length < 2) {
      setClientesBusca([]);
      return;
    }
    setBuscandoCliente(true);
    try {
      const { data } = await supabase
        .from('clientes')
        .select(`
          *,
          contas_receber (valor, status)
        `)
        .ilike('nome', `%${nome}%`)
        .eq('loja_id', user.loja_id)
        .limit(5);

      const clientesComDebito = data?.map((c: any) => {
        const debito = c.contas_receber?.filter((cr: any) => cr.status !== 'PAGO')
          .reduce((acc: number, cr: any) => acc + (cr.valor || 0), 0) || 0;
        return { ...c, debito };
      });

      setClientesBusca(clientesComDebito || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const selecionarProduto = async (produto: any) => {
    setProdutoSelecionado(produto);
    setBuscandoProduto(true);
    try {
      const { data, error } = await supabase
        .from('produto_variacoes')
        .select('*')
        .eq('produto_id', produto.id)
        .gt('estoque', 0);

      if (error) throw error;
      setVariacoes(data || []);
      setMostrarVariacoes(true);
      setResultados([]);
      setBusca('');
    } catch (err) {
      console.error(err);
    } finally {
      setBuscandoProduto(false);
    }
  };

  const adicionarAoCarrinho = (variacao: any) => {
    const itemExistente = carrinho.find(item => item.variacao_id === variacao.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.variacao_id === variacao.id 
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco }
          : item
      ));
    } else {
      const novoItem = {
        produto_id: produtoSelecionado.id,
        nome: `${produtoSelecionado.nome} (${variacao.tamanho || ''} ${variacao.cor || ''})`,
        variacao_id: variacao.id,
        quantidade: 1,
        preco: produtoSelecionado.preco,
        subtotal: produtoSelecionado.preco
      };
      setCarrinho([...carrinho, novoItem]);
    }

    setMostrarVariacoes(false);
    setProdutoSelecionado(null);
  };

  const finalizarVenda = async (formaPagamento: string) => {
    if (!caixaId || carrinho.length === 0) return;

    setLoadingCaixa(true);
    try {
      // 1. Buscar dados fiscais dos produtos
      const produtoIds = [...new Set(carrinho.map(i => i.produto_id))];
      const { data: fiscalData } = await supabase
        .from('produtos_fiscais')
        .select('*')
        .in('produto_id', produtoIds);

      const fiscalMap = (fiscalData || []).reduce((acc: any, curr: any) => {
        acc[curr.produto_id] = curr;
        return acc;
      }, {});

      // 2. Calcular totais fiscais
      let totalIcms = 0;
      let totalPis = 0;
      let totalCofins = 0;

      const itensComFiscal = carrinho.map(item => {
        const f = fiscalMap[item.produto_id] || {};
        const icms = item.subtotal * ((f.icms_aliq || 0) / 100);
        const pis = item.subtotal * ((f.pis_aliq || 0) / 100);
        const cofins = item.subtotal * ((f.cofins_aliq || 0) / 100);

        totalIcms += icms;
        totalPis += pis;
        totalCofins += cofins;

        return {
          ...item,
          icms,
          pis,
          cofins,
          ncm: f.ncm || '',
          cfop: f.cfop || '',
          cst: f.cst || ''
        };
      });

      // 3. Inserir a Venda
      const { data: venda, error: vError } = await supabase
        .from('vendas')
        .insert({
          loja_id: user.loja_id,
          caixa_id: caixaId,
          cliente_id: clienteSelecionado?.id || null,
          total: totalVenda,
          desconto: desconto,
          total_icms: totalIcms,
          total_pis: totalPis,
          total_cofins: totalCofins,
          status_fiscal: 'PRONTA_PARA_EMISSAO'
        })
        .select()
        .single();

      if (vError) throw vError;

      // 4. Inserir Itens da Venda
      const itensToInsert = itensComFiscal.map(item => ({
        venda_id: venda.id,
        produto_id: item.produto_id,
        variacao_id: item.variacao_id,
        quantidade: item.quantidade,
        preco: item.preco,
        subtotal: item.subtotal,
        icms: item.icms,
        pis: item.pis,
        cofins: item.cofins,
        ncm: item.ncm,
        cfop: item.cfop,
        cst: item.cst
      }));

      const { error: iError } = await supabase
        .from('venda_itens')
        .insert(itensToInsert);

      if (iError) throw iError;

      // 5. Gerar Nota Fiscal (Registro Interno)
      await supabase.from('notas_fiscais').insert({
        venda_id: venda.id,
        tipo: 'NFCe',
        status: 'GERADA',
        json_fiscal: {
          venda: venda.id,
          data: venda.created_at,
          total: venda.total,
          icms: totalIcms,
          pis: totalPis,
          cofins: totalCofins
        }
      });

      // 3. Atualizar Estoque
      for (const item of carrinho) {
        await supabase.rpc('decrement_inventory', {
          p_variacao_id: item.variacao_id,
          p_quantidade: item.quantidade
        });
      }

      // 4. Inserir Pagamentos
      if (valorCreditoUsado > 0) {
        await supabase.from('pagamentos').insert({
          venda_id: venda.id,
          forma: 'CREDITO_LOJA',
          valor: valorCreditoUsado
        });

        // Deduz do cliente
        await supabase.from('clientes')
          .update({ credito: clienteSelecionado.credito - valorCreditoUsado })
          .eq('id', clienteSelecionado.id);
      }

      const valorRestante = totalVenda - valorCreditoUsado;
      if (valorRestante > 0) {
        await supabase.from('pagamentos').insert({
          venda_id: venda.id,
          forma: formaPagamento === 'CREDITO_LOJA' ? 'Dinheiro' : formaPagamento, 
          valor: valorRestante
        });
      }
      

      // 6. Registrar Movimentação no Caixa
      await supabase.from('caixa_movimentacoes').insert({
        caixa_id: caixaId,
        tipo: 'VENDA',
        valor: totalVenda,
        descricao: `Venda #${venda.id.slice(-8)}`
      });

      alert('Venda realizada com sucesso!');
      setCarrinho([]);
      setDesconto(0);
      setValorCreditoUsado(0);
      setValorPontosUsado(0);
      setInputCredito('');
      setMostrarPagamento(false);
      setMetodoPagamento(null);
      setValorRecebido('');
      setTroco(0);
      setClienteSelecionado(null);
      setParcelas(1);
      fetchVendasSessao(caixaId);
    } catch (err: any) {
      alert('Erro ao finalizar venda: ' + err.message);
    } finally {
      setLoadingCaixa(false);
    }
  };



  const finalizaVendaCarne = async (numParcelas: number) => {
    if (!caixaId || carrinho.length === 0 || !clienteSelecionado) return;

    // Double check limit (client side)
    const limiteDisponivel = (clienteSelecionado.limite_credito || 0) - (clienteSelecionado.debito || 0);
    if (totalVenda > limiteDisponivel) {
      alert('Limite insuficiente!');
      return;
    }

    setLoadingCaixa(true);
    try {
      // 1. Insert Venda
      const { data: venda, error: vError } = await supabase
        .from('vendas')
        .insert({
          loja_id: user.loja_id,
          caixa_id: caixaId,
          cliente_id: clienteSelecionado.id,
          total: totalVenda,
          desconto: desconto,
          status_fiscal: 'NAO_GERADA' 
        })
        .select()
        .single();

      if (vError) throw vError;

      // 2. Insert Items
      const itensToInsert = carrinho.map(item => ({
        venda_id: venda.id,
        produto_id: item.produto_id,
        variacao_id: item.variacao_id,
        quantidade: item.quantidade,
        preco: item.preco,
        subtotal: item.subtotal
      }));

      const { error: iError } = await supabase
        .from('venda_itens')
        .insert(itensToInsert);

      if (iError) throw iError;

      // 3. Update Inventory
      for (const item of carrinho) {
        await supabase.rpc('decrement_inventory', {
          p_variacao_id: item.variacao_id,
          p_quantidade: item.quantidade
        });
      }

      // 4. Generate Contas a Receber (Installments)
      const valorParcela = totalVenda / numParcelas;
      const installments = [];
      
      for (let i = 1; i <= numParcelas; i++) {
        const dataVencimento = new Date();
        dataVencimento.setDate(dataVencimento.getDate() + (i * 30));

        installments.push({
          loja_id: user.loja_id,
          cliente_id: clienteSelecionado.id,
          venda_id: venda.id,
          numero_parcela: i,
          total_parcelas: numParcelas,
          valor: valorParcela,
          data_vencimento: dataVencimento.toISOString(),
          status: 'PENDENTE'
        });
      }

      await supabase.from('contas_receber').insert(installments);

      // 5. Register Payment Log
      await supabase.from('pagamentos').insert({
        venda_id: venda.id,
        forma: 'CARNE',
        valor: totalVenda
      });

      alert('Venda no Carnê realizada com sucesso!');
      setCarrinho([]);
      setDesconto(0);
      setMostrarPagamento(false);
      setMetodoPagamento(null);
      setClienteSelecionado(null);
      setParcelas(1);
      fetchVendasSessao(caixaId);

    } catch (err: any) {
      alert('Erro ao finalizar venda no carnê: ' + err.message);
    } finally {
      setLoadingCaixa(false);
    }
  };

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caixaId || !mostrarMovimentacao) return;

    setLoadingCaixa(true);
    try {
      const valor = parseFloat(valorMovimentacao);
      const { error } = await supabase.from('caixa_movimentacoes').insert({
        caixa_id: caixaId,
        tipo: mostrarMovimentacao,
        valor: valor,
        descricao: descricaoMovimentacao || (mostrarMovimentacao === 'SANGRIA' ? 'Retirada de valor' : 'Reforço de troco')
      });

      if (error) throw error;

      alert(`${mostrarMovimentacao === 'SANGRIA' ? 'Sangria' : 'Suprimento'} realizada com sucesso!`);
      setMostrarMovimentacao(null);
      setValorMovimentacao('');
      setDescricaoMovimentacao('');
    } catch (err: any) {
      alert('Erro ao processar movimentação: ' + err.message);
    } finally {
      setLoadingCaixa(false);
    }
  };

  const removerItem = (variacao_id: string) => {
    setCarrinho(carrinho.filter(item => item.variacao_id !== variacao_id));
  };

  const abrirCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCaixa(true);
    try {
      const { data, error } = await supabase
        .from('caixas')
        .insert({
          loja_id: user.loja_id,
          usuario_abertura: user.id,
          valor_abertura: parseFloat(valorAbertura) || 0,
          status: 'ABERTO'
        })
        .select()
        .single();

      if (error) throw error;

      setCaixaId(data.id);
      setCaixaAberto(true);
    } catch (err: any) {
      alert('Erro ao abrir caixa: ' + err.message);
    } finally {
      setLoadingCaixa(false);
    }
  };

  const fecharCaixa = async () => {
    if (!caixaId) return;
    
    setLoadingCaixa(true);
    try {
      // 1. Buscar resumo das movimentações
      const { data: movs } = await supabase
        .from('caixa_movimentacoes')
        .select('tipo, valor')
        .eq('caixa_id', caixaId);

      const resumo = (movs || []).reduce((acc, curr) => {
        if (curr.tipo === 'VENDA') acc.vendas += curr.valor;
        if (curr.tipo === 'SANGRIA') acc.sangria += curr.valor;
        if (curr.tipo === 'SUPRIMENTO') acc.suprimento += curr.valor;
        return acc;
      }, { vendas: 0, sangria: 0, suprimento: 0 });

      const totalFinal = (parseFloat(valorAbertura) || 0) + resumo.vendas + resumo.suprimento - resumo.sangria;

      const confirmacao = window.confirm(
        `Fechamento de Caixa:\n\n` +
        `Abertura: R$ ${parseFloat(valorAbertura).toLocaleString('pt-BR')}\n` +
        `Vendas: R$ ${resumo.vendas.toLocaleString('pt-BR')}\n` +
        `Suprimentos: R$ ${resumo.suprimento.toLocaleString('pt-BR')}\n` +
        `Sangrias: -R$ ${resumo.sangria.toLocaleString('pt-BR')}\n\n` +
        `Saldo em Caixa: R$ ${totalFinal.toLocaleString('pt-BR')}\n\n` +
        `Deseja realmente fechar o caixa?`
      );

      if (!confirmacao) return;

      const { error } = await supabase
        .from('caixas')
        .update({
          status: 'FECHADO',
          valor_fechamento: totalFinal,
          data_fechamento: new Date().toISOString()
        })
        .eq('id', caixaId);

      if (error) throw error;

      setCaixaAberto(false);
      setCaixaId(null);
      setVendasSessao(0);
      setCarrinho([]);
    } catch (err: any) {
      alert('Erro ao fechar caixa: ' + err.message);
    } finally {
      setLoadingCaixa(false);
    }
  };

  if (!caixaAberto) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
          style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}
        >
          <div className="mb-8">
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', marginBottom: '16px' }}>
              <AlertCircle size={40} style={{ color: 'var(--status-warning)' }} />
            </div>
            <h2 className="font-bold mb-1" style={{ fontSize: '1.5rem' }}>Caixa Fechado</h2>
            <p className="text-secondary">É necessário abrir o caixa para iniciar as vendas.</p>
          </div>

          <form onSubmit={abrirCaixa} style={{ textAlign: 'left' }}>
            <div className="mb-8">
              <label className="text-secondary font-bold" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>
                Valor de Abertura (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valorAbertura}
                onChange={(e) => setValorAbertura(e.target.value)}
                className="input-field"
                placeholder="0,00"
                required
              />
            </div>
            <button type="submit" disabled={loadingCaixa} className="btn-primary">
              {loadingCaixa ? <Loader2 className="animate-spin" /> : 'Abrir Caixa'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pdv-grid">
      {/* Esquerda: Busca de Produtos e Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card p-4" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
            />
            <input 
              type="text" 
              ref={buscaProdutoRef}
              value={busca}
              onChange={handleBusca}
              placeholder="F1 - Buscar produto..."
              className="input-field"
              style={{ paddingLeft: '48px', height: '56px', fontSize: '1.125rem' }}
            />
            {buscandoProduto && (
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                <Loader2 className="animate-spin" size={20} style={{ color: 'var(--accent-blue)' }} />
              </div>
            )}
          </div>

          {/* Resultados da Busca */}
          <AnimatePresence>
            {busca.length > 0 && !buscandoProduto && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: '8px', background: '#0f1117', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden' }}
              >
                {resultados.length > 0 ? (
                  resultados.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selecionarProduto(p)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      className="hover-bg"
                    >
                      <div>
                        <div className="font-bold">{p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.categoria || 'Geral'}</div>
                      </div>
                      <span className="text-blue font-bold">R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhum produto encontrado para "{busca}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal de Pagamento */}
        <AnimatePresence>
          {mostrarPagamento && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="glass-card p-10"
                style={{ width: '100%', maxWidth: '540px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 className="font-black" style={{ fontSize: '1.5rem' }}>Finalizar Pagamento</h3>
                  <button onClick={() => setMostrarPagamento(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  <p className="text-secondary mb-1">Total a Pagar</p>
                  <h2 className="text-blue font-black" style={{ fontSize: '3rem' }}>
                    R$ {totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                {!metodoPagamento ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button 
                      onClick={() => setMetodoPagamento('Dinheiro')}
                      className="nav-item" 
                      style={{ height: '120px', flexDirection: 'column', gap: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <DollarSign size={32} style={{ color: 'var(--status-success)' }} />
                      <span className="font-bold">Dinheiro</span>
                    </button>
                      <button 
                        onClick={() => {
                          setMetodoPagamento('Cartão');
                          finalizarVenda('Cartão');
                        }}
                        className="nav-item" 
                        style={{ height: '120px', flexDirection: 'column', gap: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}
                      >
                        <CreditCard size={32} style={{ color: 'var(--accent-blue)' }} />
                        <span className="font-bold">Cartão</span>
                      </button>

                      <button 
                        onClick={() => setMetodoPagamento('Carne')}
                        className="nav-item" 
                        style={{ height: '120px', flexDirection: 'column', gap: '12px', background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.2)' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <FileText size={32} style={{ color: 'var(--accent-orange)' }} />
                          <span className="font-bold" style={{ marginTop: '8px' }}>Carnê</span>
                        </div>
                      </button>
                    {clienteSelecionado && clienteSelecionado.credito > 0 && (
                      <div className="glass-card p-4 mb-4" style={{ gridColumn: 'span 2', background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)' }}>
                            <RefreshCcw size={20} />
                            <span className="font-bold">Usar Crédito (Saldo: R$ {clienteSelecionado.credito.toLocaleString('pt-BR')})</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input 
                            type="number" 
                            className="input-field" 
                            style={{ flex: 1 }}
                            placeholder="Valor a usar..." 
                            value={inputCredito}
                            onChange={(e) => setInputCredito(e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const val = parseFloat(inputCredito) || 0;
                              if (val > clienteSelecionado.credito) {
                                alert("Crédito insuficiente!");
                                return;
                              }
                              if (val > totalVenda) {
                                alert("O valor do crédito não pode ser maior que o total da venda!");
                                return;
                              }
                              setValorCreditoUsado(val);
                            }}
                            className="btn-primary" 
                            style={{ width: 'auto', padding: '0 20px', background: 'var(--accent-teal)' }}
                          >
                            Aplicar
                          </button>
                        </div>
                        {valorCreditoUsado > 0 && (
                          <div style={{ marginTop: '8px', color: 'var(--status-success)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Crédito aplicado com sucesso!</span>
                            <span className="font-bold">- R$ {valorCreditoUsado.toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {clienteSelecionado && clienteSelecionado.pontos > 0 && (
                      <div className="glass-card p-4 mb-4" style={{ gridColumn: 'span 2', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="font-bold text-blue">Resgatar Pontos ({clienteSelecionado.pontos} pts)</span>
                          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>10 pts = R$ 1,00</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const desc = Math.floor(clienteSelecionado.pontos / 10);
                            if (desc > totalVenda) {
                              alert("O desconto dos pontos não pode ser maior que a venda!");
                              return;
                            }
                            setValorPontosUsado(desc);
                            setDesconto(prev => prev + desc);
                            alert(`Desconto de R$ ${desc.toLocaleString('pt-BR')} aplicado!`);
                          }}
                          disabled={valorPontosUsado > 0}
                          className="btn-primary" 
                          style={{ background: 'var(--accent-blue)', height: '40px', opacity: valorPontosUsado > 0 ? 0.5 : 1 }}
                        >
                          {valorPontosUsado > 0 ? 'Pontos Resgatados' : 'Trocar Pontos por Desconto'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : metodoPagamento === 'Dinheiro' ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="mb-6">
                      <label className="text-secondary font-bold mb-2" style={{ display: 'block' }}>Valor Recebido</label>
                      <input 
                        type="number" 
                        autoFocus
                        className="input-field" 
                        style={{ fontSize: '1.5rem', textAlign: 'center', height: '64px' }}
                        value={valorRecebido}
                        onChange={(e) => {
                          const val = e.target.value;
                          setValorRecebido(val);
                          const numVal = parseFloat(val) || 0;
                          setTroco(Math.max(0, numVal - totalVenda));
                        }}
                        placeholder="0,00"
                      />
                    </div>

                    {parseFloat(valorRecebido) >= totalVenda && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', background: 'rgba(20,184,166,0.1)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--accent-teal)' }}
                      >
                        <p className="text-teal font-bold mb-1">Troco para o Cliente</p>
                        <h3 className="text-teal font-black" style={{ fontSize: '2rem' }}>
                          R$ {troco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                      </motion.div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => finalizarVenda('Dinheiro')}
                        disabled={parseFloat(valorRecebido) < totalVenda || loadingCaixa}
                        className="btn-primary" 
                        style={{ flex: 2 }}
                      >
                        {loadingCaixa ? <Loader2 className="animate-spin" /> : 'Confirmar e Finalizar'}
                      </button>
                      <button 
                        onClick={() => {
                          setMetodoPagamento(null);
                          setValorRecebido('');
                          setTroco(0);
                        }}
                        className="nav-item" 
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        Voltar
                      </button>
                    </div>
                  </motion.div>
                ) : metodoPagamento === 'Carne' ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {!clienteSelecionado ? (
                      <div className="text-center p-8">
                        <Users size={48} className="mx-auto mb-4 text-secondary" style={{ opacity: 0.3 }} />
                        <h3 className="font-bold text-lg mb-2">Identifique o Cliente</h3>
                        <p className="text-secondary mb-4">Para vender no carnê, é necessário identificar o cliente primeiro.</p>
                        <div className="flex justify-center">
                          <button 
                            onClick={() => {
                              setMostrarPagamento(false);
                              setTimeout(() => buscaClienteRef.current?.focus(), 100);
                            }}
                            className="btn-primary"
                          >
                            Selecionar Cliente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-secondary">Cliente:</span>
                            <span className="font-bold">{clienteSelecionado.nome}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="text-secondary">Limite Total:</span>
                            <span>R$ {(clienteSelecionado.limite_credito || 0).toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="text-secondary">Débitos em Aberto:</span>
                            <span className="text-red-400">R$ {(clienteSelecionado.debito || 0).toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="h-px bg-white/10 my-3"></div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-secondary">Limite Disponível:</span>
                            <span className={`font-bold ${(clienteSelecionado.limite_credito - (clienteSelecionado.debito || 0)) >= totalVenda ? 'text-green-400' : 'text-red-500'}`}>
                              R$ {Math.max(0, (clienteSelecionado.limite_credito || 0) - (clienteSelecionado.debito || 0)).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="text-secondary font-bold mb-2 block">Número de Parcelas</label>
                          <select 
                            className="input-field w-full"
                            value={parcelas}
                            onChange={(e) => setParcelas(parseInt(e.target.value))}
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                              <option key={num} value={num}>
                                {num}x de R$ {(totalVenda / num).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {(clienteSelecionado.limite_credito - (clienteSelecionado.debito || 0)) < totalVenda && (
                           <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                             <AlertCircle size={16} />
                             <span>Limite de crédito insuficiente para esta compra.</span>
                           </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button 
                            onClick={() => finalizaVendaCarne(parcelas)}
                            disabled={(clienteSelecionado.limite_credito - (clienteSelecionado.debito || 0)) < totalVenda || loadingCaixa}
                            className="btn-primary" 
                            style={{ flex: 2, background: 'var(--accent-orange)' }}
                          >
                            {loadingCaixa ? <Loader2 className="animate-spin" /> : 'Confirmar Carnê'}
                          </button>
                          <button 
                            onClick={() => {
                              setMetodoPagamento(null);
                              setParcelas(1);
                            }}
                            className="nav-item" 
                            style={{ flex: 1, justifyContent: 'center' }}
                          >
                            Voltar
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : null}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Variações */}
        <AnimatePresence>
          {mostrarVariacoes && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8"
                style={{ width: '100%', maxWidth: '500px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 className="font-bold" style={{ fontSize: '1.25rem' }}>{produtoSelecionado?.nome}</h3>
                  <button onClick={() => setMostrarVariacoes(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                  </button>
                </div>
                <p className="text-secondary mb-4">Selecione a variação disponível:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {variacoes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => adicionarAoCarrinho(v)}
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                      className="hover-border-blue"
                    >
                      <div className="font-bold" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{v.tamanho || 'Tam. Único'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estoque: {v.estoque}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{v.cor || 'Cor Única'}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="glass-card" style={{ minHeight: '400px', overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Qtd</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrinho.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <ShoppingBag size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                    <p>Carrinho vazio. Adicione produtos para começar.</p>
                  </td>
                </tr>
              ) : (
                carrinho.map((item) => (
                  <tr key={item.variacao_id}>
                    <td className="font-bold">{item.nome}</td>
                    <td>R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>{item.quantidade}x</td>
                    <td className="text-blue font-bold">R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => removerItem(item.variacao_id)}
                        style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: 'var(--status-error)', cursor: 'pointer' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direita: Resumo e Pagamento */}
      <div className="pdv-sidebar">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4" style={{ fontSize: '1.125rem' }}>Resumo da Venda</h3>
          
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '24px', marginBottom: '24px' }}>
            {/* Seleção de Cliente */}
            <div className="mb-6">
              <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Cliente (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  ref={buscaClienteRef}
                  type="text" 
                  className="input-field" 
                  placeholder="F2 - Nome do cliente..." 
                  style={{ padding: '10px 12px', fontSize: '0.875rem' }}
                  onChange={e => handleBuscaCliente(e.target.value)}
                />
                {buscandoCliente && <Loader2 className="animate-spin" size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />}
                
                <AnimatePresence>
                  {clientesBusca.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1d24', borderRadius: '12px', overflow: 'hidden', zIndex: 50, border: '1px solid var(--glass-border)', marginTop: '4px' }}>
                      {clientesBusca.map(c => (
                        <div key={c.id} onClick={() => { setClienteSelecionado(c); setClientesBusca([]); }} style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover-bg">
                          <div className="font-bold" style={{ fontSize: '0.875rem' }}>{c.nome}</div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                            <span className="text-teal">Crédito: R$ {(c.credito || 0).toLocaleString('pt-BR')}</span>
                            <span className="text-blue">• {(c.pontos || 0)} pts</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {clienteSelecionado && (
                <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontSize: '0.875rem' }}>
                    <Users size={16} /> <span className="font-bold">{clienteSelecionado.nome}</span>
                    <span className="text-secondary" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                      {clienteSelecionado.pontos || 0} pts
                    </span>
                  </div>
                  <button onClick={() => setClienteSelecionado(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}><X size={14} /></button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>R$ {(totalVenda + desconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-secondary">Desconto (R$)</span>
              <input 
                type="number" 
                value={desconto}
                onChange={(e) => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
                className="input-field"
                style={{ padding: '8px 12px', width: '100px', textAlign: 'right' }}
              />
            </div>
          </div>

          <div className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span className="text-secondary">Total a Pagar</span>
            <span className="font-black text-blue" style={{ fontSize: '2.25rem', lineHeight: 1 }}>
              R$ {totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => setMostrarPagamento(true)}
              className="btn-primary"
              disabled={carrinho.length === 0 || loadingCaixa}
              style={{ fontSize: '1.125rem', padding: '20px' }}
            >
              {loadingCaixa ? <Loader2 className="animate-spin" /> : 'F8 - Finalizar Venda'}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => { setMetodoPagamento('Dinheiro'); setMostrarPagamento(true); }}
                disabled={carrinho.length === 0 || loadingCaixa}
                className="nav-item" 
                style={{ flexDirection: 'column', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}
              >
                <DollarSign size={20} style={{ color: 'var(--status-success)' }} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>F9 - Dinheiro</span>
              </button>
              <button 
                onClick={() => {
                  setMetodoPagamento('Cartão');
                  finalizarVenda('Cartão');
                }}
                disabled={carrinho.length === 0 || loadingCaixa}
                className="nav-item" 
                style={{ flexDirection: 'column', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}
              >
                <CreditCard size={20} style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>F10 - Cartão</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
            <button 
              onClick={() => setMostrarMovimentacao('SANGRIA')}
              className="nav-item"
              style={{ justifyContent: 'center', fontSize: '0.8125rem', padding: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'var(--status-error)' }}
            >
              Sangria
            </button>
            <button 
              onClick={() => setMostrarMovimentacao('SUPRIMENTO')}
              className="nav-item"
              style={{ justifyContent: 'center', fontSize: '0.8125rem', padding: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', color: 'var(--status-success)' }}
            >
              Suprimento
            </button>
          </div>

          <button 
            onClick={fecharCaixa}
            className="nav-item"
            style={{ marginTop: '12px', justifyContent: 'center', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            Fechar Caixa do Dia
          </button>
        </div>
      </div>

        {/* Modal de Movimentação de Caixa (Sangria/Suprimento) */}
        <AnimatePresence>
          {mostrarMovimentacao && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8"
                style={{ width: '100%', maxWidth: '400px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 className="font-bold">{mostrarMovimentacao === 'SANGRIA' ? '🔴 Realizar Sangria' : '🟢 Realizar Suprimento'}</h3>
                  <button onClick={() => setMostrarMovimentacao(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleMovimentacao}>
                  <div className="mb-4">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Valor (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      autoFocus
                      className="input-field" 
                      value={valorMovimentacao}
                      onChange={e => setValorMovimentacao(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.875rem' }}>Observação / Motivo</label>
                    <textarea 
                      className="input-field" 
                      style={{ height: '80px', padding: '12px' }}
                      value={descricaoMovimentacao}
                      onChange={e => setDescricaoMovimentacao(e.target.value)}
                      placeholder="Ex: Pagamento de frete, troco extra..."
                    />
                  </div>
                  <button type="submit" disabled={loadingCaixa} className="btn-primary" style={{ background: mostrarMovimentacao === 'SANGRIA' ? 'var(--status-error)' : 'var(--status-success)' }}>
                    {loadingCaixa ? <Loader2 className="animate-spin" /> : `Confirmar ${mostrarMovimentacao === 'SANGRIA' ? 'Retirada' : 'Entrada'}`}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Barra de Legend de Atalhos */}
      <footer style={{ position: 'fixed', bottom: 0, left: '280px', right: 0, background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--glass-border)', padding: '8px 24px', display: 'flex', gap: '24px', fontSize: '0.75rem', color: 'var(--text-secondary)', zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '4px' }}><b style={{ color: 'var(--accent-blue)' }}>F1</b> Buscar Produto</div>
        <div style={{ display: 'flex', gap: '4px' }}><b style={{ color: 'var(--accent-blue)' }}>F2</b> Buscar Cliente</div>
        <div style={{ display: 'flex', gap: '4px' }}><b style={{ color: 'var(--accent-blue)' }}>F8</b> Finalizar Venda</div>
        <div style={{ display: 'flex', gap: '4px' }}><b style={{ color: 'var(--accent-blue)' }}>F9/F10</b> Opções de Pgto</div>
        <div style={{ display: 'flex', gap: '4px' }}><b style={{ color: 'var(--accent-blue)' }}>ESC</b> Cancelar/Sair</div>
      </footer>

      <style>{`
        .hover-bg:hover { background: rgba(255,255,255,0.05) !important; }
        .hover-border-blue:hover { border-color: var(--accent-blue) !important; background: rgba(59,130,246,0.05) !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PDV;
