'use client';

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createClient } from '@/utils/supabase/client';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose }) => {
    const [showScanner, setShowScanner] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [notes, setNotes] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (showScanner && isOpen) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render((decodedText) => {
                setBarcode(decodedText);
                setShowScanner(false);
                scanner.clear();
            }, (error) => {
                // Ignore errors
            });

            return () => {
                scanner.clear().catch(() => {});
            };
        }
    }, [showScanner, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const finalCategory = category === 'new' ? customCategory : category;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: profile } = await supabase
                .from('profiles')
                .select('shop_id')
                .eq('id', user.id)
                .single();

            const cleanPrice = parseFloat(price.replace(',', '.')) || 0;
            const cleanQuantity = parseInt(quantity) || 0;

            const { error } = await supabase.from('products').insert([
                {
                    name,
                    category: finalCategory,
                    price: Number(cleanPrice.toFixed(2)),
                    quantity: cleanQuantity,
                    barcode,
                    brand,
                    color,
                    notes,
                    shop_id: profile?.shop_id
                }
            ]);

            if (error) throw error;

            onClose();
            // Reset form
            setName('');
            setCategory('');
            setCustomCategory('');
            setPrice('');
            setQuantity('');
            setBarcode('');
            setBrand('');
            setColor('');
            setNotes('');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Erro ao salvar produto. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e2730] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-black text-[#111418] dark:text-white tracking-tight">Novo Produto</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto no-scrollbar">
                    {showScanner ? (
                        <div className="mb-6 space-y-4">
                            <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"></div>
                            <button
                                onClick={() => setShowScanner(false)}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-black text-sm transition-all"
                            >
                                Cancelar Leitura
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Código de Barras</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">barcode</span>
                                      <input
                                          type="text"
                                          value={barcode}
                                          onChange={(e) => setBarcode(e.target.value)}
                                          className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-medium"
                                          placeholder="Escaneie ou digite..."
                                      />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowScanner(true)}
                                        className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all active:scale-95"
                                        title="Ler código de barras"
                                    >
                                        <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold"
                                    placeholder="Ex: Capa iPhone 13 Pro Max"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Marca</label>
                                    <input
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm"
                                        placeholder="Apple, Samsung..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cor</label>
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm"
                                        placeholder="Preto, Prata..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-[#fff] transition-all text-sm font-medium appearance-none"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Acessórios">Acessórios</option>
                                        <option value="Peças">Peças</option>
                                        <option value="Dispositivos">Dispositivos</option>
                                        <option value="Serviços">Serviços</option>
                                        <option value="new">+ Nova Categoria</option>
                                    </select>
                                    {category === 'new' && (
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            className="mt-2 w-full h-10 px-4 bg-primary/5 border-2 border-primary/20 rounded-xl outline-none dark:text-white text-sm animate-in fade-in slide-in-from-top-1 duration-300"
                                            placeholder="Nome da categoria"
                                            required
                                            autoFocus
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estoque Inicial</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preço de Venda (R$)</label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                  <input
                                      type="text"
                                      value={price}
                                      onChange={(e) => setPrice(e.target.value.replace(/[^0-9,.]/g, ''))}
                                      className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-lg font-black"
                                      placeholder="0,00"
                                  />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Observação</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm resize-none"
                                    placeholder="Detalhes sobre garantia, lote..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] h-12 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Salvar Produto'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
