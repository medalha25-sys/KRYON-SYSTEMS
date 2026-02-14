'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ConfiguracoesPage() {
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        logo_url: '',
        address: '',
        phone: '',
        email_contato: '',
        whatsapp: '',
        social_instagram: '',
        pix_key: '',
        require_card_info: false
    });
    
    const supabase = createClient();

    useEffect(() => {
        async function loadShopData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('shop_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.shop_id) {
                    const { data: shopData } = await supabase
                        .from('shops')
                        .select('*')
                        .eq('id', profile.shop_id)
                        .single();

                    if (shopData) {
                        setShop(shopData);
                        setFormData({
                            name: shopData.name || '',
                            cnpj: shopData.cnpj || '',
                            logo_url: shopData.logo_url || '',
                            address: shopData.address || '',
                            phone: shopData.phone || '',
                            email_contato: shopData.email_contato || '',
                            whatsapp: shopData.whatsapp || '',
                            social_instagram: shopData.social_instagram || '',
                            pix_key: shopData.pix_key || '',
                            require_card_info: shopData.require_card_info || false
                        });
                    }
                }
            } catch (error: any) {
                console.error('Error loading shop:', error);
                // Better error feedback
                if (error.code === '42501') {
                    alert('Erro de permissão ao carregar dados da loja. Verifique o seu nível de acesso.');
                }
            } finally {
                setLoading(false);
            }
        }
        loadShopData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shop?.id) {
            alert('Erro: Dados da loja não carregados corretamente. Tente atualizar a página.');
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('shops')
                .update(formData)
                .eq('id', shop.id);

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            const msg = error.message || 'Verifique sua conexão e tente novamente.';
            alert(`Erro ao salvar configurações: ${msg}. Certifique-se de que o seu perfil tem permissão de administrador.`);
        } finally {
            setIsSaving(false);
        }
    };

    const [isFinanceiroLocked, setIsFinanceiroLocked] = useState(true);
    const [finPass, setFinPass] = useState('');
    const [isSavingPix, setIsSavingPix] = useState(false);

    const handleSavePix = async () => {
        if (!shop?.id) return;
        setIsSavingPix(true);
        try {
            const { error } = await supabase
                .from('shops')
                .update({ pix_key: formData.pix_key })
                .eq('id', shop.id);

            if (error) throw error;
            setIsFinanceiroLocked(true);
            setFinPass('');
            alert('Chave PIX salva com sucesso!');
        } catch (error) {
            console.error('Error saving PIX:', error);
            alert('Erro ao salvar chave PIX.');
        } finally {
            setIsSavingPix(false);
        }
    };

    const handleDeletePix = async () => {
        if (!confirm('Deseja realmente remover a chave PIX?')) return;
        setIsSavingPix(true);
        try {
            const { error } = await supabase
                .from('shops')
                .update({ pix_key: null })
                .eq('id', shop.id);

            if (error) throw error;
            setFormData(prev => ({ ...prev, pix_key: '' }));
            setIsFinanceiroLocked(true);
            setFinPass('');
            alert('Chave PIX removida!');
        } catch (error) {
            console.error('Error deleting PIX:', error);
        } finally {
            setIsSavingPix(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:px-12 max-w-[1280px] mx-auto flex flex-col gap-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#111418] dark:text-white tracking-tight">Configurações da Unidade</h2>
                    <p className="text-[#617589] dark:text-gray-400 mt-1">Gerencie a identidade visual e dados de contato da sua loja.</p>
                </div>
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Identity */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1e2730] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                             <span className="material-symbols-outlined notranslate text-sm">palette</span> Identidade Visual
                        </h3>
                        
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-32 h-32 rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden relative group">
                                {formData.logo_url ? (
                                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="material-symbols-outlined notranslate text-4xl text-gray-300">add_photo_alternate</span>
                                )}
                            </div>
                            
                            <div className="w-full">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-1">URL do Logotipo</label>
                                <input 
                                    name="logo_url" 
                                    value={formData.logo_url} 
                                    onChange={handleChange}
                                    placeholder="https://exemplo.com/logo.png"
                                    className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                />
                                <p className="text-[9px] text-gray-400 mt-2 px-1">Recomendado: JSON ou PNG transparente (512x512px)</p>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-6 border border-primary/20 shadow-sm flex flex-col gap-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                             <span className="material-symbols-outlined notranslate text-sm">support_agent</span> Central de Suporte
                        </h3>
                        <p className="text-xs text-[#617589] dark:text-gray-400 font-medium">
                            Precisa de ajuda com o sistema ou deseja sugerir uma melhoria?
                        </p>
                        <a 
                            href="https://wa.me/5538984257511" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined notranslate text-sm">chat</span>
                            Falar no WhatsApp
                        </a>
                        <div className="flex flex-col gap-2 mt-2">
                            <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline text-left">Manual do Usuário</button>
                            <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline text-left">Termos de Uso</button>
                        </div>
                    </div>

                    {/* Financeiro / PIX Card */}
                    <div className="bg-white dark:bg-[#1e2730] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-6">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                             <span className="material-symbols-outlined notranslate text-sm">account_balance_wallet</span> Ajustes Financeiros
                        </h3>

                        {isFinanceiroLocked ? (
                            <div className="flex flex-col gap-4 py-4">
                                <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-center mb-2">
                                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Área Protegida</p>
                                </div>
                                <input 
                                    type="password"
                                    value={finPass}
                                    onChange={(e) => setFinPass(e.target.value)}
                                    placeholder="Senha Admin"
                                    className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner text-center"
                                />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (finPass === 'admin123') setIsFinanceiroLocked(false);
                                        else alert('Senha incorreta!');
                                    }}
                                    className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    Desbloquear
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="p-5 bg-white/5 dark:bg-black/20 rounded-2xl border border-primary/30 backdrop-blur-sm">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Sua Chave PIX</label>
                                    <div className="flex gap-3">
                                        <input 
                                            name="pix_key"
                                            value={formData.pix_key}
                                            onChange={handleChange}
                                            placeholder="E-mail, CPF, Celular..."
                                            className="flex-1 h-14 px-5 bg-black/10 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary rounded-xl outline-none text-white transition-all text-lg font-black"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={handleSavePix}
                                                disabled={isSavingPix}
                                                className="w-14 h-14 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                                                title="Salvar Chave"
                                            >
                                                {isSavingPix ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined font-black">check</span>}
                                            </button>
                                            
                                            {formData.pix_key && (
                                                <button 
                                                    type="button"
                                                    onClick={handleDeletePix}
                                                    className="w-14 h-14 flex items-center justify-center bg-red-500/10 text-red-500 border-2 border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                    title="Remover Chave"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-3 italic">* Esta chave será usada automaticamente no faturamento e PDV.</p>
                                </div>
                                
                                <div className="p-5 bg-white/5 dark:bg-black/20 rounded-2xl border border-primary/30 backdrop-blur-sm">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Vendas em Cartão</label>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold dark:text-white">Exigir dados da transação</p>
                                            <p className="text-[9px] text-gray-400 italic">Solicita número da venda e data no checkout.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, require_card_info: !prev.require_card_info }))}
                                            className={`w-12 h-6 rounded-full transition-all relative ${formData.require_card_info ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.require_card_info ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleSave}
                                        className="mt-4 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Salvar Ajuste
                                    </button>
                                </div>
                                
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsFinanceiroLocked(true);
                                        setFinPass('');
                                    }}
                                    className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors w-fit mx-auto py-2"
                                >
                                    Bloquear Acesso
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Data */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1e2730] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-8">
                        
                        <section>
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined notranslate text-sm">business</span> Dados Jurídicos & Contato
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Nome da Empresa / Fantasia</label>
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">CNPJ</label>
                                    <input 
                                        name="cnpj" 
                                        value={formData.cnpj} 
                                        onChange={handleChange}
                                        placeholder="00.000.000/0001-00"
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Telefone Principal</label>
                                    <input 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange}
                                        placeholder="(00) 0000-0000"
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Endereço Completo</label>
                                    <input 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleChange}
                                        placeholder="Rua, Número, Bairro, Cidade - UF"
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

                        <section>
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined notranslate text-sm">share</span> Presença Digital
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">WhatsApp de Vendas</label>
                                    <input 
                                        name="whatsapp" 
                                        value={formData.whatsapp} 
                                        onChange={handleChange}
                                        placeholder="5538900000000"
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Instagram (@usuario)</label>
                                    <input 
                                        name="social_instagram" 
                                        value={formData.social_instagram} 
                                        onChange={handleChange}
                                        placeholder="@sualoja"
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">E-mail Público</label>
                                    <input 
                                        name="email_contato" 
                                        value={formData.email_contato} 
                                        onChange={handleChange}
                                        placeholder="contato@sualoja.com"
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" 
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-3"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined notranslate">save</span>
                                )}
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
