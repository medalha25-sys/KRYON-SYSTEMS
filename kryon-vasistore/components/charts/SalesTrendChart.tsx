'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '../../lib/formatters';

interface DailySalesData {
  date: string;
  total: number;
  count: number;
}

interface SalesTrendChartProps {
  data: DailySalesData[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
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
        Nenhuma venda registrada no período selecionado.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            stroke="#94a3b8" 
            fontSize={11}
            tickMargin={8}
          />
          <YAxis 
            tickLine={false} 
            stroke="#94a3b8" 
            fontSize={11}
            tickFormatter={(val) => `R$${val}`}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value)), 'Total Vendido']}
            labelFormatter={(label) => `Data: ${label}`}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            itemStyle={{ color: '#4ade80' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#16a34a"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
