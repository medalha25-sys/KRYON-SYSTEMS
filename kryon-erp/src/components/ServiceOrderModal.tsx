'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ServiceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order?: any;
}

const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({ isOpen, onClose, order }) => {
    const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
    const [shop, setShop] = useState<any>(null);
    const [formData, setFormData] = useState({
        clientName: '',
        clientCpf: '',
        clientPhone: '',
        deviceType: 'Smartphone',
        deviceBrand: '',
        deviceModel: '',
        deviceImei: '',
        deviceColor: '',
        devicePassword: '',
        issueDescription: '',
        accessories: '',
        entryDate: new Date().toISOString().split('T')[0],
        technician: '',
        status: 'analysis',
        estimatedCost: '',
    });
    const supabase = createClient();

    useEffect(() => {
        async function loadShopData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('shop_id')
                .eq('id', user.id)
                .single();

            if (profile?.shop_id) {
                const { data } = await supabase
                    .from('shops')
                    .select('*')
                    .eq('id', profile.shop_id)
                    .single();
                if (data) setShop(data);
            }
        }
        loadShopData();

        if (order) {
            setFormData({
                clientName: order.client_name || '',
                clientCpf: order.client_cpf || '',
                clientPhone: order.client_phone || '',
                deviceType: order.device_type || 'Smartphone',
                deviceBrand: order.device_brand || '',
                deviceModel: order.device_model || '',
                deviceImei: order.device_imei || '',
                deviceColor: order.device_color || '',
                devicePassword: order.device_password || '',
                issueDescription: order.issue_description || '',
                accessories: order.accessories || '',
                entryDate: order.entry_date || new Date().toISOString().split('T')[0],
                technician: order.technician || '',
                status: order.status || 'analysis',
                estimatedCost: order.estimated_cost?.toString() || '',
            });
        }
    }, [order]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [isSaving, setIsSaving] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { data: profile } = await supabase
                .from('profiles')
                .select('shop_id')
                .eq('id', user.id)
                .single();

            if (!profile?.shop_id) throw new Error('Shop ID not found');

            const payload = {
                shop_id: profile.shop_id,
                client_name: formData.clientName,
                client_cpf: formData.clientCpf,
                client_phone: formData.clientPhone,
                device_type: formData.deviceType,
                device_brand: formData.deviceBrand,
                device_model: formData.deviceModel,
                device_imei: formData.deviceImei,
                device_password: formData.devicePassword,
                issue_description: formData.issueDescription,
                accessories: formData.accessories,
                entry_date: formData.entryDate,
                technician: formData.technician,
                status: formData.status,
                estimated_cost: parseFloat(formData.estimatedCost.replace(',', '.')) || 0
            };

            if (order?.id) {
                // Update existing
                const { error } = await supabase
                    .from('service_orders')
                    .update(payload)
                    .eq('id', order.id);
                if (error) throw error;
            } else {
                // Insert new
                const { error } = await supabase
                    .from('service_orders')
                    .insert([payload]);
                if (error) throw error;
            }
            
            setActiveTab('preview');
        } catch (error) {
            console.error('Error saving OS:', error);
            alert('Erro ao salvar Ordem de Serviço. Verifique os dados e tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
            <div className={`bg-white dark:bg-[#1e2730] w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] print:shadow-none print:max-w-none print:max-h-none print:h-auto print:rounded-none border border-gray-100 dark:border-gray-800 ${activeTab === 'preview' ? 'print:block' : ''}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 print:hidden">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined font-black">construction</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[#111418] dark:text-white tracking-tighter">Portal de Ordens de Serviço</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Geração e Gestão de OS Técnica</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-50 dark:border-gray-800 print:hidden bg-white dark:bg-gray-900/20">
                    <button
                        className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'form' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('form')}
                    >
                        Formulário de Entrada
                    </button>
                    <button
                        className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => {
                            if (formData.clientName && formData.deviceModel) {
                                setActiveTab('preview');
                            } else {
                                alert('Preencha pelo menos o nome do cliente e o modelo do dispositivo para visualizar.');
                            }
                        }}
                    >
                        Pré-visualização de Impressão
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 no-scrollbar print:overflow-visible print:p-0">

                    {activeTab === 'form' && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                                        <span className="w-8 h-px bg-primary/30"></span> Identificação do Cliente
                                    </h3>
                                    {order?.id && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status da OS:</label>
                                            <select 
                                                name="status" 
                                                value={formData.status} 
                                                onChange={handleChange}
                                                className="bg-primary/5 text-primary text-[10px] font-black uppercase px-2 py-1 rounded-lg border-none outline-none"
                                            >
                                                <option value="analysis">Em Análise</option>
                                                <option value="waiting_parts">Aguard. Peças</option>
                                                <option value="in_progress">Em Conserto</option>
                                                <option value="finished">Finalizado</option>
                                                <option value="delivered">Entregue</option>
                                                <option value="cancelled">Cancelado</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
                                        <input name="clientName" value={formData.clientName} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="Pessoa Física ou Razão Social" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">CPF / CNPJ</label>
                                        <input name="clientCpf" value={formData.clientCpf} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="Somente números" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contato Principal (WhatsApp)</label>
                                        <input name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="(00) 0 0000-0000" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-8 h-px bg-primary/30"></span> Especificações do Dispositivo
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo</label>
                                        <select name="deviceType" value={formData.deviceType} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner appearance-none">
                                            <option>Smartphone</option>
                                            <option>Tablet</option>
                                            <option>Notebook</option>
                                            <option>Smartwatch</option>
                                            <option>Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fabricante</label>
                                        <input name="deviceBrand" value={formData.deviceBrand} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="Apple, Samsung..." />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modelo</label>
                                        <input name="deviceModel" value={formData.deviceModel} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="Ex: iPhone 14 Pro" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">IMEI / Serial</label>
                                        <input name="deviceImei" value={formData.deviceImei} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="ID único" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Senha / PIN</label>
                                        <input name="devicePassword" value={formData.devicePassword} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="Senha" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Acessórios</label>
                                        <input name="accessories" value={formData.accessories} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-inner" placeholder="Capa, carregador..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Padrão Gráfico (Manual)</label>
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                          <div className="grid grid-cols-3 gap-2">
                                            {[...Array(9)].map((_, i) => (
                                              <div key={i} className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-700"></div>
                                            ))}
                                          </div>
                                          <p className="text-[10px] font-bold text-gray-400 leading-tight">Será impresso para desenho manual.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-8 h-px bg-primary/30"></span> Diagnóstico & Termos
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Relato do Cliente (Defeito)</label>
                                        <textarea name="issueDescription" value={formData.issueDescription} onChange={handleChange} className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-medium shadow-inner resize-none" placeholder="O que o cliente relatou que está acontecendo?" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Técnico Responsável</label>
                                        <input name="technician" value={formData.technician} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white font-bold" placeholder="Nome do técnico" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data Estimada (Entrega)</label>
                                        <input type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white font-bold" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Orçamento Prévio (R$)</label>
                                        <input name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white font-black text-xl" placeholder="0,00" />
                                      </div>
                                    </div>
                                </div>
                            </section>
                        </form>
                    )}

                    {activeTab === 'preview' && (
                        <div className="bg-white text-black p-12 w-full max-w-[210mm] mx-auto shadow-2xl print:shadow-none print:max-w-none print:mx-0 print:p-8 border-t-8 border-primary rounded-b-3xl print:rounded-none">
                            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-100 pb-8">
                                <div className="space-y-4">
                                    {shop?.logo_url ? (
                                        <img src={shop.logo_url} alt="Logo" className="h-16 object-contain" />
                                    ) : (
                                        <div className="h-12 w-48 bg-primary/20 flex items-center justify-center font-black text-primary tracking-tighter text-xl italic uppercase">KRYON ERP | {shop?.name || 'LOJA'}</div>
                                    )}
                                    <div className="space-y-1">
                                      <h1 className="text-xl font-black uppercase tracking-tight leading-none text-gray-900">{shop?.name || 'DEMO SHOP LTDA'}</h1>
                                      {shop?.cnpj && <p className="text-[10px] font-bold text-gray-500">CNPJ: {shop.cnpj}</p>}
                                      <p className="text-[10px] font-bold text-primary">{shop?.address || 'Endereço não configurado'}</p>
                                      <p className="text-[10px] font-bold text-gray-400">Suporte/WhatsApp: {shop?.whatsapp || shop?.phone || '---'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-primary/5 px-4 py-2 rounded-xl inline-block">
                                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ordem de Serviço</span>
                                      <h2 className="text-4xl font-black text-primary p-0 m-0">#{order?.id?.slice(0, 5).toUpperCase() || 'NOVA'}</h2>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-10">
                                <div className="space-y-4">
                                    <h3 className="font-black text-[10px] uppercase text-gray-400 border-b-2 border-gray-50 pb-2 flex items-center gap-2">
                                      CLIENTE
                                    </h3>
                                    <div className="space-y-1">
                                      <p className="text-sm font-black text-gray-800">{formData.clientName || 'CLIENTE NÃO INFORMADO'}</p>
                                      <p className="text-xs font-bold text-gray-500">Documento: {formData.clientCpf || '---'}</p>
                                      <p className="text-xs font-bold text-gray-500">Fone: {formData.clientPhone || '---'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-black text-[10px] uppercase text-gray-400 border-b-2 border-gray-50 pb-2 flex items-center gap-2">
                                      DISPOSITIVO
                                    </h3>
                                    <div className="space-y-1">
                                      <p className="text-sm font-black text-gray-800">{formData.deviceBrand} {formData.deviceModel}</p>
                                      <p className="text-xs font-bold text-gray-500">IMEI/Serial: {formData.deviceImei || 'N/A'}</p>
                                      <p className="text-xs font-bold text-primary">Senha: {formData.devicePassword || 'S/ SENHA'}</p>
                                      {formData.accessories && <p className="text-[10px] font-bold text-gray-400">Acc: {formData.accessories}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                <h3 className="font-black text-[10px] uppercase text-gray-400 mb-4">Relatório de Sintomas / Diagnóstico</h3>
                                <p className="text-sm font-medium leading-relaxed italic text-gray-600">
                                    {formData.issueDescription || 'Nenhuma descrição técnica adicionada.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div>
                                    <h3 className="font-black text-[10px] uppercase text-gray-400 mb-2">Termos de Aceite</h3>
                                    <p className="text-[9px] text-gray-400 text-justify leading-tight">
                                        Ao assinar esta OS, o cliente autoriza a abertura do dispositivo e concorda com os termos de garantia de 90 dias sobre o serviço realizado. O estabelecimento não se responsabiliza por perda de dados ou danos preexistentes ocultos. Itens não retirados em 90 dias serão destinados a descarte/venda para custeio.
                                    </p>
                                    {formData.technician && (
                                        <p className="text-[10px] font-black text-gray-500 mt-4 uppercase">Técnico: {formData.technician}</p>
                                    )}
                                </div>
                                <div className="flex flex-col justify-end items-end gap-2">
                                  <span className="text-[10px] font-black text-gray-400">Valor Estimado</span>
                                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.estimatedCost.replace(',', '.')) || 0)}
                                  </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-20 pt-10 border-t-2 border-gray-50 mt-10">
                                <div className="text-center">
                                    <div className="h-px bg-gray-300 w-full mb-2"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assinatura do Cliente</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-px bg-gray-300 w-full mb-2"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Responsável Técnico</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-4 print:hidden">
                    {activeTab === 'preview' ? (
                        <>
                            <button onClick={() => setActiveTab('form')} className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-[#617589] hover:bg-gray-200 dark:hover:bg-gray-800 transition-all">
                                Editar Dados
                            </button>
                            <button onClick={handlePrint} className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-3">
                                <span className="material-symbols-outlined font-black">print</span>
                                Gerar Documento PDF
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-[#617589] hover:bg-gray-200 dark:hover:bg-gray-800 transition-all">
                                Descartar
                            </button>
                            <button 
                                onClick={() => handleSubmit()} 
                                disabled={isSaving}
                                className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-3 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined font-black">{isSaving ? 'sync' : 'file_save'}</span>
                                {isSaving ? 'Salvando...' : (order?.id ? 'Atualizar & Visualizar' : 'Finalizar & Visualizar')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderModal;
