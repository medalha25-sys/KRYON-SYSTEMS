'use client';

import React, { useState, useEffect } from 'react';
import { Payment } from '@/types/erp';
import { createClient } from '@/utils/supabase/client';
import { QRCodeCanvas } from 'qrcode.react';
import { generatePixPayload } from '@/utils/pix';

interface CheckoutModalProps {
    subtotal: number;
    onClose: () => void;
    onFinalize: (payments: Payment[], discount: number) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ subtotal, onClose, onFinalize }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState<'money' | 'credit' | 'debit' | 'pix' | 'on_account'>('money');
    const [currentPaymentAmount, setCurrentPaymentAmount] = useState(subtotal.toString());
    const [discount, setDiscount] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountPassword, setDiscountPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [discountValue, setDiscountValue] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [shopName, setShopName] = useState('Kryon Store');
    const [showPixQR, setShowPixQR] = useState(false);
    const [pixPayload, setPixPayload] = useState('');
    const [isPixLoading, setIsPixLoading] = useState(false);
    const [isPixConfirmed, setIsPixConfirmed] = useState(false);
    const [shouldAutoFinalize, setShouldAutoFinalize] = useState(false);
    const [requireCardInfo, setRequireCardInfo] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, shop_id')
              .eq('id', user.id)
              .single();
            if (profile?.role === 'admin') {
              setIsAdmin(true);
            }
                if (profile?.shop_id) {
                    const { data: shop } = await supabase
                        .from('shops')
                        .select('name, pix_key, require_card_info')
                        .eq('id', profile.shop_id)
                        .single();
                    if (shop) {
                        setPixKey(shop.pix_key || '');
                        if (shop.name) setShopName(shop.name);
                        setRequireCardInfo(shop.require_card_info || false);
                    }
                }
          }
        };
        fetchData();
    }, []);

    const total = Math.max(0, subtotal - discount);
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);
    const change = Math.max(0, totalPaid - total);

    const handleAddPayment = (autoFinalize = false) => {
        const amount = parseFloat(currentPaymentAmount.replace(',', '.'));
        if (!amount || amount <= 0) return;

        if (currentPaymentMethod === 'pix') {
            if (!pixKey) {
                alert('Chave PIX não configurada! Por favor, cadastre uma chave PIX nas configurações da loja.');
                return;
            }
            const payload = generatePixPayload(pixKey, amount, shopName);
            setPixPayload(payload);
            setShowPixQR(true);
            setIsPixConfirmed(false);
            setShouldAutoFinalize(autoFinalize);
            
            // Simulação de reconhecimento automático (4s para detectar, 2s exibindo sucesso)
            const checkPayment = setTimeout(() => {
                // If user closed the modal, stop here
                setShowPixQR(current => {
                    if (!current) {
                        clearTimeout(checkPayment);
                        return false;
                    }
                    setIsPixConfirmed(true);
                    
                    setTimeout(async () => {
                        setShowPixQR(stillOpen => {
                            if (!stillOpen) return false;
                            
                            const newPayment = {
                                id: Math.random().toString(36).substr(2, 9),
                                method: 'pix' as const,
                                amount
                            };
                            const updatedPayments = [...payments, newPayment];
                            setPayments(updatedPayments);
                            
                            if (autoFinalize) {
                                setIsFinishing(true);
                                onFinalize(updatedPayments, discount).catch(error => {
                                    console.error(error);
                                    alert('Erro ao finalizar venda após PIX');
                                    setIsFinishing(false);
                                });
                            } else {
                                const newTotalPaid = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
                                const newRemaining = Math.max(0, total - newTotalPaid);
                                setCurrentPaymentAmount(newRemaining > 0 ? newRemaining.toFixed(2) : '');
                            }
                            return false; // Close modal
                        });
                    }, 2000);
                    
                    return true;
                });
            }, 4000);
            return;
        }

        if ((currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') && requireCardInfo) {
            if (!transactionId) {
                alert('Informe o número da venda/transação do cartão.');
                return;
            }
        }

        const newPayments = [...payments, {
            id: Math.random().toString(36).substr(2, 9),
            method: currentPaymentMethod,
            amount,
            transaction_id: (currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') && requireCardInfo ? transactionId : undefined,
            transaction_date: (currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') && requireCardInfo ? transactionDate : undefined
        }];
        setPayments(newPayments);
        
        // Reset trans info
        setTransactionId('');
        
        const newTotalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
        const newRemaining = Math.max(0, total - newTotalPaid);
        setCurrentPaymentAmount(newRemaining > 0 ? newRemaining.toFixed(2) : '');
    };

    const handleRemovePayment = (id: string) => {
        const newPayments = payments.filter(p => p.id !== id);
        setPayments(newPayments);
        const newTotalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
        const newRemaining = Math.max(0, total - newTotalPaid);
        setCurrentPaymentAmount(newRemaining.toFixed(2));
    };

    const verifyAdminPassword = () => {
        if (discountPassword === 'admin123') { // Legacy password check, can be improved
            setIsAdmin(true);
        } else {
            alert('Senha incorreta!');
        }
    };

    const handleApplyDiscount = () => {
        const val = parseFloat(discountValue.replace(',', '.'));
        if (val >= 0) {
            setDiscount(val);
            setShowDiscountInput(false);
            const newTotal = Math.max(0, subtotal - val);
            const newRemaining = Math.max(0, newTotal - totalPaid);
            setCurrentPaymentAmount(newRemaining.toFixed(2));
        }
    };

    const handleFinish = async () => {
        // If no payments added but there is a valid amount in current input, add it automatically
        let finalPayments = [...payments];
        if (payments.length === 0) {
            const amount = parseFloat(currentPaymentAmount.replace(',', '.'));
            if (amount > 0 && amount <= total) {
                if (currentPaymentMethod === 'pix') {
                    if (!pixKey) {
                        alert('Chave PIX não configurada! Por favor, cadastre uma chave PIX nas configurações da loja.');
                        return;
                    }
                    handleAddPayment(true);
                    return;
                }
                if ((currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') && requireCardInfo) {
                    if (!transactionId) {
                        alert('Informe o número da venda do cartão antes de finalizar.');
                        return;
                    }
                    finalPayments = [{
                        id: 'auto-gen',
                        method: currentPaymentMethod,
                        amount,
                        transaction_id: transactionId,
                        transaction_date: transactionDate
                    }];
                } else {
                    finalPayments = [{
                        id: 'auto-gen',
                        method: currentPaymentMethod,
                        amount
                    }];
                }
            } else if (remaining > 0) {
                alert('Adicione o pagamento antes de confirmar.');
                return;
            }
        } else if (remaining > 0) {
            alert('Ainda resta saldo a pagar.');
            return;
        }

        setIsFinishing(true);
        try {
            await onFinalize(finalPayments, discount);
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao finalizar venda: ${error.message || 'Erro desconhecido'}`);
            setIsFinishing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e2730] rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-800 flex overflow-hidden">

                {/* Left Column: Summary & Discount */}
                <div className="w-1/3 bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-col border-r border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-black dark:text-white mb-6">Resumo</h2>

                    <div className="space-y-4 mb-auto">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between text-green-500 font-bold">
                                <span>Desconto</span>
                                <span>- R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-lg dark:text-white">Total a Pagar</span>
                            </div>
                            <div className="text-4xl font-black text-[#2196f3] tracking-tighter">
                                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Discount Section */}
                    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        {showDiscountInput ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold dark:text-white text-sm">Aplicar Desconto</h3>
                                    <button onClick={() => setShowDiscountInput(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </div>

                                {!isAdmin ? (
                                    <>
                                        <input
                                            type="password"
                                            value={discountPassword}
                                            onChange={e => setDiscountPassword(e.target.value)}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm focus:border-primary outline-none"
                                            placeholder="Senha Admin"
                                            onKeyDown={e => e.key === 'Enter' && verifyAdminPassword()}
                                        />
                                        <button onClick={verifyAdminPassword} className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold text-sm text-gray-700 dark:text-gray-200">Verificar</button>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="number"
                                            value={discountValue}
                                            onChange={e => setDiscountValue(e.target.value)}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm focus:border-primary outline-none"
                                            placeholder="Valor R$"
                                            onKeyDown={e => e.key === 'Enter' && handleApplyDiscount()}
                                            autoFocus
                                        />
                                        <button onClick={handleApplyDiscount} className="w-full py-2 bg-green-500 text-white rounded-lg font-bold text-sm">Aplicar</button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setShowDiscountInput(true);
                                    setDiscountPassword('');
                                    setDiscountValue('');
                                }}
                                className="w-full py-3 flex items-center justify-center gap-2 text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">percent</span>
                                <span className="font-bold text-sm">Adicionar Desconto</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Payment Methods */}
                <div className="flex-1 p-8 flex flex-col bg-white dark:bg-[#1e2730]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black dark:text-white tracking-tight">Pagamento</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>

                    {/* Method Selector */}
                    <div className="grid grid-cols-5 gap-3 mb-6">
                        {[
                            { id: 'money', label: 'Dinheiro', icon: 'payments' },
                            { id: 'credit', label: 'Crédito', icon: 'credit_card' },
                            { id: 'debit', label: 'Débito', icon: 'credit_card' },
                            { id: 'pix', label: 'Pix', icon: 'qr_code_2' },
                            { id: 'on_account', label: 'Fiado', icon: 'badge' }
                        ].map(method => (
                            <button
                                key={method.id}
                                onClick={() => {
                                    setCurrentPaymentMethod(method.id as any);
                                    // Auto update amount to remaining when switching methods if current is empty or matches previous total
                                    if (!currentPaymentAmount || parseFloat(currentPaymentAmount) === 0) {
                                        setCurrentPaymentAmount(remaining.toFixed(2));
                                    }
                                }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${currentPaymentMethod === method.id
                                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                    : 'border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 text-gray-400'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-3xl ${currentPaymentMethod === method.id ? 'scale-110' : ''} transition-transform`}>{method.icon}</span>
                                <span className="font-bold text-[10px] uppercase tracking-tighter">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Card Info Helper */}
                    {(currentPaymentMethod === 'credit' || currentPaymentMethod === 'debit') && requireCardInfo && (
                        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-primary/20 animate-in slide-in-from-top-2 duration-300">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">credit_score</span> Dados da Transação de Cartão
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Nº da Venda / Autorização</label>
                                    <input 
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="000000"
                                        className="w-full h-11 px-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Data da Transação</label>
                                    <input 
                                        type="date"
                                        value={transactionDate}
                                        onChange={(e) => setTransactionDate(e.target.value)}
                                        className="w-full h-11 px-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all text-sm font-bold shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PIX Key Helper */}
                    {currentPaymentMethod === 'pix' && pixKey && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined">qr_code_2</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Chave PIX Copiar</span>
                                    <span className="text-sm font-bold dark:text-white">{pixKey}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleAddPayment()}
                                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                                PAGAR COM QR CODE
                            </button>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="flex gap-4 mb-8">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">R$</span>
                            <input
                                type="text"
                                value={currentPaymentAmount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9,.]/g, '');
                                    setCurrentPaymentAmount(val);
                                }}
                                className="w-full pl-12 pr-4 py-4 text-3xl font-black bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white transition-all shadow-inner"
                                placeholder="0,00"
                                onKeyDown={e => e.key === 'Enter' && handleAddPayment()}
                                disabled={remaining <= 0}
                            />
                        </div>
                            <button
                                onClick={() => handleAddPayment()}
                                disabled={!currentPaymentAmount || remaining <= 0}
                                className="bg-[#2196f3] hover:bg-[#1e88e5] text-white px-8 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg shadow-blue-500/10 active:scale-95"
                            >
                                Adicionar
                            </button>
                        </div>

                    {/* Payments List */}
                    <div className="flex-1 overflow-y-auto mb-6 no-scrollbar">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Pagamentos Adicionados</label>
                        <div className="space-y-2">
                            {payments.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-4xl opacity-20">receipt_long</span>
                                    <span className="text-sm font-medium">Nenhum pagamento registrado</span>
                                </div>
                            ) : (
                                payments.map(p => (
                                    <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-primary border border-gray-100 dark:border-gray-700">
                                                <span className="material-symbols-outlined text-xl">
                                                    {p.method === 'money' ? 'payments' : p.method === 'pix' ? 'qr_code_2' : p.method === 'on_account' ? 'badge' : 'credit_card'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold capitalize dark:text-white text-sm">
                                                    {p.method}
                                                    {p.transaction_id && <span className="ml-2 text-[10px] text-primary border border-primary/30 px-1.5 rounded uppercase">ID: {p.transaction_id}</span>}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">REC_{p.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-lg dark:text-white">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            <button onClick={() => handleRemovePayment(p.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer Summary */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl space-y-4 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restante</span>
                                <span className={`text-2xl font-black ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            {change > 0 && (
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Troco</span>
                                    <span className="text-2xl font-black text-green-500">
                                      R$ {change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleFinish}
                            disabled={isFinishing}
                            className={`w-full py-4 text-white rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                                (remaining > 0 && payments.length > 0) || isFinishing
                                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                                : 'bg-[#00c853] hover:bg-[#00b24a] shadow-[#00c853]/30'
                            }`}
                        >
                            {isFinishing ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>Confirmar Venda</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* PIX QR Modal */}
            {showPixQR && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1e2730] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center p-8 text-center">
                        <div className="w-16 h-1 w-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-8 opacity-50" />
                        
                        <div className="mb-6">
                            <h3 className="text-2xl font-black dark:text-white tracking-tight">Pagamento PIX</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Escaneie o código para pagar</p>
                        </div>

                        <div className="relative p-6 bg-white rounded-[24px] shadow-inner mb-6 ring-8 ring-primary/5">
                            {isPixConfirmed ? (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center z-10 animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/40">
                                        <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
                                    </div>
                                    <p className="text-green-600 font-black text-xl uppercase tracking-tighter">Recebido!</p>
                                </div>
                            ) : null}
                            <QRCodeCanvas value={pixPayload} size={200} level="H" />
                        </div>

                        <div className="w-full space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor a pagar</p>
                                <p className="text-2xl font-black text-primary tracking-tighter">
                                    R$ {parseFloat(currentPaymentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(pixPayload);
                                }}
                                className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">content_copy</span>
                                Copiar Código PIX
                            </button>

                            <div className="flex items-center justify-center gap-3 py-2">
                                {!isPixConfirmed ? (
                                    <>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aguardando Pagamento...</span>
                                    </>
                                ) : (
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Pagamento Confirmado!</span>
                                )}
                            </div>

                            {!isPixConfirmed && (
                                <button 
                                    onClick={() => setShowPixQR(false)}
                                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors mt-4"
                                >
                                    Cancelar PIX
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutModal;
