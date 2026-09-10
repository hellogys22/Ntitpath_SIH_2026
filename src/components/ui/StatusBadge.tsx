import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();
  
  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  if (normalized.includes('completed') || normalized.includes('verified') || normalized.includes('accepted')) {
    colorStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = CheckCircle2;
  } else if (normalized.includes('in progress') || normalized.includes('in review') || normalized.includes('under review')) {
    colorStyle = 'bg-blue-50 text-blue-800 border-blue-200';
    Icon = Clock;
  } else if (normalized.includes('needs correction') || normalized.includes('needs attention') || normalized.includes('flagged')) {
    colorStyle = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
    Icon = AlertTriangle;
  } else if (normalized.includes('not uploaded')) {
    colorStyle = 'bg-slate-100 text-slate-600 border-slate-300 font-medium';
    Icon = FileText;
  } else if (normalized.includes('missing') || normalized.includes('blocked')) {
    colorStyle = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
    Icon = XCircle;
  } else if (normalized.includes('pending')) {
    colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';
    Icon = Clock;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${colorStyle}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  );
};
