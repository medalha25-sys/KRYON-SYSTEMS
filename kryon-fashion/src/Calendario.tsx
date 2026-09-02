import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb, 
  CheckCircle2,
  MessageCircle,
  Brain,
  Zap,
  Coins,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarioProps {
  user: any;
}

const CalendarioCriativo: React.FC<CalendarioProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [ideias, setIdeias] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [gerandoIdeia, setGerandoIdeia] = useState(false);
  const [creditosIA, setCreditosIA] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [marketingStats, setMarketingStats] = useState({ visualizadas: 0, copiadas: 0, aplicadas: 0, taxaSucesso: 0 });

  const fetchMarketingStats = async () => {
    if (!user?.loja_id) return;
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

      // 1. Stats de Uso (Mês Atual)
      const { data: usoData } = await supabase
        .from('dicas_uso')
        .select('acao')
        .eq('loja_id', user.loja_id)
        .gte('created_at', firstDay.toISOString());

      // 2. Taxa de Sucesso (Geral)
      const { data: resultadosData } = await supabase
        .from('dicas_resultados')
        .select('resultado')
        .eq('loja_id', user.loja_id);

      const newStats = { visualizadas: 0, copiadas: 0, aplicadas: 0, taxaSucesso: 0 };

      if (usoData) {
        usoData.forEach(curr => {
          if (curr.acao === 'visualizada') newStats.visualizadas++;
          if (curr.acao === 'copiada') newStats.copiadas++;
          if (curr.acao === 'aplicada') newStats.aplicadas++;
        });
      }

      if (resultadosData && resultadosData.length > 0) {
        const aumentouVendas = resultadosData.filter(r => r.resultado === 'aumentou_vendas').length;
        newStats.taxaSucesso = (aumentouVendas / resultadosData.length) * 100;
      }

      setMarketingStats(newStats);

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const trackAction = async (dicaId: string, acao: 'visualizada' | 'copiada' | 'aplicada') => {
    try {
      await supabase.from('dicas_uso').insert({
        loja_id: user.loja_id,
        dica_personalizada_id: dicaId, // Note: using dica_id for simplicity, might need adjustment if using base IDs
        acao
      });
      fetchMarketingStats(); // Refresh stats
    } catch (error) {
      console.error('Erro ao registrar ação:', error);
    }
  };

  const fetchCreditos = async () => {
    if (!user?.loja_id) return;
    try {
      // 1. Buscar plano
      const { data: loja } = await supabase
        .from('lojas')
        .select('*, planos(nome)')
        .eq('id', user.loja_id)
        .single();



      // 2. Verificar/Inicializar tabela de créditos
      let { data: creditosData } = await supabase
        .from('ia_creditos')
        .select('*')
        .eq('loja_id', user.loja_id)
        .single();

      if (!creditosData) {
        // Inicializar se não existir (Valor padrão solicitado: 30)
        const { data: newData } = await supabase
          .from('ia_creditos')
          .insert({
            loja_id: user.loja_id,
            creditos_totais: 30, 
            creditos_usados: 0
          })
          .select()
          .single();
        
        if (newData) creditosData = newData;
      } else {
        // Atualizar limite se o plano mudou (opcional integration)
        // Por enquanto mantemos a lógica do banco, mas poderíamos syncar aqui
      }

      if (creditosData) {
        setCreditosIA(Math.max(0, creditosData.creditos_totais - creditosData.creditos_usados));
      }

    } catch (err) {
      console.error('Erro ao buscar créditos:', err);
    }
  };

  useEffect(() => {
    fetchCalendarData();
    fetchCreditos();
    fetchMarketingStats();
  }, [currentDate, user]);

  const fetchCalendarData = async () => {
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // 1. Buscar datas comemorativas (Novo Sistema)
      const { data: dData } = await supabase
        .from('datas_comemorativas')
        .select('*')
        .gte('data', firstDay.toISOString())
        .lte('data', lastDay.toISOString());

      if (dData) {
        // Mapear para o formato esperado pelo calendário
        const mappedEvents = dData.map(d => ({
          id: d.id,
          data: d.data,
          titulo: d.nome,
          descricao: d.descricao,
          ativo: true
        }));
        
        setEvents(mappedEvents);
        
        // 2. Buscar dicas de marketing (Novo Sistema)
        const eventIds = dData.map(d => d.id);
        if (eventIds.length > 0) {
          const { data: iData } = await supabase
            .from('dicas_marketing')
            .select('*, tipos_dicas_marketing(nome)')
            .in('data_comemorativa_id', eventIds);
          
          if (iData) {
            // 3. Buscar variações de IA (Agora: Personalizadas)
            const dicaIds = iData.map(d => d.id);
            
            // Buscar histórico de execuções ("Já fiz!")
            const { data: eData } = await supabase
              .from('calendario_execucoes') // Assumindo que esta tabela já existia ou foi criada antes
              .select('*')
              .eq('loja_id', user.loja_id);

            // Buscar dicas personalizadas
            const { data: vData } = await supabase
              .from('dicas_marketing_personalizadas')
              .select('*')
              .in('dica_base_id', dicaIds)
              .eq('loja_id', user.loja_id)
              .order('created_at', { ascending: false });

            // Anexar variações e status de execução às dicas
            const ideiasComVariacoes = iData.map(ideia => ({
              ...ideia,
              executada: eData?.some(e => e.dica_id === ideia.id),
              variacoes: vData?.filter(v => v.dica_base_id === ideia.id).map(v => ({
                id: v.id,
                titulo: 'Sugestão Personalizada', // Como não tem título no banco novo, improvisamos
                conteudo: v.conteudo_gerado
              })) || []
            }));
            
            setIdeias(ideiasComVariacoes);
          } else {
            setIdeias([]);
          }
        } else {
          setIdeias([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };



  const gerarVariacaoIA = async (dicaBase: any) => {
    setGerandoIdeia(true);
    try {
      // 1. Verificações de Crédito (Novo Sistema)
      const { data: creditosData } = await supabase
        .from('ia_creditos')
        .select('*')
        .eq('loja_id', user.loja_id)
        .single();

      if (!creditosData || (creditosData.creditos_totais - creditosData.creditos_usados) <= 0) {
        setShowUpgradeModal(true);
        setGerandoIdeia(false);
        return;
      }

      // 2. Buscar Contexto da Loja
      const { data: perfilMarketing } = await supabase
        .from('loja_perfil_marketing')
        .select('*')
        .eq('loja_id', user.loja_id)
        .single();

      // Valores padrão caso o usuário não tenha preenchido
      const contexto = {
        segmento: perfilMarketing?.segmento || 'Roupas e Calçados',
        publico_alvo: perfilMarketing?.publico_alvo || 'Geral',
        estilo_loja: perfilMarketing?.estilo_loja || 'Casual',
        faixa_preco: perfilMarketing?.faixa_preco || 'Médio',
        tipo_conteudo_preferido: perfilMarketing?.tipo_conteudo_preferido || 'Foto'
      };

      // 3. Construir Prompt (Template do Usuário)
      const promptGerado = `Você é um especialista em marketing para lojas físicas e online de roupas e calçados no Brasil.

Use as informações abaixo para adaptar a dica de forma prática, clara e aplicável.

Perfil da loja:
- Segmento: ${contexto.segmento}
- Público-alvo: ${contexto.publico_alvo}
- Estilo da loja: ${contexto.estilo_loja}
- Faixa de preço: ${contexto.faixa_preco}
- Tipo de conteúdo preferido: ${contexto.tipo_conteudo_preferido}

Dica base:
${dicaBase.conteudo}

Tarefa:
Expanda essa dica tornando-a específica para esse tipo de loja.
Inclua:
- Sugestão prática de produto ou kit
- Forma simples de aplicar o desconto (se fizer sentido)
- Ideia de conteúdo para redes sociais
- Sugestão curta de legenda
- 3 hashtags relevantes

Responda em português, de forma direta e sem emojis.`;



      // 4. Registrar Consumo de IA e Histórico
      const { error: updateError } = await supabase
        .from('ia_creditos')
        .update({ creditos_usados: creditosData.creditos_usados + 1 })
        .eq('id', creditosData.id);

      if (updateError) throw updateError;

      await supabase.from('ia_creditos_historico').insert({
        loja_id: user.loja_id,
        dica_base_id: dicaBase.id
      });

      // 5. Simular/Gerar Resposta (Simulação com estrutura nova)
      // TODO: Conectar com Edge Function para usar o prompt real
      const respostaIA = `Sugestão de Produto: Kit "Visual ${contexto.estilo_loja}" com peças que combinam entre si.
Aplicação: Na compra de 2 peças, a terceira tem 20% OFF.
Conteúdo: Video mostrando 3 formas de usar a peça principal do kit.
Legenda: Versatilidade é tudo! ✨ Descubra como multiplicar seus looks com nosso novo kit.
Hashtags: #Moda${contexto.segmento.split(' ')[0]} #${contexto.estilo_loja} #LookDoDia`;

      // 6. Salvar Variação
      const { error } = await supabase.from('dicas_marketing_personalizadas').insert({
        dica_base_id: dicaBase.id,
        loja_id: user.loja_id,
        conteudo_gerado: respostaIA
      });

      if (error) throw error;

      alert('Nova variação gerada com sucesso! ✨');
      fetchCalendarData(); 
      fetchCreditos();

    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setGerandoIdeia(false);
    }
  };



  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasEvent = events.find(e => e.data === dateStr);
    
    days.push(
      <div 
        key={d} 
        className={`calendar-day ${hasEvent ? 'has-event' : ''} ${selectedEvent?.data === dateStr ? 'selected' : ''}`}
        onClick={() => hasEvent && setSelectedEvent(hasEvent)}
      >
        <span>{d}</span>
        {hasEvent && <div className="event-dot"></div>}
      </div>
    );
  }

  return (
    <div className="calendario-container">
      <header className="glass-card p-6 mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(234,179,8,0.1)', borderRadius: '12px' }}>
            <CalendarIcon style={{ color: 'var(--status-warning)' }} />
          </div>
          <div>
            <h3 className="font-bold">Calendário Criativo de Vendas</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Planejamento de campanhas e ações de marketing</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="text-center">
            <span className="block text-xl font-bold text-white">{marketingStats.visualizadas}</span>
            <span className="text-xs text-secondary uppercase">Visualizadas</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-blue-400">{marketingStats.copiadas}</span>
            <span className="text-xs text-secondary uppercase">Copiadas</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-green-400">{marketingStats.aplicadas}</span>
            <span className="text-xs text-secondary uppercase">Aplicadas</span>
          </div>
          <div className="text-center" style={{ paddingLeft: '24px', borderLeft: '1px solid var(--glass-border)' }}>
            <span className="block text-xl font-bold text-yellow-400">
              {marketingStats.taxaSucesso.toFixed(1)}%
            </span>
            <span className="text-xs text-secondary uppercase">Taxa Sucesso</span>
          </div>
        </div>
      </header>

      <div className="calendar-grid-layout">
        {/* Lado Esquerdo: O Calendário */}
        <div className="glass-card p-6">
          <div className="calendar-header mb-6">
            <button onClick={prevMonth} className="nav-item p-2"><ChevronLeft size={20} /></button>
            <h4 className="font-black" style={{ textTransform: 'capitalize', fontSize: '1.25rem' }}>{monthName} {year}</h4>
            <button onClick={nextMonth} className="nav-item p-2"><ChevronRight size={20} /></button>
          </div>

          <div className="calendar-weekdays">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>
          <div className="calendar-days">
            {days}
          </div>

          <div className="mt-8">
            <h5 className="font-bold mb-4 text-secondary" style={{ fontSize: '0.875rem' }}>Eventos do Mês</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.length === 0 ? (
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Nenhum evento este mês.</p>
              ) : (
                events.map(e => (
                  <button 
                    key={e.id} 
                    className={`event-list-item ${selectedEvent?.id === e.id ? 'active' : ''}`}
                    onClick={() => setSelectedEvent(e)}
                  >
                    <span className="event-date-badge">{new Date(e.data).getDate()}</span>
                    <span className="font-bold">{e.titulo}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Detalhes do Evento */}
         <div className="event-details glass-card p-6" style={{ minHeight: '500px' }}>
          {selectedEvent ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedEvent.id}
              >
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                      {selectedEvent.titulo}
                    </h2>
                    <span className="text-sm font-mono text-secondary bg-white/5 px-2 py-1 rounded">
                      {new Date(selectedEvent.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                  </div>
                  <p className="text-secondary">{selectedEvent.descricao}</p>
                </div>

                <div className="mb-6 flex items-center justify-between">
                   <h3 className="font-bold flex items-center gap-2">
                     <Lightbulb size={18} className="text-yellow-400" />
                     Dicas Práticas
                   </h3>
                   {creditosIA !== null && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                        <Coins size={12} /> {creditosIA} créditos
                      </div>
                    )}
                </div>

                <div className="ideias-sections" style={{ display: 'grid', gap: '16px' }}>
                  {ideias.filter(i => i.data_comemorativa_id === selectedEvent.id).length > 0 ? (
                    ideias.filter(i => i.data_comemorativa_id === selectedEvent.id).map(ideia => (
                      <div key={ideia.id} className="ideia-card p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {ideia.tipos_dicas_marketing?.nome || 'Geral'}
                          </span>
                          <button 
                            onClick={() => gerarVariacaoIA(ideia)}
                            disabled={gerandoIdeia}
                            className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Brain size={14} /> Melhorar com IA
                          </button>
                        </div>
                        
                        <h4 className="font-bold text-lg mb-2 text-white">{ideia.titulo}</h4>
                        <p className="text-secondary text-sm leading-relaxed mb-4">
                          {ideia.conteudo}
                        </p>

                        {ideia.variacoes && ideia.variacoes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10 mb-4">
                            <h5 className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-1">
                              <Zap size={12} /> Variações IA
                            </h5>
                            {ideia.variacoes.map((v: any) => (
                              <div key={v.id} className="bg-purple-500/10 p-3 rounded-lg mb-2 last:mb-0 border border-purple-500/20">
                                <h6 className="font-bold text-sm text-purple-200 mb-1">{v.titulo}</h6>
                                <p className="text-xs text-purple-100/80">{v.conteudo}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button 
                            className="flex-1 btn-secondary text-xs py-2"
                            onClick={() => {
                              trackAction(ideia.id, 'aplicada');
                              // Optional: Add logic to mark visually as done
                            }}
                          >
                             <CheckCircle2 size={14} className="mr-1" /> Marcar Feito
                          </button>
                          <button 
                            className="flex-1 btn-primary text-xs py-2"
                            onClick={() => {
                              trackAction(ideia.id, 'copiada');
                              navigator.clipboard.writeText(ideia.conteudo);
                              alert('Conteúdo copiado!');
                            }}
                          >
                             <MessageCircle size={14} className="mr-1" /> Copiar / Whats
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-secondary">
                      <p>Nenhuma dica cadastrada para esta data.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-secondary opacity-50">
              <CalendarIcon size={48} className="mb-4" />
              <p>Selecione uma data para ver o<br/>Planejamento de Marketing</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .calendar-grid-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          min-height: 600px;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: bold;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: 0.2s;
          position: relative;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
        }
        .calendar-day:hover { background: rgba(255,255,255,0.05); }
        .calendar-day.has-event { border-color: rgba(234,179,8,0.3); color: var(--status-warning); font-weight: bold; }
        .calendar-day.selected { background: var(--accent-blue); color: white; border-color: var(--accent-blue); }
        .calendar-day.empty { visibility: hidden; }
        .event-dot {
          width: 4px;
          height: 4px;
          background: var(--status-warning);
          border-radius: 50%;
          position: absolute;
          bottom: 6px;
        }

        .event-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
          color: white;
        }
        .event-list-item:hover { background: rgba(255,255,255,0.05); }
        .event-list-item.active { border-color: var(--accent-blue); background: rgba(59,130,246,0.05); }
        .event-date-badge {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(234,179,8,0.1);
          color: var(--status-warning);
          border-radius: 8px;
          font-weight: 900;
          font-size: 0.8125rem;
        }

        .publico-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          background: rgba(255,255,255,0.05);
        }
        .publico-badge.feminino { color: #f472b6; background: rgba(244,114,182,0.1); }
        .publico-badge.masculino { color: #60a5fa; background: rgba(96,165,250,0.1); }

        .alert-toggle-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          cursor: pointer;
          transition: 0.2s;
        }
        .alert-toggle-btn:hover { background: rgba(255,255,255,0.1); }
        .alert-toggle-btn.active { 
          background: rgba(234,179,8,0.1); 
          border-color: rgba(234,179,8,0.3); 
          color: var(--status-warning); 
        }

        .ideia-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 24px;
        }
        .ideia-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }
        .icon-wrap {
          width: 40px;
          height: 40px;
          background: var(--accent-blue);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .canal-tag {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }
        
        .ideia-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }
        .ideia-content label {
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .ideia-content p { line-height: 1.6; }

        .btn-apply {
          width: 100%;
          padding: 16px;
          background: white;
          color: black;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-apply:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }

        .flex-center { display: flex; align-items: center; justify-content: center; }
        .empty-ideias { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; }

        .btn-ia-generate {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 0.875rem;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 12px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .btn-ia-generate:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
        }
        .btn-ia-generate:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* AI Rich Content Styles */
        .ai-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .ai-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 16px;
          transition: 0.2s;
        }
        .ai-card:hover { background: rgba(255,255,255,0.05); }
        
        .ai-card h5 {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        
        .ai-card.campaign h5 { color: var(--accent-blue); }
        .ai-card.psychological h5 { color: #f59e0b; }
        .ai-card.objective h5 { color: var(--text-primary); }
        .ai-card.action h5 { color: var(--status-success); }
        .ai-card.visual-strategy h5 { color: #f472b6; }
        .ai-card.social h5 { color: #a855f7; }
        .ai-card.script h5 { color: #22c55e; }

        .script-box {
          background: rgba(0,0,0,0.2);
          padding: 12px;
          border-radius: 8px;
          position: relative;
          border: 1px dashed var(--glass-border);
        }
        .script-box p { font-style: italic; color: #e2e8f0; font-size: 0.9rem; }
        .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.65rem;
          color: white;
          cursor: pointer;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.2); }
      `}</style>
      <AnimatePresence>
        {showConfirmModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8"
              style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', color: '#facc15' }}>
                  <Zap size={32} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Gerar Estratégia IA?</h3>
                  <p className="text-secondary">
                    Isso consumirá <span className="text-yellow-400 font-bold">1 Crédito</span> do seu saldo mensal.
                  </p>
                </div>

                <div style={{ display: 'flex', width: '100%', gap: '12px', marginTop: '8px' }}>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancelar
                  </button>
                  <button 
                  onClick={() => {
                      setShowConfirmModal(false);
                      alert("Esta funcionalidade está sendo migrada. Use o botão 'Melhorar com IA' nos cartões de dica abaixo.");
                    }}
                    className="btn-primary" 
                    style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', border: 'none' }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {showUpgradeModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8"
              style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: '#ef4444' }}>
                  <Lock size={32} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Saldo Insuficiente</h3>
                  <p className="text-secondary">
                    Você utilizou todos os seus créditos de IA. Faça um upgrade para continuar gerando estratégias.
                  </p>
                </div>

                <div style={{ display: 'flex', width: '100%', gap: '12px', marginTop: '8px' }}>
                  <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className="btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={() => {
                      // Aqui você redirecionaria para a página de upgrade
                      setShowUpgradeModal(false);
                      // navigate('/upgrade'); // Exemplo
                      alert('Redirecionando para planos...');
                    }}
                    className="btn-primary" 
                    style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none' }}
                  >
                    Melhorar Plano
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarioCriativo;
