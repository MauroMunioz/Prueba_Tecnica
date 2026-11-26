import type { ButtonHTMLAttributes } from 'react';

// Sin 'use client': no tiene estado ni efectos, se puede usar desde servidor o cliente

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghost-danger';
type Size = 'sm' | 'md' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-800 text-white shadow-sm hover:bg-brand-700 active:bg-brand-900 focus-visible:outline-brand-800 disabled:bg-brand-300 disabled:shadow-none',
  secondary:
    'border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-brand-600 disabled:border-slate-200 disabled:text-slate-400 disabled:shadow-none',
  danger:
    'bg-accent-600 text-white shadow-sm hover:bg-accent-500 active:bg-accent-700 focus-visible:outline-accent-600 disabled:bg-accent-200 disabled:shadow-none',
  ghost:
    'text-slate-500 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-brand-600 disabled:text-slate-300',
  'ghost-danger':
    'text-slate-500 hover:bg-accent-50 hover:text-accent-600 focus-visible:outline-accent-600 disabled:text-slate-300',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'size-8',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed [&_svg]:size-4 [&_svg]:shrink-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
