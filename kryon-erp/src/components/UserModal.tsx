'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    shopId: string;
    onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, shopId, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('operator');
    const [isSaving, setIsSaving] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const supabase = createClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Flow: Since we can't create Auth users directly from client,
            // we will generate an invitation link that the user can use to register.
            // The link will include the shop_id and role as query params.
            
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/register?shop_id=${shopId}&role=${role}&email=${encodeURIComponent(email)}`;
            
            setInviteLink(link);
            
            // Optional: Store in a 'invitatios' table if we want tracking
            // For now, let's just show the link.
            
        } catch (error) {
            console.error('Error generating link:', error);
            alert('Erro ao gerar link de convite.');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        alert('Link copiado para a área de transferência!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white dark:bg-[#1e2730] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h2 className="text-xl font-black text-[#111418] dark:text-white tracking-tight italic uppercase">Convidar Membro</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8">
                    {!inviteLink ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">E-mail do Colaborador</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all font-bold"
                                    placeholder="exemplo@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Função / Nível de Acesso</label>
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl outline-none dark:text-white transition-all font-bold appearance-none"
                                >
                                    <option value="operator">Operador / Vendedor</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="caixa">Caixa</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isSaving ? 'Gerando...' : 'Gerar Link de Convite'}
                            </button>
                            <p className="text-[10px] text-center text-gray-400 italic">O colaborador deverá usar este link para se cadastrar e ser vinculado automaticamente à sua loja.</p>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-center">
                                <span className="material-symbols-outlined text-green-500 text-4xl mb-2">link</span>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">Link gerado com sucesso!</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 break-all font-mono text-[10px] text-gray-500">
                                {inviteLink}
                            </div>
                            <button 
                                onClick={copyToClipboard}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest transition-all"
                            >
                                Copiar Link
                            </button>
                            <button 
                                onClick={() => { setInviteLink(''); onClose(); }}
                                className="w-full py-3 text-gray-400 font-bold text-sm uppercase tracking-widest hover:text-gray-600 transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserModal;
