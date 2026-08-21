import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border ${
          error ? 'border-red-500/80 focus:border-red-500' : 'border-luxury-border focus:border-luxury-gold'
        } px-4 py-3 text-sm transition-colors duration-200 outline-none ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
      {!error && helperText && <span className="text-xs text-luxury-muted mt-0.5">{helperText}</span>}
    </div>
  );
};
