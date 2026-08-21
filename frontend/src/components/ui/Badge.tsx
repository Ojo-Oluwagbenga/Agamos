import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const getStyle = () => {
    switch (normalized) {
      case 'CONFIRMED':
      case 'PAID':
      case 'ATTENDED':
      case 'COMPLETED':
      case 'SUCCESS':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';

      case 'PENDING':
      case 'PROCESSING':
      case 'UNPAID':
        return 'bg-amber-950/50 text-amber-300 border-amber-500/40';

      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 'bg-luxury-charcoal text-luxury-gold border-luxury-gold/40';

      case 'CANCELLED':
      case 'REFUNDED':
      case 'FAILED':
        return 'bg-zinc-900 text-zinc-400 border-zinc-700';

      case 'NO_SHOW':
        return 'bg-red-950/70 text-red-300 border-red-500/50';

      case 'LOW_STOCK':
        return 'bg-orange-950/60 text-orange-300 border-orange-500/40';

      default:
        return 'bg-luxury-charcoal text-luxury-white border-luxury-border';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-sans font-medium uppercase tracking-widest border ${getStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
