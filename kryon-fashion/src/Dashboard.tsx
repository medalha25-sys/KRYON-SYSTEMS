import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Box,
  Users,
  CreditCard,
  RefreshCcw,
  FileText,
  Loader2,
  Building2,
  Receipt,
  Ticket,
  Calendar as CalendarIcon,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PDV from './PDV';
import Produtos from './Produtos';
import Clientes from './Clientes';
import Fornecedores from './Fornecedores';
import Trocas from './Trocas';
import Relatorios from './Relatorios';
import Configuracoes from './Configuracoes';
import Financeiro from './Financeiro';
import Etiquetas from './Etiquetas';
import CalendarioCriativo from './Calendario';
import { usePermissions } from './hooks/usePermissions';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, collapsed, onClick }) => (
  <button 
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
    title={collapsed ? label : ''}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
    {active && !collapsed && <ChevronRight className="ml-auto" style={{ width: '16px', height: '16px' }} />}
  </button>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; loading: boolean }> = ({ icon, label, value, color, loading }) => (
  <div className="glass-card p-6">
    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', width: 'fit-content', marginBottom: '16px', color: color }}>
      {icon}
    </div>
    <p className="text-secondary">{label}</p>
    {loading ? (
      <Loader2 className="animate-spin" style={{ margin: 'auto', color: color, width: '24px', height: '24px' }} />
    ) : (
      <h3 className="font-black" style={{ fontSize: '1.5rem' }}>{value}</h3>
    )}
  </div>
);

const Dashboard: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [vendasHoje, setVendasHoje] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loja, setLoja] = useState<any>(null);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const { hasPermission } = usePermissions(user);

  const fetchDashboardStats = async () => {
    if (!user?.loja_id) return;
    setLoadingStats(true);
    try {
      const { data: lData } = await supabase
        .from('lojas')
        .select('*')
        .eq('id', user.loja_id)
        .single();
      setLoja(lData);

      // Vendas Hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: vData } = await supabase
        .from('vendas')
        .select('total')
        .eq('loja_id', user.loja_id)
        .gte('created_at', today.toISOString());
      
      const totalVendas = vData?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 0;
      setVendasHoje(totalVendas);

      // Total Produtos & Low Stock
      const { data: produtosData } = await supabase
        .from('produtos')
        .select(`
          id,
          produto_variacoes (
             estoque
          )
        `)
        .eq('loja_id', user.loja_id);
      
      if (produtosData) {
        setTotalProdutos(produtosData.length);
        
        let lowStock = 0;
        produtosData.forEach((p: any) => {
           const total = p.produto_variacoes?.reduce((acc: number, v: any) => acc + (v.estoque || 0), 0) || 0;
           if (total <= 5) lowStock++;
        });
        setLowStockCount(lowStock);
      } else {
        setTotalProdutos(0);
      }

      // Total Clientes
      const { count: cCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('loja_id', user.loja_id);
      
      setTotalClientes(cCount || 0);

      // Status do Caixa
      const { data: caData } = await supabase
        .from('caixas')
        .select('id')
        .eq('loja_id', user.loja_id)
        .eq('aberto', true)
        .limit(1);
      
      setCaixaAberto((caData?.length || 0) > 0);
      fetchNotificacoes();
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { data } = await supabase
        .from('calendario_datas')
        .select('*')
        .gte('data', today.toISOString().split('T')[0])
        .lte('data', nextWeek.toISOString().split('T')[0])
        .eq('ativo', true)
        .order('data', { ascending: true });
      
      setUpcomingEvents(data || []);
    } catch (err) {
      console.error('Erro ao buscar próximos eventos:', err);
    }
  };

  const fetchNotificacoes = async () => {
    try {
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('loja_id', user.loja_id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setNotificacoes(data);
        setUnreadCount(data.filter(n => !n.lida).length);
      }

      // Iniciar "sweep" de alertas do calendário
      checkCalendarAlerts();
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  const checkCalendarAlerts = async () => {
    try {
      const { data: events } = await supabase
        .from('calendario_datas')
        .select('*, log:calendario_alertas_log(*)')
        .eq('alertas_ativos', true)
        .eq('ativo', true);

      if (!events) return;

      const now = new Date();
      
      for (const event of events) {
        const eventDate = new Date(event.data);
        const diffMs = eventDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        const checkIntervals = [72, 48, 24];
        
        for (const hours of checkIntervals) {
          // Se estiver dentro da janela de alerta (ex: entre 72 e 71 horas antes)
          // e ainda não foi enviado log para este intervalo
          if (diffHours <= hours && diffHours > (hours - 1)) {
            const jaEnviado = event.log?.find((l: any) => l.horas_antes === hours);
            
            if (!jaEnviado) {
              // Gerar notificação
              await supabase.from('notificacoes').insert({
                loja_id: user.loja_id,
                titulo: `Alerta: ${event.titulo}`,
                mensagem: `O evento "${event.titulo}" acontecerá em menos de ${hours} horas! Prepare suas campanhas.`,
                tipo: 'ALERTA_CALENDARIO',
                link: 'calendario'
              });

              // Registrar log para não repetir
              await supabase.from('calendario_alertas_log').insert({
                data_id: event.id,
                horas_antes: hours
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao verificar alertas do calendário:', err);
    }
  };

  const marcarLida = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    setNotificacoes(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Timer para o relógio
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user.loja_id]);

  const formatDateTime = (date: Date) => {
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${dayName}, ${day}/${month}/${year} | ${hours}:${minutes}`;
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'vendas':
        return <PDV user={user} />;
      case 'produtos':
        return <Produtos user={user} />;
      case 'clientes':
        return <Clientes user={user} />;
      case 'trocas':
        return <Trocas user={user} />;
      case 'relatorios':
        return <Relatorios user={user} />;
      case 'etiquetas':
        return <Etiquetas user={user} />;
      case 'calendario':
        return <CalendarioCriativo user={user} />;
      case 'cupom':
        return (
          <div className="glass-card p-12 text-center">
            <Receipt size={64} className="text-secondary mb-4 mx-auto" style={{ opacity: 0.1 }} />
            <h3 className="font-bold">Módulo de Cupom Fiscal</h3>
            <p className="text-secondary">Integração com impressora térmica e emissão de comprovantes.</p>
          </div>
        );
      case 'configuracoes':
        return <Configuracoes user={user} />;
      case 'fornecedores':
        return <Fornecedores user={user} />;
      default:
        return activeTab === 'dashboard' ? (
          <>
            {/* Grid de Stats */}
            <div className="stats-grid mb-12">
              <StatCard icon={<TrendingUp size={24} />} label="Vendas Hoje" value={`R$ ${vendasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="var(--accent-blue)" loading={loadingStats} />
              <StatCard icon={<Box size={24} />} label="Produtos" value={totalProdutos.toString()} color="var(--status-warning)" loading={loadingStats} />
              <StatCard icon={<Users size={24} />} label="Clientes" value={totalClientes.toString()} color="var(--status-success)" loading={loadingStats} />
              <StatCard icon={<CreditCard size={24} />} label="Status Caixa" value={caixaAberto ? 'ABERTO' : 'FECHADO'} color={caixaAberto ? 'var(--status-success)' : 'var(--status-error)'} loading={loadingStats} />
            </div>

            {lowStockCount > 0 && (
              <div className="glass-card p-4 mb-6 border border-yellow-500/30 bg-yellow-500/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                     <Box size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-lg text-white">Alerta de Estoque Baixo</h4>
                     <p className="text-secondary text-sm">Você tem <span className="text-yellow-400 font-bold">{lowStockCount} produtos</span> com menos de 5 unidades.</p>
                   </div>
                </div>
                <button 
                  onClick={() => setActiveTab('produtos')}
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 rounded-lg text-sm font-bold transition-colors"
                >
                  Ver Produtos
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
              <div className="glass-card p-8" style={{ minHeight: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 className="font-bold">Desempenho Semanal</h3>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Últimos 7 dias</div>
                </div>
                {/* Espaço para gráfico futuro */}
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                  <p className="text-secondary">Gráfico de vendas em desenvolvimento...</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <CalendarIcon size={20} className="text-blue" />
                  <h4 className="font-bold">Próximas Datas</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Nenhuma data para os próximos 7 dias.</p>
                  ) : (
                    upcomingEvents.map(e => (
                      <div key={e.id} className="event-mini-card" onClick={() => setActiveTab('calendario')} style={{ cursor: 'pointer' }}>
                        <div className="date-box">
                          <span className="day">{new Date(e.data).getDate() + 1}</span>
                          <span className="month">{new Date(e.data).toLocaleString('pt-BR', { month: 'short' })}</span>
                        </div>
                        <div className="info">
                          <div className="title font-bold">{e.titulo}</div>
                          <div className="publico" style={{ fontSize: '0.75rem', opacity: 0.6 }}>Público: {e.publico}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <button 
                    onClick={() => setActiveTab('calendario')}
                    className="btn-secondary w-full mt-4" 
                    style={{ fontSize: '0.8125rem', padding: '12px' }}
                  >
                    Ver Calendário Completo
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null; // Fallback for any unhandled activeTab that is not 'dashboard'
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ padding: sidebarCollapsed ? '24px 8px' : '24px', flexDirection: 'column', gap: '20px', alignItems: sidebarCollapsed ? 'center' : 'flex-start' }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {loja?.logo_url ? <img src={loja.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={24} color="white" />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h2 className="font-black" style={{ fontSize: '1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'white' }}>{loja?.nome || 'Minha Loja'}</h2>
                <p className="text-secondary" style={{ fontSize: '0.65rem' }}>Sistema PDV</p>
              </div>
            </div>
          ) : (
            <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <Building2 size={18} color="var(--accent-blue)" />
            </div>
          )}

          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="nav-item"
            style={{ 
              width: '32px', 
              height: '32px', 
              padding: 0, 
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              alignSelf: sidebarCollapsed ? 'center' : 'flex-end',
              marginTop: '12px'
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('dashboard')} 
          />
          {hasPermission('FORNECEDORES_GERENCIAR') && (
            <SidebarItem 
              icon={<Building2 size={20} />} 
              label="Fornecedores" 
              active={activeTab === 'fornecedores'} 
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab('fornecedores')} 
            />
          )}
          {hasPermission('ESTOQUE_GERENCIAR') && (
            <SidebarItem 
              icon={<Package size={20} />} 
              label="Produtos" 
              active={activeTab === 'produtos'} 
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab('produtos')} 
            />
          )}
          {hasPermission('PDV_ACESSAR') && (
            <SidebarItem 
              icon={<ShoppingCart size={20} />} 
              label="Vendas (PDV)" 
              active={activeTab === 'vendas'} 
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab('vendas')} 
            />
          )}
          {hasPermission('CLIENTES_GERENCIAR') && (
            <SidebarItem 
              icon={<Users size={20} />} 
              label="Clientes" 
              active={activeTab === 'clientes'} 
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab('clientes')} 
            />
          )}
          {hasPermission('PDV_VENDER') && (
            <SidebarItem 
              icon={<RefreshCcw size={20} />} 
              label="Trocas" 
              active={activeTab === 'trocas'} 
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab('trocas')} 
            />
          )}
          {hasPermission('RELATORIOS_VER') && (
            <SidebarItem 
              icon={<FileText size={20} />} 
              label="Relatórios" 
              active={activeTab === 'relatorios'} 
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab('relatorios')} 
            />
          )}
          <SidebarItem 
            icon={<Ticket size={20} />} 
            label="Etiquetas" 
            active={activeTab === 'etiquetas'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('etiquetas')} 
          />
          <SidebarItem 
            icon={<CalendarIcon size={20} />} 
            label="Calendário" 
            active={activeTab === 'calendario'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('calendario')} 
          />
          <SidebarItem 
            icon={<Receipt size={20} />} 
            label="Cupom Fiscal" 
            active={activeTab === 'cupom'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('cupom')} 
          />
        </nav>

        <div className="sidebar-footer" style={{ marginBottom: '32px' }}>
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Configurações" 
            active={activeTab === 'configuracoes'}
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('configuracoes')} 
          />
          <SidebarItem 
            icon={<LogOut size={20} />} 
            label="Sair" 
            collapsed={sidebarCollapsed}
            onClick={onLogout} 
          />
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="logo-badge">K</div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1px' }}>KRYON SYSTEMS</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sistema de Gestão Profissional</p>
            </div>
          </div>

          {/* Alertas e Perfil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotificacoes(!showNotificacoes)}
                className="nav-item p-2" 
                style={{ position: 'relative', background: 'transparent', border: 'none', color: unreadCount > 0 ? 'var(--status-warning)' : 'var(--text-secondary)' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: 'var(--status-error)', borderRadius: '50%', border: '2px solid #0f1117' }}></span>
                )}
              </button>

              <AnimatePresence>
                {showNotificacoes && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: '12px', width: '320px', background: '#1a1d24', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 1000, overflow: 'hidden' }}
                  >
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 className="font-bold">Notificações</h5>
                      {unreadCount > 0 && <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{unreadCount} novas</span>}
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {notificacoes.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          <Bell size={32} style={{ opacity: 0.1, marginBottom: '12px' }} />
                          <p style={{ fontSize: '0.875rem' }}>Nenhuma notificação por enquanto.</p>
                        </div>
                      ) : (
                        notificacoes.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { marcarLida(n.id); if(n.link) setActiveTab(n.link); setShowNotificacoes(false); }}
                            style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: n.lida ? 'transparent' : 'rgba(234,179,8,0.03)' }}
                            className="hover-bg"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span className="font-bold" style={{ fontSize: '0.875rem', color: n.lida ? 'var(--text-secondary)' : 'white' }}>{n.titulo}</span>
                              {!n.lida && <div style={{ width: '6px', height: '6px', background: 'var(--status-warning)', borderRadius: '50%' }}></div>}
                            </div>
                            <p className="text-secondary" style={{ fontSize: '0.8125rem', lineHeight: '1.4' }}>{n.mensagem}</p>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '8px', display: 'block' }}>
                              {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatDateTime(dateTime)}</span>
            </div>
            
            <div className="user-profile">
              <div className="user-info">
                <p className="user-name">{user.nome}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.perfis?.nome || 'Usuário'}</p>
              </div>
              <div className="user-avatar">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
