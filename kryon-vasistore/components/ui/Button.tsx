import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, className = '', disabled, ...props }, ref) => {
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
      lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2.5',
    }[size];

    const variantStyles = {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 active:scale-[0.98]',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98]',
      secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm shadow-slate-800/20 active:scale-[0.98]',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 active:scale-[0.98]',
      warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 active:scale-[0.98]',
      outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 active:scale-[0.98]',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
