import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    outline: 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  }[variant];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
}
