'use client';

import React from 'react';
import { CashRegisterProvider } from '@/components/CashRegisterContext';
import SalesTerminal from '@/components/SalesTerminal';

const FashionSalesPage: React.FC = () => {
    return (
        <CashRegisterProvider>
             <div className="h-[calc(100vh-4rem)]">
                <SalesTerminal />
             </div>
        </CashRegisterProvider>
    );
};

export default FashionSalesPage;
