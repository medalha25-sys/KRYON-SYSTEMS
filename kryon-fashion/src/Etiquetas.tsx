import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Barcode, 
  Printer, 
  Search, 
  Loader2, 
  Plus, 
  Trash2,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EtiquetasProps {
  user: any;
}

const Etiquetas: React.FC<EtiquetasProps> = ({ user }) => {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [selecionados, setSelecionados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);

  const handleBusca = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setBusca(query);

    if (query.length < 2) {
      setResultados([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from('produto_variacoes')
        .select(`
          id,
          tamanho,
          cor,
          sku,
          produtos (nome, preco)
        `)
        .ilike('sku', `%${query}%`)
        .eq('loja_id', user.loja_id)
        .limit(10);
      
      setResultados(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarEtiqueta = (variacao: any) => {
    const existente = selecionados.find(s => s.id === variacao.id);
    if (existente) {
      setSelecionados(selecionados.map(s => 
        s.id === variacao.id ? { ...s, quantidade: s.quantidade + 1 } : s
      ));
    } else {
      setSelecionados([...selecionados, { ...variacao, quantidade: 1 }]);
    }
    setBusca('');
    setResultados([]);
  };

  const removerEtiqueta = (id: string) => {
    setSelecionados(selecionados.filter(s => s.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="etiquetas-container no-print">
      <header className="glass-card p-6 mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px' }}>
            <Barcode style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <h3 className="font-bold">Gerador de Etiquetas</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Impressão de códigos de barras para produtos</p>
          </div>
        </div>

        <button 
          onClick={handlePrint} 
          className="btn-primary" 
          disabled={selecionados.length === 0}
          style={{ width: 'auto', padding: '0 24px' }}
        >
          <Printer size={18} /> Imprimir Etiquetas
        </button>
      </header>

      <div className="pdv-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card p-4" style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Busque por SKU ou Código de Barras..." 
                style={{ paddingLeft: '48px' }}
                value={busca}
                onChange={handleBusca}
              />
              {loading && <Loader2 className="animate-spin" size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-blue)' }} />}
            </div>

            <AnimatePresence>
              {resultados.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card mt-2"
                  style={{ position: 'absolute', left: 0, right: 0, zIndex: 10, background: '#1a1d24', maxHeight: '300px', overflowY: 'auto' }}
                >
                  {resultados.map(r => (
                    <button 
                      key={r.id} 
                      onClick={() => adicionarEtiqueta(r)}
                      className="hover-bg"
                      style={{ width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none', background: 'transparent', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div className="font-bold">{r.produtos.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.tamanho} {r.cor} • SKU: {r.sku}</div>
                      </div>
                      <Plus size={16} className="text-blue" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th style={{ textAlign: 'center' }}>Quantidade</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selecionados.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhuma etiqueta selecionada</td></tr>
                ) : (
                  selecionados.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="font-bold">{s.produtos.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.tamanho} {s.cor}</div>
                      </td>
                      <td className="text-blue font-mono">{s.sku}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="number" 
                          className="input-field" 
                          style={{ width: '80px', textAlign: 'center', display: 'inline-block' }} 
                          value={s.quantidade}
                          onChange={e => setSelecionados(selecionados.map(x => x.id === s.id ? { ...x, quantidade: parseInt(e.target.value) || 1 } : x))}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => removerEtiqueta(s.id)} style={{ color: 'var(--status-error)', background: 'transparent', border: 'none' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pdv-sidebar">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Configuração de Impressão</h3>
            <div className="mb-4">
              <label className="text-secondary font-bold mb-2" style={{ display: 'block', fontSize: '0.75rem' }}>Layout</label>
              <select className="input-field">
                <option>A4 - 3 Colunas (Pimaco 6180)</option>
                <option>Térmica 40mm x 25mm</option>
                <option>Térmica 80mm</option>
              </select>
            </div>
            <div className="p-4 bg-blue-light" style={{ borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--accent-blue)' }}>
                Total de etiquetas: <b>{selecionados.reduce((a, b) => a + b.quantidade, 0)}</b>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camada de Impressão (Só aparece no print) */}
      <div className="print-area">
        {selecionados.flatMap(s => Array(s.quantidade).fill(s)).map((item, idx) => (
          <div key={idx} className="label-item">
            <div className="label-store">LOJA DE ROUPAS</div>
            <div className="label-name">{item.produtos.nome}</div>
            <div className="label-info">{item.tamanho} - {item.cor}</div>
            <div className="label-sku">{item.sku}</div>
            <div className="label-barcode">|||| || || || |||</div>
            <div className="label-price">R$ {item.produtos.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
            padding: 10mm;
          }
          .label-item {
            border: 1px solid #ccc;
            padding: 5mm;
            text-align: center;
            font-family: sans-serif;
            page-break-inside: avoid;
          }
          .label-store { font-size: 8pt; font-weight: bold; margin-bottom: 2pt; color: #666; }
          .label-name { font-size: 10pt; font-weight: bold; margin-bottom: 2pt; }
          .label-info { font-size: 8pt; color: #444; }
          .label-sku { font-size: 9pt; font-family: monospace; margin: 4pt 0; }
          .label-barcode { font-size: 12pt; letter-spacing: 1pt; }
          .label-price { font-size: 12pt; font-weight: bold; margin-top: 5pt; }
          .no-print { display: none !important; }
        }
        .bg-blue-light { background: rgba(59,130,246,0.05); }
      `}</style>
    </div>
  );
};

export default Etiquetas;
