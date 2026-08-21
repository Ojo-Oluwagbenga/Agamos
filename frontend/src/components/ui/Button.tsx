import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline-gold' | 'black' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-sans font-medium uppercase tracking-widest-luxury transition-all duration-300 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const sizeStyles = {
    sm: 'text-[10px] px-3.5 py-2 space-x-1.5',
    md: 'text-xs px-6 py-3.5 space-x-2',
    lg: 'text-sm px-8 py-4 space-x-3',
  };

  const variantStyles = {
    gold: 'bg-luxury-gold text-luxury-black font-semibold hover:bg-luxury-gold-light active:scale-[0.99] shadow-gold-subtle',
    'outline-gold': 'bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black active:scale-[0.99]',
    black: 'bg-luxury-black text-luxury-white border border-luxury-border hover:border-luxury-gold active:scale-[0.99]',
    ghost: 'bg-transparent text-luxury-white hover:text-luxury-gold hover:bg-luxury-offblack/40',
    danger: 'bg-red-900/40 text-red-300 border border-red-800 hover:bg-red-900/60',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
