import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function Card({ children, className = '', onClick, hoverEffect = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none p-5 transition-colors ${
        hoverEffect ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4 ${className}`}>
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
