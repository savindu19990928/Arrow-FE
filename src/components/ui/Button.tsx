import React from 'react';
import { Loader2Icon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:bg-fg/85',
  secondary: 'border border-line bg-transparent text-fg hover:border-fg/40 hover:bg-raised',
  ghost: 'text-muted hover:bg-raised hover:text-fg',
  danger: 'border border-danger/40 text-danger hover:bg-danger/10'
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]'
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', fullWidth = false): string {
  return [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',
  'transition-[color,background-color,border-color,transform,opacity] duration-150 ease-out active:scale-[0.98]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  'disabled:pointer-events-none disabled:opacity-50',
  variantClasses[variant],
  sizeClasses[size],
  fullWidth ? 'w-full' : ''].
  join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses(variant, size, fullWidth)} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}>
      
      {loading && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>);

}