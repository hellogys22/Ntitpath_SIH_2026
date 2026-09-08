import React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-govNavy-900 text-white px-4 py-3 rounded-lg shadow-xl border border-govNavy-700 animate-in slide-in-from-bottom-5 duration-200 text-xs font-medium max-w-md">
      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
