import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, size = 'md' }) => {
  const styles = {
    HIGH: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
    MEDIUM: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
    LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
  };

  const icons = {
    HIGH: ShieldAlert,
    MEDIUM: AlertTriangle,
    LOW: ShieldCheck,
  };

  const Icon = icons[risk] || ShieldCheck;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${padding} ${styles[risk]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {risk} RISK
    </span>
  );
};
