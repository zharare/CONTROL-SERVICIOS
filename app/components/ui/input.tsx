import type { InputHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'transition-base h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-consitec-500 focus:ring-2 focus:ring-consitec-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700',
        className
      )}
      {...props}
    />
  );
}
