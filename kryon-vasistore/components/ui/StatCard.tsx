import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  onClick,
}: StatCardProps) {
  const iconBgStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
    purple: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400',
  }[variant];

  return (
    <Card
      onClick={onClick}
      hoverEffect={!!onClick}
      className="relative overflow-hidden transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight font-display">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
              <span className={trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">vs. período anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgStyles} flex-shrink-0 ml-3 shadow-sm`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
