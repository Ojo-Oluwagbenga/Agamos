import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-luxury-card border border-luxury-border p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:border-luxury-gold/60 hover:shadow-luxury-card' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
