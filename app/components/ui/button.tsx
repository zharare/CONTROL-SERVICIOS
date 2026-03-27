import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'destructive';

const variants: Record<Variant, string> = {
  default: 'bg-consitec-700 text-white hover:bg-consitec-500',
  secondary: 'bg-consitec-accent text-slate-900 hover:brightness-95',
  outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
  destructive: 'bg-red-600 text-white hover:bg-red-500'
};

export function Button({
  className,
  children,
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'transition-base inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
