import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 - 100
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  colorClass?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  sublabel,
  showPercentage = true,
  colorClass = 'bg-govNavy-700',
  size = 'md'
}) => {
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
          {label && <span className="text-slate-700">{label}</span>}
          {showPercentage && <span className="text-slate-900 font-bold">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}>
        <div 
          className={`h-full transition-all duration-500 rounded-full ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {sublabel && (
        <p className="mt-1 text-[11px] text-slate-500">{sublabel}</p>
      )}
    </div>
  );
};
