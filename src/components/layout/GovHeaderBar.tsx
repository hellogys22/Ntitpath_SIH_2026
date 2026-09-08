import React from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GovHeaderBar: React.FC = () => {
  const { language, toggleLanguage, t } = useApp();

  return (
    <div className="w-full bg-slate-900 text-slate-200 text-[11px] border-b border-slate-800 select-none">
      {/* Tricolor Accent Ribbon */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Ministry & Govt of India */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Government of India</span>
          </div>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline">
            वाणिज्य एवं उद्योग मंत्रालय | Ministry of Commerce & Industry
          </span>
        </div>

        {/* Right: Accessibility & Language Toggle */}
        <div className="flex items-center gap-4 text-slate-300">
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px]">
            <button className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white" title="Decrease Font">A-</button>
            <button className="px-1.5 py-0.5 rounded hover:bg-slate-800 font-bold text-white" title="Standard Font">A</button>
            <button className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white" title="Increase Font">A+</button>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Working Interactive Language Toggle */}
          <button 
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-amber-400/40 transition-colors cursor-pointer"
            title="Click to switch language (English / हिन्दी)"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'EN' ? 'English / हिन्दी' : 'हिन्दी / English'}</span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
            National Portal
          </span>
        </div>
      </div>
    </div>
  );
};
