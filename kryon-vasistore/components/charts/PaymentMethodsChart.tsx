'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { formatCurrency } from '../../lib/formatters';

interface PaymentMethodData {
  method: string;
  total: number;
  count: number;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

const METHOD_COLORS: Record<string, string> = {
  dinheiro: '#10b981',
  pix: '#06b6d4',
  debito: '#3b82f6',
  credito: '#8b5cf6',
  fiado: '#f59e0b',
  outro: '#64748b'
};

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Nenhum pagamento registrado.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            tickFormatter={(val) => `R$${val}`}
            stroke="#94a3b8" 
            fontSize={11}
            axisLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="method" 
            stroke="#475569" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value)), 'Total Arrecadado']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="total" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => {
              const colorKey = entry.method.toLowerCase().split(' ')[0];
              const fillColor = METHOD_COLORS[colorKey] || '#16a34a';
              return <Cell key={`bar-${index}`} fill={fillColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
