import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon,
  PieChart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

const Financeiro: React.FC<{ user: any }> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState({
    entradas: 0,
    saidas: 0,
    saldo: 0
  });

  useEffect(() => {
    // Simulação de carregamento por enquanto
    setTimeout(() => {
      setResumo({
        entradas: 15450.00,
        saidas: 4200.50,
        saldo: 11249.50
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col gap-6 fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">Gestão Financeira</h2>
          <p className="text-secondary">Acompanhe o fluxo de caixa da sua loja.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px' }}>
          <Plus size={20} /> Nova Transação
        </button>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
              <ArrowUpRight size={24} />
            </div>
            <span className="text-secondary font-bold text-sm uppercase tracking-wide">Receita Mensal</span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            R$ {resumo.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-green-400 text-sm flex items-center gap-1">
            <TrendingUp size={14} /> +12% vs mês anterior
          </p>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
              <ArrowDownRight size={24} />
            </div>
            <span className="text-secondary font-bold text-sm uppercase tracking-wide">Despesas</span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            R$ {resumo.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-red-400 text-sm flex items-center gap-1">
            <TrendingDown size={14} /> +5% vs mês anterior
          </p>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <DollarSign size={24} />
            </div>
            <span className="text-secondary font-bold text-sm uppercase tracking-wide">Saldo Líquido</span>
          </div>
          <div className="text-3xl font-black text-blue mb-1">
            R$ {resumo.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-blue-300 text-sm">
            Margem de lucro: 72%
          </p>
        </div>
      </div>

      {/* Área Principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Tabela de Transações */}
        <div className="glass-card p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CalendarIcon size={20} className="text-secondary" /> 
              Movimentações Recentes
            </h3>
            <button className="text-sm text-blue hover:underline">Ver tudo</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-secondary">
                  <th className="py-3 font-bold">Descrição</th>
                  <th className="py-3 font-bold">Categoria</th>
                  <th className="py-3 font-bold">Data</th>
                  <th className="py-3 font-bold text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium">Venda #1234 - Cliente João</td>
                  <td className="py-4 text-sm text-secondary"><span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs">Vendas</span></td>
                  <td className="py-4 text-sm text-secondary">Hoje, 14:30</td>
                  <td className="py-4 text-right font-bold text-green-400">+ R$ 250,00</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium">Conta de Energia</td>
                  <td className="py-4 text-sm text-secondary"><span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs">Despesas Fixas</span></td>
                  <td className="py-4 text-sm text-secondary">Ontem, 09:00</td>
                  <td className="py-4 text-right font-bold text-red-400">- R$ 350,00</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium">Fornecedor Nike</td>
                  <td className="py-4 text-sm text-secondary"><span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs">Estoque</span></td>
                  <td className="py-4 text-sm text-secondary">02/02/2026</td>
                  <td className="py-4 text-right font-bold text-red-400">- R$ 1.200,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico Simples */}
        <div className="glass-card p-6 flex flex-col">
           <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
              <PieChart size={20} className="text-secondary" /> 
              Despesas por Categoria
            </h3>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
              {/* Barras de Progresso Simulando Gráfico */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Estoque</span>
                  <span className="font-bold">60%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[60%] rounded-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Despesas Fixas</span>
                  <span className="font-bold">25%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[25%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Marketing</span>
                  <span className="font-bold">10%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[10%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Outros</span>
                  <span className="font-bold">5%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500 w-[5%] rounded-full"></div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
