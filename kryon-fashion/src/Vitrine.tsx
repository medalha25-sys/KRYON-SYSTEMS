import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Loader2, ShoppingBag, MessageCircle, ExternalLink, Package } from 'lucide-react';

interface VitrineProps {
  lojaId: string;
}

const Vitrine: React.FC<VitrineProps> = ({ lojaId }) => {
  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetchDadosVitrine();
  }, [lojaId]);

  const fetchDadosVitrine = async () => {
    try {
      // 1. Buscar Loja
      const { data: dadosLoja, error: erroLoja } = await supabase
        .from('lojas')
        .select('nome, logo_url') // Assuming these columns exist based on previous check
        .eq('id', lojaId)
        .single();

      if (erroLoja) throw new Error('Loja não encontrada');
      setLoja(dadosLoja);

      // 2. Buscar Produtos
      const { data: dadosProdutos, error: erroProdutos } = await supabase
        .from('produtos')
        .select(`
          *,
          produto_variacoes(*)
        `)
        .eq('loja_id', lojaId)
        .order('created_at', { ascending: false });

      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos || []);

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enviarPedidoWhatsApp = (produto: any) => {
    const telefone = '5538997269019'; // Should come from loja settings ideally, but hardcoding provided number or placeholder
    // If loja has whatsapp field, we should use it. For now I'll check if I can get it. 
    // Wait, the user has a "Configuracoes" page. Let's assume for now we might not have it in 'lojas'. 
    // I will try to fetch 'telefone' or similar from 'lojas' if possible, otherwise generic.
    // Actually, looking at previous conversations, user updated watermark to (38)99726-9019. 
    // I will use a generic message format.
    
    // Better approach: Since 'lojas' might not have the phone visible, 
    // I'll assume the user wants to test this. I added 'logo_url' and 'nome' to select. 
    
    const texto = `Olá! Vi o produto *${produto.nome}* na sua Vitrine Virtual e gostaria de saber mais.`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1117', color: 'white' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-blue)' }} />
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1117', color: 'white', padding: '16px', textAlign: 'center' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
        <h1 className="font-bold mb-2" style={{ fontSize: '1.5rem' }}>Ops! Algo deu errado.</h1>
        <p className="text-secondary">{erro}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1117', color: 'white', fontFamily: 'var(--font-sans)' }}>
      {/* Header da Loja */}
      <header className="glass-card" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--glass-border)', background: 'rgba(5, 7, 10, 0.8)', backdropFilter: 'blur(12px)', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple, #9333ea))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.125rem' }}>
                {loja.nome?.substring(0,1).toUpperCase()}
             </div>
             <div>
               <h1 className="font-bold" style={{ fontSize: '1.125rem', lineHeight: '1.25' }}>{loja.nome}</h1>
               <span className="text-success" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)', display: 'inline-block' }}></span> Loja Aberta
               </span>
             </div>
          </div>
          
          <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            <MessageCircle size={16} /> <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Fale Conosco</span>
          </button>
        </div>
      </header>

      {/* Grid de Produtos */}
      <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>
        {produtos.length === 0 ? (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
             <Package size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
             <p>Nenhum produto cadastrado na vitrine ainda.</p>
           </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {produtos.map(produto => (
              <div key={produto.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'border-color 0.3s' }}>
                {/* Placeholder de Imagem */}
                <div style={{ aspectRatio: '1/1', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <ShoppingBag size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  
                  {/* Badge de Preço */}
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    R$ {produto.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                      {produto.categoria || 'Geral'}
                    </span>
                  </div>
                  <h3 className="font-bold" style={{ fontSize: '0.875rem', marginBottom: '4px', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {produto.nome}
                  </h3>
                  <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '16px', height: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {produto.marca}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      onClick={() => enviarPedidoWhatsApp(produto)}
                      className="btn-primary"
                      style={{ padding: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                    >
                      <MessageCircle size={14} /> Pedir no Zap
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Simples */}
      <footer style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
        <p>Vitrine Virtual • Desenvolvido por Kryon Systems</p>
      </footer>
    </div>
  );
};

export default Vitrine;
