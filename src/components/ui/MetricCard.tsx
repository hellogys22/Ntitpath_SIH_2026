import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200 text-slate-900',
    danger: 'bg-rose-50/70 border-rose-200 text-rose-950',
    warning: 'bg-amber-50/70 border-amber-200 text-amber-950',
    success: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
  };

  const iconColors = {
    default: 'text-govNavy-700 bg-govNavy-50 border-govNavy-100',
    danger: 'text-rose-700 bg-rose-100 border-rose-200',
    warning: 'text-amber-700 bg-amber-100 border-amber-200',
    success: 'text-emerald-700 bg-emerald-100 border-emerald-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border shadow-sm transition-all duration-150 ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:border-govNavy-500 hover:shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-600 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${iconColors[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
