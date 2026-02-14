'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCashRegister } from './CashRegisterContext';
import { Product, CartItem, Payment } from '@/types/erp';
import CheckoutModal from './CheckoutModal';
import CloseRegisterModal from './CloseRegisterModal';
import { getTenantScope } from '@/utils/tenant';

const SalesTerminal: React.FC = () => {
    const { closeRegister } = useCashRegister();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [shopId, setShopId] = useState<string | null>(null);

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            setUserProfile(profile);
            setShopId(profile?.shop_id);
          }
        };
        init();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                if (cart.length > 0) setShowCheckoutModal(true);
            }
            if (e.key === 'F4') {
                e.preventDefault();
                setShowCloseRegisterModal(true);
            }
            // Auto focus on search input if typing outside of it
            if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                if (e.key.length === 1 || e.key === 'Backspace') {
                    searchInputRef.current?.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.length]);

    const handleSearch = async () => {
        if (!searchTerm || !shopId) return;

        const { data, error } = await supabase
            .from('fashion_products')
            .select('*')
            .eq('shop_id', shopId)
            .or(`name.ilike.%${searchTerm}%,sku.eq.${searchTerm}`);

        if (error) {
            console.error(error);
            return;
        }

        if (data && data.length === 1) {
            addToCart(data[0]);
        } else if (data && data.length > 1) {
            setProducts(data);
        } else {
            setProducts([]);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            if (searchTerm.length < 2 || !shopId) return;

            const { data } = await supabase
                .from('fashion_products')
                .select('*')
                .eq('shop_id', shopId)
                .or(`name.ilike.%${searchTerm}%,sku.eq.${searchTerm}`)
                .limit(5);

            if (data) setProducts(data);
        };
        const timeout = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm, shopId]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setSearchTerm('');
        setProducts([]);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleFinishSale = async (paymentMethods: Payment[], discountValue: number) => {
        try {
            if (!shopId) throw new Error('No shop ID found');
            const finalTotal = Math.max(0, subtotal - discountValue);

            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert({
                    total: finalTotal,
                    discount: discountValue,
                    payment_methods: paymentMethods,
                    status: 'completed',
                    shop_id: shopId
                })
                .select()
                .single();

            if (saleError) throw saleError;

            const saleItems = cart.map(item => ({
                sale_id: saleData.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
                shop_id: shopId
            }));

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems);

            if (itemsError) throw itemsError;

            setCart([]);
            setShowCheckoutModal(false);
        } catch (error) {
            console.error('Error finishing sale:', error);
            throw error;
        }
    };

    return (
        <div className="flex h-full min-h-0 gap-6 p-6 animate-in fade-in duration-500">
            {showCheckoutModal && (
                <CheckoutModal
                    subtotal={subtotal}
                    onClose={() => setShowCheckoutModal(false)}
                    onFinalize={handleFinishSale}
                />
            )}

            <CloseRegisterModal
                isOpen={showCloseRegisterModal}
                onClose={() => setShowCloseRegisterModal(false)}
            />

            {/* Left Col: Product Search and Cart */}
            <div className="flex-[2] flex flex-col gap-6 min-h-0">
                {/* Search Box */}
                <div className="bg-white dark:bg-[#1e2730] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative group transition-all hover:shadow-md">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Buscar Produto</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                          <input
                              autoFocus
                              ref={searchInputRef}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                      handleSearch();
                                  }
                              }}
                              className="w-full h-14 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-900 pl-12 pr-4 text-lg font-medium focus:border-primary focus:bg-white dark:focus:bg-gray-800 outline-none dark:text-white transition-all shadow-inner"
                              placeholder="Digite o nome ou escaneie o código..."
                          />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-primary hover:bg-primary-dark text-white px-8 rounded-xl font-black transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {products.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#1e2730] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="w-full text-left p-5 hover:bg-primary/5 dark:hover:bg-primary/10 border-b border-gray-50 dark:border-gray-800 last:border-none flex justify-between items-center group/item transition-colors"
                                >
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800 dark:text-gray-200 group-hover/item:text-primary transition-colors">{product.name}</span>
                                      <span className="text-[10px] text-gray-400 font-mono tracking-tighter">
                                          {product.sku ? `SKU: ${product.sku}` : `ID: ${product.id.slice(0,8)}`}
                                      </span>
                                    </div>
                                    <span className="font-black text-lg text-primary">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 bg-white dark:bg-[#1e2730] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between font-black text-[10px] uppercase tracking-widest text-gray-400">
                        <span className="flex-1">Descrição do Item</span>
                        <span className="w-24 text-center">Qtd</span>
                        <span className="w-24 text-right">Unitário</span>
                        <span className="w-24 text-right">Total</span>
                        <span className="w-12"></span>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-40 gap-3">
                                <span className="material-symbols-outlined text-7xl">shopping_cart</span>
                                <p className="font-bold uppercase tracking-widest text-xs">Aguardando produtos...</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center p-4 border-b border-gray-50 dark:border-gray-800 last:border-none hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all group/cart-item mb-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1 flex flex-col">
                                      <span className="font-bold text-gray-800 dark:text-gray-200 transition-colors group-hover/cart-item:text-primary">{item.name}</span>
                                      <span className="text-[10px] text-gray-400 font-mono italic">Item Original</span>
                                    </div>
                                    <span className="w-24 text-center text-gray-500 font-black">{item.quantity}un</span>
                                    <span className="w-24 text-right text-gray-500 font-medium">R$ {item.price.toFixed(2)}</span>
                                    <span className="w-24 text-right font-black text-gray-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="w-12 flex justify-center text-gray-300 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-gray-500">
                      <span className="text-[10px] font-black tracking-widest uppercase">Total de Itens: {cart.reduce((acc, i) => acc + i.quantity, 0)}</span>
                      <button onClick={() => setCart([])} className="text-[10px] font-black tracking-widest uppercase text-red-400 hover:text-red-500 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">remove_shopping_cart</span> Limpar Carrinho
                      </button>
                    </div>
                </div>
            </div>

            {/* Right Col: Checkout & Totals */}
            <div className="w-[380px] bg-white dark:bg-[#1e2730] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col shrink-0 overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/20">
                    <h2 className="text-xl font-black dark:text-white tracking-tight">Checkout</h2>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operador</p>
                        <p className="font-bold text-sm text-primary">{userProfile?.name?.split(' ')[0] || 'Atendente'}</p>
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-center items-center gap-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Geral</p>
                    <div className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                        <span className="text-2xl font-black text-gray-400 align-top mt-1 inline-block mr-1">R$</span>
                        {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="h-1 w-12 bg-primary rounded-full mt-4 opacity-50 shadow-sm shadow-primary/50"></div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-3">
                    <button
                        onClick={() => setShowCheckoutModal(true)}
                        disabled={cart.length === 0}
                        className="w-full py-5 rounded-2xl font-black text-white text-xl bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined">payments</span>
                        Finalizar Venda (F2)
                    </button>
                    <button onClick={() => setShowCloseRegisterModal(true)} className="w-full py-3 rounded-xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-xs flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">close_fullscreen</span> Fechar Caixa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesTerminal;
