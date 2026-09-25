import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md': variant === 'default',
            'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700': variant === 'outline',
            'hover:bg-emerald-50 text-emerald-700': variant === 'ghost',
            'bg-red-50 text-red-600 hover:bg-red-100': variant === 'danger',
            'h-8 px-3 py-1 text-[10px] uppercase tracking-wide': size === 'sm',
            'h-10 px-4 py-2 text-xs': size === 'md',
            'h-12 px-6 py-3 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
