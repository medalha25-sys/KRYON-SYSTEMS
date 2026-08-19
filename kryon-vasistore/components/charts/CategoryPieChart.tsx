'use client';

import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend 
} from 'recharts';
import { formatCurrency } from '../../lib/formatters';

interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const DEFAULT_COLORS = ['#16a34a', '#0284c7', '#ea580c', '#8b5cf6', '#f59e0b', '#0d9488', '#ec4899', '#64748b'];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
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
        Nenhum dado por categoria registrado.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value)), 'Vendas']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
