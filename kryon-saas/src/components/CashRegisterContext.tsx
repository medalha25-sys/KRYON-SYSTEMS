'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getTenantScope } from '@/utils/tenant';

interface CashRegisterContextType {
    isRegisterOpen: boolean;
    sessionId: string | null;
    shopId: string | null;
    openRegister: (openingBalance: number) => Promise<void>;
    closeRegister: () => Promise<void>;
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export const CashRegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [shopId, setShopId] = useState<string | null>(null);
    const supabase = createClient();

    // Initial load: Fetch shopId and then check for open session
    useEffect(() => {
        const initRegister = async () => {
            const id = await getTenantScope(supabase);
            if (!id) return;
            
            setShopId(id);

            const { data } = await supabase
                .from('register_sessions')
                .select('id')
                .eq('shop_id', id)
                .eq('status', 'open')
                .order('opened_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setIsRegisterOpen(true);
                setSessionId(data.id);
            }
        };
        initRegister();
    }, []);

    const openRegister = async (openingBalance: number) => {
        try {
            if (!shopId) throw new Error('No shop identified');

            const { data, error } = await supabase
                .from('register_sessions')
                .insert({
                    shop_id: shopId,
                    opening_balance: openingBalance,
                    status: 'open',
                    opened_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            setIsRegisterOpen(true);
            setSessionId(data.id);
        } catch (error) {
            console.error('Error opening register:', error);
            alert('Erro ao abrir caixa. Tente novamente.');
        }
    };

    const closeRegister = async () => {
        // DB update usually happens in the CloseRegisterModal
        setIsRegisterOpen(false);
        setSessionId(null);
    };

    return (
        <CashRegisterContext.Provider value={{ isRegisterOpen, sessionId, shopId, openRegister, closeRegister }}>
            {children}
        </CashRegisterContext.Provider>
    );
};

export const useCashRegister = () => {
    const context = useContext(CashRegisterContext);
    if (context === undefined) {
        throw new Error('useCashRegister must be used within a CashRegisterProvider');
    }
    return context;
};
