import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  TrendingUp, 
  Calendar, 
  Filter, 
  Loader2, 
  BarChart3,
  PieChart,
  Trophy,
  AlertTriangle,
  PackageX,
  Coins,
  Users,
  FileText,
  CreditCard,
  Printer,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RelatoriosProps {
  user: any;
}

const Relatorios: React.FC<RelatoriosProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [topProdutos, setTopProdutos] = useState<any[]>([]);
  const [estoqueBaixo, setEstoqueBaixo] = useState<any[]>([]);
  const [semVendas, setSemVendas] = useState<any[]>([]);
  const [topClientes, setTopClientes] = useState<any[]>([]);
  const [extratoDetalhado, setExtratoDetalhado] = useState<any[]>([]);
  
  const [resumo, setResumo] = useState({
    totalVendido: 0,
    totalVendas: 0,
    ticketMedio: 0,
    lucroBruto: 0,
    cmv: 0,
    impostos: 0,
    lucroLiquido: 0
  });

  useEffect(() => {
    fetchRelatorio();
  }, [user.loja_id]);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      const queryFim = new Date(dataFim);
      queryFim.setHours(23, 59, 59, 999);

      // 1. Vendas por Dia
      const { data: vData, error: vError } = await supabase
        .from('vendas')
        .select('total, created_at, id, cliente_id')
        .eq('loja_id', user.loja_id)
        .gte('created_at', dataInicio)
        .lte('created_at', queryFim.toISOString())
        .order('created_at', { ascending: true });

      if (vError) throw vError;

      const agrupado: { [key: string]: any } = {};
      let totalVendido = 0;
      let totalVendas = 0;

      vData?.forEach(v => {
        const dia = new Date(v.created_at).toLocaleDateString('pt-BR');
        if (!agrupado[dia]) {
          agrupado[dia] = { data: dia, total_vendido: 0, qtd_vendas: 0 };
        }
        agrupado[dia].total_vendido += v.total;
        agrupado[dia].qtd_vendas += 1;
        totalVendido += v.total;
        totalVendas += 1;
      });

      // 2. Pagamentos Totais e Extrato Detalhado
      const { data: pData } = await supabase
        .from('pagamentos')
        .select(`
          forma,
          valor,
          vendas!inner(id, loja_id, created_at, total)
        `)
        .eq('vendas.loja_id', user.loja_id)
        .gte('vendas.created_at', dataInicio)
        .lte('vendas.created_at', queryFim.toISOString())
        .order('vendas(created_at)', { ascending: false });

      const pAgrupado: { [key: string]: number } = {};
      pData?.forEach((p: any) => {
        pAgrupado[p.forma] = (pAgrupado[p.forma] || 0) + p.valor;
      });
      const listaPagamentos = Object.entries(pAgrupado).map(([forma, total]) => ({ forma, total }));
      setExtratoDetalhado(pData || []);

      // 3. Top 10 Produtos & Lucro
      const { data: tpData } = await supabase
        .from('venda_itens')
        .select(`
          quantidade,
          preco,
          produtos!inner(nome, custo, loja_id),
          vendas!inner(loja_id, created_at)
        `)
        .eq('vendas.loja_id', user.loja_id)
        .gte('vendas.created_at', dataInicio)
        .lte('vendas.created_at', queryFim.toISOString());

      const prAgrupado: { [key: string]: number } = {};
      let lucroTotal = 0;

      tpData?.forEach((item: any) => {
        const nome = item.produtos.nome;
        const custo = item.produtos.custo || 0;
        const precoVenda = item.preco;
        const qtd = item.quantidade;

        prAgrupado[nome] = (prAgrupado[nome] || 0) + qtd;
        lucroTotal += (precoVenda - custo) * qtd;
      });

      const sortedProds = Object.entries(prAgrupado)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      
      // 4. Estoque Baixo
      const { data: ebData } = await supabase
        .from('produto_variacoes')
        .select('cor, tamanho, estoque, produtos!inner(nome, loja_id)')
        .eq('produtos.loja_id', user.loja_id)
        .lte('estoque', 3)
        .order('estoque', { ascending: true });

      // 5. Sem Vendas
      const { data: svData } = await supabase
        .from('produto_variacoes')
        .select(`
          cor, tamanho, estoque, 
          produtos!inner(nome, loja_id),
          venda_itens(id)
        `)
        .eq('produtos.loja_id', user.loja_id);

      const inativos = svData?.filter((item: any) => item.venda_itens.length === 0) || [];

      // 6. Top 10 Clientes
      const { data: tcData } = await supabase
        .from('vendas')
        .select('total, cliente_id, clientes(nome)')
        .eq('loja_id', user.loja_id)
        .not('cliente_id', 'is', null);

      const clAgrupado: { [key: string]: { nome: string, total: number, qtd: number } } = {};
      tcData?.forEach((v: any) => {
        const id = v.cliente_id;
        const nome = v.clientes.nome;
        if (!clAgrupado[id]) clAgrupado[id] = { nome, total: 0, qtd: 0 };
        clAgrupado[id].total += v.total;
        clAgrupado[id].qtd += 1;
      });

      const topClis = Object.values(clAgrupado)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setPagamentos(listaPagamentos);
      setTopProdutos(sortedProds);
      setEstoqueBaixo(ebData || []);
      setSemVendas(inativos);
      setTopClientes(topClis);

      // 7. Calcular CMV e Totais Fiscais Detalhados
      const { data: vFiscalData } = await supabase
        .from('vendas')
        .select('total_icms, total_pis, total_cofins')
        .eq('loja_id', user.loja_id)
        .gte('created_at', dataInicio)
        .lte('created_at', queryFim.toISOString());

      let impostosTotal = 0;
      vFiscalData?.forEach(v => {
        impostosTotal += (v.total_icms || 0) + (v.total_pis || 0) + (v.total_cofins || 0);
      });

      const cmvTotal = tpData?.reduce((acc, item: any) => acc + ((item.produtos.custo || 0) * item.quantidade), 0) || 0;
      const lucroBruto = totalVendido - cmvTotal;
      const lucroLiquido = lucroBruto - impostosTotal;

      setResumo({
        totalVendido,
        totalVendas,
        ticketMedio: totalVendas > 0 ? totalVendido / totalVendas : 0,
        lucroBruto,
        cmv: cmvTotal,
        impostos: impostosTotal,
        lucroLiquido
      });

    } catch (err: any) {
      console.error('Erro ao buscar relatório:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header className="glass-card p-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px' }}>
            <BarChart3 style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <h3 className="font-bold">Análise de Performance</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Métricas financeiras e de inventário</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <Calendar size={16} className="text-secondary" />
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem' }} />
            <span className="text-secondary">até</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem' }} />
          </div>
          <button onClick={fetchRelatorio} className="btn-primary no-print" style={{ width: 'auto', padding: '0 24px', height: '42px' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <> <Filter size={18} /> Filtrar </>}
          </button>
          
          <div className="h-8 w-px bg-white/10 mx-2 no-print"></div>

          <button onClick={() => window.print()} className="btn-secondary no-print" style={{ height: '42px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            <Printer size={18} /> Imprimir
          </button>
          
          <button onClick={() => window.print()} className="btn-secondary no-print" style={{ height: '42px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
             <Download size={18} /> Baixar PDF
          </button>
        </div>
      </header>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {/* Card: Faturamento */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <p className="text-secondary mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faturamento</p>
          <h2 className="text-blue font-black" style={{ fontSize: '1.75rem' }}>R$ {resumo.totalVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--status-success)', fontSize: '0.75rem' }}>
            <TrendingUp size={14} /> <span>{resumo.totalVendas} vendas no período</span>
          </div>
        </motion.div>

        {/* Card: Lucro Bruto */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6" style={{ borderLeft: '4px solid var(--status-success)' }}>
          <p className="text-secondary mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lucro Bruto</p>
          <h2 className="text-teal font-black" style={{ fontSize: '1.75rem' }}>R$ {resumo.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '12px' }}>Vendas - CMV</p>
        </motion.div>

        {/* Card: Impostos */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6" style={{ borderLeft: '4px solid var(--status-warning)' }}>
          <p className="text-secondary mb-1" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Impostos</p>
          <h2 className="text-warning font-black" style={{ fontSize: '1.75rem' }}>R$ {resumo.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '12px' }}>Total tributário recolhido</p>
        </motion.div>

        {/* Card: Lucro Líquido */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 100%)', border: '1px solid rgba(16,185,129,0.3)', borderLeft: '4px solid var(--status-success)' }}>
          <p className="text-teal font-bold mb-1" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lucro Líquido</p>
          <h2 className="text-teal font-black" style={{ fontSize: '1.75rem' }}>R$ {resumo.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--status-success)', fontSize: '0.75rem' }}>
            <Coins size={14} /> <span>Margem real em caixa</span>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
        <div className="glass-card p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <PieChart size={20} className="text-blue" />
            <h4 className="font-bold">Pagamentos</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pagamentos.map(p => (
              <div key={p.forma} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.8125rem' }}>{p.forma === 'CREDITO_LOJA' ? 'Crédito' : p.forma}</span>
                <span className="font-bold text-blue" style={{ fontSize: '0.8125rem' }}>R$ {p.total.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Trophy size={20} style={{ color: '#facc15' }} />
            <h4 className="font-bold">Mais Vendidos</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProdutos.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span className="text-secondary">{i+1}. {p.nome}</span>
                <span className="font-bold">{p.total} un.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Users size={20} className="text-teal" />
            <h4 className="font-bold">Melhores Clientes</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topClientes.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span className="text-secondary">{i+1}. {c.nome}</span>
                <span className="font-bold text-teal">R$ {c.total.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} className="text-blue" />
          <h4 className="font-bold">Extrato Detalhado de Vendas</h4>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="custom-table" style={{ fontSize: '0.8125rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1d24', zIndex: 5 }}>
              <tr>
                <th>Data/Hora</th>
                <th>Venda ID</th>
                <th>Total Venda</th>
                <th>ICMS / PIS / COFINS</th>
                <th>Forma Pagto</th>
                <th style={{ textAlign: 'right' }}>Valor Pagto</th>
              </tr>
            </thead>
            <tbody>
              {extratoDetalhado.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Nenhuma venda no período.</td></tr>
              ) : extratoDetalhado.map((p, i) => (
                <tr key={i}>
                  <td>{new Date(p.vendas.created_at).toLocaleString('pt-BR')}</td>
                  <td className="text-secondary">#{p.vendas.id.slice(-8)}</td>
                  <td className="font-bold text-blue">R$ {p.vendas.total.toLocaleString('pt-BR')}</td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <div className="text-secondary">I: R$ {(p.vendas.total_icms || 0).toLocaleString('pt-BR')}</div>
                    <div className="text-secondary">P/C: R$ {((p.vendas.total_pis || 0) + (p.vendas.total_cofins || 0)).toLocaleString('pt-BR')}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={12} className="text-secondary" />
                      {p.forma === 'CREDITO_LOJA' ? 'Crédito' : p.forma}
                    </div>
                  </td>
                  <td className="font-black" style={{ textAlign: 'right' }}>R$ {p.valor.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px' }}>
        <div className="glass-card p-6" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <AlertTriangle size={20} className="text-error" />
            <h4 className="font-bold">Estoque Baixo (≤ 3)</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {estoqueBaixo.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', fontSize: '0.75rem' }}>
                <span>{item.produtos.nome} ({item.cor}/{item.tamanho})</span>
                <span className="text-error font-bold">{item.estoque} un.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <PackageX size={20} className="text-secondary" />
            <h4 className="font-bold">Produtos Parados</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {semVendas.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span className="text-secondary">{item.produtos.nome} ({item.cor}/{item.tamanho})</span>
                <span>{item.estoque} un.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Relatorios;
