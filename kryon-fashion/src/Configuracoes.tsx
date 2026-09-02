import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Settings, 
  Store, 
  UserPlus, 
  Users, 
  Save, 
  Image as ImageIcon,
  Loader2,
  Trash2,
  Shield,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './contexts/ThemeContext';

interface ConfiguracoesProps {
  user: any;
}

const Configuracoes: React.FC<ConfiguracoesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'loja' | 'usuarios' | 'marketing'>('loja');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { theme, setTheme } = useTheme();
  
  // Estados Loja
  const [lojaData, setLojaData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    endereco: '',
    logo_url: ''
  });

  const [marketingContext, setMarketingContext] = useState({
    segmento: '',
    publico_alvo: '',
    estilo_loja: '',
    faixa_preco: '',
    tipo_conteudo_preferido: ''
  });

  // Estados Usuários
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [mostrarNovoUsuario, setMostrarNovoUsuario] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    email: '',
    password: '',
    nome: '',
    perfil_id: ''
  });

  useEffect(() => {
    fetchLoja();
    fetchUsuarios();
    fetchPerfis();
    fetchMarketingContext();
  }, [user.loja_id]);

  const fetchLoja = async () => {
    try {
      const { data } = await supabase
        .from('lojas')
        .select('*')
        .eq('id', user.loja_id)
        .single();
      if (data) setLojaData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*, perfis(nome)')
        .eq('loja_id', user.loja_id);
      if (data) setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPerfis = async () => {
    try {
      const { data } = await supabase.from('perfis').select('*');
      if (data) setPerfis(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMarketingContext = async () => {
    try {
      const { data } = await supabase
        .from('loja_perfil_marketing')
        .select('*')
        .eq('loja_id', user.loja_id)
        .single();
      if (data) {
        setMarketingContext({
          segmento: data.segmento || '',
          publico_alvo: data.publico_alvo || '',
          estilo_loja: data.estilo_loja || '',
          faixa_preco: data.faixa_preco || '',
          tipo_conteudo_preferido: data.tipo_conteudo_preferido || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveMarketingContext = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('loja_perfil_marketing')
        .upsert({
          loja_id: user.loja_id,
          ...marketingContext
        }, { onConflict: 'loja_id' }); // Important: ensure onConflict works if you have a unique constraint or PK
      
      if (error) throw error;
      alert('Perfil de marketing atualizado!');
    } catch (err: any) {
      // Se der erro que não existe, tentamos insert
      if (err.code === 'PGRST116') {
         // handle insert if upsert fails logic isn't perfect
      }
      console.error(err);
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('lojas')
        .update(lojaData)
        .eq('id', user.loja_id);
      if (error) throw error;
      alert('Configurações da loja salvas!');
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.loja_id}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLojaData({ ...lojaData, logo_url: publicUrl });
      
      // Salvar imediatamente no banco para refletir no Dashboard
      await supabase
        .from('lojas')
        .update({ logo_url: publicUrl })
        .eq('id', user.loja_id);

      alert('Logo atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Criar no Auth do Supabase (Atenção: Requer service_role ou Edge Function para total controle)
      // Para este MVP, simularemos a criação ou usaremos o cadastro público se habilitado
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: novoUsuario.email,
        password: novoUsuario.password,
        options: {
          data: {
            nome: novoUsuario.nome
          }
        }
      });

      if (authError) throw authError;

      // 2. Vincular à loja e perfil na tabela usuarios
      if (authData.user) {
        const { error: dbError } = await supabase.from('usuarios').insert({
          id: authData.user.id,
          loja_id: user.loja_id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          perfil_id: novoUsuario.perfil_id,
          ativo: true
        });

        if (dbError) throw dbError;
      }

      alert('Usuário criado com sucesso!');
      setMostrarNovoUsuario(false);
      fetchUsuarios();
    } catch (err: any) {
      alert('Erro ao criar usuário: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header className="glass-card p-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px' }}>
            <Settings style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <h3 className="font-bold">Configurações do Sistema</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Gerencie sua unidade e equipe</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('loja')}
            className={`btn-tab ${activeTab === 'loja' ? 'active' : ''}`}
            style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'loja' ? 'var(--accent-blue)' : 'transparent', color: 'white', transition: '0.3s', cursor: 'pointer' }}
          >
            Dados da Loja
          </button>
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`btn-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
            style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'usuarios' ? 'var(--accent-blue)' : 'transparent', color: 'white', transition: '0.3s', cursor: 'pointer' }}
          >
            Usuários & Acesso
          </button>
          <button 
            onClick={() => setActiveTab('marketing')}
            className={`btn-tab ${activeTab === 'marketing' ? 'active' : ''}`}
            style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'marketing' ? 'var(--accent-blue)' : 'transparent', color: 'white', transition: '0.3s', cursor: 'pointer' }}
          >
            Perfil de Marketing
          </button>
        </div>
      </header>

      <div className="main-config-content">
        <AnimatePresence mode="wait">
          {activeTab === 'loja' ? (
            <motion.div 
              key="loja"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-8"
              style={{ maxWidth: '800px' }}
            >
              <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Monitor size={18} className="text-secondary" />
                  Aparência do Sistema
                </h4>
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                  <button
                    onClick={() => setTheme('light')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '10px', border: 'none',
                      background: theme === 'light' ? 'white' : 'transparent',
                      color: theme === 'light' ? 'black' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: '0.2s', fontWeight: 600
                    }}
                  >
                    <Sun size={18} /> Claro
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '10px', border: 'none',
                      background: theme === 'dark' ? '#1e293b' : 'transparent',
                      color: theme === 'dark' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: '0.2s', fontWeight: 600
                    }}
                  >
                    <Moon size={18} /> Escuro
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '10px', border: 'none',
                      background: theme === 'system' ? 'var(--accent-blue)' : 'transparent',
                      color: theme === 'system' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: '0.2s', fontWeight: 600
                    }}
                  >
                    <Monitor size={18} /> Sistema
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                <label 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '24px', 
                    border: '2px dashed var(--glass-border)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {uploading ? (
                    <Loader2 className="animate-spin text-blue" />
                  ) : lojaData.logo_url ? (
                    <img src={lojaData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-secondary" />
                      <span style={{ fontSize: '0.7rem' }} className="text-secondary">Alterar Logo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleUploadLogo} 
                    disabled={uploading}
                  />
                </label>
                <div style={{ flex: 1 }}>
                  <h4 className="font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={18} /> Identidade do Estabelecimento</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label className="label-form">Nome da Loja</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={lojaData.nome} 
                        onChange={e => setLojaData({...lojaData, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="label-form">CNPJ</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={lojaData.cnpj} 
                        onChange={e => setLojaData({...lojaData, cnpj: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label className="label-form">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={lojaData.telefone} 
                    onChange={e => setLojaData({...lojaData, telefone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label-form">Endereço Completo</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={lojaData.endereco} 
                    onChange={e => setLojaData({...lojaData, endereco: e.target.value})}
                  />
                </div>
              </div>

                <button 
                  onClick={handleSaveConfig} 
                  disabled={saving}
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  {saving ? <Loader2 className="animate-spin" /> : (
                    <>
                      <Save size={20} /> Salvar Alterações
                    </>
                  )}
                </button>
            </motion.div>
          ) : activeTab === 'marketing' ? (
            <motion.div 
              key="marketing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-8"
              style={{ maxWidth: '800px' }}
            >
              <h4 className="font-bold mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🚀 Perfil Estratégico da Loja</h4>
              <p className="text-secondary mb-8" style={{ fontSize: '0.9rem' }}>Essas informações ajudam nossa IA a sugerir campanhas mais assertivas para o seu negócio.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label className="label-form">Segmento Principal</label>
                  <select 
                    className="input-field" 
                    value={marketingContext.segmento} 
                    onChange={e => setMarketingContext({...marketingContext, segmento: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Roupas">Roupas</option>
                    <option value="Calçados">Calçados</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="label-form">Público-alvo</label>
                  <select 
                    className="input-field" 
                    value={marketingContext.publico_alvo} 
                    onChange={e => setMarketingContext({...marketingContext, publico_alvo: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Misto">Misto</option>
                  </select>
                </div>
                <div>
                  <label className="label-form">Estilo da Loja</label>
                  <select 
                    className="input-field" 
                    value={marketingContext.estilo_loja} 
                    onChange={e => setMarketingContext({...marketingContext, estilo_loja: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Popular">Popular</option>
                    <option value="Premium">Premium</option>
                    <option value="Street">Street</option>
                    <option value="Esportivo">Esportivo</option>
                  </select>
                </div>
                 <div>
                  <label className="label-form">Faixa de Preço</label>
                  <select 
                    className="input-field" 
                    value={marketingContext.faixa_preco} 
                    onChange={e => setMarketingContext({...marketingContext, faixa_preco: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
                 <div>
                  <label className="label-form">Conteúdo Preferido</label>
                  <select 
                    className="input-field" 
                    value={marketingContext.tipo_conteudo_preferido} 
                    onChange={e => setMarketingContext({...marketingContext, tipo_conteudo_preferido: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Foto">Foto</option>
                    <option value="Vídeo">Vídeo</option>
                    <option value="Reels">Reels</option>
                    <option value="Stories">Stories</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={saveMarketingContext} 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0 32px' }}
                disabled={saving}
              >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Atualizar Perfil</>}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="usuarios"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Equipe ({usuarios.length})</h4>
                <button onClick={() => setMostrarNovoUsuario(true)} className="btn-primary" style={{ width: 'auto', padding: '0 20px', fontSize: '0.875rem' }}>
                  <UserPlus size={18} /> Novo Usuário
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Perfil</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td className="font-bold">{u.nome} {u.id === user.id && <span style={{ fontSize: '0.6rem', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>VOCÊ</span>}</td>
                        <td className="text-secondary">{u.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={14} className="text-blue" />
                            {u.perfis?.nome || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', background: u.ativo ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: u.ativo ? 'var(--status-success)' : 'var(--status-error)' }}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button style={{ color: 'var(--status-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Novo Usuário */}
      <AnimatePresence>
        {mostrarNovoUsuario && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8"
              style={{ width: '100%', maxWidth: '450px' }}
            >
              <h3 className="font-bold mb-6">Cadastrar Colaborador</h3>
              <form onSubmit={handleCriarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label-form">Nome Completo</label>
                  <input type="text" required className="input-field" value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} />
                </div>
                <div>
                  <label className="label-form">E-mail de Acesso</label>
                  <input type="email" required className="input-field" value={novoUsuario.email} onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} />
                </div>
                <div>
                  <label className="label-form">Senha Provisória</label>
                  <input type="password" required className="input-field" value={novoUsuario.password} onChange={e => setNovoUsuario({...novoUsuario, password: e.target.value})} />
                </div>
                <div>
                  <label className="label-form">Cargo / Perfil</label>
                  <select 
                    className="input-field" 
                    required 
                    value={novoUsuario.perfil_id} 
                    onChange={e => setNovoUsuario({...novoUsuario, perfil_id: e.target.value})}
                    style={{ appearance: 'none' }}
                  >
                    <option value="">Selecione...</option>
                    {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setMostrarNovoUsuario(false)} className="nav-item" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2 }}>
                    {saving ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .label-form {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .btn-tab:hover {
          background: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default Configuracoes;
